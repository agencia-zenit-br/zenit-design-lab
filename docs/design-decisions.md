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

## Zenit Design System 03.35 — APPLICATION HEADER AND PRODUCT SWITCHER APPROVED
- User approved the compact, stable universal application header: active product identity/logo and name on the leading side; global search, notification indicator and user account menu on the trailing side.
- Product switcher lists only products available to the current user and organization, with clear active selection and product-specific identity. The product's internal navigation remains in the separately approved 03.34 sidebar.
- Search button opens the existing 03.33 universal command palette; do not implement a competing search experience. Global notifications should identify originating product and support opening the relevant item.
- User menu provides profile, preferences, organization switching (when permitted), and sign-out, separate from product navigation.
- All dropdowns and menus must be anchored floating overlays that do not reflow or push the main content; the in-chat prototype used inline panels for illustration only. Maintain compact consistent header height, responsive mobile treatment, accessibility and LTR/RTL support.
- Prototype products, menu entries and actions were illustrative; final catalog, entitlements and branding remain product-specific and pending implementation.

## Zenit Design System 03.36 — ORGANIZATION IDENTITY AND WORKSPACES APPROVED
- User approved the universal context hierarchy Organization → Product → Workspace. A user may access multiple authorized organizations and products without logging out; workspaces are optional/configurable depending on product needs.
- Organization switcher offers search, recognizable organization identity (name/logo), role indication and clear active selection. Product and workspace choices update to the new organization's authorized context; do not expose unauthorized organizations, products or data.
- Keep organization identity and branding distinct from the active Zenit product identity. Integrate organization and product selectors with approved 03.35 application header, using anchored floating overlays without content reflow.
- Switching organization/workspace must respect unsaved changes (03.28 confirmation), permissions and entitlements, clear tenant isolation enforced server-side, and safe navigation; restore last-used context only while authorization remains valid.
- Support responsive layouts, accessible keyboard/touch navigation, LTR/RTL and independent user/organization/product preferences. The in-chat prototype uses illustrative organizations, roles and products only; it is not a production implementation or proof of real access.

## Zenit Design System 03.37 — USER PREFERENCES AND INTERFACE PERSONALIZATION APPROVED
- User approved a universal personal preferences center with General, Accessibility and Region sections, interactive partial preview, explicit save, unsaved-state indication and reset.
- Appearance: light, dark or follow operating system. Density: compact, comfortable or spacious without sacrificing minimum interactive target sizes. Option to remember navigation sidebar state.
- Accessibility: reduced nonessential motion, enhanced contrast, and independent LTR/RTL direction. Respect operating-system motion/contrast preferences unless explicitly overridden where appropriate; ensure the entire interface responds coherently.
- Regional preferences: UI language (including Spanish, Brazilian Portuguese, English and future Arabic/Hebrew), IANA timezone, calendar system (Gregorian, Hebrew and Islamic/Hijri as implementation-supported). Language, direction, timezone and calendar system remain distinct settings; availability and formatting require implementation validation.
- Configuration scopes: user controls personal presentation and navigation; organization controls branding, policies and shared settings; product controls product-specific identity and options; platform controls universal behavior, security and accessibility requirements. User preferences must not override mandatory organizational policy or platform security.
- Preview in the chat is illustrative and partial, not proof of fully functional theme, bidi, contrast or localization. Real React components and persistence remain to be implemented.

## Zenit Design System 03.38 — CONTEXTUAL HELP AND SUPPORT CENTER APPROVED
- User approved a universal, discreet help center accessible from the 03.35 application header and contextual help affordances on complex controls. Do not turn it into a competing administrative module.
- Four integrated areas: (1) searchable, product/version/permission-aware documentation and guides; (2) contextual help keyed to active route, product and module without automatically exposing private record contents; (3) AI assistance grounded in authorized documentation, distinguishing verified references from suggestions and requiring explicit authorization before data modification; (4) support requests with ticket identifier, status, history and user-controlled attachments and diagnostic data.
- Open as an anchored, logical inline-end overlay drawer reusing 03.27, without resizing or reflowing the workspace; use full-screen presentation on mobile. Preserve unsaved forms, selections, filters and scroll positions while help opens and closes.
- Minimize diagnostic data and apply appropriate disclosure/consent and access controls. Avoid sharing private information with external models without an appropriate authorization basis. Keyboard, touch, screen reader, LTR/RTL and accessibility support are mandatory.
- In-chat demo guides, AI responses and prepared support ticket are illustrative only; no model, documentation backend or ticketing service was connected and no production React implementation has been delivered.

