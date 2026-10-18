# Operational records preview — configurable demo columns and fixed guides

**Status:** synthetic-only UI Core demonstration in draft Design Lab PR #12; does not edit customer data or Platform schema.

The reusable [`OperationalRecords`](../../src/operational/OperationalRecords.tsx) accepts controlled columns, queries, selected IDs and optional `freezeHeader`, `freezeFirstRow`, `freezeFirstColumn`. Column definitions remain presentation contracts passed by the consuming product. A `ServerPage` is displayed as supplied, without re-running a client-side sort, filter or pagination. The domain adapter owns permissions, tenancy, data validation, persistence and audit.

The [`OperationalWorkbench`](../../src/operational/OperationalWorkbench.tsx) has a **demonstration-only** column editor. It can create an editable local column, hide/show optional columns, reorder/delete added columns and toggle sticky table guides. A user can edit values in the added cells; this alters only React state in the current tab and resets with `Restablecer ejemplo`. This is not a schema migration, external API call or database modification.

A compact feedback slot and a standing selection-summary slot protect the table from ordinary layout shifts. On desktop the table scrolls internally and can hold a header, first data row and first data column as sticky guides. On narrow screens the table is hidden and represented as cards; the page has no horizontal table-scroll requirement.

**Compatibility limitations:** the "first row" is the first **visible row on the current page**, not the first row across server pagination. With restricted fields or record-level visibility, the server supplies only authorized rows/columns. Persisting column layout, typing and rearrangement to another product needs a separate versioned configuration API. Advanced spreadsheet gestures (drag-resize, Excel-like selection, clipboard, undo/redo) remain future capabilities.

**QA:** `npm run test:operational`, `npm run check:design`, `npm run build`, `npm run build-storybook`, `npm run check:browser`; verify sticky guides and mobile overflow in both color modes and LTR/RTL. The previous published Cloud Run revision does not include these changes.
