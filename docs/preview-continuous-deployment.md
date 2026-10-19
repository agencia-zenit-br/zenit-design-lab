# Zenit UI Core — entrega continua de vista previa (propuesta para aprobación)

**Estado: preparada en rama de trabajo, INACTIVA.** No hay despliegue automático activado ni cambios de permisos GCP/GitHub. No crear la rama `preview/ui-core` hasta completar el control de identidad.

## Resultado de la auditoría (18 Oct 2026)

1. `.github/workflows/deploy-design-lab.yml` de `main` **ya despliega automáticamente** `zenit-design-lab` mediante GitHub Actions/WIF, como demuestra la ejecución [38328651186](https://github.com/agencia-zenit-br/zenit-design-lab/actions/runs/38328651186). Este servicio es **intocable** para UI Core preview.
2. `zenit-platform` `.github/workflows/publish-labs-container.yml` también compila/despliega LABS desde `main`, al margen del Design Lab. No se modificarán workflows o IAM LABS.
3. Cloud Shell devolvió **sin filas ni errores** al listar Cloud Build triggers en `southamerica-east1` y `global`: no se evidencian triggers en esas dos regiones; la automatización existente opera por GitHub Actions y no necesita uno nuevo.
4. Las revisiones `zenit-ui-core-preview` publicadas hasta ahora se hicieron mediante `ops/design-lab/update-ui-core-preview.sh` manual, con validación del SHA; revisión vigente antes de habilitar CD: `zenit-ui-core-preview-00003-mrl`, aplicación SHA `c31131c1bc8bad4122130155b2ddd63ecacb14c2`.

## Arquitectura objetivo — solo vista previa aislada

Workflow `.github/workflows/deploy-ui-core-preview.yml`:

- **Único trigger automático:** `push` a `preview/ui-core`, omitiendo modificaciones que sean exclusivamente documentación.
- Antes de obtener permisos cloud: `npm ci`, contratos de diseño, TypeScript/Vite, Storybook y pruebas reales Chromium **en el mismo SHA**. Fallo => no ejecuta deploy.
- Despliegue únicamente a `zenit-ui-core-preview` en `zenit-platform-labs/southamerica-east1`; se verifica servicio existente, runtime identity, etiquetas de ámbito/propósito y que una única revisión reciba 100 % de su tráfico.
- Imagen y repositorio separados `southamerica-east1-docker.pkg.dev/zenit-platform-labs/zenit-ui-core-preview/ui-core:<commit>`, construida por GitHub Actions con `docker build` y subida al **nuevo repositorio Artifact Registry `zenit-ui-core-preview`**, con permisos de escritura exclusivamente sobre ese repositorio. Se despliega por **digest** inmutable en Cloud Run. No requiere Cloud Build trigger ni invocarlo.
- Acceso cloud por WIF/OIDC temporal, mediante un **deployer dedicado** distinto del runtime, con variables del entorno de GitHub `ui-core-preview`; nunca secretos persistentes de llave de service account.
- Verificación `/__zenit_health`; ante respuesta errónea, intentar restablecer **100 % del tráfico a la revisión anterior** y marcar el job fallido. Si el despliegue falla antes de crear una revisión, detenerse y notificar; no reintentar en bucle.
- Nunca modifica `zenit-design-lab`, `zenit-platform-labs` Cloud Run, Cloud SQL, ningún job de Platform, IAM de otros productos ni clientes ZMC/WordPress.
- Dispara costes de runner y Artifact Registry/Cloud Run; `min-instances=0`, `max-instances=1`.

## Activación única (pendiente, requiere privilegios explícitos del propietario)

1. **Auditoría IAM realizada por Cloud Shell:** el pool `zenit-github-actions-labs` tiene el proveedor `github-design-lab` restringido a `refs/heads/main` y `refs/heads/preview/zmc-editorial-20261016`; la cuenta **original** `zenit-design-lab-deployer` tiene `roles/iam.workloadIdentityUser` concedido a un `principalSet` de **todo el repositorio dentro de ese pool** (`attribute.repository/agencia-zenit-br/zenit-design-lab`). Por tanto, **no** ampliar el provider original y **no** añadir otro provider al mismo pool: ello podría permitir asumir también la identidad original desde la rama experimental. Crear un **pool independiente** `zenit-ui-core-preview` y un provider OIDC `github-actions` condicionado a propietario, repositorio y **exclusivamente** `refs/heads/preview/ui-core`; mapear `google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref`.
2. Crear en GCP **cuenta deployer dedicada** `zenit-ui-core-preview-deployer@zenit-platform-labs.iam.gserviceaccount.com`. Vincular únicamente el pool **independiente** `zenit-ui-core-preview` mediante el `principalSet` de repositorio de ese pool (el provider admite exclusivamente la rama `preview/ui-core`). Nunca conceder `roles/iam.workloadIdentityUser` a esa identidad desde el pool original.
3. Crear repositorio Docker **independiente** en Artifact Registry, `zenit-ui-core-preview`, y otorgar **solo** `roles/artifactregistry.writer` a la cuenta deployer sobre ese repositorio. Otorgar `roles/run.developer` **solo en el servicio** Cloud Run existente `zenit-ui-core-preview`, y `roles/iam.serviceAccountUser` **solo sobre la identidad de ejecución** `zenit-ui-core-preview@...`. No asignar papeles sobre el proyecto entero, no dar acceso al repositorio `zenit-design-lab`, Cloud SQL ni al servicio original. Comprobar IAM Policy Troubleshooter antes de activar.
4. En GitHub, crear el **Environment `ui-core-preview`**, limitar deployment branches a `preview/ui-core`, y configurar exactamente las variables no secretas `GCP_UI_CORE_WIF_PROVIDER` y `GCP_UI_CORE_DEPLOY_SERVICE_ACCOUNT`. Si se quieren despliegues totalmente automáticos, no configurar una aprobación humana obligatoria en ese ambiente; la aprobación corresponde a los cambios antes de entrar a la rama.
5. Establecer reglas para `preview/ui-core` que eviten push arbitrario de colaboradores y exijan revisión y CI; una vez aprobado y probado el workflow, crear/promover el commit a esa rama. Su primer push ejecutará pruebas + deploy. No habilitar antes de que todas las comprobaciones IAM y GitHub estén aprobadas.
6. Ensayar una publicación controlada, revisar los logs y comprobar `PREVIEW_URL`, `PREVIEW_COMMIT`, `PREVIEW_SERVICE`, `PREVIEW_REVISION`. Ensayar rollback con fallo sintético **sin interrumpir otros servicios** y validar los costos y políticas de retención.

**Límites pendientes:** la rama de UI Core sigue con PR de producto en borrador y aceptación visual pendiente. La automatización no implica merge de PR, aprobación visual automática, ni permiso de publicar Platform/ZMC. No se ha comprobado aún de forma directa el IAM actual de GCP o los ajustes de GitHub Environment: esas comprobaciones son un gate de activación, no una suposición.

## 2026-10-18 — Hallazgo prioritario de seguridad en Workload Identity

La autenticación original de Design Lab **sí funciona** (GitHub Actions exitosos). Pero la vinculación original del deployer es por atributo de repositorio en el pool compartido, no por proveedor específico. Compartir ese pool con un nuevo provider de `preview/ui-core` podría abrir un camino de impersonación hacia el deployer original. Por ello el workflow ahora exige explícitamente el nuevo pool `zenit-ui-core-preview`, provider `github-actions`, deployer `zenit-ui-core-preview-deployer@zenit-platform-labs.iam.gserviceaccount.com` y repositorio de imágenes dedicado. Estas identidades y repositorio **aún no existen** según el listado previo de pools/cuentas; el repositorio deberá comprobarse antes de crearlo. Los cambios de GCP deben aprobarse y ejecutarse en Cloud Shell por su propietario. Las directrices oficiales de Google Cloud indican que los principalSets se restringen por pool y atributo y que `roles/run.developer` puede otorgarse por servicio.
