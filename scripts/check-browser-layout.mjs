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
      tableDisplay: document.querySelector('.catalog__table') ? getComputedStyle(document.querySelector('.catalog__table')).display : null,
    };
  })()`);
  await send('Page.enable');
  await send('Runtime.enable');

  for (const width of [320, 375, 390, 768, 1024, 1440]) {
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
      if (width <= 700) assert.equal(state.tableDisplay, 'block', 'Mobile table must reflow into cards');
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
          left:rect?.left,right:rect?.right,bottom:rect?.bottom,
          sheetHeader:!!popup?.querySelector('.zenit-select__sheet-head')};
      })()`);
      assert.ok(popupCheck.shown && popupCheck.radius === '18px' && popupCheck.position === 'fixed',
        'Mobile dropdown should open as an 18px rounded bottom sheet');
      assert.ok(Math.abs(popupCheck.left) < 1 && Math.abs(popupCheck.right - 375) < 1 && Math.abs(popupCheck.bottom - 850) < 2,
        `Mobile selector not aligned to viewport: ${JSON.stringify(popupCheck)}`);
      process.stdout.write('PASS full-width mobile dropdown bottom sheet with rounded corners\n');

      await waitFor('document.activeElement?.matches(".catalog__select-example .zenit-select__search input")', 'Searchable dropdown did not focus its search input');
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
      await waitFor('Boolean(document.querySelector(".lab-sidebar--mobile-open") && document.querySelector(".lab-sidebar__backdrop"))', 'Mobile sidebar overlay did not open');
      await evaluate(`document.querySelector('.lab-sidebar__backdrop')?.click(); true`);
      await waitFor('!document.querySelector(".lab-sidebar--mobile-open")', 'Mobile sidebar did not close');
      process.stdout.write('PASS mobile sidebar overlay open/close\n');
      await evaluate('window.scrollTo(0, 500); true');
      await sleep(100);
      const stickyAfterScroll = await evaluate('({scrollY:window.scrollY, top:document.querySelector(".app-chrome").getBoundingClientRect().top})');
      assert.ok(stickyAfterScroll.scrollY > 0 && Math.abs(stickyAfterScroll.top) <= 1, `Header not fixed at top while scrolling: ${JSON.stringify(stickyAfterScroll)}`);
      process.stdout.write('PASS sticky header remains at top during real scrolling\n');
      const cardCheckbox = await evaluate(`(() => {
        const row=document.querySelector('.catalog__data-row');
        const cell=row?.querySelector('td:first-child');
        const checkbox=cell?.querySelector('input[type="checkbox"]');
        const r=row?.getBoundingClientRect(),c=checkbox?.getBoundingClientRect();
        return {rowTop:r?.top,rowRight:r?.right,checkTop:c?.top,checkRight:c?.right,
          position:cell?getComputedStyle(cell).position:null,
          tapFlash:checkbox?getComputedStyle(checkbox).webkitTapHighlightColor:null};
      })()`);
      assert.equal(cardCheckbox.position,'absolute','Mobile record checkbox must be in compact card header');
      assert.ok(cardCheckbox.checkTop >= cardCheckbox.rowTop && cardCheckbox.checkTop <= cardCheckbox.rowTop+45,
        `Checkbox must sit alongside the card first row: ${JSON.stringify(cardCheckbox)}`);
      assert.ok(cardCheckbox.checkRight <= cardCheckbox.rowRight+1,
        `Checkbox must remain inside card: ${JSON.stringify(cardCheckbox)}`);
      process.stdout.write('PASS mobile record checkbox integrated in card corner\n');

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
