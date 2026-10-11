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
