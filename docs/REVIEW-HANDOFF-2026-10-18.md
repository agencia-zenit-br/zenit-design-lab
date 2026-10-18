# Zenit UI Core / Design Lab — Handoff de revisión visual

**Corte:** 2026-10-18  
**Estado:** preview independiente publicada; **esperando feedback visual del CEO**.  
**Alcance:** documentación del prototipo visual sintético, no Zenit Platform ni aplicación ZMC real.

## URL y fuente exactas de la versión que se está revisando

- Vista: https://zenit-ui-core-preview-725877092709.southamerica-east1.run.app/
- URL equivalente reportada por Cloud Shell: https://zenit-ui-core-preview-pj3dnprg2a-rj.a.run.app/
- Cloud Run independiente: `zenit-ui-core-preview`, revisión `zenit-ui-core-preview-00001-wfs`.
- Fuente desplegada: rama `preview/zmc-editorial-20261016`, commit **`ab7db1345356a5bc736d180d8bc1561c1832a472`**.
- [PR visual #8](https://github.com/agencia-zenit-br/zenit-design-lab/pull/8): **draft**, no fusionado.
- Evidencia CI para ese commit: [Design Lab CI #39156346912](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39156346912), [Verify #39156346942](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39156346942), SUCCESS.
- CEO ejecutó en Cloud Shell el despliegue autorizado. Cloud Build `252eaea0-d1ab-46ad-b9e9-fa77c810baea`: SUCCESS; `/__zenit_health`: `ok` reportado por el script. **No significa aprobación visual ni certificación de accesibilidad**.
- Servicio existente `zenit-design-lab`: conservado, no sobrescrito.

**Regla de consistencia:** el branch documental que contiene este archivo **no** es el commit desplegado. Actualizar documentos no actualiza la URL ni cambia el SHA publicado. No atribuir a la preview una corrección posterior sin construirla/desplegarla y verificar su revisión.

## Procedimiento de revisión, en el orden acordado

1. El CEO inspecciona la URL actual en escritorio y móvil y envía observaciones, una o varias rondas.
2. Ingeniería **recibe todo el feedback pertinente antes de codificar cambios sobre el diseño en revisión**. Clasifica cada observación: defecto, desviación frente a la regla aprobada, nueva propuesta o trabajo diferido.
3. Compara contra [design-decisions.md](design-decisions.md) y [implementation-conformance.md](implementation-conformance.md), usando la referencia visual canónica **Zenit Design System V3.0 — Integrated Workspace**, más las decisiones vigentes V3.1.2–V4.5.1. No presentar una estética nueva.
4. Una vez autorizado el lote, ingeniería actualiza rama y pruebas: `npm run check:design`, `npm run build` (TypeScript/Vite, test temporal y operativo), `npm run build-storybook` y Chromium en claros/oscuros, móvil/escritorio y RTL/LTR.
5. Cualquier nueva preview se despliega por vía controlada y se identifica por **SHA + revisión Cloud Run + URL**. La versión anterior permanece hasta su aceptación.
6. El CEO aprueba `ok` **solo** el objeto claro inmediatamente propuesto; la aprobación de una versión visual no autoriza por sí sola fusionar PR, activar backend o publicar clientes.

## Aspectos que corresponde revisar ahora

- **Identidad:** superficies y texto neutros, espaciados, botones y estados activos/deshabilitados, iconografía SVG, diseño light/dark, idioma y RTL cuando corresponda.
- **Escritorio:** navegación superior tipo píldoras, cabecera sticky, sidebar contextual, panel inferior usando ancho disponible y márgenes consistentes, tablas legibles, selectores anclados a su campo y ayudas contextuales discretas.
- **Móvil:** 320/375/390 px y variantes de dispositivo, menús/popup redondeados, selección en tarjetas con checkbox junto a cabecera, calendario centrado y **cero desbordamiento horizontal de la página**.
- **Core temporal universal:** campo fecha y hora de finalización, catálogo IANA seleccionable/buscable, eventos DST ambiguos/imposibles, calendario single/range/multiday, rueda/híbrido de hora y segundos, duración diferenciada de días civiles, countdown y timer iniciar/pausar/reanudar/resetear. **Nunca** ejecutar una acción real de publicación/cobro desde temporizador de cliente.
- **Componente operativo:** tabla y tarjetas; búsqueda, filtros, estados, selección persistente, `Servidor simulado` con totales/páginas suministrados; los datos siguen siendo **sintéticos** y ninguna demostración está autenticada contra Platform/ZMC.

## Límites verificados y pendientes

- UI Core es una implementación de prototipo en rama con checks, **no** biblioteca L2/L3 certificada, adaptador WordPress real ni UI comercial integrada.
- Sin validación real de dispositivo físico, Safari/Android o lector de pantalla; no afirmar pixel-parity, ya que la captura aprobada original V3.0 no está versionada aquí.
- La vista Redacción es un ejemplo, no un sistema de autorización editorial. No debe contener datos reales ni código/secretos de Platform.
- Las operaciones cloud y el script de preview están confinados a repositorio **privado** de operaciones Platform, no a este Design Lab.
- Tras el feedback, los defectos deben priorizarse sin retrasar innecesariamente entregables editoriales de ZMC/América News; la integración productiva tiene gate de autorización distinto.

## Documentos de continuidad

- [Decisiones visuales](design-decisions.md).
- [Conformidad de implementación](implementation-conformance.md).
- [Protocolo de QA visual previo](PREVIEW-VISUAL-QA-2026-10-18.md).
- [Arquitectura visual compartida](https://github.com/agencia-zenit-br/zenit-platform/blob/main/docs/design/FAMILY-VISUAL-ARCHITECTURE.md).
- Manual transversal aprobado como **procedimiento de trabajo** en revisión documental: `zenit-platform/docs/WORKING-METHODOLOGY.md`, rama `docs/working-methodology-continuity-20261018`, PR #328; **no fusionado**.

## Siguiente acción

**CEO:** revisar la URL y comunicar observaciones. **Ingeniería:** escuchar, cotejar fuentes y preparar correcciones una vez conocido el feedback y autorizado el lote. **No se requieren más comandos de Cloud Shell ahora.**

Este handoff preserva la secuencia previa y no autoriza modificar ni desplegar durante la revisión.
