import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';

const dist = resolve('dist');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const chromeCandidates = [process.env.CHROME_BIN, 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean);
const chromeBinary = chromeCandidates.find(candidate => spawnSync('which', [candidate], { stdio: 'ignore' }).status === 0 || candidate.startsWith('/'));
assert.ok(chromeBinary, 'Chromium or Google Chrome is required for browser QA');

const mimetypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const name = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const fullPath = resolve(dist, '.' + name);
    if (!fullPath.startsWith(dist + sep)) { res.writeHead(403).end(); return; }
    const content = await readFile(fullPath);
    res.setHeader('Content-Type', mimetypes[extname(fullPath)] || 'application/octet-stream');
    res.writeHead(200).end(content);
  } catch {
    res.writeHead(404).end('Not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
const profile = await mkdtemp(join(tmpdir(), 'zenit-lab-browser-'));
const browser = spawn(chromeBinary, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--no-first-run', '--disable-background-networking', '--remote-allow-origins=*',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

let ws;
try {
  let port = null;
  for (let attempt = 0; attempt < 160; attempt++) {
    if (browser.exitCode !== null) throw new Error(`Chrome exited early: ${browser.exitCode}`);
    try {
      const active = await readFile(join(profile, 'DevToolsActivePort'), 'utf8');
      port = Number(active.split('\n')[0]);
      if (Number.isFinite(port) && port > 0) break;
    } catch { /* Chrome has not finished starting. */ }
    await sleep(75);
  }
  assert.ok(port, 'Chrome remote debugging endpoint did not start');

  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
  const page = targets.find(item => item.type === 'page');
  assert.ok(page?.webSocketDebuggerUrl, 'No debuggable Chrome page');

  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (!message.id) return;
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
    else entry.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  };
  const waitFor = async (expression, message) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      try { if (await evaluate(expression)) return; } catch { /* React may still be loading. */ }
      await sleep(60);
    }
    throw new Error(message);
  };
  const snapshot = () => evaluate(`(() => {
    const root = document.documentElement;
    const header = document.querySelector('.app-chrome');
    const sidebar = document.querySelector('.lab-sidebar');
    return {
      width: window.innerWidth,
      pageWidth: root.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      headerPosition: header ? getComputedStyle(header).position : null,
      headerTop: header ? header.getBoundingClientRect().top : null,
      navIconCount: document.querySelectorAll('.nav-item svg').length,
      sidebarVisible: !!sidebar && getComputedStyle(sidebar).visibility !== 'hidden',
      sidebarState: sidebar?.dataset.sidebarState,
      desktopTableDisplay: document.querySelector('.operational-records__desktop') ? getComputedStyle(document.querySelector('.operational-records__desktop')).display : null,
      mobileRecordsDisplay: document.querySelector('.operational-records__mobile') ? getComputedStyle(document.querySelector('.operational-records__mobile')).display : null,
      mobileCardCount: document.querySelectorAll('.operational-records__card').length,
    };
  })()`);
  await send('Page.enable');
  await send('Runtime.enable');

  for (const width of [320, 375, 390, 600, 700, 701, 768, 820, 900, 1024, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width, height: 850, deviceScaleFactor: 1, mobile: width <= 700,
    });
    await send('Page.navigate', { url });
    await waitFor('Boolean(document.querySelector(".lab") && document.querySelector(".nav-item"))', 'Design Lab did not render');

    await evaluate(`Array.from(document.querySelectorAll('.nav-item')).find(node => node.textContent.includes('Componentes'))?.click()`);
    await waitFor('Boolean(document.getElementById("catalog-select"))', 'Component catalogue did not render');
    for (const theme of ['light', 'dark']) {
      await evaluate(`document.querySelector('.lab').dataset.theme = '${theme}'; true`);
      const state = await snapshot();
      assert.equal(state.width, width, `Viewport emulation failed at ${width}px`);
      assert.ok(state.pageWidth <= width + 1, `Horizontal document overflow at ${width}px ${theme}: ${JSON.stringify(state)}`);
      assert.ok(state.bodyWidth <= width + 1, `Horizontal body overflow at ${width}px ${theme}: ${JSON.stringify(state)}`);
      assert.equal(state.headerPosition, 'sticky', 'Header must remain sticky');
      assert.ok(state.navIconCount >= 3, 'Vector icons must remain in the top navigation');
      if (width <= 700) {
        assert.equal(state.desktopTableDisplay, 'none', 'Mobile must not inherit desktop table layout');
        assert.equal(state.mobileRecordsDisplay, 'grid', 'Mobile must show dedicated responsive record cards');
        assert.equal(state.mobileCardCount, 5, 'Canonical mobile list should show the first five paginated synthetic records');
      } else {
        assert.notEqual(state.desktopTableDisplay, 'none', 'Desktop table must remain available');
        assert.equal(state.mobileRecordsDisplay, 'none', 'Dedicated mobile cards must remain hidden on desktop and tablet');
      }
      if (width <= 700) {
        const alignment=await evaluate(`(() => {
          const root=document.querySelector('.catalog__section[aria-labelledby="catalog-calendar"] .calendar-specimen')?.getBoundingClientRect();
          const grid=document.querySelector('.catalog__section[aria-labelledby="catalog-calendar"] .zenit-calendar')?.getBoundingClientRect();
          return {offset:root&&grid?Math.abs((root.left+root.right)-(grid.left+grid.right)):null,
            gridWidth:grid?.width,rootWidth:root?.width};
        })()`);
        assert.ok(alignment.offset!==null && alignment.offset<=2,
          `Mobile calendar must be visually centered: ${JSON.stringify(alignment)}`);
      }
      if (width <= 700) {
        const cards=await evaluate(`[...document.querySelectorAll('.operational-records__card')].map(card=>{
          const rect=card.getBoundingClientRect();
          return {left:rect.left,right:rect.right,width:rect.width};
        })`);
        assert.ok(cards.every(card=>card.left>=0&&card.right<=width+1&&card.width>width*0.50),
          `Mobile cards must fit without clipping and use available width: ${JSON.stringify(cards)}`);
      }
      process.stdout.write(`PASS viewport ${width}px / ${theme}; no horizontal overflow\n`);
    }
    if (width === 375) {
      await evaluate(`document.querySelector('.catalog__select-example .zenit-select__trigger')?.click(); true`);
      await waitFor('Boolean(document.querySelector(".catalog__select-example .zenit-select__popover"))', 'Custom dropdown did not open');
      const popupCheck = await evaluate(`(() => {
        const popup = document.querySelector('.catalog__select-example .zenit-select__popover');
        const rect=popup?.getBoundingClientRect();
        return {shown:!!popup, radius:popup ? getComputedStyle(popup).borderTopLeftRadius : null,
          position:popup ? getComputedStyle(popup).position : null,
          left:rect?.left,right:rect?.right,bottom:rect?.bottom,top:rect?.top,
          width:rect?.width,dialog:popup?.getAttribute('role'),
          sheetHeader:!!popup?.querySelector('.zenit-select__sheet-head'),
          bodyLocked:document.body.style.overflow==='hidden'};
      })()`);
      assert.ok(popupCheck.shown && popupCheck.radius === '16px' && popupCheck.position === 'fixed' && popupCheck.dialog === 'dialog',
        'Mobile dropdown must open as a rounded modal popup');
      assert.ok(Math.abs(popupCheck.left - 16) <= 2 && Math.abs(popupCheck.right - (375-16)) <= 2,
        `Mobile popup must have symmetrical margins: ${JSON.stringify(popupCheck)}`);
      assert.ok(Math.abs((popupCheck.bottom + popupCheck.top)/2 - 425) <= 2,
        `Mobile popup must be centered on available screen: ${JSON.stringify(popupCheck)}`);
      assert.ok(popupCheck.bodyLocked,'Mobile dropdown should lock background page scroll');
      process.stdout.write('PASS centered mobile popup, focus dialog and background scroll lock\n');

      const mobileInitialFocus = await evaluate('document.activeElement?.classList.contains("zenit-select__popover")');
      assert.ok(mobileInitialFocus, 'Mobile popup must initially focus its dialog without showing the on-screen keyboard');
      await evaluate(`document.querySelector('.catalog__select-example .zenit-select__search input')?.focus();true`);
      await waitFor('document.activeElement?.matches(".catalog__select-example .zenit-select__search input")', 'Search must be focusable when the user elects to search');
      await send('Input.insertText', { text:'revisión' });
      await waitFor('document.querySelectorAll(".catalog__select-example:first-child .zenit-select__list .zenit-select__option").length === 1', 'Search did not filter grouped single-select options');
      await send('Input.dispatchKeyEvent', { type:'rawKeyDown', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 });
      await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 });
      await waitFor('document.querySelector(".catalog__select-example:first-child .zenit-select__value")?.textContent === "En revisión"', 'Keyboard Enter did not choose the filtered single selection');
      await waitFor('!document.querySelector(".catalog__select-example:first-child .zenit-select__popover")', 'Single-select did not close on choice');
      await evaluate(`document.querySelector('.catalog__select-example:first-child .zenit-select__clear')?.click(); true`);
      await waitFor('document.querySelector(".catalog__select-example:first-child .zenit-select__value")?.textContent === "Seleccionar"', 'Single-select clear did not reset the choice');
      process.stdout.write('PASS grouped single selection, live search, keyboard choice and clear\n');

      await evaluate(`document.querySelector('.catalog__select-example:nth-child(2) .zenit-select__trigger')?.click(); true`);
      await waitFor('Boolean(document.querySelector(".catalog__select-example:nth-child(2) .zenit-select__popover"))', 'Multi-select popup did not open');
      await evaluate(`Array.from(document.querySelectorAll('.catalog__select-example:nth-child(2) .zenit-select__option')).find(element=>element.textContent?.includes('Métricas'))?.click(); true`);
      await waitFor('Array.from(document.querySelectorAll(".catalog__select-example:nth-child(2) .zenit-select__chip")).some(element=>element.textContent?.includes("Métricas"))', 'Multi-select did not add a selected chip');
      assert.ok(await evaluate('Boolean(document.querySelector(".catalog__select-example:nth-child(2) .zenit-select__popover"))'), 'Multi-select closed before explicit Done');
      await evaluate(`document.querySelector('.catalog__select-example:nth-child(2) .zenit-select__footer button')?.click(); true`);
      await waitFor('!document.querySelector(".catalog__select-example:nth-child(2) .zenit-select__popover")', 'Multi-select Done did not close the menu');
      await evaluate(`Array.from(document.querySelectorAll('.catalog__select-example:nth-child(2) .zenit-select__chip')).find(element=>element.textContent?.includes('Métricas'))?.querySelector('button')?.click(); true`);
      await waitFor('!Array.from(document.querySelectorAll(".catalog__select-example:nth-child(2) .zenit-select__chip")).some(element=>element.textContent?.includes("Métricas"))', 'Multi-select chip removal failed');
      process.stdout.write('PASS grouped multiple selection, chip removal and explicit Done\n');

      await evaluate(`document.querySelector('.mobile-nav-toggle')?.click(); true`);
      await waitFor('Boolean(document.querySelector(".lab-sidebar--mobile-open"))', 'Mobile navigation did not open');
      await waitFor('Math.abs(document.querySelector(".lab-sidebar").getBoundingClientRect().left) < 1',
        'Full-screen mobile navigation did not settle at the viewport edge');
      const menu=await evaluate(`(() => {
        const panel=document.querySelector('.lab-sidebar'),rect=panel.getBoundingClientRect();
        return {left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,
          width:rect.width,modal:panel.getAttribute('aria-modal'),
          locked:document.body.style.overflow==='hidden'};
      })()`);
      assert.ok(Math.abs(menu.left)<1 && Math.abs(menu.top)<1 &&
        Math.abs(menu.right-375)<1 && Math.abs(menu.bottom-850)<1 && menu.modal==='true' && menu.locked,
        `Mobile navigation must occupy entire screen: ${JSON.stringify(menu)}`);
      await evaluate(`document.querySelector('.lab-sidebar__close')?.click(); true`);
      await waitFor('!document.querySelector(".lab-sidebar--mobile-open")', 'Full-screen navigation did not close');
      await waitFor('document.body.style.overflow!== "hidden"', 'Mobile menu failed to restore background scrolling');
      process.stdout.write('PASS full-screen mobile navigation open/close, focus and scroll lock\n');
      for (const title of ['Producto','Apariencia']) {
        await evaluate(`Array.from(document.querySelectorAll('.header-controls .zenit-select')).find(el=>el.textContent.includes('${title}'))?.querySelector('.zenit-select__trigger')?.click();true`);
        await waitFor(`Boolean(Array.from(document.querySelectorAll('.header-controls .zenit-select')).find(el=>el.textContent.includes('${title}'))?.querySelector('.zenit-select__popover'))`,
          'Header selector failed to open as a modal');
        const headerPopup=await evaluate(`(() => {
          const p=Array.from(document.querySelectorAll('.header-controls .zenit-select')).find(el=>el.textContent.includes('${title}'));
          const d=p?.querySelector('.zenit-select__popover'),r=d?.getBoundingClientRect();
          return {left:r?.left,right:r?.right,top:r?.top,bottom:r?.bottom,
            modal:d?.getAttribute('aria-modal'),radius:d?getComputedStyle(d).borderTopLeftRadius:null};
        })()`);
        assert.ok(headerPopup.modal==='true' && headerPopup.radius==='16px' &&
          Math.abs(headerPopup.left-16)<=2 && Math.abs(headerPopup.right-(375-16))<=2,
          `Header mobile selector is not consistent with other popups: ${JSON.stringify(headerPopup)}`);
        await evaluate(`Array.from(document.querySelectorAll('.header-controls .zenit-select')).find(el=>el.textContent.includes('${title}'))?.querySelector('.zenit-select__sheet-head button')?.click();true`);
        await waitFor(`!Array.from(document.querySelectorAll('.header-controls .zenit-select')).find(el=>el.textContent.includes('${title}'))?.querySelector('.zenit-select__popover')`,
          'Header mobile selector failed to dismiss');
      }
      process.stdout.write('PASS product and appearance selectors use the same centered mobile popup\n');

      await evaluate('window.scrollTo(0, 500); true');
      await sleep(100);
      const stickyAfterScroll = await evaluate('({scrollY:window.scrollY, top:document.querySelector(".app-chrome").getBoundingClientRect().top})');
      assert.ok(stickyAfterScroll.scrollY > 0 && Math.abs(stickyAfterScroll.top) <= 1, `Header not fixed at top while scrolling: ${JSON.stringify(stickyAfterScroll)}`);
      process.stdout.write('PASS sticky header remains at top during real scrolling\n');
      await evaluate(`document.querySelector('.operational-workbench__actions input[aria-label="Editar celdas"]')?.click();true`);
      await waitFor('Boolean(document.querySelector(".operational-records__card-title input"))',
        'Shared mobile records did not expose editable title after editing enabled');
      const cardLayout = await evaluate(`(() => {
        const card=document.querySelector('.operational-records__card');
        const box=card?.querySelector('.operational-records__card-head input[type="checkbox"]');
        const title=card?.querySelector('.operational-records__card-title input');
        const category=card?.querySelector('.operational-records__card dl input');
        const status=card?.querySelector('.operational-records__card dl select');
        const r=card?.getBoundingClientRect(),b=box?.getBoundingClientRect(),
          t=title?.getBoundingClientRect(),c=category?.getBoundingClientRect(),st=status?.getBoundingClientRect();
        return {cardLeft:r?.left,cardRight:r?.right,
          checkRight:b?.right,checkCenterY:b?(b.top+b.bottom)/2:null,
          titleLeft:t?.left,titleCenterY:t?(t.top+t.bottom)/2:null,
          categoryWidth:c?.width,statusWidth:st?.width,
          categoryTop:c?.top,statusTop:st?.top,categoryHeight:c?.height,statusHeight:st?.height};
      })()`);
      assert.ok(cardLayout.checkRight<=cardLayout.titleLeft &&
        cardLayout.titleLeft-cardLayout.checkRight<=25,
        `Mobile checkbox must be next to its own editable record title: ${JSON.stringify(cardLayout)}`);
      assert.ok(Math.abs(cardLayout.checkCenterY-cardLayout.titleCenterY)<=9,
        `Checkbox and record name must share visual center: ${JSON.stringify(cardLayout)}`);
      assert.ok(Math.abs(cardLayout.categoryWidth-cardLayout.statusWidth)<2 &&
        Math.abs(cardLayout.categoryHeight-cardLayout.statusHeight)<2 &&
        Math.abs(cardLayout.categoryTop-cardLayout.statusTop)<2,
        `Mobile metadata fields must have identical aligned geometry: ${JSON.stringify(cardLayout)}`);
      await evaluate(`(() => {
        const title=document.querySelector('.operational-records__card-title input');
        title.focus();title.select();return true;
      })()`);
      await send('Input.insertText',{text:'Registro 01 corregido'});
      await waitFor('document.querySelector(".operational-records__card-title input")?.value==="Registro 01 corregido"',
        'Universal mobile record title did not synchronize after editing');
      process.stdout.write('PASS unified mobile record cards: adjacent checkbox, aligned metadata, editable title\\n');
      const mobileProfileAlignment=await evaluate(`(() => {
        const product=document.querySelector('.header-controls .zenit-select:nth-child(1) .zenit-select__trigger').getBoundingClientRect();
        const appearance=document.querySelector('.header-controls .zenit-select:nth-child(2) .zenit-select__trigger').getBoundingClientRect();
        const avatar=document.querySelector('.profile-menu__avatar').getBoundingClientRect();
        return {productBottom:product.bottom,appearanceBottom:appearance.bottom,avatarBottom:avatar.bottom,
          avatarRight:avatar.right,viewport:window.innerWidth};
      })()`);
      assert.ok(Math.abs(mobileProfileAlignment.productBottom-mobileProfileAlignment.appearanceBottom)<=2 &&
        Math.abs(mobileProfileAlignment.productBottom-mobileProfileAlignment.avatarBottom)<=2,
        `Profile avatar must share baseline with both header selectors: ${JSON.stringify(mobileProfileAlignment)}`);
      await evaluate(`document.querySelector('.profile-menu__trigger')?.click(); true`);
      await waitFor('Boolean(document.querySelector(".profile-menu__popover"))','Mobile profile menu did not open');
      const menuInfo=await evaluate(`(() => {
        const popup=document.querySelector('.profile-menu__popover'),rect=popup.getBoundingClientRect();
        return {role:popup.getAttribute('role'),radius:getComputedStyle(popup).borderTopLeftRadius,
          left:rect.left,right:rect.right,choices:[...popup.querySelectorAll('.profile-menu__option')].map(el=>el.textContent.trim()),
          locked:document.body.style.overflow==='hidden'};
      })()`);
      assert.equal(menuInfo.role,'dialog');
      assert.equal(menuInfo.radius,'16px');
      assert.equal(menuInfo.choices.length,6);
      assert.ok(menuInfo.choices.includes('Mi perfil')&&menuInfo.choices.includes('Cerrar sesión')&&menuInfo.locked,
        'Mobile profile must show expected actions and lock background');
      await evaluate(`document.querySelector('.profile-menu__close')?.click(); true`);
      await waitFor('!document.querySelector(".profile-menu__popover")','Profile menu failed to close');
      await waitFor('document.body.style.overflow!=="hidden"','Profile modal must restore page scrolling');
      process.stdout.write('PASS mobile profile alignment and accessible profile action popup\n');

    }
    if (width === 1024) {
      for (const index of [1, 2]) {
        await evaluate(`document.querySelector('.catalog__select-example:nth-child(${index}) .zenit-select__trigger')?.click(); true`);
        await waitFor(`Boolean(document.querySelector(".catalog__select-example:nth-child(${index}) .zenit-select__popover"))`,
          'Desktop dropdown did not open');
        const geometry=await evaluate(`(() => {
          const parent=document.querySelector('.catalog__select-example:nth-child(${index})');
          const trigger=parent.querySelector('.zenit-select__trigger').getBoundingClientRect();
          const popup=parent.querySelector('.zenit-select__popover').getBoundingClientRect();
          return {fieldBottom:trigger.bottom,fieldLeft:trigger.left,fieldWidth:trigger.width,
            popupTop:popup.top,popupLeft:popup.left,popupWidth:popup.width};
        })()`);
        assert.ok(Math.abs(geometry.fieldWidth - geometry.popupWidth) <= 2,
          `Desktop dropdown width must equal originating field: ${JSON.stringify(geometry)}`);
        assert.ok(Math.abs(geometry.fieldLeft - geometry.popupLeft) <= 2 && Math.abs(geometry.popupTop - geometry.fieldBottom - 5) <= 2,
          `Desktop dropdown must be immediately anchored to originating field: ${JSON.stringify(geometry)}`);
        await evaluate(`document.querySelector('.catalog__select-example:nth-child(${index}) .zenit-select__trigger')?.click(); true`);
        await waitFor(`!document.querySelector(".catalog__select-example:nth-child(${index}) .zenit-select__popover")`,
          'Desktop dropdown did not close');
      }
      process.stdout.write('PASS both desktop dropdowns match originating field width and position\n');
      await evaluate(`document.querySelector('.lab-sidebar__collapse')?.click(); true`);
      await waitFor('document.querySelector(".lab-sidebar")?.dataset.sidebarState === "collapsed"', 'Desktop sidebar did not collapse');
      process.stdout.write('PASS desktop collapsible contextual sidebar\n');
      const calendarRoot='.catalog__section[aria-labelledby="catalog-calendar"]';
      const selectRegional=async (key,label) => {
        await evaluate(`document.querySelector('.regional-prefs__${key} .zenit-select__trigger')?.click(); true`);
        await waitFor(`Boolean(document.querySelector(".regional-prefs__${key} .zenit-select__popover"))`,
          `Regional selector ${key} failed to open`);
        const count=await evaluate(`(() => {
          const options=[...document.querySelectorAll('.regional-prefs__${key} .zenit-select__option')];
          const item=options.find(el=>el.textContent.trim()==='${label}');
          if(!item)return -1;
          item.click();
          return options.length;
        })()`);
        assert.ok(count>0,`Regional option '${label}' missing from ${key}`);
        await waitFor(`!document.querySelector(".regional-prefs__${key} .zenit-select__popover")`,
          `Regional selector ${key} did not close`);
      };
      const getCalendar=()=>evaluate(`(() => {
        const root=document.querySelector('.catalog__section[aria-labelledby="catalog-calendar"] .calendar-specimen');
        const grid=root?.querySelector('.zenit-calendar');
        const rect=grid?.getBoundingClientRect(),container=root?.getBoundingClientRect();
        return {codes:[...root.querySelectorAll('.zenit-calendar__weekday')].map(el=>el.textContent.trim()).join(''),
          names:[...root.querySelectorAll('.zenit-calendar__weekday')].map(el=>el.getAttribute('aria-label')),
          direction:root.getAttribute('dir'),system:root.getAttribute('data-calendar-system'),
          label:root.querySelector('.calendar-specimen__month')?.textContent?.trim(),
          centerDelta:rect&&container?Math.abs((rect.left+rect.right)-(container.left+container.right)):null,
          weekStart:grid?.getAttribute('data-week-start'),hasDays:!!root.querySelector('[data-calendar-day="1"]')};
      })()`);
      const stableMonth=await evaluate(`(() => {
        const days=document.querySelector('.catalog__section[aria-labelledby="catalog-calendar"] .zenit-calendar__days');
        return {height:days?.getBoundingClientRect().height,count:days?.children.length};
      })()`);
      assert.equal(stableMonth.count,42,'Calendar must reserve six complete week rows');
      const spanish=await getCalendar();
      assert.equal(spanish.codes,'LMMJVSD','Spanish weekdays must use L M M J V S D, never X');
      assert.ok(spanish.names[1]!==spanish.names[2] && spanish.names[1].toLowerCase().includes('martes') &&
        spanish.names[2].toLowerCase().includes('miércoles'),'Distinct accessible names required for repeated M initials');
      assert.ok(spanish.centerDelta<=2,`Calendar not centered in LTR container: ${JSON.stringify(spanish)}`);
      assert.ok(spanish.label==='octubre de 2026',`Spanish month casing must remain native: ${JSON.stringify(spanish)}`);
      await evaluate(`document.querySelector('.catalog__section[aria-labelledby="catalog-calendar"] .calendar-specimen__month-control button[aria-label="Mes siguiente"]')?.click();true`);
      const november=await getCalendar();
      assert.equal(november.label,'noviembre de 2026','Month name and "de" must remain lowercase');
      const nextMonth=await evaluate(`(() => {
        const days=document.querySelector('.catalog__section[aria-labelledby="catalog-calendar"] .zenit-calendar__days');
        return {height:days?.getBoundingClientRect().height,count:days?.children.length};
      })()`);
      assert.equal(nextMonth.count,42,'November must retain six calendar rows');
      assert.equal(nextMonth.height,stableMonth.height,'Calendar must not resize when switching months');
      await selectRegional('week','Domingo');
      assert.equal((await getCalendar()).codes,'DLMMJVS');
      await selectRegional('week','Sábado');
      assert.equal((await getCalendar()).codes,'SDLMMJV');
      await selectRegional('week','Lunes');
      assert.equal((await getCalendar()).codes,'LMMJVSD');
      await selectRegional('week','Según la región');
      for (const [label,expected] of [['Português (Brasil)','DSTQQSS'],['English (US)','SMTWTFS']]) {
        await selectRegional('locale',label);
        const current=await getCalendar();
        assert.equal(current.codes,expected,`Locale weekday sequence failed for ${label}`);
        assert.ok(current.centerDelta<=2,`Calendar not centered in ${label}`);
      }
      await selectRegional('locale','עברית');
      const hebrew=await getCalendar();
      assert.ok(hebrew.direction==='rtl'&&hebrew.centerDelta<=2,`Calendar not centered in RTL: ${JSON.stringify(hebrew)}`);
      await selectRegional('locale','العربية');
      const arabic=await getCalendar();
      assert.ok(arabic.direction==='rtl'&&arabic.codes.length>0&&arabic.names.length===7&&arabic.centerDelta<=2,
        'Arabic weekdays must remain accessible and RTL-centered');
      await selectRegional('locale','Español');
      await selectRegional('calendar','Hebreo (motor pendiente)');
      const unsupported=await getCalendar();
      assert.ok(unsupported.system==='hebrew'&&!unsupported.hasDays,'Unimplemented Hebrew engine must not show Gregorian day buttons');
      await selectRegional('calendar','Gregoriano');
      await selectRegional('hours','12 horas (AM/PM)');
      await evaluate(`document.querySelector('.datetime-demo__mode .zenit-select__trigger')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__mode .zenit-select__popover"))','DateTime mode did not open');
      await evaluate(`[...document.querySelectorAll('.datetime-demo__mode .zenit-select__option')].find(el=>el.textContent.trim()==='Hora')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__clock .temporal-wheel__track"))','Time wheel did not render');
      const clock=await evaluate(`(() => ({
        period:!!document.querySelector('.datetime-demo__clock .temporal-wheel__period'),
        wheelUnits:document.querySelectorAll('.datetime-demo__clock .temporal-wheel__unit').length,
        wheelCells:document.querySelectorAll('.datetime-demo__clock .temporal-wheel__unit:first-child button').length,
        text:document.querySelector('.datetime-demo__summary')?.textContent,
        writable:!!document.querySelector('.datetime-demo__clock .temporal-time-input__field input')
      }))()`);
      assert.ok(clock.period && clock.wheelUnits===2 && clock.wheelCells===3 && clock.writable &&
        clock.text.includes('PM'),'AM/PM mode must provide 3-value wheel plus writable field');
      await selectRegional('hours','24 horas');
      await waitFor('!document.querySelector(".datetime-demo__clock .temporal-wheel__period")',
        'Hour-cycle change did not remove AM/PM control');
      const typeTime=async (selector,value)=>{
        await evaluate(`(() => {
          const input=document.querySelector('${selector}');
          input.focus();input.select();
          return true;
        })()`);
        await send('Input.insertText',{text:value});
        await waitFor(`document.querySelector('${selector}')?.value==='${value}'`,
          `Text insertion failed for ${selector}`);
        await sleep(90);
        await evaluate(`document.querySelector('${selector}')?.blur();true`);
      };
      await typeTime('.datetime-demo__clock .temporal-time-input__field input','2000');
      await waitFor('document.querySelector(".datetime-demo__summary")?.textContent?.includes("20:00")',
        'Compact numeric time entry 2000 must normalize to 20:00');
      await typeTime('.datetime-demo__clock .temporal-time-input__field input','16:45');
      await waitFor('document.querySelector(".datetime-demo__summary")?.textContent?.includes("16:45")',
        'Direct time entry must commit one shared controlled time value');
      await evaluate(`document.querySelector('.datetime-demo__presentation .zenit-select__trigger')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__presentation .zenit-select__popover"))',
        'Time renderer selector did not open');
      await evaluate(`[...document.querySelectorAll('.datetime-demo__presentation .zenit-select__option')].find(el=>el.textContent.trim()==='Solo escritura')?.click();true`);
      await waitFor('!document.querySelector(".datetime-demo__clock .temporal-wheel")','Text-only renderer failed to replace wheel');
      assert.equal(await evaluate('document.querySelector(".datetime-demo__clock .temporal-time-input__field input")?.value'),'16:45',
        'Time value must remain unchanged when renderer changes');
      await evaluate(`document.querySelector('.datetime-demo__presentation .zenit-select__trigger')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__presentation .zenit-select__popover"))','Renderer menu did not reopen');
      await evaluate(`[...document.querySelectorAll('.datetime-demo__presentation .zenit-select__option')].find(el=>el.textContent.trim()==='Selector y escritura')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__clock .temporal-wheel__track"))','Hybrid renderer did not restore wheel');
      await evaluate(`document.querySelector('.datetime-demo__mode .zenit-select__trigger')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__mode .zenit-select__popover"))','Picker mode selector did not reopen');
      await evaluate(`[...document.querySelectorAll('.datetime-demo__mode .zenit-select__option')].find(el=>el.textContent.trim()==='Rango de fechas')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__calendar [data-calendar-day]"))','Range calendar failed to render');
      await evaluate(`document.querySelector('.datetime-demo__calendar [data-calendar-day="12"]')?.click();true`);
      await evaluate(`document.querySelector('.datetime-demo__calendar [data-calendar-day="16"]')?.click();true`);
      await waitFor('document.querySelector(".datetime-demo__metrics")?.textContent?.includes("noches")',
        'Selected calendar date range did not compute days and nights');
      const counts=await evaluate(`[...document.querySelectorAll('.datetime-demo__metrics>span strong')].map(el=>el.textContent.trim())`);
      assert.deepEqual(counts,['5','4','4'],'Four nights must differ from five inclusive calendar days');
      await evaluate(`[...document.querySelectorAll('.datetime-demo__actions button')].find(el=>el.textContent.includes('Validar selección'))?.click();true`);
      await waitFor('document.querySelector(".datetime-demo__message")?.textContent?.includes("Selección validada")',
        'Valid date range failed local validation');
      await evaluate(`document.querySelector('.datetime-demo__mode .zenit-select__trigger')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__mode .zenit-select__popover"))',
        'Picker mode unavailable for multiple dates');
      await evaluate(`[...document.querySelectorAll('.datetime-demo__mode .zenit-select__option')].find(el=>el.textContent.trim()==='Varios días')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__calendar [data-calendar-day]"))',
        'Multi-date calendar did not render');
      await evaluate(`document.querySelector('.datetime-demo__calendar [data-calendar-day="12"]')?.click();true`);
      await evaluate(`document.querySelector('.datetime-demo__calendar [data-calendar-day="16"]')?.click();true`);
      await waitFor('document.querySelector(".datetime-demo__summary")?.textContent?.includes("2 días individuales")',
        'Non-consecutive day selection did not count both days');
      await evaluate(`document.querySelector('.datetime-demo__calendar [data-calendar-day="16"]')?.click();true`);
      await waitFor('document.querySelector(".datetime-demo__summary")?.textContent?.includes("1 días individuales")',
        'Non-consecutive day toggling did not deselect previous day');
      await evaluate(`document.querySelector('.datetime-demo__mode .zenit-select__trigger')?.click();true`);
      await waitFor('Boolean(document.querySelector(".datetime-demo__mode .zenit-select__popover"))','Time range mode selector unavailable');
      await evaluate(`[...document.querySelectorAll('.datetime-demo__mode .zenit-select__option')].find(el=>el.textContent.trim()==='Intervalo horario')?.click();true`);
      await waitFor('document.querySelectorAll(".datetime-demo__time-range .temporal-time-input__field input").length===2',
        'Time range must have two editable endpoints');
      await typeTime('.datetime-demo__time-range .temporal-time-input:first-child input','22:30');
      await typeTime('.datetime-demo__time-range .temporal-time-input:last-child input','02:15');
      await waitFor('document.querySelector(".datetime-demo__duration")?.textContent?.includes("cruza medianoche")',
        'Cross-midnight should require explicit authorization');
      await evaluate(`[...document.querySelectorAll('.datetime-demo__checkbox input')].find(el=>el.parentElement.textContent.includes('día siguiente'))?.click();true`);
      await waitFor('document.querySelector(".datetime-demo__duration")?.textContent?.includes("3 h 45 min")',
        'Cross-midnight duration must compute 3h 45min');
      process.stdout.write('PASS editable date/time, 3-value wheel, renderer switching, range/nights, multi-date and midnight duration\\n');

      await evaluate(`document.querySelector('.forms-demo button[type="submit"]')?.click();true`);
      await waitFor('document.querySelectorAll(".forms-demo__error").length===3','Form did not flag required fields');
      await evaluate(`(() => {
        const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
        const fields=[['#forms-demo-title','Ejemplo válido'],['#forms-demo-email','prueba@ejemplo.com']];
        for(const [selector,value] of fields) {
          const input=document.querySelector(selector);
          setter.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));
        }
        document.querySelector('.forms-demo__consent input')?.click();
        return true;
      })()`);
      await evaluate(`document.querySelector('.forms-demo button[type="submit"]')?.click();true`);
      await waitFor('Boolean(document.querySelector(".forms-demo__success"))','Valid form failed its local-only submission');
      await selectRegional('week','Sábado');
      await waitFor('Boolean(document.querySelector(".regional-prefs__actions button:not(:disabled)"))',
        'Preferences changes should require explicit save');
      await evaluate(`[...document.querySelectorAll('.regional-prefs__actions button')].find(el=>el.textContent.includes('Guardar preferencias'))?.click();true`);
      await waitFor('document.querySelector(".regional-prefs__notice")?.textContent?.includes("guardadas")',
        'Regional preferences failed to persist demo settings');
      const saved=await evaluate(`JSON.parse(localStorage.getItem('zenit-design-lab-regional-demo-v1'))?.weekStart`);
      assert.equal(saved,'saturday','Saved demo settings must retain independent week start');
      await evaluate(`[...document.querySelectorAll('.regional-prefs__actions button')].find(el=>el.textContent.includes('Restablecer valores'))?.click();true`);
      assert.equal((await getCalendar()).codes,'LMMJVSD','Reset must update live preview before saving');
      await evaluate(`[...document.querySelectorAll('.regional-prefs__actions button')].find(el=>el.textContent.includes('Guardar preferencias'))?.click();true`);
      await waitFor('document.querySelector(".regional-prefs__notice")?.textContent?.includes("guardadas")',
        'Reset preferences could not be persisted');
      process.stdout.write('PASS locale/week-start/calendar-system/hour-cycle, centered LTR/RTL dates, native lowercase months, form validation and demo preference save/reset\\n');

      const timezoneSelector=await evaluate(`(() => ({
        select:!!document.querySelector('.regional-prefs__timezone-select .zenit-select__trigger'),
        freeText:!!document.querySelector('.regional-prefs__timezone-choice>input'),
        visible:document.querySelector('.regional-prefs__timezone-select .zenit-select__value')?.textContent
      }))()`);
      assert.ok(timezoneSelector.select&&!timezoneSelector.freeText,
        'Timezone must be selected from a searchable IANA catalogue, never entered as arbitrary free text');
      await evaluate(`document.querySelector('.regional-prefs__timezone-select .zenit-select__trigger')?.click();true`);
      await waitFor('Boolean(document.querySelector(".regional-prefs__timezone-select .zenit-select__popover"))',
        'Timezone selector failed to open');
      const optionsCount=await evaluate('document.querySelectorAll(".regional-prefs__timezone-select .zenit-select__option").length');
      assert.ok(optionsCount>10,'Timezone catalogue should include more than an arbitrary handful of zones');
      await evaluate(`[...document.querySelectorAll('.regional-prefs__timezone-select .zenit-select__option')]
        .find(el=>el.textContent.includes('America/New_York'))?.click();true`);
      await waitFor('document.querySelector(".regional-prefs__timezone-select .zenit-select__value")?.textContent?.includes("Nueva York")',
        'Friendly timezone label/selection failed');
      await evaluate(`document.querySelector('.regional-prefs__timezone-select .zenit-select__trigger')?.click();true`);
      await waitFor('Boolean(document.querySelector(".regional-prefs__timezone-select .zenit-select__popover"))',
        'Timezone selector did not reopen');
      await evaluate(`[...document.querySelectorAll('.regional-prefs__timezone-select .zenit-select__option')]
        .find(el=>el.textContent.includes('America/Sao_Paulo'))?.click();true`);
      await waitFor('document.querySelector(".regional-prefs__timezone-select .zenit-select__value")?.textContent?.includes("São Paulo")',
        'Timezone reset in picker failed');
      process.stdout.write('PASS searchable IANA timezone picker, friendly city labels and no free text\\n');

      const skinGeometry=await evaluate(`(() => {
        const a=document.querySelector('[data-temporal-host="zenit"]');
        const b=document.querySelector('[data-temporal-host="client"]');
        const zi=a?.querySelector('.temporal-time-input__field input');
        const ci=b?.querySelector('.temporal-time-input__field input');
        return {zenitBackground:a?getComputedStyle(a).backgroundColor:null,
          clientBackground:b?getComputedStyle(b).backgroundColor:null,
          zenitField:zi?.value,clientField:ci?.value,
          zenitWidth:a?.getBoundingClientRect().width,clientWidth:b?.getBoundingClientRect().width};
      })()`);
      assert.notEqual(skinGeometry.zenitBackground,skinGeometry.clientBackground,
        'Two independent consumers must render genuinely different semantic skins');
      assert.equal(skinGeometry.zenitField,skinGeometry.clientField,
        'Different skins must initially reflect exactly the same time');
      await typeTime('[data-temporal-host="client"] .temporal-time-input__field input','17:20');
      await waitFor('document.querySelector("[data-temporal-host=zenit] .temporal-time-input__field input")?.value==="17:20"',
        'Independent client-skinned renderer failed to synchronize shared controlled time');
      assert.equal(await evaluate('document.querySelector(".temporal-portability__value strong")?.textContent'),'17:20',
        'Product-neutral shared time contract did not update');
      process.stdout.write('PASS two independent host skins share the exact same functional controlled time\\n');
      await evaluate(`document.querySelector('[data-temporal-counter="countdown"] .temporal-live-demo__quick button:first-child')?.click();true`);
      const countdown=await evaluate(`(() => {
        const root=document.querySelector('[data-temporal-counter="countdown"]');
        const date=root.querySelector('input[type=date]')?.value;
        const time=root.querySelector('input[type=time]')?.value;
        const zone=root.querySelector('.temporal-live-demo__timezone')?.textContent;
        const status=root.querySelector('.temporal-live-demo__state')?.textContent;
        return {date,time,zone,status,unitCount:root.querySelectorAll('.temporal-duration__cell').length};
      })()`);
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(countdown.date)&&/^\d{2}:\d{2}$/.test(countdown.time)&&
        countdown.zone.includes('Zona horaria')&&countdown.status==='Tiempo restante'&&countdown.unitCount===4,
        'Countdown must use local date/time fields, display zone and show live durations');
      const timerFieldSelector='[data-temporal-counter="timer"] input[aria-label="Segundos del temporizador"]';
      await evaluate(`(() => {
        const input=document.querySelector('${timerFieldSelector}');
        const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
        setter.call(input,'6');input.dispatchEvent(new Event('input',{bubbles:true}));
        return true;
      })()`);
      await evaluate(`[...document.querySelectorAll('[data-temporal-counter="timer"] button')].find(el=>el.textContent.includes('Aplicar duración'))?.click();true`);
      await waitFor('document.querySelector("[data-temporal-counter=timer] .temporal-duration__cell:nth-child(4) strong")?.textContent==="06"',
        'Timer could not accept a new duration');
      await evaluate(`[...document.querySelectorAll('[data-temporal-counter="timer"] button')].find(el=>el.textContent.includes('Iniciar'))?.click();true`);
      await waitFor('document.querySelector("[data-temporal-counter=timer] .temporal-live-demo__state")?.textContent==="En curso"',
        'Timer failed to start');
      await sleep(1150);
      await evaluate(`[...document.querySelectorAll('[data-temporal-counter="timer"] button')].find(el=>el.textContent.includes('Pausar'))?.click();true`);
      await waitFor('document.querySelector("[data-temporal-counter=timer] .temporal-live-demo__state")?.textContent==="En pausa"',
        'Timer failed to pause');
      const pauseValue=await evaluate('document.querySelector("[data-temporal-counter=timer] .temporal-duration__cell:nth-child(4) strong")?.textContent');
      await sleep(700);
      assert.equal(await evaluate('document.querySelector("[data-temporal-counter=timer] .temporal-duration__cell:nth-child(4) strong")?.textContent'),pauseValue,
        'Paused timer must not consume remaining time');
      await evaluate(`[...document.querySelectorAll('[data-temporal-counter="timer"] button')].find(el=>el.textContent.includes('Reanudar'))?.click();true`);
      await waitFor('document.querySelector("[data-temporal-counter=timer] .temporal-live-demo__state")?.textContent==="En curso"',
        'Timer failed to resume');
      await evaluate(`[...document.querySelectorAll('[data-temporal-counter="timer"] button')].find(el=>el.textContent.includes('Restablecer'))?.click();true`);
      await waitFor('document.querySelector("[data-temporal-counter=timer] .temporal-live-demo__state")?.textContent==="Listo"',
        'Timer failed to reset');
      process.stdout.write('PASS active countdown, configurable timer, start/pause/resume/reset with stable pause\\n');

      const opInitial=await evaluate(`(() => ({
        panel:!!document.querySelector('[data-operational-workbench]'),
        desktopRows:document.querySelectorAll('.operational-records__desktop tbody tr').length,
        mobileCards:document.querySelectorAll('.operational-records__card').length,
        count:document.querySelector('.operational-records__footer')?.textContent,
        title:document.querySelector('#catalog-operational')?.textContent
      }))()`);
      assert.ok(opInitial.panel&&opInitial.desktopRows===5&&opInitial.mobileCards===5&&
        opInitial.count.includes('1–5 de 17'),'Operational view must paginate 17 synthetic records by 5');
      await evaluate(`[...document.querySelectorAll('.operational-records__pages button')].find(el=>el.textContent.includes('Siguiente'))?.click();true`);
      await waitFor('document.querySelector(".operational-records__footer")?.textContent?.includes("6–10 de 17")',
        'Operational pagination failed');
      const beforeSelectTop=await evaluate('document.querySelector(".operational-records__desktop")?.getBoundingClientRect().top');
      await evaluate(`document.querySelector('.operational-records__desktop tbody tr input[type=checkbox]')?.click();true`);
      await waitFor('document.querySelector(".operational-records__selected")?.textContent?.includes("1 seleccionado")',
        'Operational row selection failed');
      const afterSelectTop=await evaluate('document.querySelector(".operational-records__desktop")?.getBoundingClientRect().top');
      assert.ok(Math.abs(beforeSelectTop-afterSelectTop)<=1,'Selecting a checkbox moved the records table vertically');
      const rowSelected=await evaluate('document.querySelector(".operational-records__desktop tbody tr input[type=checkbox]")?.checked');
      assert.equal(rowSelected,true,'Checkbox must reflect selection');
      await evaluate(`document.querySelector('.operational-records__search input')?.focus();true`);
      await send('Input.insertText',{text:'Registro 17'});
      await waitFor('document.querySelector(".operational-records__footer")?.textContent?.includes("1–1 de 1")',
        'Operational query did not filter across all rows and reset page');
      assert.equal(await evaluate('document.querySelector(".operational-records__selected")?.textContent?.includes("1 seleccionado")'),true,
        'Selection should survive filters rather than silently reset');
      await evaluate(`[...document.querySelectorAll('.operational-workbench__simulation button')].find(el=>el.textContent==='Error')?.click();true`);
      await waitFor('Boolean(document.querySelector(".operational-records__state[role=alert]"))',
        'Operational fetch error state missing');
      await evaluate(`[...document.querySelectorAll('.operational-records__state button')].find(el=>el.textContent.includes('Reintentar'))?.click();true`);
      await waitFor('!document.querySelector(".operational-records__state[role=alert]")',
        'Operational error retry did not recover');
      await evaluate(`[...document.querySelectorAll('.operational-workbench__action-buttons button')].find(el=>el.textContent.includes('Restablecer ejemplo'))?.click();true`);
      await waitFor('document.querySelector(".operational-records__footer")?.textContent?.includes("1–5 de 17")',
        'Operational reset did not restore initial model');
      process.stdout.write('PASS universal operational records: paging, selection across filters, error retry and reset\\n');
      assert.equal(await evaluate('document.querySelectorAll("#catalog-operational").length'),1,
        'One canonical operational/records heading is required');
      assert.equal(await evaluate('document.querySelectorAll("#catalog-table").length'),0,
        'Legacy duplicated tables heading must be removed');
      assert.equal(await evaluate('document.querySelectorAll("[data-operational-workbench]").length'),1,
        'Only one interactive shared table should be mounted');
      // Synthetic columns and guide controls; never mutate a real product data model.
      await evaluate(`(() => {
        const input=document.querySelector('[aria-label="Nombre de columna nueva"]');
        const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
        setter.call(input,'Responsable');input.dispatchEvent(new Event('input',{bubbles:true}));
        return true;
      })()`);
      await evaluate(`[...document.querySelectorAll('[data-column-manager] button')].find(el=>el.textContent.includes('Añadir columna'))?.click();true`);
      await waitFor('Boolean(document.querySelector("input[aria-label=\\"Responsable de Registro 01\\"]"))',
        'New synthetic editable column not rendered');
      await evaluate(`(() => {
        const input=document.querySelector('[data-column-title="name"]');
        input.focus();input.select();return true;
      })()`);
      await send('Input.insertText',{text:'Referencia principal'});
      await waitFor('document.querySelector("[data-column-title=name]")?.value==="Referencia principal"',
        'New guide column title not editable');
      await evaluate(`document.querySelector('[data-column-title="name"]')?.blur();true`);
      await waitFor('document.querySelector(".operational-records__desktop thead th:nth-child(2)")?.textContent?.includes("Referencia principal")',
        'Renaming the first (guide) data column did not update the visible header');
      assert.equal(await evaluate('document.querySelector(".operational-records__desktop tbody tr:first-child td:nth-child(2)")?.textContent?.includes("Registro 01")'),true,
        'Renaming a guide column must not mutate the underlying record');
            await evaluate(`document.querySelector('[aria-label="Fijar primera columna"]')?.click();true`);
      await waitFor('document.querySelector(".operational-records--freeze-first-column")!==null',
        'Freeze-first-column toggle not applied');
      const sticky=await evaluate(`(() => ({
        first:getComputedStyle(document.querySelector('.operational-records__desktop th:first-child')).position,
        second:getComputedStyle(document.querySelector('.operational-records__desktop th:nth-child(2)')).position,
        scroll:getComputedStyle(document.querySelector('.operational-records__desktop')).overflowX,
        cards:document.querySelectorAll('.operational-records__mobile .operational-records__card').length
      }))()`);
      assert.equal(sticky.first,'sticky','Guide checkbox column must be sticky in desktop grid');
      assert.equal(sticky.second,'sticky','Guide first data column must be sticky in desktop grid');
      assert.ok(['auto','scroll'].includes(sticky.scroll),'Scroll should remain internal to desktop table');
      assert.equal(sticky.cards,5,'Adding a column must preserve mobile card display');
      await evaluate(`[...document.querySelectorAll('.operational-workbench__action-buttons button')].find(el=>el.textContent.includes('Restablecer ejemplo'))?.click();true`);
      process.stdout.write('PASS stable layout, synthetic column add and fixed guide columns\\n');

      await evaluate("document.querySelector('[data-remote-page-demo]')?.click();true");
      await waitFor('document.querySelector("[data-remote-page-demo]")?.checked===true',
        'Remote-page synthetic mode did not activate');
      await waitFor('document.querySelector(".operational-records__footer")?.textContent?.includes("1–5 de 17")',
        'Remote server total is not displayed');
      for (let step=0;step<2;step++) {
        await evaluate("[...document.querySelectorAll('.operational-records__pages button')].find(el=>el.textContent.includes('Siguiente'))?.click();true");
      }
      await waitFor('document.querySelector(".operational-records__footer")?.textContent?.includes("11–15 de 17")',
        'Remote third page was re-paginated locally or lost server total');
      const remoteCheck=await evaluate("(() => ({rows:document.querySelectorAll('.operational-records__desktop tbody tr').length,first:document.querySelector('.operational-records__desktop tbody tr td:nth-child(2)')?.textContent}))()");
      assert.equal(remoteCheck.rows,5,'Remote third page must render all five server-supplied rows');
      assert.ok(remoteCheck.first?.includes('Registro 11'),'Remote page must keep server-provided row order');
      await evaluate("document.querySelector('.operational-records__desktop tbody tr input[type=checkbox]')?.click();true");
      await waitFor('document.querySelector(".operational-records__selected")?.textContent?.includes("1 seleccionado")',
        'Remote-page selection failed');
      await evaluate("[...document.querySelectorAll('.operational-records__pages button')].find(el=>el.textContent.includes('Siguiente'))?.click();true");
      await waitFor('document.querySelector(".operational-records__footer")?.textContent?.includes("16–17 de 17")',
        'Remote last page did not preserve its two rows');
      assert.equal(await evaluate('document.querySelector(".operational-records__selected")?.textContent?.includes("1 seleccionado")'),true,
        'Remote selection must survive a page change');
      await evaluate("[...document.querySelectorAll('.operational-records__pages button')].find(el=>el.textContent.includes('Anterior'))?.click();true");
      await waitFor('document.querySelector(".operational-records__footer")?.textContent?.includes("11–15 de 17")',
        'Remote previous page navigation failed');
      assert.equal(await evaluate('document.querySelector(".operational-records__desktop tbody tr input[type=checkbox]")?.checked'),true,
        'Selected record must remain checked on returning to its server page');
      await evaluate("[...document.querySelectorAll('.operational-workbench__action-buttons button')].find(el=>el.textContent.includes('Restablecer ejemplo'))?.click();true");
      process.stdout.write('PASS synthetic server-owned pagination, third-page rows, authoritative counts and persistent selection\n');

      const avatarGeometry=await evaluate(`(() => {
        const product=document.querySelector('.header-controls .zenit-select:nth-child(1) .zenit-select__trigger').getBoundingClientRect();
        const appearance=document.querySelector('.header-controls .zenit-select:nth-child(2) .zenit-select__trigger').getBoundingClientRect();
        const avatar=document.querySelector('.profile-menu__avatar').getBoundingClientRect();
        return {productMid:(product.top+product.bottom)/2,appearanceMid:(appearance.top+appearance.bottom)/2,
          avatarMid:(avatar.top+avatar.bottom)/2,avatarRight:avatar.right,productRight:product.right};
      })()`);
      assert.ok(Math.abs(avatarGeometry.productMid-avatarGeometry.appearanceMid)<=2 &&
        Math.abs(avatarGeometry.productMid-avatarGeometry.avatarMid)<=2,
        `Desktop profile icon not aligned with product and appearance fields: ${JSON.stringify(avatarGeometry)}`);
      await evaluate(`document.querySelector('.profile-menu__trigger')?.click(); true`);
      await waitFor('Boolean(document.querySelector(".profile-menu__popover"))',
        'Desktop profile options were not displayed');
      const profile=await evaluate(`(() => {
        const p=document.querySelector('.profile-menu__popover'),a=document.querySelector('.profile-menu__avatar');
        const r=p.getBoundingClientRect(),b=a.getBoundingClientRect();
        return {role:p.getAttribute('role'),width:r.width,top:r.top,avatarBottom:b.bottom,
          options:[...p.querySelectorAll('.profile-menu__option')].map(el=>el.textContent.trim())};
      })()`);
      assert.equal(profile.role,'menu');
      assert.equal(profile.options.length,6);
      assert.ok(profile.options.includes('Preferencias')&&profile.options.includes('Organización')&&
        profile.top>profile.avatarBottom,'Profile dropdown must be anchored below avatar');
      await evaluate(`[...document.querySelectorAll('.profile-menu__option')].find(el=>el.textContent.includes('Preferencias'))?.click(); true`);
      await waitFor('!document.querySelector(".profile-menu__popover")','Desktop profile menu did not close after action');
      await waitFor('document.querySelector(".notice")?.textContent?.includes("preferencias")',
        'Profile preference action must show honest demonstration feedback');
      process.stdout.write('PASS desktop profile vertical alignment, six-item menu, anchored popup and safe actions\n');

      await evaluate(`Array.from(document.querySelectorAll('.nav-item')).find(node => node.textContent.includes('Redacción'))?.click(); true`);
      await waitFor('Boolean(document.querySelector(".editorial-hero"))', 'Editorial demo did not render');
      const editorial = await evaluate(`(() => ({
        title:document.querySelector('.editorial-hero h1')?.textContent,
        extraneous:document.querySelector('.editorial-disclaimer')?.textContent ?? null,
        heroParagraphs:document.querySelectorAll('.editorial-hero p').length,
        helper:!!document.querySelector('.editorial-hero .context-help__trigger'),
      }))()`);
      assert.equal(editorial.title,'Producción editorial');
      assert.equal(editorial.extraneous,null,'Editorial disclaimer must not occupy permanent workspace space');
      assert.equal(editorial.heroParagraphs,0,'Editorial hero must not contain persistent explanatory paragraphs');
      assert.ok(editorial.helper,'The demo description must be available through contextual information');
      await evaluate(`document.querySelector('.editorial-hero .context-help__trigger')?.click(); true`);
      await waitFor('Boolean(document.querySelector(".editorial-hero .context-help__popover"))', 'Contextual help did not open');
      process.stdout.write('PASS editorial workspace remains copy-efficient with accessible contextual info\n');
    }
  }
  for (const width of [375,1024]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:width<=700});
    await send('Page.navigate',{url:url+'temporal-embed.html'});
    await waitFor('Boolean(document.querySelector("[data-standalone-host=true] [data-temporal-host=client]"))',
      'Independent temporal host did not load');
    const isolated=await evaluate(`(() => {
      const root=document.querySelector('[data-standalone-host=true]'),a=root.querySelector('[data-temporal-host=zenit]'),
        b=root.querySelector('[data-temporal-host=client]'),z=a.querySelector('input'),c=b.querySelector('input');
      return {labCount:document.querySelectorAll('.lab').length,
        appNav:!!document.querySelector('.app-chrome'),rootWidth:root.getBoundingClientRect().width,
        viewport:window.innerWidth,documentWidth:document.documentElement.scrollWidth,
        firstSkin:getComputedStyle(a).backgroundColor,secondSkin:getComputedStyle(b).backgroundColor,
        firstValue:z.value,secondValue:c.value};
    })()`);
    assert.equal(isolated.labCount,0,'Standalone temporal host must never require .lab ancestor');
    assert.equal(isolated.appNav,false,'Host must not mount global Design Lab shell');
    assert.ok(isolated.documentWidth<=width+1,'Standalone host overflowed viewport');
    assert.notEqual(isolated.firstSkin,isolated.secondSkin,'Independent host skins were not distinct');
    assert.equal(isolated.firstValue,isolated.secondValue,'Independent consumers do not share state');
    await evaluate(`(() => {
      const input=document.querySelector('[data-temporal-host=client] input');
      input.focus();input.select();return true;
    })()`);
    await send('Input.insertText',{text:'19:05'});
    await waitFor('document.querySelector("[data-temporal-host=client] input")?.value==="19:05"',
      'Standalone host input did not accept typed time');
    await sleep(80);
    await evaluate('document.querySelector("[data-temporal-host=client] input")?.blur();true');
    await waitFor('document.querySelector("[data-temporal-host=zenit] input")?.value==="19:05"',
      'Standalone host did not synchronize time across independent skins');
    process.stdout.write(`PASS isolated temporal host at ${width}px: no Lab, two skins, shared contract, no overflow\\n`);
  }
  process.stdout.write('Browser layout checks passed. Screenshot comparisons and screen-reader QA remain pending.\n');
} finally {
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  browser.kill('SIGTERM');
  server.close();
  // Chromium may still flush profile state after SIGTERM. Cleanup must not
  // mask passing browser assertions because Windows/Linux runners differ.
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