## Zenit Design System 03.39 — ONBOARDING AND GUIDED TOURS APPROVED
- User approved voluntary, contextual, role/product/permission-aware onboarding and guided tours. First access should offer a discreet invitation to start, postpone or skip, rather than automatically launching a full walkthrough.
- Tours highlight actual interface targets and show viewport-safe anchored floating guidance without reflow; support previous/next, skip, finish and replay. Respect keyboard, touch, screen readers, reduced motion, mobile and LTR/RTL.
- Never present steps for inaccessible features. Track completed, skipped and in-progress state per user, product and version; allow recovery/replay through approved 03.38 contextual help center.
- Optional contextual hints can be disabled. Preserve ongoing user work, forms and navigation context. Do not automatically publish, delete, charge or otherwise mutate real data during tours; interactive practice requires safe sandbox/demo data and explicit authorization for consequential actions.
- In-chat prototype was illustrative only; production positioning, persistence, tour engine and integrations remain unimplemented.

## Zenit Design System 03.40 — METRICS, KPIs AND DASHBOARDS APPROVED
- User approved compact KPI cards with clearly identified metric, unit, time range, change and comparison baseline, and consistent line/bar/area/distribution charts and accessible tabular alternatives. Choose chart forms based on data semantics, not decoration.
- Provide explicit time ranges, comparison periods and auditable change calculations. Preserve precise units, currencies, timezone, last updated timestamp, source and provenance; avoid misleading axes and ambiguous rounding.
- Dashboard composition may be configured by authorized users using approved 03.29 reorder and 03.31 resizable layout patterns. Respect each product's semantic design tokens rather than hardcoding a universal accent color.
- Data quality must distinguish observed/actual, estimated, provisional, incomplete and stale values. Missing or failed-to-load data must NEVER silently become zero. Integrate loading, empty and error states from 03.22–03.23.
- Production charts should support point/series interaction, keyboard navigation, screen readers, responsive presentation and LTR/RTL. In-chat prototype values, chart series, exports and filters were illustrative only, not connected to live backend data; production React implementation remains pending.

## Zenit Design System 03.41 — KANBAN BOARDS AND STATE TRANSITIONS APPROVED (REVISED V2)
- User explicitly approved the second interactive Kanban proposal after rejecting unequal-looking card geometry in the initial prototype.
- Columns have consistent widths, headings and spacing. Cards use a uniform 108px height in the demonstration, consistent padding, up-to-two-line clamped titles and stable internal structure. Selection uses an external outline/box-shadow, never a thicker layout-affecting border.
- Drag cards directly by click-and-hold/pointer, with a lifted ghost and a full-height destination gap, not an insertion line. Reuse the approved 03.29 drag/drop behavior. Support pointer/touch, keyboard alternative, LTR/RTL and reduced motion. Provide safe cancellation and no accidental changes.
- Kanban is a universal visual component, NOT a universal workflow engine. Each product owns its states, permissions, legal transitions, validation and server-side enforcement. Moves across columns may change business state; sensitive transitions require explicit confirmation or additional data as appropriate. Not every routine transition needs confirmation.
- Support counts, filtering, responsive horizontally scrollable columns/mobile navigation, history and audit attribution. Undo only when authorized and genuinely reversible. Keep rearranging cards within a column conceptually distinct from moving across states.
- Revised in-chat prototype demonstrated fixed geometry, direct pointer dragging, destination gap, adjacent-state checks, confirmation, undo and keyboard/button fallback with fictitious editorial records. This was a design demo, not a production React implementation or live workflow integration.

## Zenit Design System 03.42 — CALENDARS, VISUAL PLANNING AND VERIFIED HOLIDAYS APPROVED (REVISED)
- User approved the revised 03.42 calendar design with month, week, day and agenda views, contextual event editing, scheduling, time zones, and planned Gregorian/Hebrew/Hijri calendar presentation. Product-specific permissions, states and execution rules remain server-enforced.
- CRITICAL LEGIBILITY REQUIREMENT: tasks/events must appear as clearly separated, consistently spaced individual visual cards/blocks with readable titles, explicit start/end times, type and state. Daily/weekly timed layouts must handle duration and simultaneous events without unreadable overlap; use columns, expansion or overflow indicators. Selection must not distort geometry. Responsive presentation, keyboard/touch, reduced-motion and RTL/LTR required.
- CRITICAL HOLIDAY REQUIREMENT: user-configurable country, state/province and city/municipality, independent of UI language and time zone; support national, regional, municipal and movable holidays. Display holiday overlays and allow multiple relevant jurisdictions for distributed teams. Distinguish legally recognized holidays, commemorative dates and optional/nonmandatory observances.
- AI may assist in discovering, interpreting and explaining holidays, but holiday identity/classification must be checked against official or trustworthy jurisdiction-specific sources, with year, provenance and verification status. Do not present an unverified AI inference as an official holiday.
- Intelligent planning may flag holidays, non-working days and scheduling collisions and suggest alternative dates. Never automatically block, reschedule, publish or otherwise execute consequential changes solely due to AI recommendations; require authorized user acceptance and applicable business rules.
- Direct event drag/drop between dates/time slots and duration resizing are production interaction goals, not fully implemented in the in-chat prototype. Prototype content is fictitious and visual; this approval documents design, not production React/Storybook deployment.

