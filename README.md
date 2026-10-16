# Design Lab

Standalone, public visual prototyping workspace for a SaaS product family (commercial name provisional).

All demonstration data must be synthetic. No private Platform code, secrets, customer data, infrastructure configuration or internal documents belong here.

The cross-product visual language has an **approved reference (Integrated Workspace V3.0 and follow-up V3.1.2–V4.5.1)**. Implementation is partial and must not be presented as complete. No open-source license is granted by this repository at this time.

## Design governance

The canonical source for visual and interaction decisions is [docs/design-decisions.md](docs/design-decisions.md). Read it before proposing, implementing, or reviewing any component or visual change. Explicitly approved decisions are binding; in-review proposals are not. Update the decision log whenever a component is approved or a previously approved rule changes. Keep this design lab separate from the private Zenit Platform backend.

## Visual conformance before implementation

Read **both** [approved design decisions](docs/design-decisions.md) and the
[implementation conformance matrix](docs/implementation-conformance.md)
before changing any screen or component. The latter records exactly what is
implemented and what still needs technical/visual validation.

The current preview has three interactive sections:
- **Resumen:** canonical neutral app shell and synthetic dashboard.
- **Componentes:** typography, vector icons, buttons, states and a *partial* editable table.
- **Redacción:** purely local editorial flow simulation, not connected to production.

The **approved horizontal pill pattern** remains the global navigation.
A **separate contextual sidebar** is expanded by default on desktop, may be
collapsed to accessible icons, and opens as an overlay drawer on mobile.
Mobile navigation and records must reflow without horizontal scrolling;
the same tokens and components apply across products.

The global header stays sticky while the page scrolls. Product and appearance
controls use the shared **Zenit Select** rounded anchored popup (03.14),
not visible browser-native selects. Only the single-selection mode is
currently implemented; advanced modes remain tracked as pending.

## Local verification

```sh
npm ci
npm run check:design
npm run build
npm run dev
```

The static guard and TypeScript build cannot replace browser viewport testing,
keyboard QA, or comparison to the original V3.0 screenshot. Do not claim full
visual or functional parity until those checks and all required components
are complete.

No secrets, real account data, or Platform backend code are used in this lab.
