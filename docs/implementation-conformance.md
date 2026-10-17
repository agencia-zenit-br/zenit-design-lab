# Zenit visual conformance — implementation gate

Status: **PARTIAL IMPLEMENTATION — NOT FINAL VISUAL APPROVAL**. Updated 2026-10-16.

## Authority and precedence

The binding design baseline is [design-decisions.md](design-decisions.md).
The explicitly selected **Integrated Workspace V3.0 screenshot** (2026-10-12) is the visual reference; its exact pixel rendering must be compared with the original image during browser QA. Later approvals V3.1.2–V4.5.1 consolidate the global application shell. Where earlier component-specific exploration (for example 03.34 sidebar) conflicts with the later accepted **horizontal navigation** of V3.0–V4.5.1, use the later integrated shell for the application and retain separate sidebar rules only for contexts requiring hierarchical module navigation.

Earlier prototypes and the current React demo do not override approved decisions.

## Applied to the 2026-10-16 preview branch

| Required baseline | Approved specification | Code state | Verification |
|---|---|---|---|
| Neutral color tokens | V3.0 / V3.2 / V4.3: #f5f5f5, #ffffff, #191919, #111111, #476b59 | Implemented as CSS variables in `styles.css` | Static guard; browser visual QA pending |
| Horizontal pill navigation | V3.0 / V3.1.2 / V4.5.1 | Implemented in `DesignLab.tsx` | Keyboard and browser QA pending |
| Shared product appearance | V3.5 / V4.5.1; product changes must not change control colors | Implemented: no product-specific palette overrides | Static guard; browser comparison pending |
| Compact control proportions | V1.1, V3.3: approx. 27/32/37px buttons | Implemented in `components.tsx` + `styles.css` | Browser dimensions and touch accessibility pending |
| Fine SVG icons, not characters | V1.3.2, V3.1.2; icon refinements | Initial unified inline SVG family in `Icon.tsx` | Full approved icon asset parity **not verified** |
| Spacing and margins | V3.6.1 / V4.3: 4/8/12/16/24/32px; container 12/16/24px | Standard 16px and compact 12px in prototype | Layout inspection pending |
| Mobile without horizontal scrollbar | V3.0 screenshot, V3.1.2, V3.7, V4.5.1 | Navigation grid, data cards, wrapping controls; removed horizontal table strip | Viewport tests 320/375/390/768px pending |
| Editor contextual width | V2.7.2 / V3.8: full available width with inner padding | Available workspace uses full width; editorial split adapts at 900px | Visual comparison pending |
| States without layout shift | V3.3 / V4.4 | Basic hover/focus/disabled/semantic feedback | All component states not fully implemented |
| Accessibility and RTL/LTR | Global 03.04 and accessibility baseline | Basic labels/focus/logical CSS, some native control semantics | Not certified; keyboard and RTL tests pending |
| Advanced editable tables | Lab 03.03 + 03.49 + V3.7 | Only cell edits, bulk selection, column chevrons and data reflow | Drag, resizing, clipboard, range, undo and redo **missing** |
| Unified rich media editor | V16 plus editors 03.50–03.53 | **Not in this demo** | Separate implementation required |
| Product-specific functional applications | Platform and ZMC | Simulated demonstration only | Not connected to backend |

## Review corrections of 2026-10-16 — code implemented, CI pending

| Review requirement | Approved source | Implementation in this branch | Validation status |
|---|---|---|---|
| Consistent rounded dropdown menus | 03.14 custom Zenit Select | `src/ZenitSelect.tsx`: non-native anchored popover, 12px rounded corners, hover/selection, Escape/Enter/arrows/Home/End, keyboard focused combobox, outside-click dismissal | **CI green**. Chromium verifies rounded popup, live single-search and Enter, clear, multi-choice chip add/remove and Done; remote search, virtualization, cross-browser/screen-reader and screenshot parity still pending |
| Header remains fixed while scrolling | 03.35 and user review 2026-10-16 | `.app-chrome { position: sticky; top: 0 }` wraps global header and horizontal pills | **CI green**. Chromium confirms header remains at top after real page scrolling; multi-browser QA pending |
| Sidebar visible and collapsible | 03.34, V3.0, 2026-10-16 review | `LabSidebar.tsx`: expanded default desktop, icon-only collapsed mode, local preference, contextual real-page anchors | **CI green**. Chromium verifies desktop collapse/expand state; screen-reader QA, desktop splitter resizing and flyout submenu behaviour remain pending |
| Mobile sidebar without horizontal scroll | 03.34, V3.1.2, V4.5.1 | Overlay drawer with backdrop, Escape close, keyboard focus loop and restore | **CI green**. Chromium checks 320/375/390/768/1024/1440 widths in both themes and mobile overlay open/close; device-specific touch/RTL QA pending |