## Zenit Design System 03.43 — GANTT CHARTS AND PROJECT TIMELINES APPROVED
- User approved the 03.43 Gantt design proposal: readable task labels and owner, start/end dates, duration, progress bars, milestones, dependencies, and day/week/true-calendar-month timeline scales with horizontal scrolling.
- Allow direct visual bar dragging to reschedule, endpoint handles to change duration, and equivalent keyboard/touch interactions. Differentiate completed/ongoing/pending work without color-only signaling; support LTR/RTL and accessible task table.
- Model predecessor/successor dependencies with visible links, reject cycles and invalid constraints, and show affected downstream tasks before committing any cascading reschedule. Server-side validation and permissions apply. Automatic rescheduling is opt-in and must not silently modify external commitments or execute irreversible operations.
- Distinguish calendar days from working days; integrate verified jurisdictional holidays and work calendars from 03.42. Synchronize applicable task data/state with 03.41 Kanban and 03.42 Calendar without duplicating sources of truth.
- Record baseline vs forecast/actual dates where applicable, meaningful progress and auditable changes. Critical-path calculations, dependency connectors and drag-to-resize are future implementation requirements, not functioning features of the in-chat prototype.
- In-chat prototype used fictional data and simple controls; its 'months' display was illustrative equal-width blocks, NOT real calendar months. Production must use actual date intervals. This approval documents design only; React/Storybook production components and deployment remain pending.

## Zenit Design System 03.44 — UNIVERSAL FILE MANAGER AND MEDIA LIBRARY APPROVED
- User approved the universal asset browser in two contexts: full management and contextual authorized asset picking for editors, publications, campaigns and projects. Provide compact grid/list modes, search, filters, sort, folder navigation, multi-selection, clear selection and contextual properties.
- Integrate hierarchical folder tree and drag/drop move/copy semantics with 03.30; use the custom file picker/upload flow 03.13. Present actual thumbnails for supported images/video, safe SVG previews, document previews and audio playback where feasible, with accessible file-type icon fallbacks.
- Properties include file name, type, dimensions or relevant media metadata, size, modified time, versions, authorship, use references and authorized restoration. Respect permissions, quotas, tenant isolation, audit history, validation and safe file processing. Support bulk actions with clear destructive confirmation.
- Zenit Storage Service remains the abstraction layer; customer binaries belong in external object storage, not on Zenit application servers. Prefer signed direct browser-to-object-storage uploads/downloads; application maintains asset IDs, metadata, references and access policy. Avoid unnecessary duplicate copies when inserting shared assets.
- Removing a file reference from a publication/project is distinct from deleting the shared library asset; warn about usage and require appropriate authorization before destructive deletion. Contextual picker returns an authorized reference rather than copying the binary.
- Prototype was illustrative, with fake files, file-type icons instead of real thumbnails, and no actual storage operations, upload, previews or folder drag/drop. Approval records design requirements only, not production React/Storybook implementation or deployment.

## Zenit Design System 03.45 — UNIVERSAL MEDIA VIEWERS AND ANNOTATIONS APPROVED
- User approved a universal resource viewer integrated with the 03.44 library: images, video, audio, PDFs and SVG, with format-specific navigation, true zoom/pan/fit/fullscreen, page or time navigation, and vector-sharp SVG rendering.
- Provide contextual annotations anchored to the actual content: image coordinates/regions, PDF pages/regions, video frames or timestamps and audio timestamps/ranges. Clicking an annotation should navigate to its precise anchor. Store annotations independently of source binaries and preserve original files.
- Every annotation must reference the exact asset version against which it was created. Replacing a resource must not silently reuse potentially invalid anchors; retain original version linkage and provide explicit review/migration when needed. Consider interoperable structured selectors, consistent with W3C Web Annotation concepts, during implementation.
- Support version comparison side by side, optionally synchronized zoom and clear version provenance; comments, editing, approving, exporting an annotated derivative and replacing originals are distinct permission-gated actions. Prevent unintended source mutations.
- Annotation panel uses the previously approved 03.27 true lateral overlay rather than resizing/reflowing the viewer, especially on small screens. Include accessible keyboard/touch interactions, responsive layout, reduced motion and RTL/LTR.
- In-chat prototype used synthetic previews and fictional comments; it did not load/play actual media or implement true physical zoom, region drawing or synchronized comparison. Approval documents design only, not production React/Storybook implementation or deployment.

