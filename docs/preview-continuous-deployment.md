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
- Imagen separada `southamerica-east1-docker.pkg.dev/zenit-platform-labs/zenit-design-lab/zenit-ui-core-preview:<commit>`, construida por GitHub Actions con `docker build` y subida a Artifact Registry, usando **digest** inmutable para Cloud Run. No requiere trigger ni invocar Cloud Build.
- Acceso cloud por WIF/OIDC temporal, mediante un **deployer dedicado** distinto del runtime, con variables del entorno de GitHub `ui-core-preview`; nunca secretos persistentes de llave de service account.
- Verificación `/__zenit_health`; ante respuesta errónea, intentar restablecer **100 % del tráfico a la revisión anterior** y marcar el job fallido. Si el despliegue falla antes de crear una revisión, detenerse y notificar; no reintentar en bucle.
- Nunca modifica `zenit-design-lab`, `zenit-platform-labs` Cloud Run, Cloud SQL, ningún job de Platform, IAM de otros productos ni clientes ZMC/WordPress.
- Dispara costes de runner y Artifact Registry/Cloud Run; `min-instances=0`, `max-instances=1`.

## Activación única (pendiente, requiere privilegios explícitos del propietario)

1. Revisar la configuración existente de WIF que usa Design Lab. **No suponer** que el proveedor permite la nueva rama; si se restringe a `main`, crear un proveedor/binding dedicado en vez de ampliar indiscriminadamente la confianza.
2. Crear en GCP una **cuenta deployer distinta**: propuesta `zenit-ui-core-preview-deployer@zenit-platform-labs.iam.gserviceaccount.com`. Vincular la identidad federada exclusivamente a `agencia-zenit-br/zenit-design-lab` y, de ser posible, a `refs/heads/preview/ui-core`. Auditar la condición/mapping de atributos WIF antes de agregar bindings.
3. Otorgar permisos **mínimos y por recurso**, no un rol de administrador de proyecto: escritura Artifact Registry en el repositorio `zenit-design-lab`; actualizar/consultar **solo** Cloud Run `zenit-ui-core-preview`; `iam.serviceAccountUser` exclusivamente en la cuenta runtime de ese preview. Verificar las acciones exactas con IAM Policy Troubleshooter antes de publicar. No dar acceso a Cloud SQL ni a los servicios originales.
4. En GitHub, crear el **Environment `ui-core-preview`**, limitar deployment branches a `preview/ui-core`, y configurar exactamente las variables no secretas `GCP_UI_CORE_WIF_PROVIDER` y `GCP_UI_CORE_DEPLOY_SERVICE_ACCOUNT`. Si se quieren despliegues totalmente automáticos, no configurar una aprobación humana obligatoria en ese ambiente; la aprobación corresponde a los cambios antes de entrar a la rama.
5. Establecer reglas para `preview/ui-core` que eviten push arbitrario de colaboradores y exijan revisión y CI; una vez aprobado y probado el workflow, crear/promover el commit a esa rama. Su primer push ejecutará pruebas + deploy. No habilitar antes de que todas las comprobaciones IAM y GitHub estén aprobadas.
6. Ensayar una publicación controlada, revisar los logs y comprobar `PREVIEW_URL`, `PREVIEW_COMMIT`, `PREVIEW_SERVICE`, `PREVIEW_REVISION`. Ensayar rollback con fallo sintético **sin interrumpir otros servicios** y validar los costos y políticas de retención.

**Límites pendientes:** la rama de UI Core sigue con PR de producto en borrador y aceptación visual pendiente. La automatización no implica merge de PR, aprobación visual automática, ni permiso de publicar Platform/ZMC. No se ha comprobado aún de forma directa el IAM actual de GCP o los ajustes de GitHub Environment: esas comprobaciones son un gate de activación, no una suposición.
