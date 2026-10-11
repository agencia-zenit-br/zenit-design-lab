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