## Zenit Design System 03.46 — BILLABLE AI/CLOUD UX AND CENTRAL PRICING REQUIREMENT (DESIGN IN REVIEW)
- User requires a platform-wide commercial rule: for Zenit-managed AI/Cloud services (customers not using BYOK/BYOC), every billable action must clearly display its customer-facing final price in the execution button before execution, including applicable taxes, with explicit authorization. Do not hide billable execution behind generic AI buttons.
- Admin-configurable central pricing policy must support provider/model/service/action cost basis, configurable commercial multiplier, currency conversion, applicable taxes, product/tenant/plan overrides and price versioning. Conceptual formula: final price = provider cost * configured multiplier + applicable taxes; fiscal computation must reflect actual tax rules, not assume one simple flat percentage.
- Distinguish fixed-price operations from variable usage. For uncertain consumption, display estimate plus explicit authorized maximum or equivalent enforceable spending cap, settle on metered actual usage and never silently exceed authorized spend. Display price transparently and obtain new approval for material quote changes. Use server-issued immutable quotes, atomic authorization/reservation, idempotency, metering, reconciliation, refunds and audit trails to prevent double charges and client-side price manipulation.
- BYOK/BYOC provider costs belong to the customer's provider contract, not automatically Zenit's markup. Clearly disclose any separate Zenit platform/service fee if applicable; never imply BYOK/BYOC is necessarily free.
- The editor 03.46 should integrate contextual AI (rewrite, summarize, translate, editorial analysis etc.) with user review/accept/reject/undo; generation costs are authorized before the provider call, independently of whether the user accepts the resulting suggestion. Core editor must remain functional without AI.
- These are approved cross-platform commercial/UX requirements, NOT approval of the full 03.46 rich-text editor design or a production billing implementation. In-chat prices and tax rates are illustrative only.

## Zenit Platform Commercial UX — FREE-FORM MULTIPLIERS AND PROPOSED ZENIT TOKENS (03.46 RELATED)
- User explicitly corrected the prior pricing prototype: administrator-defined markup multiplier MUST be a free-form positive decimal input, not a fixed dropdown or enumerated choices. Validate server-side, support decimal precision and locale-aware entry, and preserve pricing-policy versions.
- User proposed a proprietary platform usage/billing unit provisionally called Zenit Tokens (ZT), independent of underlying LLM provider tokens. Design a provider-neutral accounting layer for AI and Cloud operations, with configurable ZT-to-currency valuation, transparent quotes, prepaid balances or contractual billing as applicable, authorization, metering, immutable ledgers, refunds, and audit.
- Display the exact quoted ZT charge (and monetary/tax equivalent as appropriate) on the billable execution action before authorization. For variable costs, enforce authorized maximum and settle actual usage; never silently exceed it. Provider-native tokens, storage bytes, compute and other metrics must be translated via versioned service-specific pricing rules, not treated as equivalent physical units.
- BYOK/BYOC provider charges remain with the customer; Zenit Tokens apply only to clearly disclosed Zenit-owned charges if any. Avoid assuming these modes are free.
- Illustrative token value, example taxes, conversion and rounding in the chat prototype are NOT approved production rates. The user has proposed the unit; exact denomination, rounding, expiry, refund, invoicing and fiscal handling remain to be designed and approved. Do not claim full 03.46 editor approval.

## Zenit Platform Commercial UX — CUSTOMER-FACING TOKENS AND ONE-CLICK AUTHORIZATION
- User corrected the customer-facing denomination: always display the full word **Tokens** (e.g. `42 Tokens`), not `ZT` or `Zenit Tokens`, in balance, operation cost and action buttons. An internal accounting code may remain but is not shown to customers.
- For ordinary billable AI/Cloud operations, clicking the action button displaying the Tokens charge constitutes the explicit authorization to charge and execute. Do NOT add a separate consent checkbox, mandatory confirmation dialog, or additional consent form. Button must state the Tokens price clearly BEFORE the click, e.g. `Improve text · 42 Tokens`.
- Quote the final charge before execution; if metering is variable, show an enforceable maximum authorized Tokens amount and settle the actual use within that cap. If no price is yet known, obtain a quote before enabling a priced execution button. Keep applicable monetary/tax transparency accessible without obstructing the single-click path.
- Enforce available balance/limits, server-side pricing, idempotent charge reservation and settlement, audit and refund/release on failure. This is a UI authorization policy, not permission to exceed the displayed charge or execute unrelated actions. Existing free-form positive decimal multiplier requirement remains.
- In-chat example uses synthetic balances/charges only and does not execute AI or debit a real account. The full 03.46 editor design remains under review.

