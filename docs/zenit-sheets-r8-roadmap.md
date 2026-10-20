# Zenit Sheets — incremental delivery and deferred capabilities (2026-10-20)

## Implemented R8 foundation
- Deterministic multi-column filter predicates: exact, case/accent-insensitive substring, inclusive monetary range, listed values.
- Stable hierarchical sorting by explicit column priority, preserving entire record rows and original source order.
- **Typed clothing sizes**: PP, P, M, G, GG, XGG, XXGG, and one-size (Tamanho Único / Talla Única / Tamaño Único), including common aliases. Sort uses size hierarchy, never alphabetic collation when a column is consistently recognized as clothing sizes.
- Client-side smart-order toggle and combined filter panel operate **only** on rows that the owning product has already authorized and provided. The original data remains unchanged.
- Explicit types for books and normalization proposals. These are **contracts**, not workbook persistence or LLM implementation.
- Explicit worksheet height selection and visual confirmation of formatting state.

## Next independent increments (not promised in R8)
1. **Multi-sheet books:** persistent stable sheet IDs, name/rename/clone/reorder/delete with confirmation, per-sheet grid state, active sheet and draft persistence through an authorized adapter. No synthetic references masquerading as persisted records.
2. **Bidirectional filtering:** context menu for row and column guides; by row range, column range, title, keyword, typed field values. Show active predicates and allow removal; never silently alter the base dataset.
3. **LLM search mode:** convert natural-language intent to typed filter proposals; show human-readable predicates before applying; ask a contextual clarification question only for ambiguous attributes (e.g., G versus GG or category-specific meanings); do not substitute generated content for source authorization.
4. **Smart order configuration:** preview and reorder priorities, per-column type overrides, custom locale/size taxonomies, user approval before persisting an order.
5. **Estandarizar:** propose spelling/case/unit/value normalization while storing original value, tenant-scoped canonical representation, locale-aware aliases/synonyms and provenance; batch confirmation and audit/rollback. Different meanings (e.g., *franela*) must trigger clarification.
6. **Platform execution:** capability permissions, versioned metadata dictionary, tenant boundaries, indexed semantic search, LLM spend accounting and durable operation logs. No automatic server mutation from a UI-only component.
7. **Scale:** virtualization, large-sheet export/import, transactional change sets, multi-user edits and backend-backed undo.

## Invariants
- Data source or backend enforces record access, not the browser.
- Drafts are separate from enterprise records until an explicit authorized commit.
- Filtering and sorting are reversible views, not destructive transformations.
- Normalization and LLM-driven write operations require explicit user approval.
- Missing or unrecognized size tokens must not be silently coerced to known garment sizes.

## Next major UI Core capability: per-cell digital attachments (approved for future design)
A cell may contain references to one photo, an ordered image gallery, one or more documents, and other authorized file types. This is a **typed asset reference**, not binary data embedded in the worksheet value.
- Cell model: value, optional typed attachments array (asset ID, MIME type, display name, size, optional dimensions/page count, ordered position, preview references, annotations), plus permissions and version/provenance.
- Interactions: upload / choose existing asset, drag-and-drop when appropriate, inline thumbnail, gallery lightbox, document preview, rename/reorder/remove with clear confirmations, download subject to ACL; remain usable in desktop and mobile.
- Product use cases: apparel SKU photos and styles, HR records and supporting documents, engineering plans/specifications, editorial image packages.
- Platform duties: tenant-isolated object storage and indexes, role-based access, signed delivery URLs, malware scanning, quotas, allowed file types/sizes, original fidelity, immutable audit, retention, delete governance, rollback, and safe upload lifecycle.
- Data adapters may enable or forbid attachments per sheet, column, row, or cell. Displaying a sheet does **not** grant attachment access independently.
- Future LLM visual/document understanding may propose metadata from **authorized** assets. It must not infer unseen files or bypass user approval for a write.
- **Status:** accepted as future requirement; not implemented in R8.3. Do not let this delay Zenit Media Core committed beta.

## R8.3 current scope
- Branded dropdowns in the filter dialog, with no native grey popup.
- Strongly visible italic rendering on cell content; automated CSS/DOM regression.
- Toolbar undo/redo for local edits, formats, filters and sorting, with a bounded action stack.
- Remove redundant legend, helper text and floating format-status badge from sheet toolbar.
- AI action launches an instruction/review dialog. **The Design Lab is not connected to a real LLM.** A limited, deterministic local parser proposes recognized exact values and ordering; unclear instructions lead to clarification rather than unverified modifications. Application is opt-in and reversible. Platform LLM orchestration, tenant-scoped permissions, auditing, prompt policy, token accounting and semantic classification remain future integration.


## R9 first-version workbook shell (isolated preview)
- Workbook starts with an enterprise-backed **Registros** sheet. The plus control creates additional independent blank worksheet canvases.
- Tabs sit beneath the grid, support switching and double-click renaming. A non-source sheet can be deleted after explicit confirmation. The enterprise source tab cannot be deleted in Design Lab.
- Each sheet canvas stays mounted across switches, keeping local draft values, cell formatting, guides, sorting, filters and undo history independent. Extra sheets never receive enterprise records or write callbacks; there is no implied cross-sheet database association.
- The UI demo does **not** yet persist new sheets across browser reloads. Saving/sharing workbooks, cross-sheet formulas, backend identities and ACL policies require authorized Platform adapters.
- Toolbar button groups now have consistent spacing and the IA shortcut shares a baseline and height with the adjacent search field.
- Responsive workbook tab strip scrolls independently on small screens and never forces a page-wide horizontal scroll.
