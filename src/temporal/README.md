# Zenit Temporal Core — reusable contracts (prototype v0)

**Status:** functional **Design Lab prototype**, not a published package, server-backed scheduler or commercially certified plugin. The normative cross-platform approval is documented in [Design decisions](../../docs/design-decisions.md) and the QA matrix in [Implementation conformance](../../docs/implementation-conformance.md).

This module must be treated as a **Zenit ecosystem building block**, not as part of a single product (including ZMC).

## Separation of concerns

| Layer | Files | Responsibility |
|---|---|---|
| Pure core | `core.ts` | Gregorian civil dates; strict localized parsing; `TimeOfDay`; date and time range metrics; elapsed duration between explicit-offset instants; countdown snapshots; immutable timer lifecycle. **No React or product-specific code.** |
| Time renderers | `TimeInput.tsx` | Controlled `TimeOfDay` editing, a three-visible-value vertical wheel or direct text field; hybrid mode; optional seconds and 12/24-hour display. Both modes share the same value and validation. |
| Date field | `CivilDateField.tsx` | Controlled locale-aware manual entry; explicit bounds and errors; no implicit timezone conversion. |
| Date grid | `../CalendarSpecimen.tsx` | Month/day display, single/range/multidate visual selection, navigation and regional weekday order. Gregorian implementation; Hebrew and Islamic engines explicitly unavailable. |
| Combined demos | `../DateTimeDemo.tsx` | Six selector workflows: single date, date range, discontiguous days, date-time, time, and time interval. Computes derived metrics and shows how to compose the primitives. |
| Live temporal | `../TemporalDemo.tsx` | Clock-anchored countdown and local pause/resume/reset timer, different visual presentations, status and progress. |
| Independent consumers | `PortabilityDemo.tsx`, `host-main.tsx` | Two product-like wrappers with distinct skins and a shared controlled time value, also mounted at `/temporal-embed.html` **without the Design Lab shell**. |
| Stories / tests | `../temporal.stories.tsx`, `../../scripts/temporal.test.mjs`, `../../scripts/check-browser-layout.mjs` | Independent component mounts, deterministic injected-clock unit tests, browser interaction/geometry and two-skin test. |

### Typed public contract patterns

`core.ts` exports:
- `CivilDate`: validated ISO `YYYY-MM-DD` Gregorian date with **no timezone**.
- `TimeOfDay`: `{hour: 0..23, minute: 0..59, second: 0..59}`; a wall-clock time, **not** an instant.
- `TemporalResult<T>`: discriminated `{ok:true,value}` / `{ok:false,error}`.
- `validateCivilDate`, `parseCivilDate`, `formatEditableCivilDate`, `civilDayDifference`, `dateRangeMetrics`, `normalizeMultiDates`.
- `validateTimeOfDay`, `parseTimeOfDay`, `formatEditableTime`, `timeOfDaySeconds`, `timeRangeDuration`, `secondsToDuration`, `instantIntervalDuration`.
- `countdownSnapshot`, `makeTimer`, `timerSnapshot`, `startTimer`, `pauseTimer`, `resetTimer`.

The widget implementation follows a controlled contract:
```tsx
const [time,setTime] = useState<TimeOfDay>({hour:14,minute:30,second:0});
<TimeInput label="Hora" value={time} onChange={setTime}
  hourCycle="h23" showSeconds={true} presentation="hybrid" />
```

The parent owns the value; choosing `wheel`, `text` or `hybrid` must not change the underlying data. A future analog clock renderer should accept the same `value` and `onChange` contract without duplicating validation.

### Domain-specific interpretation of the same date range

```ts
const metrics=dateRangeMetrics('2026-11-10','2026-11-15');
if(metrics.ok) {
  // Editorial / inclusive selected civil days: metrics.value.inclusiveDays === 6
  // Travel/hotel interpretation of date-boundary gap: metrics.value.nights === 5
}
```

`nights` is arithmetic only. Hotel reservation inventory, stay constraints, rate plans and payment rules **must be supplied by a hotel product adapter**. ZMC's editorial state machine, multi-day schedules and approvals must also remain outside the core.

`timeRangeDuration(start,end,true)` opts into next-day interpretation. It never silently assumes midnight rollover when `end` is earlier than `start`.

### Temporal correctness and clocks

- **Civil date** = calendar day in a configured calendar system, not UTC-midnight timestamp.
- **Wall-clock time** = local display/edit without a date/timezone; intervals crossing midnight need explicit policy.
- **Instant** = timestamp with explicit `Z` or numeric offset; `instantIntervalDuration` compares elapsed seconds and handles actual DST offset changes.
- **Countdown** computes `targetEpochMs - nowEpochMs` on each sample. It does not decrement a variable by one second on each UI tick. Finishes at exact zero, tracks expiration and updates after tab visibility changes.
- **Timer** stores duration, accrued elapsed time, optional running anchor and state; pause/resume/reset are pure transformations. The UI uses browser wall clock and is **not authoritative across clients or devices**. Changing system time can affect a browser-only demonstration; consequential deadlines need a trusted server clock, reconciliation and audit.
- Decimal time arithmetic avoids adding “one calendar day” as if it always equals exactly 86,400 local seconds. Gregorian date arithmetic can count calendar boundaries while instant arithmetic counts actual elapsed seconds.

### Locale / calendar systems

Use `calendarLocale.ts` for locale, first weekday, 12/24-hour formatting, direction and IANA timezone. Calendar system remains an independent dimension. **Hebrew and Islamic/Hijri civil arithmetic and observational conventions are not implemented.** Display those systems as unavailable rather than decorating Gregorian days with translated labels.

### Themes and portability levels

`PortabilityDemo` has two controlled consumers:
1. Zenit canonical light skin using semantic tokens.
2. A visually distinct fictional customer skin using scoped CSS variables.

Both share the same time value and parse/validate behavior. The standalone page `/temporal-embed.html` is built as a separate Vite entry from `index.html`; browser QA checks the absence of `.lab` and .app-chrome, both skins and no viewport overflow.

**This is evidence toward L1 reuse, not proof of external distribution.** No published npm package, stable semver API or independently deployable WordPress adapter exists yet. L2 (external app) and L3 (licensed standalone package) require further packaging/versioning, style collision audit, security, screen-reader/mobile Safari QA and compatibility gates.

### Certification and intentionally deferred capabilities

- `npm run build` runs static conformance, deterministic temporal unit tests and TypeScript/Vite compilation.
- `npm run build-storybook` validates independent stories.
- `npm run check:browser` covers mobile/desktop, themes, keyboard text input, wheel, ranges, midnight rollover, countdown/timer and standalone skin harness.
- The real physical iPhone/Android/tablet review, pixel comparison with V3.0 baseline and full assistive-technology audit remain pending.

Deferred: real hotel/airline inventory and booking, business-triggered expiration actions, server-backed timer synchronization, non-Gregorian civil engines, DST-aware resolution of an ambiguous/nonexistent *local wall time* to a scheduled instant, analog clock UI, certified L2/L3 adapters, interval accessibility across all readers and operational persistence. These limits must remain explicit in product documentation and sales discussions.
