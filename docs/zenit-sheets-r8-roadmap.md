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