**Important:** compilation, Storybook and Chromium viewport checks are green for the preview branch, but no independent pixel-level comparison with the original V3.0 screenshot or screen-reader certification has been completed.

## Next implementation milestone — approved Zenit Select 03.14

The approved universal selection family is now represented by two **shared React components** that consume the same `ZenitOption` model and visual tokens: `ZenitSelect` for single-choice and `ZenitMultiSelect` for multi-choice. The latter is not a divergent product-specific design.

- **Single:** optional searchable grouped list, clear action, disabled choices, empty-results state, Escape/arrows/Enter, selection closes on choice.
- **Multiple:** selected chips with individual removal, clear-all, grouped options, live search, disabled choices, selection stays open, explicit **Listo** closes.
- **Demonstration:** `ComponentCatalog.tsx` exposes both modes and `select.stories.tsx` contains independent interactive examples. No real customer data or backend persistence.
- **Styles:** shared rounded floating menus, density and semantics in `styles.css`; responsive wrapping and no sideways navigation/table scrolling.

**Not yet certified:** browser behavior, screen-reader interaction, cross-browser/touch QA, long-list virtualization, remote search and any production-scale caching. These must remain explicitly pending.

## Automated preview verification

`.github/workflows/verify-design-lab.yml` runs only read-only npm install, static design checks, TypeScript/Vite build, and Storybook build on preview branch pushes/PRs, without Cloud authentication, secrets, deploy, or production changes. CI now also runs `scripts/check-browser-layout.mjs` using real headless Chromium across six viewport widths and two themes: page overflow, sticky header, mobile table reflow, rounded popup, keyboard single-select, multi-select chips/Done, and contextual desktop/mobile sidebar behavior. This does **not** replace original-V3.0 screenshot comparison, physical-device tests or screen-reader QA. The existing deployment workflow remains a **separate explicit action** for preview changes.

## Green verification evidence — 2026-10-16

- [Design Lab CI, run 38954034166](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/38954034166): **success** (TypeScript/Vite and Storybook).
- [Verify Design Lab, run 38954034151](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/38954034151): **success** (14 static guards, TypeScript/Vite, Storybook, Chromium responsive/behavioral checks).
- The underlying build stays isolated: no private APIs, credential exchange, Cloud Run deployment, production tenant data or deployment side effect.

## Screenshot review corrections — 2026-10-17

Status: **IMPLEMENTED IN PREVIEW BRANCH / CHROMIUM CHECKS PASS / USER VISUAL REVIEW PENDING**.

| User finding | Root cause | Corrected behaviour | Evidence and remaining tests |
|---|---|---|---|
| Multiple-selection list appeared far below its trigger | Popover positioning relative to the whole component, including dynamic chip stack; `flex:1 1 155px` applied in a column layout | Popover is a child of `zenit-select__multi-control`, chips are outside the anchor, control no longer uses vertically stretching basis | Chromium compares popup.top to trigger.bottom and popup width to trigger width (1024px). Cross-browser and real user visual review pending |
| Desktop dropdowns had inconsistent widths | Global 180px–270px min/max constraints leaked from header into general Select controls | Desktop single/multi menus align to trigger edges and match trigger width; top-header Product/Appearance keep approved independent popup sizing | Chromium geometry comparison for both variants passed at 1024px |
| Editorial screen wasted space on explanations | Hero subtitle, disclaimer paragraph, duplicative demo eyebrow and metadata | Removed permanent explanatory copy; compact title and contextual information icon instead; operational revision/count remain visible | Chromium checks no editorial disclaimer or hero paragraph and verifies info popover opens |
| Mobile blue square tap flash | Native mobile highlight and inconsistent focus treatment | Custom transparent tap highlight on clickable surfaces with retained `:focus-visible` outlines | CSS guard; **physical iOS/Android check pending** |
| Mobile selects behaved like downsized desktop menus | Fixed desktop-width popovers in narrow viewport | Content selectors use responsive full-viewport bottom sheets with rounded top corners, larger tappable options, safe-area padding, and accessible dismiss; global header selectors stay compact | Chromium 375px verifies popup position, full viewport width, rounded 18px edge, and keyboard/multi-select behaviour; touch/screen-reader validation pending |
| Mobile checkbox floated on a separate row | Table first cell's stacked-card mobile CSS retained its own labelled grid line | Row checkbox is positioned in the upper card corner; other cells become readable stacked label/value fields | Chromium checks checkbox geometry inside mobile record card |

