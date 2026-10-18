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
const regional = readFileSync(new URL('../src/RegionalWorkbench.tsx', import.meta.url), 'utf8');
const datetime = readFileSync(new URL('../src/DateTimeDemo.tsx', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/FormSpecimen.tsx', import.meta.url), 'utf8');
const mobileModal = readFileSync(new URL('../src/mobileModal.ts', import.meta.url), 'utf8');
const temporalCore = readFileSync(new URL('../src/temporal/core.ts', import.meta.url), 'utf8');
const collectionCore = readFileSync(new URL('../src/operational/collectionCore.ts', import.meta.url), 'utf8');
const operationalRecords = readFileSync(new URL('../src/operational/OperationalRecords.tsx', import.meta.url), 'utf8');
const operationalWorkbench = readFileSync(new URL('../src/operational/OperationalWorkbench.tsx', import.meta.url), 'utf8');
const timeInput = readFileSync(new URL('../src/temporal/TimeInput.tsx', import.meta.url), 'utf8');
const dateInput = readFileSync(new URL('../src/temporal/CivilDateField.tsx', import.meta.url), 'utf8');
const liveTemporal = readFileSync(new URL('../src/TemporalDemo.tsx', import.meta.url), 'utf8');
const portability = readFileSync(new URL('../src/temporal/PortabilityDemo.tsx', import.meta.url), 'utf8');
const temporalStories = readFileSync(new URL('../src/temporal.stories.tsx', import.meta.url), 'utf8');

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
    assert.ok(css.includes('.operational-records__mobile {display:grid;'));
    assert.ok(operationalRecords.includes('data-label={column.label}'));
  }],
  ['uniform SVG icon component used in navigation and table', () => {
    assert.ok(icons.includes('<svg'));
    assert.ok(shell.includes('<Icon name={item.icon}'));
    assert.ok(operationalRecords.includes('<Icon name="chevron-left"'));
    assert.ok(operationalRecords.includes('<Icon name="chevron-right"'));
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
  ['a single canonical table/records presentation replaces the legacy catalog fork', () => {
    assert.ok(catalog.includes('id="catalog-operational"'));
    assert.ok(catalog.includes('<OperationalWorkbench/>'));
    assert.ok(!catalog.includes('id="catalog-table"'));
    assert.ok(!catalog.includes('catalog__table-scroll'));
    assert.ok(sidebar.includes("label:'Registros y tablas',target:'catalog-operational'"));
    assert.ok(!sidebar.includes("target:'catalog-table'"));
    assert.ok(shell.includes('Abrir registros y tablas'));
  }],
  ['mobile record cards preserve inline editing and checkbox alignment in the shared component', () => {
    assert.ok(operationalRecords.includes('className="operational-records__card-head"'));
    assert.ok(operationalRecords.includes('operational-records__card-title'));
    assert.ok(operationalRecords.includes('renderMobileTitle?'));
    assert.ok(operationalWorkbench.includes('renderMobileTitle={editingCells?'));
    assert.ok(operationalWorkbench.includes('Editar celdas'));
    assert.ok(css.includes('.operational-records__card-title'));
    assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
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
    assert.ok(calendar.includes('calendarWeekdays(settings.locale,resolveWeekStart(settings))'));
    assert.ok(calendar.includes('aria-label={day.full}'));
    assert.ok(catalog.includes('<RegionalWorkbench/>'));
    assert.ok(regional.includes('<CalendarSpecimen settings={draft}/>'));
    assert.ok(shell.includes("calendarWeekdays('es-ES', 1)"));
    assert.doesNotMatch(shell, /'M','X','J'/);
  }],
  ['regional preferences are independent, validated and explicitly saved in demo only', () => {
    for(const field of ['locale','weekStart','calendarSystem','hourCycle','timeZone','direction']) {
      assert.ok(locale.includes(field+':') || locale.includes(field+';'), `Missing setting ${field}`);
    }
    assert.ok(regional.includes('localStorage.setItem(storageKey,JSON.stringify(draft))'));
    assert.ok(regional.includes('validRegionalSettings('));
    assert.ok(regional.includes('timezoneValid('));
    assert.ok(regional.includes("label=\"Inicio de semana\""));
    assert.ok(regional.includes("label=\"Formato horario\""));
    assert.ok(regional.includes("label=\"Sistema de calendario\""));
    assert.ok(regional.includes("label=\"Dirección de lectura\""));
    assert.ok(locale.includes("'saturday'"));
    assert.ok(css.includes('.regional-prefs__grid'));
  }],
  ['calendar is direction-independent centered and respects native month casing', () => {
    assert.ok(css.includes('align-items:center;'));
    assert.ok(css.includes('margin-inline:auto;align-self:center;'));
    assert.match(css, /\.calendar-specimen__month\s*\{text-transform:none/);
    assert.ok(locale.includes('calendarMonthLabel('));
    assert.ok(calendar.includes("data-calendar-system={settings.calendarSystem}"));
    assert.ok(calendar.includes("settings.calendarSystem === 'gregory'"));
    assert.ok(calendar.includes('resolveWeekStart(settings)'));
    assert.ok(calendar.includes('resolveDirection(settings)'));
    assert.ok(calendar.includes('Motor de fechas pendiente de implementación'));
  }],
  ['date/time/multidate/time range share the headless Temporal Core', () => {
    for(const mode of ["'date'","'range'","'multidate'","'datetime'","'time'","'timerange'"])
      assert.ok(datetime.includes(mode), `Missing picker mode ${mode}`);
    assert.ok(datetime.includes('<CalendarSpecimen settings={settings}'));
    assert.ok(datetime.includes('<CivilDateField'));
    assert.ok(datetime.includes('<TimeInput'));
    assert.ok(datetime.includes('dateRangeMetrics('));
    assert.ok(datetime.includes('timeRangeDuration('));
    assert.ok(datetime.includes("No se ha guardado ni programado ningún evento"));
    assert.ok(timeInput.includes('parseTimeOfDay(draft,hourCycle)'));
    assert.ok(dateInput.includes('parseCivilDate(draft,locale)'));
    assert.ok(temporalCore.includes('export function dateRangeMetrics'));
  }],
  ['time renderers share one controlled value and no horizontal wheel scrollbar', () => {
    assert.ok(timeInput.includes('presentation!==\'wheel\''));
    assert.ok(timeInput.includes('presentation!==\'text\''));
    assert.ok(timeInput.includes('function TimeWheel('));
    assert.ok(timeInput.includes('aria-valuetext='));
    assert.ok(timeInput.includes('onTouchEnd='));
    assert.ok(css.includes('.temporal-wheel__track'));
    assert.doesNotMatch(css, /\\.temporal-wheel[^}]*overflow-x\\s*:\\s*(auto|scroll)/s);
  }],
  ['countdown derives time from target and timer stores pause/resume state', () => {
    assert.ok(temporalCore.includes('export function countdownSnapshot'));
    assert.ok(temporalCore.includes('export function timerSnapshot'));
    assert.ok(temporalCore.includes('export function pauseTimer'));
    assert.ok(temporalCore.includes('export function startTimer'));
    assert.ok(liveTemporal.includes('countdownSnapshot('));
    assert.ok(liveTemporal.includes('timerSnapshot('));
    assert.ok(liveTemporal.includes("document.addEventListener('visibilitychange',refresh)"));
    assert.ok(liveTemporal.includes('aria-live="off"'));
    assert.ok(regional.includes('<TemporalDemo settings={draft}/>'));
    assert.ok(regional.includes('timeZoneOptions'));
    assert.ok(regional.includes('regional-prefs__timezone-select'));
    assert.ok(!regional.includes('aria-label="Zona horaria IANA"'));
    assert.ok(liveTemporal.includes('resolveZonedDateTime('));
  }],
  ['operational copy is contextual and intro uses available width', () => {
    assert.ok(catalog.includes('<ContextHelp label="Acerca del catálogo'));
    assert.doesNotMatch(catalog, /<p>Pruebas del lenguaje visual aprobado para toda la familia/);
    assert.ok(css.includes('.catalog__intro p {max-width:none;}'));
  }],
  ['portable time renderer has two independent consumers and distinct scoped skins', () => {
    assert.ok(portability.includes('<ZenitTimeConsumer'));
    assert.ok(portability.includes('<ClientTimeConsumer'));
    assert.ok(portability.includes('<TimeInput label='));
    assert.ok(css.includes('.temporal-host--client {'));
    assert.ok(css.includes('.temporal-host--zenit'));
    assert.ok(temporalStories.includes('SkinsSinCambiarMotor'));
    assert.ok(regional.includes('<PortabilityDemo settings={draft}/>'));
  }],
  ['universal operational records remain headless, controlled and mobile-safe', () => {
    assert.ok(collectionCore.includes('export function queryCollection'));
    assert.ok(collectionCore.includes('export function reconcileSelectedIds'));
    assert.ok(collectionCore.includes('export function nextSort'));
    assert.ok(operationalRecords.includes('aria-sort='));
    assert.ok(operationalRecords.includes('data-operational-records='));
    assert.ok(operationalRecords.includes('operational-records__mobile'));
    assert.ok(operationalRecords.includes('operational-records__desktop'));
    assert.ok(operationalWorkbench.includes('<OperationalRecords'));
    assert.ok(catalog.includes('<OperationalWorkbench/>'));
    assert.ok(css.includes('.operational-records__card'));
  }],
  ['form fields expose errors without backend submission', () => {
    assert.ok(form.includes('onSubmit={validate}'));
    assert.ok(form.includes('aria-invalid='));
    assert.ok(form.includes('role="alert"'));
    assert.ok(form.includes('role="status"'));
    assert.ok(form.includes('type="reset"'));
    assert.ok(form.includes('Ningún dato se ha enviado ni almacenado'));
  }],
  ['CEO-approved spatial stability and temporal consistency', () => {
    assert.ok(calendar.includes('42-offset-days'),'Calendar must always reserve six week rows');
    assert.ok(temporalCore.includes('const compact=/'),'Strict compact HHMM recognition must remain');
    assert.ok(temporalCore.includes('export function parseTimerDuration'));
    assert.ok(liveTemporal.includes('temporal-live-demo__duration-fields'));
    assert.ok(datetime.includes('datetime-demo__summary-head'));
    assert.ok(css.includes('.temporal-feedback-slot'));
    assert.ok(css.includes('.operational-workbench__feedback-slot'));
    assert.ok(css.includes('scrollbar-color:var(--brand)'));
    assert.ok(css.includes('.operational-records__selected'));
  }],
  ['configurable synthetic columns stay within component boundaries', () => {
    assert.ok(operationalWorkbench.includes('setColumnTitles'));
    assert.ok(operationalWorkbench.includes('commitColumnTitle'));
    assert.ok(operationalWorkbench.includes('data-column-title={column.key}'));
    assert.ok(operationalWorkbench.includes('aria-label={\'Título de columna \'+column.key}'));
    assert.ok(operationalWorkbench.includes('setEditingCells'));
    assert.ok(operationalWorkbench.includes('setCustomColumns'));
    assert.ok(operationalWorkbench.includes('data-column-manager="true"'));
    assert.ok(operationalWorkbench.includes('freezeFirstColumn={freezeFirstColumn}'));
    assert.ok(operationalRecords.includes('freezeFirstRow?:boolean'));
    assert.ok(operationalRecords.includes('data-record-scroll-region="true"'));
    assert.ok(css.includes('.operational-records--freeze-first-column'));
    assert.ok(css.includes('.operational-records--freeze-first-row'));
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
