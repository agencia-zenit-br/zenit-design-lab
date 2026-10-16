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
| Consistent rounded dropdown menus | 03.14 custom Zenit Select | `src/ZenitSelect.tsx`: non-native anchored popover, 12px rounded corners, hover/selection, Escape/Enter/arrows/Home/End, keyboard focused combobox, outside-click dismissal | **Static checks pending CI**; visual/browser keyboard QA pending. Single-select search, grouping and clearing plus multi-select chips, search, grouping and explicit Done have since been added in the preview branch; remote search, virtualization and browser assistive-technology QA remain pending |
| Header remains fixed while scrolling | 03.35 and user review 2026-10-16 | `.app-chrome { position: sticky; top: 0 }` wraps global header and horizontal pills | **Static checks pending CI**; browser scrolling QA pending |
| Sidebar visible and collapsible | 03.34, V3.0, 2026-10-16 review | `LabSidebar.tsx`: expanded default desktop, icon-only collapsed mode, local preference, contextual real-page anchors | **Static checks pending CI**; screen-reader/browser QA pending. Desktop splitter resizing and flyout submenu behaviour remain unimplemented |
| Mobile sidebar without horizontal scroll | 03.34, V3.1.2, V4.5.1 | Overlay drawer with backdrop, Escape close, keyboard focus loop and restore | **Static checks pending CI**; responsive/browser QA pending |

**Important:** no independent visual comparison to the original V3.0 screenshot has yet been completed, and compilation has not yet been confirmed for this revision.

## Next implementation milestone — approved Zenit Select 03.14

The approved universal selection family is now represented by two **shared React components** that consume the same `ZenitOption` model and visual tokens: `ZenitSelect` for single-choice and `ZenitMultiSelect` for multi-choice. The latter is not a divergent product-specific design.

- **Single:** optional searchable grouped list, clear action, disabled choices, empty-results state, Escape/arrows/Enter, selection closes on choice.
- **Multiple:** selected chips with individual removal, clear-all, grouped options, live search, disabled choices, selection stays open, explicit **Listo** closes.
- **Demonstration:** `ComponentCatalog.tsx` exposes both modes and `select.stories.tsx` contains independent interactive examples. No real customer data or backend persistence.
- **Styles:** shared rounded floating menus, density and semantics in `styles.css`; responsive wrapping and no sideways navigation/table scrolling.

**Not yet certified:** browser behavior, screen-reader interaction, cross-browser/touch QA, long-list virtualization, remote search and any production-scale caching. These must remain explicitly pending.

## Automated preview verification

`.github/workflows/verify-design-lab.yml` runs only read-only npm install, static design checks, TypeScript/Vite build, and Storybook build on preview branch pushes/PRs, without Cloud authentication, secrets, deploy, or production changes. A successful run is evidence of compilation only; viewport/browser checks must still be performed independently. The existing deployment workflow remains a **separate explicit action** for preview changes.

## Non-negotiable workflow

1. Read the relevant approved sections and newer superseding decisions **before changing code**.
2. Map approved/required/proposed/in-review items separately. Never treat an in-review visual as approved.
3. Preserve visual decisions across products, theme and viewport. Keep lab diagnostics out of customer screens.
4. Add or update conformance evidence with each visual change; do not claim completed implementation merely because it builds.
5. Run `npm run check:design`, `npm run build`, then browser QA in both modes at **320, 375, 390, 768, 1024, 1440px**. Check `document.documentElement.scrollWidth <= window.innerWidth`, keyboard, icon alignment, padding, content flow and visible selected/focus/disabled states.
6. Compare against the original V3.0 image; the file is referenced in the decisions but is **not present as a versioned image asset** in this repository. Do not claim pixel-equivalence until provided or recovered and compared.
7. Never deploy/move to production merely because visual QA or preview CI passes.

The automated static design guard is a regression detector, **not** screenshot/dimensional/browser certification.
