# Zenit UI Core — protocolo de revisión visual V3.0–V4.5.1
Fecha: 2026-10-18

**Estado:** listo para revisión visual humana **sin aprobación visual final**. Esta guía NO es autorización de despliegue ni fusión. Referencia de alcance: [Issue #10](https://github.com/agencia-zenit-br/zenit-design-lab/issues/10); código en [PR #8](https://github.com/agencia-zenit-br/zenit-design-lab/pull/8).

## 1. Rama e integridad
- Rama exacta: `preview/zmc-editorial-20261016`.
- Punto de partida técnico validado: commit `b68c50f9631c85b231d8709ad518e239ed75ded7`, [Design Lab CI #39153921474](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39153921474) y [Verify Design Lab #39153921469](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/39153921469), ambos SUCCESS.
- Antes de revisar una nueva revisión, comprobar el SHA actual y que CI / Verify estén verdes para ese SHA (los commits posteriores solo documentales también generan workflows).

## 2. Ruta de revisión SIN Cloud Run, fusión ni credenciales
**Opción preferida para revisión técnica aislada:** clonar la rama en un entorno local con Node 22 y Git, ejecutar `npm ci` y `npm run dev`, y abrir la URL que muestre Vite (normalmente `http://127.0.0.1:5173/`). No requiere GCP, IAM, migraciones, secretos o conectores. En Windows PowerShell:

```powershell
git clone https://github.com/agencia-zenit-br/zenit-design-lab.git
cd zenit-design-lab
git switch --track origin/preview/zmc-editorial-20261016
npm ci
npm run dev
```

No usar un build viejo de `main` para aprobar la rama. La vista del laboratorio contiene únicamente datos sintéticos. Para revisión remota, diseñar y autorizar por separado un hosting de vista previa aislado; no crear nuevos servicios/credenciales automáticamente.

**Advertencia sobre despliegue existente:** `.github/workflows/deploy-design-lab.yml` publica el servicio Cloud Run `zenit-design-lab` cuando se actualiza `main` o se ejecuta manualmente. No es una ruta de preview aislada: usarla para este PR puede fallar por las restricciones WIF de rama `main`, o alterar el servicio compartido si esas restricciones cambian. No ejecutar el workflow, no fusionar PR #8 para obtener una previsualización y no modificar sus autorizaciones sin aprobación expresa.

## 3. Validación visual con la versión aprobada
La autoridad visual sigue siendo la captura **Integrated Workspace V3.0** y las decisiones V3.1.2–V4.5.1 de `docs/design-decisions.md`. La imagen original no está versionada aquí: **no afirmar equivalencia de píxeles** mientras no se recupere la captura y se compare con las pantallas renderizadas.

### Escritorio (1024 y 1440px)
- Fondo neutro, controles, tipografía compacta, espaciado y márgenes de la versión aprobada.
- Navegación horizontal mediante píldoras y cabecera fija.
- Sidebar contextual visible, expandible/colapsable, sin modificar el estilo global.
- Select simple/múltiple, posición y ancho consistente, menús redondeados, teclado y foco.
- Tablas operativas, filtros, selección masiva, estados de carga/error y notificaciones.
- Área contextual de edición utiliza todo el ancho útil con padding interno.

### Móvil/tableta (320, 375, 390, 600, 700, 768 y 900px)
- **Cero desbordamiento horizontal de la página**, botones y campos no recortados.
- Menús modales centrados y navegación contextual a pantalla completa cuando corresponda.
- Registros en tarjetas: checkbox junto al título, metadatos ordenados y selección accesible.
- Calendario centrado, fecha y hora seleccionables, zona horaria con selector buscable.
- Verificar apertura/cierre con teclado táctil, márgenes, safe areas, foco y scroll.

### Comportamiento regional y temporal
- ES/PT/EN y HE/AR de prueba con dirección RTL/LTR; inicio de semana configurable.
- Zonas IANA seleccionables sin campo de texto técnico libre; nombres comprensibles.
- Cuenta regresiva con 'Fecha y hora de finalización', zona explícita y rechazo de horas DST imposibles o ambiguas.
- Temporizador: duración, iniciar, pausar, reanudar y restablecer; no representa una operación de servidor.

### Datos y límites
- Activar **Servidor simulado** en Workbench: la tabla debe mostrar totales del servidor simulado, respetar el orden de las filas suministradas y conservar selección entre páginas. No hay integración autenticada real.
- Los cambios locales del ejemplo nunca crean, modifican ni eliminan artículos de ZMC.
- La inspección automática en Chromium y CI no sustituye revisión visual humana, Safari/Android físicos ni certificación WCAG.

## 4. Criterios de cierre
Registrar por cada hallazgo: pantalla, viewport, modo claro/oscuro, locale/dirección, estado, comportamiento observado, comportamiento esperado y captura si es posible.

**No cerrar la etapa** sin: revisión visual del CEO, corrección de discrepancias críticas con versión aprobada, CI del SHA revisado en verde y registro de pendientes no bloqueantes. Mantener PR #8 draft hasta aprobación específica. No avanzar al despliegue productivo ni fusionar PR #314/#325/#326 por resultados visuales del laboratorio.

## 5. Acciones
- Trabajo técnico de preparación y CI: responsabilidad de implementación, sin intervención del CEO.
- **ACCIÓN REQUERIDA DEL CEO** únicamente cuando disponga de una vista revisable: abrir la vista y aprobarla o detallar correcciones.
- **APROBACIÓN EXPLÍCITA REQUERIDA** antes de crear un servicio de preview en GCP, ejecutar workflow de despliegue, fusionar PR o aplicar migraciones.