Browser verification on the code change (before this documentation commit):
- [Build and Storybook CI](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39039112665) — **passed**.
- [Responsive and component verification](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39039112752) — **passed** (six widths, two themes; single/multiple select operations, desktop popup width/position, mobile sheet, mobile selection card, lean editorial).
- **Not yet deployed** from this round of corrections. The currently published Design Lab revision is unchanged pending explicit preview deployment.
- **Still pending:** original approved V3.0 screenshot pixel comparison, mobile Safari/Android physical touch, assistive-technology review and RTL visual acceptance.

## Mobile UX refinement approved 2026-10-17 — desktop visual system preserved

**Implementation:** complete for this isolated demo; browser verification successful; physical-device UX and assistive-technology validation remain pending. These mobile-specific decisions supersede the previous bottom sheet and upper-corner checkbox patterns, not the V3.0–V4.5.1 desktop visual design.

| Required behaviour | Implementation | Evidence |
|---|---|---|
| Consistent mobile popup for all Select variants | `ZenitSelect` and `ZenitMultiSelect` now open as centered 16px-rounded modal popups on widths <=700px; Product and Appearance use the same pattern. No automatic keyboard when opening a popup; search focuses only on interaction. Desktop popovers retain original field-width anchoring. | Chromium verifies modal role, symmetric margins, scroll lock, single/multiple selection, keyboard operations and header selectors |
| Full-screen contextual navigation in mobile / narrow tablet | `LabSidebar` occupies the whole viewport at <=900px with close control, focus handling and blocked background scrolling. Desktop collapsible sidebar unchanged. | Chromium checks full-viewport menu geometry, dismiss, lock and desktop collapsed mode |
| Checkbox immediately before record title | Responsive table uses a two-column grid: accessible 44x44px checkbox label and adjacent editable element name, vertically aligned. Other data stays within compact card. | Chromium compares checkbox/title horizontal separation and vertical centers |
| No horizontal overflow or palette fragmentation | Mobile-only CSS media rules reuse approved tokens. | Chromium at 320/375/390/600/700/701/768/820/900/1024/1440px in light and dark themes; 17 static contract checks |

