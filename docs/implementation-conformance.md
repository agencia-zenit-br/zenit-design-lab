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


## Universal time-selection adapter gate — APPROVED 2026-10-17

**Binding decision:** time selection is a *functional/headless* capability with interchangeable visual presentations, not a permanent commitment to the current three-value wheel. Approved interface candidates include wheel, analog clock face with hands, direct editable text input and hybrid controls. All share time-only representation, configurable precision and range/step validation, independently configurable 12/24-hour locale display, accessibility contract and consistent user events.

**Implementation/certification checklist for future iterations:**
1. Publish an adapter-agnostic `TimeValue`/parsing/formatting/validation contract with explicit granularity, date/timezone boundaries and semantic error states.
2. Prove at least two distinct interaction renderers can read/edit the same controlled value without duplicating validation or product policies. Writing direct values must remain possible when supported by the product.
3. Ensure changes of rendering mode preserve selection, error state, locale, min/max/step rules, accessibility and screen-size behavior.
4. Validate timeranges across midnight and distinguish wall-clock arithmetic from elapsed time across DST boundaries.
5. Mark wheel/analog/text/hybrid as **planned**, **implemented**, **tested** or **certified** individually; the existing Zenit DateTimeDemo currently uses select menus and therefore does **not** satisfy these future adapter gates yet.


## Next-delivery conformance matrix: Zenit universal temporal capabilities — APPROVED

**Approval:** 2026-10-17, ecosystem-wide foundation. **Current status:** approved and scheduled for next Design Lab iteration; NOT implemented/tested/deployed by this documentation commit. The current preview has Gregorian date/range and simple select-based time controls but no validated universal time input, multi-date, time-range duration, clock-driven countdown or pause/resume timer.

| Package / item | Next deliverable / pass condition | Evidence gate | Status now |
|---|---|---|---|
| A — Remove excess copy | Operational pages show actionable essentials; contextual help exposes details by click/tap, keyboard, and hover as enhancement. No unnecessary text height. | Human visual review in mobile/desktop; accessibility focus and no hidden task-critical messages | **Approved / pending** |
| A — Use available width | Remove unnecessary 740/780px text constraints in introductory UI, preserve readable line length on true long-form text and 12/16/24px margins. | Browser geometry at 320–1440px and chosen desktop screenshot | **Approved / pending** |
| B — Date entry | Parse/format/validate locale-specific manual input, selection and accessible clear/reset; ambiguous dates never silently normalized. | Unit and browser tests (ES/PT/EN, RTL); invalid and out-of-bounds values | **Approved / pending** |
| B — Date range | Inclusive calendar-day count, elapsed date-boundary count, number of hotel nights as *optional product-specific display*, min/max bounds. Edit each endpoint. | Unit tests including same day, reversed range, month/year/leap and checkout semantics | **Approved / pending** |
| B — Multi-date selection | Select discontiguous civil dates, toggle, count, and expose controlled data with no product-specific state. | Unit tests and browser keyboard/touch editing | **Approved / pending** |
| B — Time entry | Controlled text and three-visible-number wheel sharing core `TimeOfDay`, 12/24h and minutes/seconds precision/step, no needless horizontal bar. | Swapping renderer preserves value, same validation, phone and keyboard checks | **Approved / pending** |
| B — Time intervals | Start/end in minutes/seconds with explicit next-day policy; hours/minutes/seconds duration. | Unit tests for midnight, invalid endpoints, 00:00, AM/PM, DST policy boundaries | **Approved / pending** |
| B — Analog clock | Extension interface for analog face; rendering implementation *not in this next delivery by default*. | API contract and mock/harness; separately track actual implementation | **Approved architecture / renderer deferred** |
| C — Headless domain | Pure civil dates vs clock time vs instants/durations, time arithmetic, typed results and semantic errors; UI/domain separate. | Pure unit tests, no Zenit product or React imports in core | **Approved / pending** |
| C — Portability | Two consumer harnesses, Zenit and a distinct client skin; semantic scoped tokens; documented API/versions. | Independent integration, visuals, keyboard/RTL, regression, honest L1/L2/L3 classification | **Approved / pending** |
| D — Durations | Calculate days vs nights vs elapsed hours/minutes/seconds, avoid conflating calendar days and fixed 24h durations. | Test exact endpoints, day boundary, leap year and zoned DST situations | **Approved / pending** |
| D — Countdown | Reference instant-based days/hours/minutes/seconds, compact and prominent presentations, end/overdue and tab-resume behavior. | Fake-clock tests, past/zero/future, pause page/resume, timezone independent formatting | **Approved / pending** |
| D — Timer | Set duration, start/pause/resume/reset, stable elapsed time, clear idle/running/paused/completed states. | Deterministic fake time tests and browser interactions; no business side effects | **Approved / pending** |
| Cross-cutting | No mobile horizontal overflow, accessible labels/focus, localizable error/help text, dark/light and RTL/LTR; avoid countdown screen-reader spam. | Build+Storybook+Chromium, snapshots where source exists, real phone QA separately | **Approved / pending** |