## Zenit Platform Commercial Safeguard — WORST-CASE PRICING AND HARD COST CEILINGS
- User requires every AI/Cloud operation to be priced against the most expensive **technically permitted** cost scenario for Zenit, never an average or optimistic estimate that could expose Zenit to uncapped provider expense. This is a mandatory platform-wide financial safety principle.
- Compute a conservative maximum provider cost including input/output tokens, tool calls, auxiliary services, retries, processing/storage/network charges as applicable, exchange-rate exposure and explicit safety reserve; apply administrator's free-form decimal markup, applicable taxes and conservative rounding to the customer-facing **Tokens** quote.
- A worst-case quote MUST be paired with enforceable server/provider-side limits on maximum output, tool calls, retries, duration, storage/compute or other cost drivers. If no reliable enforceable upper bound is possible, do not offer a fixed-price one-click execution; require a bounded scope or different separately approved commercial arrangement.
- The execution button must show the full quoted Tokens cost before click; clicking it is authorization with no extra checkbox or routine confirmation. Reserve balance and execute idempotently within the approved maximum, reconcile actual provider usage, and handle release/refund according to explicit policy. Do not exceed the authorized ceiling silently.
- Track provider actual costs separately from customer charges, and validate a configured minimum viable margin / cost floor before making a price policy available. Protect against stale quotes, tariff/FX changes and provider overruns with pricing versions, quote expiry and operational kill switches.
- The example `42 Tokens` is illustrative, not a production rate. This requirement does not by itself approve the entire editor 03.46 design.

## Zenit Design System 03.46 — UNIVERSAL RICH-TEXT EDITOR EXPERIENCE APPROVED (V2)
- User accepted the revised interactive editor V2 inspired by the editorial interaction of Neo/Éxodo Diario, without copying its code or implementation dependencies. Preserve a distraction-free continuous writing surface and compact main controls, with selection/caret-anchored floating formatting toolbar that never causes layout reflow, hides when out of view and adapts to mobile/RTL.
- Contextual editing: real text selection and inline bold/italic/underline/highlighting, paragraph/intertitle/quote formatting, links, lists, tables, undo/redo and safe insertion at the cursor. Floating tools must preserve selections and support keyboard/accessibility. Use a structured document model rather than arbitrary HTML or browser execCommand in production.
- Insert contextual image, gallery, video, embed, table and other structured media blocks through reusable pickers/overlays, integrated with asset library 03.44 and viewer 03.45; preserve cursor, allow edit/reorder/remove, sanitize embedded content and keep original asset references.
- Contextual AI should act on selected fragments or whole documents: clarity, summary, rewriting, style, translation and product-specific editorial tools. AI returns an editable proposal that users may accept/reject/undo, never silently rewrites or publishes content. The core editor works without AI.
- For Zenit-billed AI/Cloud actions, the execution button must visibly state `N Tokens` (not ZT) and the click alone authorizes that operation, without extra consent UI. Quote using the most expensive technically bounded provider cost scenario, with hard limits and safe server-side pricing/authorization, accounting, idempotency and reconciliation. BYOK/BYOC provider charges and any Zenit fee must remain clearly distinguished.
- Allow product-specific tools, permissions, workflows and style guidance while sharing a common editor core. Support anchored comments, revision history, recovery, optional collaboration, multilingual bidi/LTR/RTL and accessible mobile behavior.
- In-chat V2 used browser-native execCommand, synthetic AI responses/prices and illustrative media blocks; approval is for UX/design direction only. Production React/Storybook editor, real AI, persistent editing and deployment are NOT implemented by this approval.

## Zenit Design System — RESPONSIVE TEXT-ENTRY SPACE (03.47 REVIEW)
- User explicitly requires text-entry fields to be more spacious whenever layout space is available. Apply as a cross-product UI guideline to prompts, AI assistant conversations, additional instructions, comments, forms and editors.
- Textareas should use available container width and a comfortable minimum height, expand vertically with content up to a reasonable context-sensitive maximum, and only then scroll internally. On wide screens avoid unnecessarily narrow input columns; on small screens use available width within safe margins.
- Expansion must respect layout bounds, keyboard visibility, essential controls and overlay/no-reflow principles where applicable. The user reviewed 03.47 V1 and requested this refinement; full 03.47 approval has not yet been explicitly recorded.

## Zenit Design System 03.47 — COMPACT CONVERSATION COMPOSER (REVIEW)
- In AI conversations, prioritize the chronological question-answer history rather than a tall input field.
- Default the message composer to approximately two lines; auto-grow to about five lines, then scroll within the input. Offer optional manual expansion for long messages.
- Keep the Send action and its quoted Tokens cost visible and accessible. Preserve a spacious writing area for long-form contextual instructions; input sizing must match the task.
- This refines the 03.47 V2 prototype; the overall assistant design is still under review. No production implementation is implied.

