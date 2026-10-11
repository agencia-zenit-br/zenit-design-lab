# Zenit Design Lab — Design decisions

Status: Living decision log. Product-independent visual design system.

## Principles
- Editorial Minimalism. Warm off-white background (#F5F5F2), white surfaces, ink (#29332D), muted green (#35584A), subtle borders; support dark mode.
- Responsive desktop/tablet/mobile; consistent 4px spacing grid, rounded geometry, accessible keyboard/touch interactions.
- Avoid layout shifts from confirmations or validation: reserve message space from initial render or use an appropriate overlay.
- Prefer contextual help, subtle transitions, and reduced-motion support.
- These decisions are design specifications, not a claim of production implementation.

## Component 01 — Window system — APPROVED
- Standard modal, expanded window, immersive/full-screen editor.
- Close, minimize, maximize/restore, persistent header, accessible actions, unsaved-changes confirmation.
- Confirmation/status messages occupy space reserved from the outset and must not enlarge the container or shift controls.
- Production work still requires true overlay behavior, focus management, animations, mobile validation.

## Component 02 — Quantity stepper — APPROVED
- Horizontal minus / quantity / plus arrangement with consistent spacing and rounded controls.
- Quantity must be centered horizontally and vertically, including multi-digit values; use tabular numerals.
- Regular and compact variants; min/max and step configuration; manual entry and validation in final implementation; disabled state and sufficiently large touch targets.
- Preserve the approved circular selection-control visual effect for compact/disabled option toggles in the design language.

## Component 03 — Editable dynamic table — APPROVED (header/guide behavior; other advanced features pending)
- Add/remove rows and columns, edit cells and column names, select rows and perform bulk actions.
- APPROVED: optional first-row header formatting and independent optional first-column guide formatting, including both together and a distinct intersection cell.
- APPROVED: header/guide formatting uses subtle backgrounds, stronger type, and appropriate dividers; separate optional sticky row/column behavior for large tables.
- Further review: drag reordering, resizing, undo/redo, keyboard navigation, responsive overflow and accessible semantics.

## Governance
- This file is the canonical, binding design baseline for this repository. Read it before design or implementation decisions; link it from the root README. Approved decisions override incidental demo choices. Proposals are nonbinding until explicit approval.

- Review and approve components one at a time. Do not label a component approved until explicit user approval.
- Update this log as decisions change, ideally in the same PR as corresponding implementation; keep experimental in-chat demos distinct from committed code.
- This repository is a standalone visual prototyping workspace; do not include secrets, customer data, or private Zenit Platform backend code.

## Cross-component decisions and proposals
- Scrollbars: APPROVED. Default 8px where browser supports exact sizing, balanced contrast (track #e8ebe6, thumb #b0beb4, hover #6e8a79), rounded geometry; preserve native scroll behavior and accessibility. Respect browser limitations, OS conventions, and touch overlay scrolling. Alternative widths/contrasts may remain configurable.
- First-use guidance: brief, dismissible contextual onboarding tied to actual controls; persistent, discoverable help entry points for later reference; keyboard/screen-reader support; do not obstruct essential actions or permanently consume valuable screen space. Avoid repeating dismissed guidance unnecessarily.
- Table advanced interaction review: column resizing, row/column reordering with destination preview, undo/redo, and scrolling behavior. Await explicit user approval before marking these as final.

## Space efficiency — APPROVED PRINCIPLE
- Maximize usable workspace while preserving legibility, accessible target sizes, and comfortable interaction. Do not add unnecessary rows, columns, dividers, or empty space.
- Place table column-reordering arrows inline with the column title, in the compact arrangement `< Product >`, rather than creating a separate control row. Use responsive adaptations if space is constrained.

## Column reorder icon refinement — APPROVED
- The literal characters `<` and `>` were placeholders for layout, not the desired icon glyphs.
- Approved: polished, thin-stroke vector chevrons inline with header text, borderless at rest, subtle palette-consistent hover feedback.

## Table reorder chevron scale — APPROVED
- User preference: chevrons visually smaller than header text. Prototype target: approximately 12px vector chevrons alongside 14px header labels, fine strokes, subtle visual weight, with usable interaction targets and no extra header row.

## Table guide header alignment — APPROVED
- Approved default: center guide/header titles horizontally while keeping data alignment appropriate to content; center the full label-plus-chevron group, and allow table-level override.

## First-use contextual guidance — APPROVED
- Provide a brief, optional first-use walkthrough per feature, with Next, Skip, and Finish.
- Users can recover and replay guidance later from a clearly discoverable contextual Help control. Do not restrict help to hover or first use.
- Preserve completed/skipped state per user and feature across sessions in production.
- Prefer anchored overlays that do not cause layout shifts; support keyboard, touch, reduced motion, and accessible dismissal.
- Keep copy concise and avoid persistent instructional clutter.

## Table column drag-and-drop visual behavior — APPROVED
- Directly dragging a column header will show a subtle muted-green vertical insertion line between columns at the intended drop location.
- The dragged header receives a restrained elevated visual treatment during drag.
- The table's definitive column order changes only upon drop, not during hovering.
- Preserve the previously approved inline chevron reorder controls as an alternative, including for keyboard/accessibility.
- Visual behavior approved; implementation and hands-on drag interaction remain to be reviewed in the next interactive prototype.

## Dynamic table semantic column alignment — APPROVED
- Column alignment follows its semantic role, not its current position in the reorderable table.
- Identifier/name columns (for example, Product) align their body values left; attribute columns (for example, Quantity, Price, Status) center their body values by default.
- Reordering a column must not change its alignment.
- Preserve the previously approved centered guide/header titles, including their inline chevrons, independently of body-cell alignment.
- Permit per-column alignment overrides for specialized content or requirements.

## Dynamic table column resizing — APPROVED
- Resize columns independently by dragging a narrow handle at the right edge of each header; update width live during drag.
- Double-click the handle to fit the column to its content.
- Enforce a usable minimum width per column; do not collapse or hide columns by resizing.
- Support keyboard resizing on the focused separator: Left/Right arrows in 10px increments; Home to minimum width.
- On touch devices, allow direct handle dragging without interfering with ordinary table scrolling.
- When total column width exceeds the viewport, use native horizontal scrolling rather than compressing columns.
- Preserve semantic body-cell alignment, centered guide headers, column order, and consistent padding while resizing.
- Provide an explicit restore-default-widths action. Interaction design approved; production implementation and cross-device QA remain separate.

## Shared undo/redo action history — APPROVED
- Provide discreet, always-discoverable Undo and Redo controls, with Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts (and platform-appropriate equivalents).
- Track completed logical operations as individual history entries, not every keystroke; include cell edits, column reorder, column width changes, row edits, and other supported table operations.
- Undo reverses the last committed operation; Redo reapplies it. A new operation after Undo truncates the previous redo branch.
- Keep disabled actions visible but subdued.
- Optional history panel, normally collapsed, exposes a readable action list without occupying persistent table space.
- Treat the mechanism as a reusable design-system capability across Zenit editors.
- Session-local history is approved for the prototype; persistence across editor sessions and server-side save boundaries require separate design decisions.

## Editable table keyboard selection geometry — APPROVED
- Approved after interactive v3 validation: selection outlines the entire cell rectangle rather than the text/value area.
- Use a single, uniformly weighted green outer border for individual cells or rectangular multi-cell ranges; subtle interior shading and distinct active-cell indicator within a range.
- Expand the actual outer rectangle on Shift+arrow, Shift+click, or pointer drag; avoid doubled or uneven borders and layout shifts.
- The user confirmed the corrected v3 visual behavior. Other keyboard navigation details remain subject to separate approval.

## Editable table keyboard direct typing — USER-REQUESTED REFINEMENT (IN REVIEW)
- When a cell is selected in navigation mode, typing a printable character immediately starts editing with that character, replacing the previous cell value (Excel-like).
- Enter, F2, or double-click start editing while preserving the existing value.
- Escape cancels and restores the prior value; Enter commits and moves down; Tab commits and advances horizontally.
- When a range is selected, direct typing replaces only the active cell, not every cell in the range.
- Keep standard text-editing shortcuts within an open editor. Confirm in an interactive demonstration before marking the keyboard-navigation component fully approved.

## Editable table direct typing — APPROVED
- The user approved the interactive v5 behavior: typing a printable character while a cell is selected replaces its existing value immediately; Enter/F2/double-click preserve existing text for editing. Escape cancels; Enter commits and moves down; Tab commits and advances.

## Editable table fill handle — PROPOSED, PENDING INTERACTIVE APPROVAL
- Show a small draggable handle at the bottom-right corner of the selected cell or rectangular range, similar to Excel.
- Drag vertically to preview extension of the range; on release fill target cells by repeating the source values/pattern, preserving order for multi-cell selections.
- Show a green outline for the prospective fill extent, without shifting layout. Record the entire fill as one undoable operation.
- Initially support literal-value copying; numerical/date series and formulas require a separate design decision.

## Editable table fill handle — APPROVED
- User approved the interactive fill-handle prototype: bottom-right square handle on the selected cell/range; pointer drag previews a contiguous extension with a green outline; releasing fills target cells by repeating the literal source values or block in order.
- A fill gesture is one logical undoable/redoable operation. Keep the selection geometry consistent with the previously approved full-cell outline, without changing table dimensions.
- Initial implementation is literal-value fill; numeric/date sequence inference is deferred.

## Spreadsheet-like cell formatting and formulas — FUTURE ROADMAP (NOT APPROVED FOR INITIAL SCOPE)
- Consider cell-level formatting: data types, currency, percentages, decimals, dates, colors, alignment, conditional formatting.
- Consider spreadsheet-style formulas (e.g. =A1+B1, =SUMA(B2:B10)), references, dependencies, and automatic recalculation.
- Design a forward-compatible cell model that separates raw value, display formatting, and eventual formula metadata, but do not treat formula engine or rich formatting as initial release requirements.

## Editable table clipboard and pointer-range selection — APPROVED WITH REFINEMENT
- User approved copy/cut/paste behavior: rectangular range selection, dashed source outline, cut source retained until paste, TSV interoperability with Excel/Google Sheets, and undoable paste.
- Required refinement: mouse pointer-down on any cell followed by held-button drag across cells extends the rectangular selection live without Shift or other modifiers; pointer release completes selection. Shift+click and Shift+arrow remain alternatives.
- Keep range selection drag distinct from fill-handle drag: dragging the cell body selects; dragging the bottom-right handle fills/copies.
- Handle pointer cancellation, scrolling and touch interaction without accidentally modifying data. Offer explicit expansion rather than silent data loss if pasted dimensions exceed table bounds.

## Editable table context menu and AI analysis — APPROVED
- Secondary click on a cell or selected rectangular range opens a compact context menu with Copy, Paste, and Analyze with AI.
- Right-click within an existing range preserves that selection; right-click outside selects the clicked cell before opening the menu. Keyboard context-menu invocation and touch accessibility should be supported.
- Copy/paste reuse the approved clipboard and undo/redo semantics.
- Analyze with AI opens a contextual panel accepting natural-language questions about the selected data; default read-only, with explicit confirmation before applying any suggested edits.
- Scope the data passed to the LLM to the user's authorized selection; integrate through a shared Zenit Platform AI service rather than a per-product provider dependency. Provider, billing, permissions, data minimization, and audit requirements remain architectural design questions.
- Pending interactive review and approval.

## Context menu: Cut and extensibility — APPROVED
- The user approved the table secondary-click menu and AI analysis entry, and explicitly added Cut alongside Copy, Paste, and Analyze with AI as the four initial actions.
- Cut leaves source values intact until a successful paste, then moves the selected rectangular range as one reversible operation, integrated with Undo/Redo.
- Keep a compact menu with keyboard shortcut hints where relevant. Preserve existing selection when secondary-click occurs inside it; otherwise select the clicked cell.
- Design the menu as an extensible, context-aware command registry. Future Excel-like options may include insert/delete rows and columns, cell formatting, sorting/filtering, validation, formulas, and other commands; these are roadmap candidates, not current-scope approvals.
- Show only commands applicable to the current table, selection, user permissions, and product capabilities. Analyze with AI opens a scoped read-only-by-default panel; actual LLM integration remains separate.

## Table structural operations — APPROVED
- User approved insertion of rows above/below and columns left/right, and deletion of entire selected rows/columns.
- A multi-row or multi-column selection determines the number of structures inserted or removed; each operation is a single undoable action.
- New columns have editable provisional titles; guard against deleting the last required row/column; enforce permissions, schema constraints and server-side record semantics for data-bound tables.

## Bidirectional Microsoft Excel clipboard interoperability — REQUIRED
- The editable table must support reliable copy/paste of single cells and rectangular ranges Excel → Zenit and Zenit → Excel, preserving row/column positions, empty cells, and rectangular shape.
- Support text/tab-separated-values (TSV) and HTML table clipboard formats where supported by the browser; use standards-compatible clipboard read/write with appropriate fallback.
- Avoid silent truncation: offer explicit row/column expansion or clear handling when incoming data exceeds the table bounds.
- Handle locale-sensitive numeric, decimal, date, percentage and currency values without silent coercion or data loss. Document the import/type-inference policy and provide a safe text-preserving path for ambiguous inputs.
- Treat each paste as one undoable operation. Preserve appropriate keyboard shortcuts and avoid hijacking native text editing while editing a cell.
- Initial acceptance scope: data values and rectangular structure. Formatting, formulas and references are future roadmap items requiring separate decisions; macros and proprietary Excel features are not implied.
- Verify interoperability in both directions against actual Excel clipboard samples, including multiline quoted content, Unicode, tabs/newlines, empty cells and large ranges. Browser clipboard permissions and platform limitations must be accounted for.

## Cross-application spreadsheet and enterprise data interoperability — REQUIRED
- Extend the previously approved Excel clipboard requirement to Google Sheets, LibreOffice Calc, comparable spreadsheets, and future administrative, accounting, ERP, inventory, invoicing and business systems.
- Design for standards-based bidirectional interchange rather than Excel-specific behavior: clipboard text/plain TSV and text/html tables; file-based CSV, TSV, XLSX and open formats where appropriate; future API/adapter-based exchange for enterprise systems.
- Separate the editable presentation grid (Zenit Data Grid) from reusable import/export and normalization services (provisional name: Zenit Data Interchange) and provider-specific enterprise adapters. Names and concrete service boundaries remain subject to architecture review.
- Preserve cell/range geometry, blank cells, Unicode, locale-aware decimals, dates, percentages, currencies and large datasets; define explicit type inference, validation and conflict handling without silent conversion or truncation.
- Accounting-grade use cases require exact decimal representation, separation of canonical values from display formatting, currencies, permissions, auditability, and transactional validation. Clipboard/import actions must not automatically post financial entries or mutate authoritative records without explicit authorized confirmation.
- Compatibility is an architectural and acceptance-test goal, not a claim of current tested implementation. Verify behavior against real Excel, Google Sheets, LibreOffice and representative enterprise exports; defer advanced formatting/formula fidelity and vendor-specific integrations to separate scope decisions.

## Data import/export workflow — APPROVED WITH DESIGN CORRECTION
- User approved the three-stage import flow (File → Review → Confirm), preview, type mapping and export direction.
- **Universal mandatory design rule:** NEVER expose browser-native form control styling in Zenit product UI. In particular, no visible default `input[type=file]` / "Choose File" button, default browser selects, or other unstyled native widgets. All visible file pickers, dropdowns, buttons, input states, drop zones and controls must use the Zenit Design System.
- Native browser/system capabilities may be used under the hood for accessibility and function (e.g., a visually hidden file input triggered by a Zenit-styled upload button); the OS file selection dialog is outside the product's visual surface.
- Apply consistently across the entire Zenit product family and all design lab demos. Treat any visible native picker in earlier prototypes as a design defect, not an approved precedent.
- Import implementation still needs actual XLSX/ODS support, type validation, error handling and persistence; the demonstrated CSV/TSV flow is a prototype only.

## Universal Zenit File Picker — APPROVED
- User approved the interactive File Picker design shown in Lab 03.13 without changes.
- Reusable across all Zenit products; custom-styled drop zone and selection button, with native OS file dialog accessed only through a visually hidden file input. Never expose browser-native-looking file controls.
- Supports context-configurable single-file and multi-file selection, drag-and-drop, accepted-format and file-size validation, duplicate detection, selected-file list (filename, extension, size, status, remove), clear selection and explicit continue action.
- Selecting files does not automatically upload or process them. Production implementation requires content-level validation, accessible keyboard and touch handling, upload progress/cancel/error recovery where applicable, and permissions appropriate to the product.
- The Lab 03.13 demonstration was a client-side prototype, not a production implementation or server upload. File types and 10 MB limit in the demo are examples, not universal fixed limits.

## Zenit Select universal dropdown — APPROVED (Lab 03.14)
- User approved the presented custom-styled Zenit Select interaction and appearance.
- Support configurable single selection (closes on choice) and multiple selection (compact selected chips and explicit Done), optional searchable filtering, optional grouped choices, clear selection, and empty-results state.
- Large datasets require internal scrolling, scalable virtualization and optional remote search. Production accessibility must implement keyboard arrows, Enter/Space activation, Escape close, focus indicators and appropriate screen-reader combobox/listbox semantics.
- No visible browser-native select controls. The in-chat prototype demonstrated selection, search and grouping only; production keyboard/virtualization behavior is a requirement, not a tested implementation.

## Date & Time Picker refinements — APPROVED
- User requests a denser day grid: reduce horizontal and vertical gaps between day cells, avoiding a loose/spread-out calendar while preserving usable touch and keyboard hit targets.
- Universal product theming rule confirmed: dark green is the Design Lab reference accent, not a hard-coded color across all Zenit products. Each product (and potentially tenant/brand) may supply semantic design tokens for selected, hover, focus, accent and contrast states while retaining shared geometry, interaction and accessibility.
- Apply semantic color tokens rather than literal `#35584A` in production components; validate contrast in light and dark themes. The Date & Time Picker itself remains under review pending user approval of the compact revision.

## Zenit Date & Time Picker compact calendar — APPROVED (Lab 03.15)
- User explicitly approved the revised compact calendar day-grid density and appearance: seven tightly spaced columns, approximately 2px cell gaps and 36px day hit areas in the prototype, with a restrained calendar width.
- Use product- or tenant-specific semantic theme tokens for selected-day accents (rather than hard-coding the lab's dark green), with accessible contrast across light/dark themes.
- The overall date/time picker design covers date, date range, date-time and time modes, month navigation, 12/24-hour configuration, timezone and locale-aware display, bounds and validation; advanced cross-month range behavior, manual entry and timezone correctness remain implementation requirements, not features proven by the prototype.
- Reuse one universal component; avoid visible native date/time controls.

## Calendar weekday initials by locale — APPROVED CORRECTION
- In the Spanish compact Date & Time Picker, use the weekday header initials **L · M · M · J · V · S · D** (Monday through Sunday). Tuesday and Wednesday are both M; do not substitute X for Wednesday.
- Weekday labels are locale-specific and should be generated/configured for each user/product language, not hard-coded globally. Maintain weekday ordering appropriate to the locale or product settings and accessible full weekday names for screen readers/tooltips.
- Preserve the previously approved compact seven-column calendar geometry.

## Additional calendar systems — FUTURE REQUIREMENT
- User expects potential Jewish and Muslim customers; the universal Date & Time Picker must be architected to support non-Gregorian calendars, prioritizing **Hebrew** and **Islamic/Hijri** alongside Gregorian.
- Keep interface language, calendar system, locale/date formatting, timezone, and text direction as independent configuration dimensions. Support RTL layouts, localized weekday/month names and accessible labels.
- Allow Hebrew and Islamic date entry/display with validated conversions to normalized internal instants or civil dates, as appropriate to the field; distinguish date-only values from timezone-dependent timestamps.
- For Hijri calendars, support explicit calculation/observational convention where applicable; do not assume one universally agreed conversion. Religious holidays and sunset-based day boundaries may require jurisdiction/community-specific policies.
- This is an architectural roadmap requirement, not an assertion that these calendar systems are already implemented or visually approved. Design and test the dedicated calendar views in a later lab.

## Universal bidirectional layout (LTR/RTL) — MANDATORY PLATFORM-WIDE REQUIREMENT
- All Zenit products and shared Design System components must be architected for both left-to-right (LTR) and right-to-left (RTL) interfaces, especially future Hebrew and Arabic localizations. RTL is a first-class direction mode, not a separate duplicated product or optional calendar-only feature.
- Mirror appropriate layout/navigation structure: sidebars, menus, dialogs, forms, data grids, calendars, contextual popovers, focus/navigation flow and directional icons. Do not mirror non-directional symbols, logos, images or data indiscriminately.
- Use CSS logical properties and direction-aware design tokens instead of hardcoded physical left/right positioning wherever layout direction matters. Test overflow, sticky columns, resizers, drag/drop, range selection and context menus in both directions.
- Support Unicode bidirectional text correctly, including mixed Arabic/Hebrew with Latin text, numbers, dates, email addresses, identifiers, accounting values and code; isolate direction-sensitive substrings as needed. Preserve canonical data independently of visual direction.
- Language, text direction, calendar system, locale, timezone and theme must remain independently configurable, with sensible defaults. Support appropriate fonts and glyph coverage, accessible focus/reading order, keyboard behavior, and both desktop and mobile layouts.
- Establish RTL acceptance testing for every reusable component and product before releasing Hebrew/Arabic versions; this is a design/architecture mandate, not a claim of current implementation.

## Accessibility program — FUTURE DEDICATED REVIEW; BASELINE MANDATORY NOW
- User explicitly requests a later, dedicated discussion and formal decisions about accessibility across the Zenit product family.
- Accessibility must be considered from the start for every shared component and product; it is not a premium feature or optional add-on. Include keyboard access, screen-reader semantics, visible focus, accessible error/status feedback, touch targets, contrast, RTL/LTR support, text scaling and reduced motion.
- Schedule a dedicated design review to establish an accessibility policy, acceptance criteria, testing methodology and governance. WCAG 2.2 Level AA is a proposed baseline for that future discussion, not yet a formally user-approved compliance commitment.
- Review visual, motor, auditory and cognitive accessibility, high-contrast modes, complex data grids, and accessible localization. Do not claim certification or conformance until implementation and audits verify it.

## Zenit Color Picker 03.16 — USER REVIEW / REVISION REQUIRED
- Previous prototype's swatches and preview blocks were judged excessively large. Redesign as a compact, high-density professional color picker with small swatches.
- User requires HEX, RGB, CMYK input/display modes, continuous visual color spectrum selection, and a real eyedropper.
- Eyedropper desired behavior: activate sampling, allow scrolling to find a target color, click to sample, apply it and restore the prior work position/state. Assess browser API permissions and limitations; do not promise unrestricted screen pixel sampling or scroll behavior unsupported by native EyeDropper. Provide a controlled in-app fallback where feasible.
- CMYK is print-oriented; conversions from screen RGB without ICC profiles are approximations. Distinguish precise color-managed workflows from convenience conversions.
- This is a change request to the prototype, not final component approval. Validate interactive behavior before marking approved.

## Color Picker 03.16 — Compact Photoshop-like popover refinement (IN REVIEW)
- User clarified the desired reference is Photoshop's compact color picker, not the large/wide preview shown earlier.
- Target a small anchored popover (~240–260px wide as an initial desktop design target), with a compact square saturation/value field, narrow hue control, small current/previous swatches, eyedropper and compact HEX/RGB/CMYK fields. Keep spacing tight and avoid oversized previews or swatches.
- Adapt positioning to available viewport space and mobile layouts; final dimensions and interaction remain subject to prototype validation.

## Zenit Color Picker 03.16 — APPROVED COMPACT DESIGN
- User approved the compact Photoshop-inspired color picker layout presented in the design lab: a small anchored popover (~240–260 px desktop reference), square saturation/value spectrum with narrow vertical hue strip, small swatch and HEX display, and compact format controls.
- Retain the previously requested functional requirements: editable HEX, RGB and CMYK, interactive spectrum, eyedropper with scroll-to-target / click / return-to-workflow behavior where technically supported, opacity where relevant, and themeable, accessible LTR/RTL behavior.
- Approval applies to the visual layout and stated requirements; the latest visual was explicitly a noninteractive size/layout reference. Do not mark spectrum, eyedropper, or conversion behavior as implemented or tested. Browser eyedropper constraints and color-managed CMYK/ICC support need engineering validation.

## Zenit Tooltip 03.17 — USER-REQUESTED REFINEMENTS (IN REVIEW)
- Tooltip content must never overflow its container or viewport. Use intrinsic sizing with a sensible maximum width, natural line wrapping, and collision-aware positioning; ensure long translated strings and narrow mobile viewports remain legible. No clipping or text running outside the tooltip.
- Use restrained internal padding and compact typography rather than oversized tooltip surfaces.
- Omit terminal full stops in short contextual help labels and short tooltip descriptions. Preserve internal punctuation and punctuation needed for longer or more complex prose.
- These refinements respond to user feedback on the prototype; do not mark the full Tooltip component approved until the revised behavior is validated.

## Zenit Tooltip 03.17 — Stable layout and padding correction (IN REVIEW)
- User identified layout shift when contextual help appears. Establish a general no-layout-shift principle for contextual messaging.
- Floating tooltips must overlay content without changing parent dimensions. Inline/contextual status or help messages must have a reserved message area from initial render, including when the message is hidden; determine a stable height appropriate to content and responsive breakpoints.
- Correct the 'Message length' control label alignment: apply the same consistent horizontal inset/padding as the surrounding content. Audit labels and controls for edge-hugging and inconsistent alignment.
- Maintain previous rules: text wrapping without overflow, compact padding, no terminal period for short contextual messages. The revised demo and component remain under review pending explicit approval.

## Tooltip 03.17 — second visual correction (IN REVIEW)
- User reports the 'Save changes' sample looked like a strange button. Separate the real action control from its contextual tooltip; do not present tooltip content as an apparent standalone action.
- User reports slight container expansion persists despite min-height reservations. min-height is insufficient for strict layout stability; floating tooltips should use an overlay layer outside normal layout flow (e.g. absolute positioning/portal), with collision avoidance and no parent reflow. Inline messages requiring reservation must use a measured/stable allocated slot, not an expanding minimum height.
- Demonstrate the revised interaction and confirm zero card-size changes before approval. Maintain compact wrapping, inner padding, and omission of terminal periods.

## Tooltip 03.17 — Single-line preference and viewport width cap (USER-APPROVED REQUIREMENT)
- Prefer a single line whenever the tooltip text fits within one third of the viewport width. Do not impose arbitrary narrow fixed widths that force premature wrapping.
- Limit tooltip inline size to approximately 33.33vw, additionally constrained by safe viewport-edge margins. Wrap naturally only when the text exceeds that available width. Handle unusually long unbroken tokens without overflow.
- Preserve collision-aware positioning, compact internal padding, no unnecessary terminal punctuation, LTR/RTL directionality, and absolutely no parent/container layout shift when opening or closing the floating tooltip.
- This rule is approved; the overall Tooltip component still requires final visual/interaction validation.

## Zenit Notifications 03.18 — APPROVED DESIGN
- User approved the presented universal notification structure: success, information, warning, and error variants, each with a compact icon, short heading, supporting message, and dismiss action.
- Inline/form notifications reserve layout space to prevent shifts; floating notifications render in an overlay without resizing page content.
- Preserve restrained padding, readable wrapped text, accessible status/error announcements, semantic theme tokens, responsive layout, and LTR/RTL support.
- Approval is for the design demonstrated in chat; it does not imply production implementation or completed accessibility tests.

## Zenit Progress & Loading 03.19 — APPROVED DESIGN
- User approved the demonstrated compact progress/loading component with determinate percentage bar and indeterminate activity variant.
- Include running, paused, completed and error states; only expose pause/cancel controls when supported by the underlying operation.
- Use compact horizontal progress indicator, stable tabular percentage, reserved status-message space without layout shifts, optional compact description-free presentation, accessible progress announcements, reduced-motion behavior and RTL/LTR compatibility.
- Theme via semantic product/tenant tokens rather than hardcoded lab green.
- Approval covers the demonstrated design and functional requirements, not production implementation or verified animation/accessibility behavior.

## Zenit Tabs & Navigation 03.20 — APPROVED DESIGN
- User explicitly approved all three presented navigation variants: classic tabs with bottom indicator, compact tabs with subtle selected background, and grouped segmented navigation. Retain all three in the shared design system, with context-appropriate usage.
- Support optional counts, active states identifiable beyond color alone, readable inactive tabs, accessible click/touch targets, keyboard and screen-reader tab semantics, and semantic product/tenant theming.
- On narrow viewports, prefer horizontal scrolling or adaptive navigation rather than squeezing or clipping labels. Avoid unnecessary layout shifts when switching tabs or changing counters.
- Support RTL/LTR layout and direction-aware navigation. Distinguish navigational tabs from filter controls even if visual styling overlaps.
- This is approval of the design demonstrated in chat, not a claim of production implementation or verified accessibility.

## Future lab priority — Zenit Loading System (PENDING DESIGN)
- User requested a dedicated upcoming design discussion for loading indicators in three distinct contexts: individual operations/actions, whole pages/app sections, and multimedia content (images, videos, audio, documents/previews).
- This is broader than the approved 03.19 Progress & Loading component; reuse its determinate/indeterminate primitives where appropriate but define context-specific loading states, transitions and behavior.
- Explore a reusable Zenit loading identity with tenant/product semantic theming, layout-preserving skeletons, media aspect-ratio placeholders, inline button states, progress when measurable, accessible announcements and reduced-motion alternatives.
- Keep the loading experience visually stable without layout shifts. This is a future design task, not yet approved or implemented. Continue with Breadcrumbs 03.21 before scheduling this lab, unless the user changes priorities.

## Zenit Breadcrumbs 03.21 — APPROVED DESIGN
- User explicitly approved both presented variants: full breadcrumb trail for desktop and compact trail that collapses intermediate hierarchy into an accessible menu for constrained spaces.
- Current location is visually distinguished and not a self-link; earlier levels navigate to real ancestors. Optional home icon, long-label handling, and RTL-aware separator direction are required.
- Breadcrumbs must reflect actual product navigation rather than fabricate routes. Preserve responsive behavior, keyboard accessibility, screen-reader semantics and semantic product/tenant theming.
- Approval applies to the chat design prototype; production implementation and testing remain pending.

## Zenit Loading System 03.22 — image reveal refinement (IN REVIEW)
- User likes the four loading modes and requests a subtle render/reveal effect as images load.
- Proposed image transition: a restrained blur-to-sharp and low-to-full opacity reveal (approximately 200–300 ms), while preserving media aspect ratio and container dimensions and without delaying ready images artificially.
- Respect prefers-reduced-motion, image errors and cached/instant image loads; avoid flashing, excessive animation, and layout shift. The illustrated transition is a prototype, not a real image-loading integration.
- The four-mode Loading System remains in review until the user explicitly approves the revised design.

## Loading System 03.22 — bidirectional repeating image sweep (USER REVISION, IN REVIEW)
- User prefers a subtle repeating side-to-side light/render sweep across the reserved image area during loading, rather than a one-time blur-to-sharp effect as the primary loading indicator.
- Sweep reverses horizontally at the edges and continues while the resource is loading. On completion, stop the sweep and reveal the actual image without changing container size or aspect ratio. Respect reduced-motion with a static placeholder.
- Prototype is a visual simulation; it does not demonstrate real network image loading. Final motion intensity, speed and overall Loading System approval await user validation.

## Loading System 03.22 — central media-type icon proposal (IN REVIEW)
- User likes the repeating horizontal bidirectional loading sweep but suggests adding a centered multimedia icon.
- Proposed refinement: a small, subtle, semi-transparent centered icon identifying image, video, audio or document, kept static while the sweep moves behind it. Avoid excessive visual emphasis or using the Zenit logo for every media placeholder.
- Preserve reserved media dimensions, accessibility, reduced-motion support and the previously requested sweep. This icon treatment is proposed, not yet approved; the latest illustrative chat mockup did not animate the sweep.

## Zenit Loading System 03.22 — APPROVED MULTIMEDIA LOADER VARIANT
- User approved the combined multimedia loading prototype: continuous subtle horizontal light sweep that reverses direction, with a static centered semi-transparent media-type icon (image, video, audio, document).
- Keep the reserved media aspect ratio and dimensions fixed; stop the sweep and replace the placeholder when the actual resource becomes ready. Respect reduced-motion preferences with a nonanimated fallback; use semantic product/tenant theming and accessible status text.
- This approval is specifically for the demonstrated multimedia loader appearance and behavior. The chat demo simulates completion and is not evidence of real asset-loading integration. The full page/action/process Loading System may require separate final validation.

## Zenit Loading System 03.22 — PAGE LOADING APPROVED (STRUCTURAL)
- User explicitly approved the structural page-loading variant. Keep page navigation and layout stable, with reserved skeleton areas for cards, text and tables and a subtle repeated bidirectional shimmer on pending content.
- Structural skeleton loading is the selected default for page loading. The full-page overlay transition was demonstrated but NOT selected as the default; do not present it as approved.
- Skeletons should approximate final content geometry, avoid cumulative layout shift, stop on data readiness, respect reduced-motion and RTL/LTR, and avoid fake progress.
- Multimedia loader was separately approved earlier: bidirectional sweep behind a static contextual media icon.
- This records design approval, not completed implementation in production.

## Zenit Loading System 03.22 — OPERATION LOADING APPROVED
- User approved the demonstrated operation loading states for save, publish, import and export.
- Keep action button width and height stable. During execution, display a compact inline activity indicator with the action label and prevent duplicate submissions. Provide accessible status messaging in a reserved stable slot.
- On success, display a concise completion confirmation; on failure, explain the error and allow retry without losing entered data. For long-running jobs, add real determinate progress when available; never fabricate percentage or server status.
- Respect reduced-motion, keyboard accessibility, RTL/LTR and product-specific semantic theming.
- Approval covers the interactive visual prototype and design behavior; production implementation and backend integration remain pending.

## Zenit Loading System 03.22 — LONG-RUNNING TASK CENTER APPROVED
- User explicitly approved the compact task center for long-running background work (e.g., record imports and media processing), rather than choosing a floating/minimizable window as the primary presentation.
- Show distinct determinate progress only with trustworthy server-provided measurements; otherwise use an indeterminate activity bar. Include concise task name, context, status, progress and appropriate controls.
- Pause, resume and retry must appear only where backend operations support them; successful completion and failure must be represented accurately. Allow users to continue working in other sections while tasks execute; persistence/recovery across navigation must be implemented and verified separately.
- The interactive demo uses local simulated progress and controls, not actual persistent background jobs.
- With this approval, all four 03.22 loading modes have an approved design: multimedia bidirectional shimmer with centered type icon; structural page skeletons; stable operation-button loading; compact long-running task center. Production implementation remains pending.

## Zenit Design System 03.23 — EMPTY STATES AND ERRORS APPROVED
- User approved the interactive proposal for four states: no content, no search results, offline/connectivity failure, and operation/load error.
- Use restrained contextual icons, concise messages and one useful primary action where permitted. Empty states orient toward first creation; no-results states offer clearing filters or adjusting search without deleting source data; connectivity and server errors must be distinguished and allow retry where appropriate.
- Preserve user input and unsaved edits where possible. Keep recovery actions contextual and permission-aware, avoid unnecessary technical details, and support section/table/full-page placements with product-specific theme tokens, accessibility and RTL/LTR.
- The chat prototype simulated action completion; actual error detection and recovery integration remain pending.

## Zenit Design System 03.24 — UNIVERSAL SEARCH AND FILTERS APPROVED
- User approved the interactive search/filter prototype after the results-table margin and column layout correction.
- Search immediately by name, identifier and authorized attributes. Combine type/status and extensible filters; show removable active-filter chips and a clear/reset action. Sorting is independent of search/filter state. Show contextual no-results pattern (03.23).
- Results table: uniform 14px horizontal cell padding, stable proportional columns (approximately 49% record, 23% status, 28% date in the demonstrated layout), visually restrained neutral status labels, dates right-aligned on one line with tabular numerals, readable two-line record identifiers, and horizontal scrolling on narrow screens rather than crushing content. Use logical alignment for RTL/LTR.
- Restore search, filters, sorting and list position on navigation back where applicable. At scale, use server-side pagination, debounced search, stale-request cancellation and access-controlled query fields.
- Approval covers the design and revised table spacing; the interactive prototype used fictional local records and is not a production implementation.

## Zenit Design System 03.25 — CONTEXT MENUS AND QUICK ACTIONS APPROVED
- User approved the revised contextual action menu after correcting both table/action-column margins and menu-item spacing, then replacing improvised typographic glyphs with professional, consistent vector icons.
- Use coherent Lucide-style semantic icons (approximately 16px, consistent 1.75px stroke); do not use Unicode glyphs, emojis or mixed icon libraries as substitutes for functional UI iconography. Brand marks are a separate case.
- Results/action table uses uniform 14px horizontal cell padding; reserve a sufficiently wide action column with centered ellipsis trigger and adequate edge clearance. Keep menu padding around 7px, consistent option spacing (roughly 10–11px), aligned icon/text columns, and a divider separating destructive actions.
- The context menu is an overlay that does not reflow rows; position within viewport, flip upward where necessary, close on action/Escape/outside click, and provide focus and keyboard support.
- Include permission-aware individual actions, contextual bulk actions for multi-selection, and explicit confirmation for destructive actions. Enforce permissions server-side. Interactive prototypes simulated actions only; implementation remains pending.

## Zenit Design System 03.26 — FORMS AND VALIDATION APPROVED
- User approved the interactive compact client-creation form pattern with aligned labels and fields, required-field asterisks, optional-field identification, contextual field help, and consistent spacing.
- Show actionable validation messages adjacent to fields; reserve stable space for brief help/errors to minimize layout shifts. Validate complex formats on blur as appropriate; preserve accessible associations between inputs and errors.
- Track unsaved changes, request confirmation before discarding or navigating away in the implemented version, and retain inputs on submission failure. The prototype's Cancel reset without confirmation is explicitly not the final production behavior.
- Reuse approved 03.22 operation-loading patterns for submissions: stable button dimensions, duplicate-submission prevention, real status, and retry when supported. Enforce all important validation and authorization server-side.
- Accessible keyboard and screen-reader semantics, RTL/LTR, and consistent responsive layout are mandatory. Prototype saves are simulated; production implementation is pending.

## Zenit Design System 03.27 — CONTEXTUAL SIDE PANELS APPROVED
- User approved a true lateral sliding drawer, explicitly **not** a vertical accordion or an expanding section below the records table. Earlier stacked prototype was misleading; the subsequent side-by-side illustration clarified the intended pattern.
- On desktop the drawer overlays the existing page from the logical inline-end edge (right in LTR, left in RTL) without resizing, compressing, reflowing or scrolling the underlying table. Preserve page position and working context when opened and closed.
- Use the drawer for quick record inspection and editing, with the approved 03.26 form conventions, accessible focus management, keyboard close, and explicit unsaved-changes confirmation. Complex workflows should use the previously approved window system instead.
- On narrow/mobile screens the drawer becomes a full-screen contextual view with accessible header and actions. Respect RTL directionality.
- Approved as a design specification; implementation in the deployed design lab remains pending.

## Zenit Design System 03.28 — CONFIRMATION DIALOGS AND CRITICAL DECISIONS APPROVED
- User approved the interactive proposal for three contextual confirmation types: destructive record deletion, discarding unsaved changes, and replacing an existing file.
- Dialogs use concise consequence-oriented headings and descriptions, explicit action labels instead of ambiguous Yes/No, consistent compact margins and professional semantic vector iconography. Production dialogs are true floating modals that do not reflow the underlying interface; the stacked prototype was only for demonstration.
- Make confirmation proportional to risk: simple confirmations for ordinary destructive actions; typed confirmation for especially consequential or irrecoverable bulk/organization-level operations. Favor reliable Undo over needless confirmation for reversible actions.
- Default focus normally favors the data-preserving choice; guard against accidental Enter activation of destructive operations. Apply accessible modal focus trapping/return, safe Escape behavior, and LTR/RTL support.
- Semantic danger colors for irreversible destruction and restrained warning/neutral treatment for other consequential changes; never rely solely on color. Demonstrated actions are simulated; implementation pending.

## Zenit Design System 03.29 — DRAG, DROP AND REORDER APPROVED
- User explicitly rejected a mere insertion line during drag and approved the revised interactive prototype that opens a **full-sized dynamic insertion gap** as an item is moved with the pointer held down.
- When drag begins from a six-dot handle, lift the dragged item visually and leave an equal-height placeholder; as the pointer moves, surrounding items smoothly rearrange to open a real drop slot at the prospective destination. On release, insert the item in that slot; on cancellation, restore the prior order.
- Retain up/down arrow controls as an accessible alternative. Support pointer, touch and keyboard workflows, RTL/LTR, reduced motion, focus management and accessible announcements. Provide auto-scroll near container edges in the production implementation.
- Mark changes as unsaved until explicit save; offer reset and cancellation. Drag-to-reorder does not imply file relocation or changes in record status; apply separate permissions and semantics to those operations.
- Approved as an interaction/design specification. The in-chat prototype simulates persistence; deployed implementation remains pending.

## Zenit Design System 03.30 — TREE NAVIGATION AND HIERARCHIES APPROVED
- User approved the folder tree design with Windows Explorer/macOS Finder-style direct click-and-hold drag-and-drop, without requiring origin/destination dropdowns or separate Move buttons.
- Dragging a folder onto another folder nests it within the target; dragging onto a parent folder moves it up to that level; dragging onto a clearly marked Root target extracts it to the root. Support moving freely into, out of, and between nested folder hierarchies.
- Preserve the entire moved subtree, including all nested folders and contents. Prevent self-parenting, cycles, moving into descendants, and other unauthorized or invalid hierarchy changes; validate server-side, especially where permissions, paths or inherited access may change.
- For reordering among siblings, reuse the approved 03.29 full-height dynamic insertion gap; distinguish insertion-between from drop-onto-folder via clear target feedback. Support delayed auto-expansion of collapsed folders on hover during drag.
- Keep compact, expandable hierarchical rows with consistent indentation and Lucide icons; separate expand/collapse from selection. Provide keyboard and touch alternatives, RTL/LTR and accessible announcements. The in-chat demo simulated changes only; production implementation pending.

## Zenit Design System 03.31 — RESIZABLE PANELS AND WORKSPACE LAYOUT APPROVED
- User approved the 03.31 concept for adjustable workspace panels: direct click-and-hold dragging on subtle splitters with a larger accessible hit target, resizing live without content loss or layout jumps.
- Support horizontal and vertical splits, practical min/max panel sizes, collapse and restore retaining previous dimensions, and double-click on splitter to restore default proportions.
- Persist layout preferences per user, product and workspace as appropriate; restore across sessions/devices where supported. Provide explicit reset and responsive fallback to alternate views on narrow screens.
- Support keyboard resizing, touch/pointer input, reduced motion and LTR/RTL logical directions.
- The chat prototype demonstrated proportions with a slider, not a functioning draggable divider. The user approved the design concept; direct divider drag must be implemented and verified in production.

## Zenit Design System 03.32 — CONTEXTUAL TOOLBARS AND COMMANDS APPROVED (SECOND PROPOSAL)
- User approved proposal B: keep a simple, stable global toolbar for persistent document-level actions (e.g. Save, Preview), and reveal compact contextual toolbars only for the currently edited/selected object (text, image, etc.). Do not make the entire top toolbar unpredictably morph by context.
- Text editing toolbar MUST float near the active text/caret/selection at the vertical position of the edited passage in long documents, rather than being pinned to the top of the editor or viewport. Reposition with scrolling and editing; avoid covering text and respect viewport edges, side panels, LTR/RTL.
- Hide the floating toolbar when the editor leaves the viewport, and also when the active passage/caret is outside the visible viewport even if another part of the editor remains visible. Restore it when the active editing position is visible again and editing context remains active.
- Hide when editing focus is lost, except while interacting with the toolbar itself (avoid blur-before-click bugs). Use overlay/portal positioning without layout reflow or jumps; accessibility, keyboard, touch and reduced motion remain required.
- Show only tools relevant to the selected content type; hide contextual tools when nothing is selected or actively edited. Secondary tools may go in an overflow menu; complex apps can have fuller fixed toolbars where warranted.
- In-chat prototype demonstrated contextual controls but not real caret-anchored viewport-aware floating behavior; this is an approved production requirement pending implementation and testing.

## Zenit Design System 03.33 — UNIVERSAL COMMAND PALETTE APPROVED WITH KEYBOARD FOOTER REFINEMENT
- User approved the compact universal command palette with searchable actions by name/intention/synonyms, contextual and recent commands, grouping, permission filtering, and overlay presentation without reflow. Keyboard shortcuts: Ctrl+K (Windows/Linux), Command+K (macOS); arrows navigate, Enter executes, Escape closes. Preserve focus and support accessibility/RTL.
- User requested a more professional keyboard-help footer than the plain string '↑ ↓ Navegar · Enter Ejecutar · Esc Cerrar'. Approved refinement: render discrete subtle bordered keycaps for Up and Down arrow icons, Enter, and Esc, each paired with its label ('Navegar', 'Ejecutar', 'Cerrar'), with uniform compact spacing and responsive wrapping. Avoid raw typography-based separators or crude glyphs; use consistent vector icons and semantic key labels. Respect platform keyboard conventions.
- Prototype command actions and shortcuts were illustrative only; actual commands, keyboard handling, permission checks and navigation remain implementation requirements.

## Zenit Design System 03.34 — MAIN MENUS AND SIDEBAR NAVIGATION APPROVED
- User approved the first proposed navigation layout: a compact expandable/collapsible sidebar with consistent Lucide icons, nested module groups, and a clearly highlighted active destination.
- Expanded sidebar shows labels and hierarchy; collapsed sidebar shows icons with accessible tooltips, and opens group submodules in overlay flyout menus without expanding the entire sidebar.
- Keep global product identity/product switching separate from navigation modules belonging to the currently active Zenit product; do not mix all products' modules into one unbounded menu. Module names and final product information architecture remain product-specific and undecided.
- On desktop, support resizing via approved 03.31 splitters, and persist expanded/collapsed preference and expanded groups per user/workspace as appropriate.
- On mobile, show an overlay sidebar rather than compressing the workspace, and dismiss on destination selection.
- Respect product entitlements and user permissions, keyboard focus and navigation, screen readers, touch and LTR/RTL direction. Prototype is a design demonstration, not deployed production implementation.
