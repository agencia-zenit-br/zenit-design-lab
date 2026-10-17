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
      desktopTableDisplay: document.querySelector('.catalog__table-scroll') ? getComputedStyle(document.querySelector('.catalog__table-scroll')).display : null,
      mobileRecordsDisplay: document.querySelector('.catalog__mobile-records') ? getComputedStyle(document.querySelector('.catalog__mobile-records')).display : null,
      mobileCardCount: document.querySelectorAll('.catalog__mobile-card').length,
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
        assert.equal(state.mobileCardCount, 3, 'Mobile list should show every sample record');
      } else {
        assert.notEqual(state.desktopTableDisplay, 'none', 'Desktop table must remain available');
        assert.equal(state.mobileRecordsDisplay, 'none', 'Dedicated mobile cards must remain hidden on desktop and tablet');
      }
      if (width <= 700) {
        const cards=await evaluate(`[...document.querySelectorAll('.catalog__mobile-card')].map(card=>{
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
      const cardLayout = await evaluate(`(() => {
        const card=document.querySelector('.catalog__mobile-card');
        const box=card?.querySelector('.catalog__mobile-card-select input[type="checkbox"]');
        const title=card?.querySelector('.catalog__mobile-card-title input');
        const category=card?.querySelector('.catalog__mobile-card-field:first-child input');
        const status=card?.querySelector('.catalog__mobile-card-field:last-child input');
        const r=card?.getBoundingClientRect(),b=box?.getBoundingClientRect(),
          t=title?.getBoundingClientRect(),c=category?.getBoundingClientRect(),s=status?.getBoundingClientRect();
        return {cardLeft:r?.left,cardRight:r?.right,
          checkRight:b?.right,checkCenterY:b?(b.top+b.bottom)/2:null,
          titleLeft:t?.left,titleCenterY:t?(t.top+t.bottom)/2:null,
          categoryWidth:c?.width,statusWidth:s?.width,
          categoryTop:c?.top,statusTop:s?.top,categoryHeight:c?.height,statusHeight:s?.height};
      })()`);
      assert.ok(cardLayout.checkRight<=cardLayout.titleLeft &&
        cardLayout.titleLeft-cardLayout.checkRight<=25,
        `Mobile checkbox must be next to its own record title: ${JSON.stringify(cardLayout)}`);
      assert.ok(Math.abs(cardLayout.checkCenterY-cardLayout.titleCenterY)<=9,
        `Checkbox and record name must share visual center: ${JSON.stringify(cardLayout)}`);
      assert.ok(Math.abs(cardLayout.categoryWidth-cardLayout.statusWidth)<2 &&
        Math.abs(cardLayout.categoryHeight-cardLayout.statusHeight)<2 &&
        Math.abs(cardLayout.categoryTop-cardLayout.statusTop)<2,
        `Mobile metadata fields must have identical aligned geometry: ${JSON.stringify(cardLayout)}`);
      const editMobileCard = await evaluate(`(() => {
        const title=document.querySelector('.catalog__mobile-card-title input');
        const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
        setter.call(title,'Documento corregido');
        title.dispatchEvent(new Event('input',{bubbles:true}));
        return true;
      })()`);
      assert.ok(editMobileCard,'Mobile record field must remain editable');
      await waitFor('document.querySelector(".catalog__mobile-card-title input")?.value === "Documento corregido"',
        'Mobile record name editing did not synchronize');
      process.stdout.write('PASS purpose-built mobile record cards: adjacent checkbox, equal metadata fields, live edit\\n');
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
      process.stdout.write('PASS mobile profile alignment and accessible profile action popup\\n');

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
      const weekdayLabels=await evaluate(`(() => ({
        codes:[...document.querySelectorAll('#catalog-calendar .zenit-calendar__weekday')].map(el=>el.textContent.trim()).join(''),
        fullNames:[...document.querySelectorAll('#catalog-calendar .zenit-calendar__weekday')].map(el=>el.getAttribute('aria-label')),
        firstCalendarDay:document.querySelector('#catalog-calendar [data-calendar-day="1"]')?.getAttribute('aria-label'),
      }))()`);
      assert.equal(weekdayLabels.codes,'LMMJVSD','Spanish weekday initials must use L M M J V S D, never X');
      assert.ok(weekdayLabels.fullNames[1]!==weekdayLabels.fullNames[2] &&
        weekdayLabels.fullNames[1].toLowerCase().includes('martes') &&
        weekdayLabels.fullNames[2].toLowerCase().includes('miércoles'),
        'Calendar must expose different accessible names for both M initials');
      assert.ok(weekdayLabels.firstCalendarDay,'Calendar day buttons must have full localized date names');
      for(const [label, expected] of [['Português (BR)','DSTQQSS'],['English (US)','SMTWTFS']]) {
        await evaluate(`document.querySelector('.calendar-specimen .zenit-select__trigger')?.click(); true`);
        await waitFor('Boolean(document.querySelector(".calendar-specimen .zenit-select__popover"))',
          'Calendar locale selector did not open');
        await evaluate(`[...document.querySelectorAll('.calendar-specimen .zenit-select__option')].find(el=>el.textContent.includes('${label}'))?.click(); true`);
        await waitFor(`[...document.querySelectorAll('#catalog-calendar .zenit-calendar__weekday')].map(el=>el.textContent.trim()).join('')==='${expected}'`,
          `Calendar weekday symbols do not match requested locale: ${label}`);
      }
      await evaluate(`document.querySelector('.calendar-specimen .zenit-select__trigger')?.click(); true`);
      await waitFor('Boolean(document.querySelector(".calendar-specimen .zenit-select__popover"))',
        'Calendar locale menu unavailable after change');
      await evaluate(`[...document.querySelectorAll('.calendar-specimen .zenit-select__option')].find(el=>el.textContent.includes('עברית'))?.click(); true`);
      await waitFor('document.querySelector(".calendar-specimen")?.getAttribute("dir")==="rtl"',
        'Hebrew calendar preview must use RTL');
      await evaluate(`document.querySelector('.calendar-specimen .zenit-select__trigger')?.click(); true`);
      await waitFor('Boolean(document.querySelector(".calendar-specimen .zenit-select__popover"))',
        'Calendar locale menu unavailable for Spanish reset');
      await evaluate(`[...document.querySelectorAll('.calendar-specimen .zenit-select__option')].find(el=>el.textContent.includes('Español'))?.click(); true`);
      await waitFor('[...document.querySelectorAll("#catalog-calendar .zenit-calendar__weekday")].map(el=>el.textContent.trim()).join("") === "LMMJVSD"',
        'Calendar failed to return to Spanish configuration');
      process.stdout.write('PASS calendar weekdays Spanish LMMJVSD, PT-BR, English, Hebrew RTL and accessible names\\n');

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
      process.stdout.write('PASS desktop profile vertical alignment, six-item menu, anchored popup and safe actions\\n');

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
  process.stdout.write('Browser layout checks passed. Screenshot comparisons and screen-reader QA remain pending.\n');
} finally {
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  browser.kill('SIGTERM');
  server.close();
  await rm(profile, { recursive: true, force: true });
}