## Zenit Design System 03.47 — UNIVERSAL AI ASSISTANT APPROVED (V3)
- User explicitly approved the universal Zenit AI assistant laboratory with **both** presentation modes: a contextual side panel and an expanded/full workspace. Users can switch between them without losing conversation history, draft inputs, active context, or pending tasks. Switching must not cause unexpected layout jumps.
- Reusable assistant across Zenit products, with product/tenant/user-scoped capabilities, authorized resources, permissions and audit boundaries. Contextual actions operate on selected text or the whole document; long-form research and multi-document workflows use the expanded workspace.
- Chat follows a chronological question/answer stream with history prioritized. Composer is compact (~2 lines), grows to ~5 lines before internal scrolling and can be manually expanded for long messages. Long-form contextual instructions use spacious, responsive textareas instead.
- AI may assist with review, rewrite, summary, research and product-specific tools. Present results as proposals with explicit user accept/reject before modifying real documents; never silently modify or publish. Ground factual research in permitted sources, distinguish verified findings from unverified output, and enforce permissions.
- Customer-facing billable actions display full-word `Tokens` cost on the execution button; a single click authorizes that specific charge and operation, without an extra consent checkbox. Worst-case technically bounded provider cost, margin/tax/rounding safeguards, idempotent server-side authorization, metering and settlement remain mandatory; BYOK/BYOC provider charges are distinguished from Zenit fees.
- Design approval only: in-chat V3 was a simulated interactive prototype with illustrative token prices, responses and balances. No real AI integration, React/Storybook implementation, production code or deployment is implied.

## Zenit Design System 03.48 — INSTANCE-SCOPED OPERATIONS AND BILLING (REVIEW)
- User rejected a customer-facing global operations center across products/instances. Every individual product/service instance must have its own operations center, operation history and permissions.
- Each instance has an independent Tokens balance/ledger, its own renewal date and billing cycle, and its own contracted plan and commercial settings. Token authorization, reservations, settlement, refunds and usage limits must be scoped to the correct instance. Never implicitly pool or transfer Tokens across instances.
- Tasks, progress, results, errors, retries and audit trails are scoped to their originating instance. Authorized users see only operations for instances they may access; enforce tenant and instance isolation server-side, not just through UI filters.
- An internal platform administration console may oversee multiple instances for authorized Zenit operators, but is distinct from customer-facing instance-specific operations centers and must not imply cross-instance access for customers.
- Example balances, dates and operation counts in the in-chat diagram are illustrative. The overall 03.48 laboratory remains under review; no implementation is implied.

## Zenit Platform 03.48 — MONTHLY ALLOTMENT TOKENS EXPIRE AT INSTANCE RENEWAL (APPROVED RULE)
- User explicitly decided that unused Tokens are forfeited at each individual instance's renewal boundary: no rollover, accumulation, transfer to another instance, or restoration in later cycles.
- Maintain per-instance billing cycle, renewal date, Tokens balance and audit ledger. At cycle end expire remaining periodic allotment Tokens; on successful renewal allocate the new cycle's plan allowance. Never grant a new allotment if renewal/payment has not succeeded.
- Customer UI should clearly show current balance, upcoming renewal/expiry date and the fact that unused Tokens expire. Preserve transaction records for expired balances.
- Ensure already-authorized in-flight operations have explicit reservation/settlement rules at the cycle boundary; avoid accidental double charge or unexpected interruption.
- Separate purchased top-up Tokens, if offered later, are NOT yet governed by this decision; their expiry policy remains open. The overall 03.48 operations-center laboratory remains under review.

## Zenit Platform 03.48 — TOP-UP TOKENS WITH INDEPENDENT EXPIRATION (APPROVED)
- User chose additional purchased Tokens to have their own expiration date calculated from each purchase, independent of the product instance's subscription renewal date.
- Keep subscription allotment Tokens expiring at the instance renewal as already approved; top-up Tokens persist across plan renewals until their respective purchased lot expires. All balances, lots, purchases, charges and expirations remain scoped to the same individual instance, with no cross-instance pooling.
- Maintain per-lot accounting (purchase time, quantity, amount consumed, expiration and ledger events) and show the customer a combined balance plus an understandable expiration breakdown.
- The duration of a top-up's validity has NOT been decided and must not be treated as fixed. Consuming the earliest-expiring Tokens first is a proposed operational policy, NOT yet approved.
- The overall 03.48 laboratory remains in review; no production implementation is implied.

## Zenit Platform 03.48 — EARLIEST EXPIRY CONSUMPTION AND CONFIGURABLE TOP-UP OFFERS (APPROVED)
- User approved automatically consuming the Tokens with the nearest expiration first, regardless of whether they originate from the current plan allotment or an additional purchased top-up. The ledger must select eligible lots by expiration and preserve per-lot reservations, settlements and auditability.
- Before selling a top-up offer, authorized Zenit administrators can configure its Token quantity, monetary price, currency, validity duration measured from purchase, and promotional discounts. The validity period is not a fixed global constant; it is defined per offer before sale.
- Snapshot the exact offered commercial terms at purchase, including price, discount, purchased quantity, purchase timestamp, expiration calculation, currency, tax treatment and offer/version reference. Later catalog edits must not retroactively change previously purchased lots.
- Apply existing worst-case provider cost, markup, margin-floor and applicable tax safeguards to promotional pricing. Discounting must not bypass cost coverage. Display price, discount and expiry transparently before purchase; do not infer or approve any specific default duration or rate from illustrative UI values.
- These are approved rules within the still-in-review 03.48 operations and instance billing laboratory. No production implementation is implied.

