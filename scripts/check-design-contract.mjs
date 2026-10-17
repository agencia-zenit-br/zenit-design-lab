import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../src/DesignLab.tsx', import.meta.url), 'utf8');
const catalog = readFileSync(new URL('../src/ComponentCatalog.tsx', import.meta.url), 'utf8');
const icons = readFileSync(new URL('../src/Icon.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('../src/components.stories.tsx', import.meta.url), 'utf8');
const select = readFileSync(new URL('../src/ZenitSelect.tsx', import.meta.url), 'utf8');
const multiSelect = readFileSync(new URL('../src/ZenitMultiSelect.tsx', import.meta.url), 'utf8');
const selectStories = readFileSync(new URL('../src/select.stories.tsx', import.meta.url), 'utf8');
const sidebar = readFileSync(new URL('../src/LabSidebar.tsx', import.meta.url), 'utf8');
const profile = readFileSync(new URL('../src/ProfileMenu.tsx', import.meta.url), 'utf8');
const locale = readFileSync(new URL('../src/calendarLocale.ts', import.meta.url), 'utf8');
const calendar = readFileSync(new URL('../src/CalendarSpecimen.tsx', import.meta.url), 'utf8');
const mobileModal = readFileSync(new URL('../src/mobileModal.ts', import.meta.url), 'utf8');

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
  ['storybook shares typed SVG icon vocabulary', () => {
    assert.ok(stories.includes('icon="services"'));
    assert.doesNotMatch(stories, /[◇▦▤▣▥⚙✎]/);
    assert.ok(stories.includes('<Icon name={name}'));
  }],
  ['custom rounded selects without browser-native options', () => {
    assert.doesNotMatch(shell, /<select[\s>]/i);
    assert.doesNotMatch(catalog, /<select[\s>]/i);
    assert.ok(shell.includes('ZenitSelect<Product>'));
    assert.ok(shell.includes('ZenitSelect<Mode>'));
    assert.match(css, /\.zenit-select__popover\s*\{[^}]*border-radius\s*:\s*12px/is);
    assert.ok(select.includes('role="combobox"'));
    assert.ok(select.includes('role="listbox"'));
    assert.ok(select.includes('aria-activedescendant'));
    for (const key of ['ArrowDown', 'ArrowUp', 'Escape', 'Enter', 'Home', 'End']) assert.ok(select.includes(key));
  }],
  ['approved single and multiple select modes remain coherent', () => {
    assert.ok(catalog.includes('<ZenitSelect<DemoFilter>'));
    assert.ok(catalog.includes('<ZenitMultiSelect<DemoModule>'));
    assert.ok(select.includes('searchable = false'));
    assert.ok(select.includes('onClear'));
    assert.ok(select.includes('option.group'));
    assert.ok(select.includes('Sin resultados'));
    assert.ok(multiSelect.includes('aria-multiselectable="true"'));
    assert.ok(multiSelect.includes('className="zenit-select__chips"'));
    assert.ok(multiSelect.includes('changeSelection'));
    assert.ok(multiSelect.includes('Listo'));
    assert.ok(multiSelect.includes('Sin resultados'));
    assert.ok(multiSelect.includes('onChange([])'));
    assert.ok(selectStories.includes('<ZenitSelect<ReviewStatus>'));
    assert.ok(selectStories.includes('<ZenitMultiSelect<Module>'));
  }],
  ['select demos adapt without sideways scroll', () => {
    assert.match(css, /\.catalog__select-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/is);
    assert.match(css, /@media\(max-width:700px\)\s*\{\s*\.catalog__select-grid\s*\{grid-template-columns:minmax\(0,1fr\)/is);
    assert.match(css, /\.zenit-select__chips\s*\{[^}]*flex-wrap:\s*wrap/is);
    assert.doesNotMatch(multiSelect, /<select[\s>]/i);
    assert.doesNotMatch(select, /<select[\s>]/i);
  }],
  ['sticky global header with no navigation fragmentation', () => {
    assert.match(css, /\.app-chrome\s*\{[^}]*position\s*:\s*sticky/is);
    assert.ok(shell.includes('className="app-chrome"'));
    assert.ok(shell.includes('className="app-nav"'));
  }],
  ['sidebar is visible, collapsible, and mobile overlay is focus-managed', () => {
    assert.ok(shell.includes('<LabSidebar'));
    assert.ok(shell.includes('useState(initialSidebarCollapsed)'));
    assert.ok(sidebar.includes('data-sidebar-state='));
    assert.ok(sidebar.includes('onToggle'));
    assert.ok(sidebar.includes('mobileOpen'));
    assert.ok(sidebar.includes('aria-modal={mobileOpen'));
    assert.ok(sidebar.includes("event.key==='Escape'"));
    assert.ok(sidebar.includes("event.key!=='Tab'"));
    assert.match(css, /\.lab-sidebar\s*\{[^}]*position\s*:\s*sticky/is);
    assert.match(css, /\.lab-sidebar--mobile-open\s*\{/);
    assert.match(css, /\.app-body--sidebar-collapsed\s*\{/);
  }],
  ['mobile popup uses same palette and geometry without changing desktop', () => {
    assert.doesNotMatch(shell, /mobileSheet=\{false\}/);
    assert.ok(select.includes('useMobileModal('));
    assert.ok(multiSelect.includes('useMobileModal('));
    assert.ok(select.includes("role={modalActive ? 'dialog' : undefined}"));
    assert.ok(multiSelect.includes("role={modalActive ? 'dialog' : undefined}"));
    assert.ok(mobileModal.includes("document.body.style.overflow = 'hidden'"));
    assert.ok(mobileModal.includes("event.key !== 'Tab'"));
    assert.match(css, /border-radius:16px;\s*box-shadow:0 18px 55px/s);
    assert.match(css, /transform:translate\(-50%,-50%\)/);
  }],
  ['mobile navigation is full-screen without affecting desktop collapse', () => {
    assert.ok(sidebar.includes("document.body.style.overflow = 'hidden'"));
    assert.match(css, /\.lab-sidebar\s*\{\s*inset:0;\s*width:100%;\s*max-width:none;\s*height:100dvh/s);
    assert.ok(sidebar.includes('role={mobileOpen ?'));
    assert.ok(css.includes('.app-body--sidebar-collapsed'));
  }],
  ['mobile checkbox immediately precedes title with 44px touch target', () => {
    assert.ok(catalog.includes('className="catalog__row-select"'));
    assert.match(css, /\.catalog__table \.catalog__data-row\s*\{\s*display:grid;\s*grid-template-columns:44px minmax\(0,1fr\)/s);
    assert.ok(css.includes('td[data-label="Elemento"]'));
    assert.ok(css.includes('width:44px;height:44px'));
  }],
  ['mobile record cards have independent harmonized composition', () => {
    assert.ok(catalog.includes('className="catalog__mobile-records"'));
    assert.ok(catalog.includes('className="catalog__mobile-card-head"'));
    assert.ok(catalog.includes('className="catalog__mobile-card-fields"'));
    assert.ok(catalog.includes('className="catalog__mobile-card-field"'));
    assert.match(css, /\.catalog__table-scroll\s*\{display:none;\}/s);
    assert.match(css, /\.catalog__mobile-card-fields\s*\{\s*display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
    assert.ok(css.includes('.catalog__mobile-card-title input'));
  }],
  ['user profile is aligned with the header and opens a safe menu', () => {
    assert.ok(shell.includes('<ProfileMenu onAction='));
    assert.ok(profile.includes("'Mi perfil'"));
    assert.ok(profile.includes("'Organización'"));
    assert.ok(profile.includes("'Preferencias'"));
    assert.ok(profile.includes("'Idioma'"));
    assert.ok(profile.includes("'Cerrar sesión'"));
    assert.ok(profile.includes('useMobileModal(open,mobile,popup)'));
    assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr) 42px'));
    assert.ok(css.includes('.profile-menu__popover'));
  }],
  ['weekday initials are localized, not Spanish Wednesday X', () => {
    assert.ok(locale.includes("es: ['L','M','M','J','V','S','D']"));
    assert.ok(locale.includes("pt: ['S','T','Q','Q','S','S','D']"));
    assert.ok(locale.includes("en: ['M','T','W','T','F','S','S']"));
    assert.ok(locale.includes('weekday: \'long\''));
    assert.ok(calendar.includes('calendarWeekdays(locale)'));
    assert.ok(calendar.includes('aria-label={day.full}'));
    assert.ok(catalog.includes('<CalendarSpecimen/>'));
    assert.ok(shell.includes("calendarWeekdays('es-ES', 1)"));
    assert.doesNotMatch(shell, /'M','X','J'/);
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