**Successful CI on code/docs commit `42cd2a1`:**
- [Design Lab CI #39044766618](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39044766618): success (TypeScript/Vite + Storybook).
- [Verify Design Lab #39044766728](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39044766728): success (17 static controls and real Chromium viewport / interaction tests).

**Pending:** real device verification in mobile Safari and Android Chrome, landscape and on-screen keyboard behaviour, RTL parity, screen-reader experience, original approved V3.0 screenshot comparison, user visual acceptance. **Not yet deployed**; existing Cloud Run revision remains unchanged until separate explicit preview workflow.

## Mobile polish and account/calendar examples — approved feedback 2026-10-17

**Implementation in branch:** complete as a preview/prototype; user acceptance and physical device validation pending. This updates the mobile-only design while keeping the canonical V3.0–V4.5.1 tokens and original desktop table layout.

| Item | Implementation | Verified behaviour | Limits |
|---|---|---|---|
| Mobile records are visually misaligned | Dedicated `catalog__mobile-records` card list, distinct from the desktop semantic table; checkbox and editable name share a header, two metadata fields have equal geometry | Chromium tests card positions, width, editability, checkbox/name proximity and identical category/status input size on mobile | Physical Safari and Android Chrome review pending |
| Profile circle off-axis | `ProfileMenu.tsx` replaces static avatar; aligned mobile three-column header and desktop control centering; six illustrated account/help choices | Browser checks avatar/selector baseline on mobile and centerline on desktop | Demo-only labels and action feedback, no real account/session operations |
| Profile menu not implemented | Desktop anchored rounded popup, mobile centered modal, keyboard dismissal/focus and scroll locking | Chromium checks all six entries, geometry, modal roles, click-to-close and notice behaviour | Screen-reader audit pending |
| Wednesday wrongly shown as `X` | One locale-aware `calendarWeekdays` utility for chart and interactive compact date specimen. Spanish `L M M J V S D`; Portuguese, English, Hebrew and Arabic use localized initial/full day labels with independent weekday start and RTL consideration | Browser asserts Spanish symbols/accessibility names, PT-BR/EN-US sequences and Hebrew RTL. Static rule blocks regressions to Spanish `X` | Date specimen demonstrates **Gregorian dates only**; non-Gregorian calendars and timezone engine remain future work |
| Desktop visual language | Existing desktop tables and selectors preserved; profile belongs to same icon family, controls retain canonical colors, sizes and shapes | Browser tests field-anchored dropdown geometry at 1024px and no overflow across 11 viewports × 2 modes | Original V3.0 screenshot pixel comparison still pending |

**CI evidence on code commit `1651dedc`:**
- [Design Lab CI #39046889794](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39046889794) — success (TypeScript/Vite + Storybook).
- [Verify Design Lab #39046889777](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39046889777) — success (20 static contract guards plus Chromium interaction/geometry in 11 viewport widths and 2 themes).

**Deployment:** no deployment of this revision at the time of authoring; Cloud Run continues serving the previous successful version until the dedicated preview deployment workflow runs. **PR #8 stays in draft.** No Zenit Platform/ZMC production files or services changed.

## A–D phase: regional preferences, Gregorian calendar and universal forms — 2026-10-17

**Implementation:** integrated in preview only; no merge or service deployment. This is **not** a finished ZMC/Platform feature or a working Hebrew/Hijri scheduling engine. It follows the user's explicit approval of the four A–D blocks without changing the V3.0–V4.5.1 visual language.

| Approved workstream | Implemented in this preview | Browser evidence and remaining limits |
|---|---|---|
| A. Calendar layout and casing | `CalendarSpecimen.tsx` uses a centered 298px max-width grid independent of LTR/RTL direction, inherited neutral tokens and unchanged compact 7-day grid; `text-transform:none` preserves `octubre de 2026` / `noviembre de 2026`. Main catalog heading now **Calendario**. | Chromium verifies centering in mobile and RTL/LTR, lowercase month, full weekday names and locale changes |
| B. Region preferences | `calendarLocale.ts` defines independent UI locale, week start `auto/monday/saturday/sunday`, calendar system, 12/24 hour cycle, IANA timezone and writing direction. `RegionalWorkbench.tsx` gives live unsaved preview, explicit Save, Reset and safe validation of timezone and localStorage. | Tests vary Saturday/Sunday/Monday origin independently from Spanish locale; PT-BR/EN-US/HE/AR localizations; 12/24-hour switching, Hebrew/Arabic RTL, demo-only persistence/reset. No real user/account preference backend |
| C. Date and time modes | `DateTimeDemo.tsx` demonstrates single date, inclusive date range, date+time and time-only control with custom Zenit Select hour/minute/AM-PM controls, bounds and local validation. Reuses Gregorian `CalendarSpecimen`; prints a separately formatted real reference instant for selected IANA timezone in preferences. | Browser checks AM/PM mode, range selection, validation and access labels. Gregorian civil dates remain timezone-independent; real DST-disambiguated wall time scheduling, non-Gregorian arithmetic and user event persistence are **not implemented** |
| D. Forms and validation | `FormSpecimen.tsx` demonstrates required/optional fields, inline accessible errors, checkbox consent, reset, success state and local-only feedback. | Browser submits invalid then valid data and checks rendered errors/success. **No server submission or production validation** |

**Verified code commit `fc38fa5`:** [Design Lab CI #39051226141](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39051226141) **SUCCESS** (TypeScript/Vite + Storybook). [Verify Design Lab #39051226126](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39051226126) **SUCCESS** (24 source guards, actual Chromium checks at 320/375/390/600/700/701/768/820/900/1024/1440px in light and dark mode). Screenshots, actual phone/tablet, screen reader, and cross-browser certification still pending.

**Intentionally deferred to later phases:** independent Hebrew/Hijri civil calendar engines, observational Hijri convention, approved event planner month/week/day/agenda and holiday jurisdictions, server-backed account preferences, DST-safe timezone conversion of ambiguous or nonexistent local wall times, backend form validation/authorization and extensive pointer/touch device audit. **Do not describe these as implemented.**


## Universal module certification gate — APPROVED 2026-10-17; implementation pending

**Normative source:** [design-decisions.md — UNIVERSAL ARCHITECTURE PRINCIPLE](design-decisions.md). This is an approved *architecture requirement*, **not evidence that every existing widget already complies**. It applies across Zenit Platform products, services, APIs and frontend/UI assets. Refine and extend this matrix as modules are prepared for use outside Design Lab.

| Certification criterion | Definition of done / evidence | Current Design Lab status |
|---|---|---|
| Stable public API/contract | Document props/configuration, outputs/events, error states, lifecycle, and semantic versioning | **Partial:** internal TS component props; published package/API contract absent |
| Separation of responsibilities | Core behavior decoupled from application service, product rule, tenant, persistence and presentation | **Partial:** some shared utilities; direct state/local browser storage and `.lab` host styling exist |
| Versioned extension strategy | Document slots/strategies/adapters; demonstrate future capability without core forking | **Pending** |
| Skin/theme portability | Design tokens + scoped styles; same behavior under at least two distinct client skins | **Pending:** existing Zenit light/dark themes are not proof of independent client skins |
| Multi-product portability | Consume component in two independent app harnesses without source copying | **Pending** |
| External integration | Certified independent bundle/adapter (e.g. WordPress) with style isolation/dependencies | **Pending** |
| Accessibility/localization | Keyboard, screen reader, touch, mobile/tablet, RTL/LTR and theme contrast in supported variants | **Partial:** Chromium smoke checks; real-device/screen-reader certification pending |
| Safe updates & reversibility | Compatibility/version matrix, tested migration and rollback; deprecation policy | **Pending** |
| Multi-tenant security | Permissions, entitlement and tenant isolation at backend adapter boundary; audit | **N/A for Lab mocks; required before platform deployment** |
| Capability honesty | Planned, implemented, tested, portable and certified statuses distinct | **Implemented in docs; requires ongoing review** |

**Levels:** L1 = reusable internally across Zenit products; L2 = externally embeddable with an adapter; L3 = independently packaged and licensable. None of the current Design Lab samples are certified L2 or L3 by this decision alone. Do not upgrade status based solely on successful Vite/Storybook, cloud deploy or Chromium checks.

**Concrete future conformance fixture:** universal Calendar rendered with its Zenit skin and a clearly distinct fictitious client skin, in an independent host app, with identical controlled selection behavior. A second fixture should compose optional ZMC multi-day selection without introducing ZMC-specific state into generic calendar core. Continue to treat hotel availability/inventory, airline ticketing, Hijri/Hebrew calendar engines and discontiguous multi-date selection as future extensions.

## Non-negotiable workflow

1. Read the relevant approved sections and newer superseding decisions **before changing code**.
2. Map approved/required/proposed/in-review items separately. Never treat an in-review visual as approved.
3. Preserve visual decisions across products, theme and viewport. Keep lab diagnostics out of customer screens.
4. Add or update conformance evidence with each visual change; do not claim completed implementation merely because it builds.
5. Run `npm run check:design`, `npm run build`, then browser QA in both modes at **320, 375, 390, 768, 1024, 1440px**. Check `document.documentElement.scrollWidth <= window.innerWidth`, keyboard, icon alignment, padding, content flow and visible selected/focus/disabled states.
6. Compare against the original V3.0 image; the file is referenced in the decisions but is **not present as a versioned image asset** in this repository. Do not claim pixel-equivalence until provided or recovered and compared.
7. Never deploy/move to production merely because visual QA or preview CI passes.

The automated static design guard is a regression detector, **not** screenshot/dimensional/browser certification.
