import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../src/DesignLab.tsx', import.meta.url), 'utf8');
const catalog = readFileSync(new URL('../src/ComponentCatalog.tsx', import.meta.url), 'utf8');
const icons = readFileSync(new URL('../src/Icon.tsx', import.meta.url), 'utf8');

const checks = [
  ['canonical neutral palette', () => {
    for (const color of ['#f5f5f5','#ffffff','#191919','#111111','#476b59']) {
      assert.ok(css.includes(color), `Missing approved token ${color}`);
    }
  }],
  ['no per-product palette fragmentation', () => assert.doesNotMatch(css, /\[data-product\s*=/i)],
  ['no horizontal scrollbar in preview CSS', () => assert.doesNotMatch(css, /overflow-x\s*:\s*(auto|scroll)/i)],
  ['no fixed-width table forcing mobile overflow', () => assert.doesNotMatch(css, /\.catalog__table\s*\{[^}]*min-width\s*:\s*\d+px/is)],
  ['horizontal navigation and responsive reflow', () => {
    assert.match(css, /\.app-nav\s*\{[^}]*display\s*:\s*flex/is);
    assert.match(css, /\.app-nav\s*\{[^}]*display\s*:\s*grid/is);
    assert.ok(shell.includes('className="app-nav"'));
  }],
  ['mobile data cards', () => {
    assert.match(css, /\.catalog__table tbody[^}]*display\s*:\s*grid/is);
    assert.ok(catalog.includes('data-label={names[column]}'));
  }],
  ['uniform SVG icon component used in navigation and table', () => {
    assert.ok(icons.includes('<svg'));
    assert.ok(shell.includes('<Icon name={item.icon}'));
    assert.ok(catalog.includes('<Icon name="chevron-left"'));
    assert.ok(catalog.includes('<Icon name="chevron-right"'));
  }],
  ['container and compact spacing tokens', () => {
    assert.ok(css.includes('--container-pad:16px'));
    assert.ok(css.includes('--space-3:12px'));
    assert.ok(css.includes('--space-6:24px'));
  }],
];

for (const [label, test] of checks) {
  test();
  process.stdout.write(`PASS ${label}\n`);
}
process.stdout.write(`Static conformance guards: ${checks.length} passed. Browser QA still required.\n`);