**Constraints:** Universal capability (not ZMC feature), no live hotel/airline inventory, no scheduled billing/publication, no actual booking engine, no Hebrew/Hijri arithmetic, no authoritative clock synchronization or cross-device timer state in this preview. The frontend must never treat an expired countdown as authorization to execute a consequential operation. Prefer incremental, compatible improvements and documented regression gates.

**References:** binding [next-delivery architecture section](design-decisions.md), prior [portability gate](design-decisions.md), and Zenit Platform [cross-product modularity issue #323](https://github.com/agencia-zenit-br/zenit-platform/issues/323).


## 2026-10-17 — Universal Temporal Core implementation checkpoint: code and browser QA GREEN

**Status:** approved next-release *prototype functionality has been implemented on the preview branch* and verified at the source/component/browser level. The **user has not yet reviewed this build on a real phone**, the PR is still draft, and **Cloud Run currently serves the previous deployed build** until a separate authorized manual deployment. This checkpoint supersedes the earlier `Approved / pending` statuses in the planning matrix **only for the tested prototype capabilities below**.

| Package | Implemented in preview | Evidence | Explicitly not yet certified |
|---|---|---|---|
| A — Operational density | Removed persistent intro/catalog select/table/tutorial copy, reused accessible `ContextHelp` for details; removed inappropriate 740/780px width caps from operational intro; preserved typographic tokens and desktop table. | Browser no-overflow across 320–1440px + light/dark; style guard; contextual help remains clickable/tappable. | Physical iPhone/Android screen-reader, exact V3.0 pixel parity and every product screen. |
| B — Gregorian dates | `CivilDateField` strict ES/PT/EN-aware numeric text parsing, min/max bounds, calendar selection, single/range/discontiguous days, end/start editing, inclusive days, days elapsed and example lodging nights from `dateRangeMetrics`. Gregorian grid supports year-step navigation and localized weekdays. | Pure Node unit assertions for leap days, invalid dates, ranges, multiple dates; Chromium UI test for multi-select and 5 inclusive dates versus 4 nights. | Hebrew/Hijri engines, product-specific inventory and external calendar providers. |
| B — Time selection | One controlled `TimeOfDay` contract with 24h or AM/PM, optional seconds, vertical wheel showing three values and typed direct field, text/wheel/hybrid interchangeability, minutes/seconds steps and explicit errors; time ranges with explicit next-day option and duration to seconds. | Node tests for AM/PM, invalid input and 22:30→02:15:12 rollover; Chromium keyboard typing, mode switching, interval calculation. | Analog clock UI (contract-approved future adapter), DST-local-time ambiguity resolution for production scheduling and full mobile Safari accessibility QA. |
| C — Functional reuse and skins | Pure TS temporal core with no React or product imports; two independent consumer wrappers share value/validation; separate Vite-built `/temporal-embed.html` entry mounts *without* `.lab` or Design Lab shell and uses two distinct scoped semantic skins. `src/temporal/README.md` documents the contract and future adapter boundary. | Chromium separate-host tests at 375px and 1024px verify independent mount, distinct skins, no overflow and synchronized keyboard edits; Storybook examples compile. | **NOT** a published npm package, L2-certified WordPress adapter or commercially certified L3 component; semver migration testing/deprecation policy still needed. |
| D — Durations | Pure functions distinguish civil inclusive days, hotel-style date-boundary gaps, wall-time range and elapsed offsets via explicit instants; structured `DurationParts`. | Deterministic pure tests incl. leap-day/month crossing, midnight and NYC spring-forward explicit-offset interval. | Advanced IANA local-time disambiguation for scheduled events, business policy backends. |
| D — Countdown | Deadline target with explicit Z/offset, `countdownSnapshot(targetMs,nowMs)`, real-time browser refresh on visibility/focus, days/hours/minutes/seconds, card/compact/progress views and expiry states. | Fake-clock pure tests for before/exact-zero/after; Chromium active countdown smoke checks. | Trusted server clock, cross-device continuity, automatic domain transitions, accessibility audit across assistive readers. |
| D — Timer | `makeTimer`, `startTimer`, `pauseTimer`, `timerSnapshot`, `resetTimer`, immutable state + configurable duration. UI supports start, pause, resume, reset, progress display, seconds toggle, explicit completed/paused states. | Virtual clock pure tests and Chromium UI tests verifying run→pause→stable value→resume→reset. | Server-backed timer restoration and security-sensitive actions. |

**Build and QA evidence for implementation commit `910cdb6`** (before README-only update):
- [Design Lab CI #39057295047](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39057295047): **success**, including Vite/TypeScript compilation, Storybook build and 8 deterministic Node temporal tests.
- [Verify Design Lab #39057295046](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39057295046): **success**, 28 static guards, 11 Chromium viewport widths in light and dark mode, locale/RTL and UI interactions, plus standalone host at 375 and 1024px.
- Further documentation-only commits must keep both checks green before sharing a deployment branch; do not call this deployed until user runs the workflow and Cloud Run revision/health is verified.

**Security/product semantics:** counter expiration is **informational** and does not authorize any publication, account activity, payment, booking/cancellation or external action. Server-authoritative deadlines and tenant permissions belong to consuming products.


## 2026-10-18 — Zenit UI Core operational implementation checkpoint

**Scope:** Approved generic operational components, see [issue #10](https://github.com/agencia-zenit-br/zenit-design-lab/issues/10). This is not production-ready Platform integration and does not certify external package L2/L3 portability.

| Capability | Implementation and evidence | Remaining gates |
|---|---|---|
| Pure collection core | `src/operational/collectionCore.ts`: deterministic search with accent normalization, exact opt-in filters, stable ID-based selection, sorting, bounded pagination, no React imports. | Per-service authorization is entirely server responsibility; remote datasets need an adapter. |
| Universal records presentation | `OperationalRecords.tsx`: controlled filters/query/sort/page/selection with semantic desktop table and no-horizontal-scroll mobile cards. | More complex editing/table UX (drag, resize, clipboard, undo, virtualization) is deliberately not claimed. |
| Feedback and confirmation | `OperationFeedback.tsx`: typed notice levels and explicit inline confirmation, callback-mediated product operations. | Real audit and server-confirmed operation results; full assistive screen-reader audit. |
| Demo in catalog | `OperationalWorkbench.tsx`: 17 synthetic records, search/filter/sort/paging/bulk selection, local add/remove, loading/error/retry examples. | Platform API integration, authoritative persistent records, tenant policy tests. |
| Adapter contract | `src/operational/adapter.ts` documents `list/read/update` and version conflicts. | No real implementation or deployment; ZMC PR #314 still needs authorized GET/list and GET/detail routes. |
| Time zone UX | `timeZoneOptions.ts` supplies a searchable IANA timezone list with human-friendly city labels. RegionalWorkbench no longer exposes an arbitrary timezone input. | Large catalog virtualization if required; locale label translations and DST-dependent offset enhancements. |
| Countdown UX | `TemporalDemo.tsx` asks for final **date** and **time** separately, shows selected regional zone; `zonedClock.ts` converts to a real instant or explicitly refuses DST gap/overlap. | Trusted clock, server-side deadline validation and choices for ambiguous DST fall-back cases. |

**QA:** [Design Lab CI #39150860663](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39150860663) and [Verify Design Lab #39150860682](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39150860682) **success** after operational/timezone/date-time changes. Vite + Storybook builds, 28+ static guards, deterministic Node temporal/operational test suites, 11 Chromium viewport widths in light/dark, multi-mode calendar/countdown/timer, IANA selection, new operational table paging/selection/retry and separate temporal host tests.

**Current level:** partial internal preview L1 candidate. The new operational collection has not yet been exercised under two independent *external* hosts/skins or backed by authorized Platform endpoints. Do not claim commercial L3, WordPress L2 or production API readiness.

**Release governance:** The CEO has approved the direction and the work on a preview branch, not merge or production deployment. Keep PR #8 as draft; the CEO manually triggers any Design Lab preview workflow. The original V3.0 design image has not been pixel-diff certified. Physical phone validation and screen-reader audit remain separate gates.

## Non-negotiable workflow

1. Read the relevant approved sections and newer superseding decisions **before changing code**.
2. Map approved/required/proposed/in-review items separately. Never treat an in-review visual as approved.
3. Preserve visual decisions across products, theme and viewport. Keep lab diagnostics out of customer screens.
4. Add or update conformance evidence with each visual change; do not claim completed implementation merely because it builds.
5. Run `npm run check:design`, `npm run build`, then browser QA in both modes at **320, 375, 390, 768, 1024, 1440px**. Check `document.documentElement.scrollWidth <= window.innerWidth`, keyboard, icon alignment, padding, content flow and visible selected/focus/disabled states.
6. Compare against the original V3.0 image; the file is referenced in the decisions but is **not present as a versioned image asset** in this repository. Do not claim pixel-equivalence until provided or recovered and compared.
7. Never deploy/move to production merely because visual QA or preview CI passes.

The automated static design guard is a regression detector, **not** screenshot/dimensional/browser certification.


## 2026-10-18 — Seven CEO feedback items / PR #12 implementation checkpoint

**Approval:** CEO authorized both implementation lots after inspecting commit `ab7db134`; **not yet visually accepted**. Working branch `feat/ui-core-stability-tables-20261018` with [draft PR #12](https://github.com/agencia-zenit-br/zenit-design-lab/pull/12) based on the former preview branch. The published service `zenit-ui-core-preview` still displays the earlier SHA until a distinct authorized deployment; do not claim these improvements are live.

| Approved criterion | Implementation in PR #12 branch | Acceptance test and remaining gate |
| --- | --- | --- |
| Non-shifting feedback and selections | Reserved status zones in Records and temporal fields; overlapping confirmation only when asked | Chromium measure table position before/after checkbox; observe notices in narrow view; further UX review on real phones |
| Stable calendar height | Six complete weeks/42 Gregorian cells including inert blanks | Chromium exact cell count and month-to-month height regression |
| Numeric time `2000` | Pure parser normalizes 3/4 digits, keeps strict time validation and explicit 12h period | Node test valid/invalid HHMM, Chromium input↔controlled value |
| Scrollbar theming | `--brand` semantic scrollbar thumb plus neutral track | Light/dark browser inspection; native OS styles vary |
| Vertical control alignment | Shared checkboxes and label baseline rules, reserved validation region | Chromium overflow + keyboard; manual precision QA of remaining components |
| Inline contextual `?` | Summary help beside heading and countdown/timer help with their title line | Inspect RTL/mobile; generic popover remains independent |
| Columns/row/column guides | Synthetic-only editable added columns with visibility, reorder/delete; sticky header/data row/first column in internally scrollable desktop table; mobile cards remain | Chromium add/guide controls, sticky CSS and pagination; **not** product schema changes |
| Structured timer input | Days/hours/minutes/seconds typed fields; pure aggregate validated and used by timer | Node strict boundaries and Chromium start/pause/resume/reset |

**Not included/certified:** persistable per-user view configuration, production schema changes, advanced spreadsheet selection/resizing/clipboard/undo, screen-reader audit, physical mobile QA, pixel-diff V3.0, authorization to deploy, real ZMC backend. The source-of-truth parent is [2026-10-18 design decision](design-decisions.md). This addendum records implemented source pending final CI and visual gates; update check links when CI passes.

### 2026-10-18 — QA verified for functional SHA `c72ac0174d5218cb59739b9274b9ef2d67f20816`

- [Design Lab CI #39171009508](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39171009508): **SUCCESS**, TypeScript/Vite production build, unit suites, static invariants and Storybook build.
- [Verify Design Lab #39171009459](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39171009459): **SUCCESS**, including Chromium viewport/RTL/LTR/synthetic operational interactions, fixed six-week calendar, normalized typed `2000`, stable table position when selecting a row, custom column creation and fixed first-column CSS.
- An earlier Verify job [#39170598796](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39170598796) **failed** because its browser test expected an explicit `aria-label` attribute on a checkbox whose accessible name was originally only inherited from a wrapping `label`. The component was strengthened with explicit `aria-label` and retested successfully. Do not erase failed-run provenance.
- **Remaining gates:** manual visual comparison to V3.0, physical devices, keyboard/screen reader audit, actual sticky scroll observation in narrow desktop cases and approved Cloud Run redeploy. `zenit-ui-core-preview` still contains earlier SHA `ab7db134` until operator confirms a new revision. PR #12 remains draft.


### 2026-10-18 — UI Core review revision 2 DEPLOYED, human review pending

The CEO ran the guarded `--check` followed by `--deploy` through Cloud Shell, with expected branch and **commit `c747fb3985f5d20b080ea9b7beb93a84e5f41925`**. Source CI/Chromium for this exact SHA passed in [Design Lab CI #39171249469](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39171249469) and [Verify #39171249453](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39171249453).

| Evidence | Verified outcome |
| --- | --- |
| Cloud Build | `321e991a-5f39-4d8f-9ca9-93dffd3d57aa`, SUCCESS (1m06s), per CEO Cloud Shell |
| Cloud Run service | `zenit-ui-core-preview` in `zenit-platform-labs/southamerica-east1` (independent from original `zenit-design-lab`) |
| Revision | `zenit-ui-core-preview-00002-c2d` at 100% traffic for **its own preview service** |
| Preview | https://zenit-ui-core-preview-725877092709.southamerica-east1.run.app |
| Alternative script URL | https://zenit-ui-core-preview-pj3dnprg2a-rj.a.run.app |
| Health | The deploy script reported successful verification; visual rendering is **not** certified by health |
| Current gate | `DEPLOYED_PREVIEW` + `HUMAN_REVIEW_PENDING` |

**Supersession:** the earlier note in this file that the preview still serves `ab7db134` records the state *before* this deployment and is now historical; the new revision above is current. The existing Design Lab service is preserved, no PR was merged and no Platform/ZMC customer data or backend was activated. Further browser/device/assistive-technology and CEO visual acceptance remain open. **This addendum is a documentation-only commit newer than the deployed source SHA; it does not mean the running preview contains this documentation commit.**


## 2026-10-18 — Consolidated records and renamable guide headers: PR #13

The CEO approved consolidating the two competing table demos and added editable titles for fixed guide columns. Implementation is isolated in [Design Lab draft PR #13](https://github.com/agencia-zenit-br/zenit-design-lab/pull/13), branch `feat/ui-core-unified-record-guides-20261018`, **stacked on PR #12**, not on `main`.

| Requirement | Implementation evidence | Separate gate |
| --- | --- | --- |
| One table component | `ComponentCatalog.tsx` no longer renders the legacy `catalog-table` demo; `OperationalWorkbench` is the sole interactive table. `LabSidebar` has one `Registros y tablas` item | Chromium single-mount and navigation checks |
| Discoverability from home | `DesignLab.tsx` overview relabels record strip as read-only and links to canonical records and tables | Browser navigation QA |
| Edit guide header title | The column manager allows renaming base and added column labels keyed by immutable column IDs, including first pinned data column; validation rejects invalid/duplicate names | Browser test rename `Nombre` to `Referencia principal`, unchanged record and sort key |
| Retain legacy edits | Workbench optional cell editing of sample name/category/status; shared `OperationalRecords` renders editable mobile title; no extra grid | Browser mobile editable title and checkbox geometry |
| Fixed guides | Existing sticky header/first visible row/first data column controls retained | Real browser pinned scrolling, light/dark, RTL/LTR |

**Boundaries:** the user-approved behavior applies to the **visual titles**, not SQL schema, external data models or mutable tenant authorization. All edits are in-memory synthetic demo changes and reset with the example; mobile cards intentionally do not use horizontal table sticky scrolling. The existing Cloud Run UI Core preview still serves previous revision `00002-c2d`/source `c747fb3985` until a **separately authorized deployment**, and this change requires new CEO visual acceptance. This addendum is implementation description pending fresh CI for exact PR HEAD.