## Zenit Design System 03.48 — INSTANCE OPERATIONS CENTER V2 VISUAL ARCHITECTURE APPROVED
- User approved the V2 visual distribution: compact summary header, instance-contextual information, tabs for operations/Tokens/renewal/history, KPI cards, status/progress rows, Token-lot expiry breakdown, and isolated per-instance views.
- Approval is for VISUAL ARCHITECTURE and interaction organization only. This design laboratory must not continue specifying detailed billing/business logic; the user explicitly redirected the conversation back to the universal visual language of the Zenit product family.
- Prior approved rules on Tokens, expiry, discounts, lot consumption and renewal are preserved as future Platform/product functional requirements, NOT as implemented billing functionality.
- Subsequent labs should prioritize reusable cross-product design primitives, components and interaction patterns rather than commercial/accounting workflows. No production React/Storybook/backend code or deployment implied.

## Zenit Design System 03.48 — INSTANCE OPERATIONS CENTER V2 VISUAL LAYOUT APPROVED
- User reviewed and approved the V2 visual composition: instance-scoped operations center; compact summary indicators for Tokens, renewal and active operations; Operations, Tokens, Renewal and History tabs; per-lot expiry presentation; operation progress, status and contextual actions; responsive, accessible design.
- This approval concerns visual architecture and interaction patterns only, NOT implementation of billing, token ledgers, payment flows, commercial pricing, expiration mechanics or other backend business logic.
- Scope boundary clarified by user: Zenit Design Lab defines the universal visual language, components, navigation, states, accessibility and responsive patterns. Detailed financial/commercial rules belong to Zenit Platform product architecture and must not derail design-system review. Capture functional requirements as handoff notes rather than design-lab implementation tasks.
- Visual laboratory 03.48 is approved and closed. Proceed to the next universal design component. No production component, Storybook story or deployment is implied.

## Zenit Design System 03.49 — ADVANCED DATA TABLES V1 VISUAL PATTERN APPROVED
- User approved the V1 universal advanced data table visual composition: compact density and headers; search and status filters; sortable columns; row and multi-row selection; persistent selection across pagination; configurable column visibility; compact/comfortable density toggle; contextual row menus; pagination and contextual empty state.
- Keep controls visually compact, predictable and accessible, with responsive horizontal overflow when needed. Continue design review for frozen, resizable and reorderable columns, keyboard navigation and loading states without treating those unshown details as approved implementations.
- Reuse the editable grid behaviors approved under laboratory 03.03 where applicable; do not duplicate the editing component.
- This is a visual/interaction design approval only, not backend functionality, production React/Storybook code or deployment. Continue focusing Zenit Design Lab on the cross-product design language rather than commercial or billing logic.

## Zenit Design System 03.50 — UNIVERSAL PROPERTIES INSPECTOR APPROVED
- User approved the reusable universal contextual properties inspector, following the interactive editorial-card example and the initial inspector V1 exploration.
- The inspector displays controls for the currently selected object, with a consistent compact header, grouped/collapsible property sections, contextual content and design controls, and immediate canvas preview of visual changes.
- Reuse the same visual interaction model across editorial modules, commerce product cards, social-creative layers, form fields, dashboards and other visual builders, while each product supplies its own appropriate properties.
- The inspector complements rather than replaces specialized editors (e.g. media editing). Desktop may show it as a side panel; narrow/mobile viewports use an overlay to preserve usable canvas width and avoid unexpected reflow. Maintain accessibility, keyboard navigation, logical-direction layout and stable controls.
- This is approval of the design pattern only, not production functionality, Storybook implementation or deployment. No product-specific business rules are approved by this decision.

## Zenit Design System 03.51 — DIRECT CANVAS TRANSFORM REQUIREMENT
- User explicitly requires Photoshop-like direct manipulation in visual compositions: free two-dimensional click-hold dragging, corner/edge resize handles, keyboard modifiers for constrained proportional scaling and center-origin scaling, and independent layer order management.
- The design should support rotation, multi-selection, fine keyboard nudging, smart alignment guides, grid snapping, numeric geometry in the inspector, zoom, undo/redo, and touch-accessible equivalents as design proposals for the lab review. Modifier mappings are provisional until tested for consistency across operating systems and product editors.
- These controls belong to visual composition editors (e.g. Social Creative), not routine news article writing. Integrate with the approved 03.50 properties inspector and the 03.51 layer tree. This records a cross-product interaction requirement, not approval of the complete 03.51 lab or implementation.

## Zenit Design System 03.51 — LAYER CLIPBOARD SHORTCUT REQUIREMENT
- User explicitly requires standard layer clipboard shortcuts in the visual composition canvas: Ctrl/Cmd+C copy, Ctrl/Cmd+V paste, Ctrl/Cmd+X cut; Ctrl/Cmd+D duplicate and Ctrl/Cmd+Z undo as complementary interaction proposals.
- Clipboard copies must preserve editable layer content, styling, dimensions, and applicable properties. Pasted layers should be selected and visibly offset to distinguish them from originals; copying across compatible documents/projects is a desired behavior, subject to permissions and asset-reference integrity.
- Keyboard shortcuts are context-aware: when editing text inside a field or text layer, native text clipboard semantics take precedence over layer clipboard actions. Provide accessible menu actions and touch equivalents.
- This documents an explicitly requested interaction requirement for the 03.51 review, not approval of the full lab or production implementation.

