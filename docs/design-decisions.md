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

## Component 03 — Editable dynamic table — IN REVIEW
- Add/remove rows and columns, edit cells and column names, select rows and perform bulk actions.
- NEW PROPOSAL, NOT YET APPROVED: optional first-row header formatting and independent optional first-column guide formatting, including both together and a distinct intersection cell.
- Header/guide formatting should use subtle backgrounds, stronger type, and appropriate dividers; separate optional sticky row/column behavior for large tables.
- Further review: drag reordering, resizing, undo/redo, keyboard navigation, responsive overflow and accessible semantics.

## Governance
- Review and approve components one at a time. Do not label a component approved until explicit user approval.
- Update this log as decisions change, ideally in the same PR as corresponding implementation; keep experimental in-chat demos distinct from committed code.
- This repository is a standalone visual prototyping workspace; do not include secrets, customer data, or private Zenit Platform backend code.
