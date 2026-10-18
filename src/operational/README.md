# Zenit UI Core — Componentes Operativos Universales

**Estado:** primer lote de componentes operativos implementado exclusivamente en la rama de prueba. **No es un paquete comercial ni una integración viva con Platform.** Aprobación/alcance: [Issue #10](https://github.com/agencia-zenit-br/zenit-design-lab/issues/10). Principio arquitectónico de referencia: [Zenit Platform #323](https://github.com/agencia-zenit-br/zenit-platform/issues/323).

## Responsabilidades y contratos

| Pieza | Responsabilidad |
|---|---|
| `collectionCore.ts` | Motor puro de búsqueda con normalización, filtros de igualdad autorizados por columna, ordenación, paginación y selección por ID. Sin React, DOM, red, negocio ni dependencias de un producto. |
| `OperationalRecords.tsx` | Vista controlada genérica de registros. Muestra tabla y tarjetas móviles; entradas: `rows`, `columns`, `query`, `selectedIds`, `getRowLabel`; salidas: `onQueryChange`, `onSelectedIdsChange`, `onOpenRow`. |
| `OperationFeedback.tsx` | Avisos semánticos accesibles y confirmación explícita de operaciones. La aplicación ejecuta acciones, no el control visual. |
| `adapter.ts` | **Contrato propuesto, no implementación productiva** para `list/read/update` con revisión, errores y cancelación. El producto debe validar permisos, instancia, tenant y capacidades. |
| `OperationalWorkbench.tsx` | Fixtures sintéticos y manipulables: buscar, ordenar, filtrar, paginar, añadir, seleccionar, eliminar mediante confirmación, estados de carga/error/recuperación. Sin backend. |

### Reglas de uso

- Los registros se filtran y ordenan en memoria **solo en el ejemplo del Lab**. Una aplicación con listas grandes debe consultar el backend con paginación, filtros autorizados y ordenamiento compatible. El frontend jamás confiere permisos ni sustitute consultas tenant-scoped.
- `id` es identidad estable; selección visible por página, selección persistente entre filtros y paginación; eliminar IDs solo tras constatar que el registro desapareció realmente del conjunto autorizado.
- Una tabla de producto controla operaciones con callbacks; no debe acoplarse a las transiciones editoriales de ZMC, tarifas hoteleras ni entitlements de billing.
- `queryCollection` es determinista, con `page` limitado y `pageSize` defensivo. La búsqueda normaliza acentos y mayúsculas; los filtros solo operan sobre columnas explícitamente filterables.
- Los ejemplos de carga y error **simulan** un servicio. `Reintentar` no reenvía datos a Platform; el adaptador real debe distinguir HTTP 401/403/409, offline, timeouts y cancelación.
- Acciones potencialmente destructivas requieren confirmación e historial auditable cuando las políticas del producto lo exijan. La UI no ejecuta funciones sensibles por sí sola.

### Integración ZMC de referencia: dependencias concretas

El borrador [Zenit Platform PR #314](https://github.com/agencia-zenit-br/zenit-platform/pull/314) contiene `POST /zenit/zmc/instances/{instanceId}/articles`, `PUT .../articles/{articleId}/draft` y `POST .../articles/{articleId}/transitions` bajo autenticación humana, permisos y validaciones. **Todavía no incluye GET/list y GET/detail** autorizados. Una interfaz de tabla editorial de verdad necesitará esas rutas con aislamiento de tenant/instancia, permisos, entitlement, cursores o paginación y pruebas de regresión, antes de conectar `RecordsDataSource`.

La integración de referencia se hará en una rama de desarrollo revisada por separado, sin fusionar ni desplegar Platform/ZMC y sin introducir reglas editoriales en los componentes compartidos.

### Verificación y certificación

- `npm run test:operational`: búsquedas insensibles a acentos, filtrado, orden, paginación, selección estable, valores extremos.
- `npm run check:design`: guardias estructurales de la biblioteca operativa y la semántica de presentación.
- `npm run check:browser`: interfaz en móvil/escritorio, ciclos de selección/paginación/búsqueda, estados error y retry, sin desbordamiento horizontal.
- `npm run build`: incluye compilación TypeScript, construcción Vite y tests de los motores temporal y operativo.

**Nivel de portabilidad real:** prototipo interno hacia L1 (código React reutilizable). Aún faltan package boundary, instalación fuera del Lab para registros, semver documentado, pruebas de dos skins sobre OperationalRecords, adaptadores WordPress (L2), validación asistida de lector de pantalla, host externo de producción y rollback. La existencia de `adapter.ts` no demuestra una integración con Platform.

### UX regional y temporal (misma entrega)

El selector IANA de zona horaria y el campo comprensible de fecha/hora de finalización de la cuenta regresiva son ajustes solicitados, no capacidades específicas de ZMC. Mantienen el dato canónico en el núcleo y adaptan solo la entrada. Las horas DST imposibles/ambiguas no deben corregirse en silencio.