## Zenit Design System 03.51 — DIRECT MANIPULATION AND ZOOM CONTROL REFINEMENT
- User explicitly rejects slider bars for object X/Y positioning and resizing in the visual editor. Direct click-hold dragging and corner/edge handles are the primary manipulation mechanisms; numeric X/Y/width/height fields may remain for precision, without sliders.
- User explicitly requests a dedicated zoom slider for the canvas. Design proposal: place it in a compact canvas footer with minus/plus controls, visible zoom percentage, and fit-to-window action; zoom must not change document geometry or object dimensions. Mouse wheel with modifier and trackpad gesture are supplementary proposals.
- This refines the ongoing 03.51 visual design review; do not claim the full laboratory is approved or implemented.

## Zenit Design System 03.51 — VECTOR SHAPES AND ICON LIBRARY REQUIREMENT
- User requests that the universal visual composition editor support inserting editable geometric shapes (squares, rectangles, semicircles, circles, etc.) and icons, with direct control over dimensions and color.
- Proposed visual design: an Insert/Shapes and Icons library; inserted items become independent editable vector layers compatible with direct canvas drag/resize, layer ordering, copy/paste, grouping and the 03.50 inspector. Contextual properties include fill, stroke, stroke width, opacity and rotation; additional shapes, arrows and icon sets can be extended.
- Prefer resolution-independent vector objects, not rasterized shape assets. Shape geometry should be manipulated primarily on the canvas using handles, with precise numeric fields as an option; do not reintroduce position sliders. The dedicated zoom slider remains a canvas control.
- This records the user's additional 03.51 requirement and prototype direction, not approval of the full 03.51 lab or production implementation.

## Zenit Design System 03.51 — UNIVERSAL LAYERED VISUAL EDITOR APPROVED
- User explicitly approved the universal layered visual editor and all discussed enhancements: three-column desktop arrangement (layers / canvas / properties inspector) with independently collapsible side panels; direct click-hold free movement; corner/edge resize with modifiers; layer selection, ordering, grouping, visibility and locking; context-sensitive clipboard shortcuts (Ctrl/Cmd+C/V/X), duplication, undo; dedicated canvas zoom slider; numeric geometry fields for precision without position/size sliders.
- User also approved a library of editable resolution-independent vector shapes and icons: square, rectangle, circle, ellipse, semicircle and additional geometric/icon primitives, with configurable dimensions, fill, stroke, color, rotation, opacity, and combination/grouping to create complex compositions. Distinguish circle (equal dimensions) from ellipse (independently adjustable axes).
- Review observation: the ellipse icon failed to render in the prototype. Fix its library thumbnail with a reliable inline vector SVG rather than relying on an unavailable icon glyph; verify each shape preview before implementation.
- Advanced capabilities discussed (touch, keyboard, snapping, guides, cross-document clipboard) remain part of the visual interaction direction and must be implemented and tested deliberately. Approval is for the design language and behavior specification, NOT production code, Storybook components, backend work, or deployment.

## Documentation precision and implementation handoff standard
- The GitHub repository is the authoritative, durable design specification. Future implementation must be possible without relying on chat history or reinterpreting informal prototype behavior.
- For each lab, document: (1) scope, intended use and exclusions; (2) visual anatomy, dimensions, spacing, density, semantic tokens and states; (3) interaction contracts for mouse, touch, keyboard and clipboard, including modifier keys; (4) data/state transitions, validation, undo, failure and persistence expectations; (5) responsive behavior, LTR/RTL, accessibility and reduced motion; (6) integration boundaries and component reuse; (7) measurable acceptance criteria and test cases; (8) explicit approvals, rejected alternatives, open questions, deferred items and rationale.
- Mark every statement as APPROVED / REQUIRED, PROPOSED / IN REVIEW, or DEFERRED where status is not obvious. Do not silently elevate suggestions or incomplete mockup behavior into approved requirements.
- Record failed experiments and fixes with their cause and expected verified result. Capture precise examples, keyboard mappings, geometry behavior, constraints and exceptions when applicable. Document design intent separately from backend/business rules and implementation details.
- Interactive chat prototypes are review artifacts, not production React components or committed Storybook stories. Approval of a visual lab does not mean that source code has been implemented or deployed.
- Before implementation, perform a gap review of prior approved labs and enrich their specifications with missing measurable details; do not fabricate pixel values, untested behavior, or approvals retroactively. Any unresolved details remain explicitly open until reviewed.
