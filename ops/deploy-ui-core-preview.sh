#!/usr/bin/env bash
# Isolated Zenit UI Core preview. Existing Design Lab and Platform are untouched.
set -Eeuo pipefail
PROJECT=zenit-platform-labs
REGION=southamerica-east1
SERVICE=zenit-ui-core-preview
EXISTING=zenit-design-lab
BRANCH=preview/zmc-editorial-20261016
IDENTITY=zenit-ui-core-preview@$PROJECT.iam.gserviceaccount.com
BUILDER=zenit-design-lab-builder@$PROJECT.iam.gserviceaccount.com
IMAGE=southamerica-east1-docker.pkg.dev/$PROJECT/zenit-design-lab/zenit-design-lab
STAGING=gs://zenit-platform-labs-design-build/source

usage() {
  echo "Usage: bash ops/deploy-ui-core-preview.sh --check | --deploy | --help"
  echo "--check performs read-only GCP preflight. --deploy creates a separate, publicly"
  echo "viewable Cloud Run service with min=0, max=1 and a dedicated no-role identity."
}
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
note() { printf '[ui-core-preview] %s\n' "$*"; }
if [ "$#" -ne 1 ]; then usage; exit 2; fi
case "$1" in
  --help|-h) usage; exit 0 ;;
  --check|--deploy) MODE="$1" ;;
  *) usage; exit 2 ;;
esac
for tool in gcloud git grep curl; do
  command -v "$tool" >/dev/null 2>&1 || die "Missing executable: $tool"
done
[ "$(gcloud config get-value project 2>/dev/null)" = "$PROJECT" ] ||
  die "Wrong project. Run: gcloud config set project $PROJECT"
[ "$(pwd -P)" = "$(git rev-parse --show-toplevel)" ] ||
  die "Run from the repository root."
[ "$(git branch --show-current)" = "$BRANCH" ] ||
  die "Wrong branch: expected $BRANCH."
[ -z "$(git status --porcelain)" ] ||
  die "Git working tree must be clean."
[ -f cloudbuild.yaml ] && [ -f Dockerfile ] && [ -f deploy/nginx.conf ] ||
  die "Missing source build configuration."
COMMIT=$(git rev-parse HEAD)
TAG=ui-preview-$(git rev-parse --short=12 HEAD)
note "Repo: $BRANCH at $COMMIT"
note "Target: $PROJECT/$REGION service $SERVICE (NOT $EXISTING)."
note "PUBLIC synthetic-only preview, 0-1 instances, 1 CPU / 512 MiB."
note "Cloud Build, Artifact Registry, Cloud Run and logs may incur costs."

# Use listing APIs so permission errors do not look like nonexistent resources.
SERVICES=$(gcloud run services list --project="$PROJECT" --region="$REGION" \
  --format='value(metadata.name)') || die "Cannot list Cloud Run services."
printf '%s\n' "$SERVICES" | grep -Fxq "$EXISTING" ||
  die "Existing Design Lab was not found; verify project and region."
if printf '%s\n' "$SERVICES" | grep -Fxq "$SERVICE"; then
  die "Preview service already exists; refusing to overwrite."
fi
ACCOUNTS=$(gcloud iam service-accounts list --project="$PROJECT" \
  --format='value(email)') || die "Cannot list service accounts."
if printf '%s\n' "$ACCOUNTS" | grep -Fxq "$IDENTITY"; then
  die "Preview runtime identity already exists; refusing to reuse."
fi
printf '%s\n' "$ACCOUNTS" | grep -Fxq "$BUILDER" ||
  die "Existing Cloud Build service account not found."
gcloud artifacts repositories describe zenit-design-lab \
  --project="$PROJECT" --location="$REGION" --format='value(name)' >/dev/null ||
  die "Existing Artifact Registry repository is unavailable."

note "Read-only infrastructure checks passed."
if [ "$MODE" = "--check" ]; then
  note "No resources were created. To proceed, use --deploy."
  exit 0
fi

note "Creating dedicated runtime identity (no project roles)."
gcloud iam service-accounts create zenit-ui-core-preview \
  --project="$PROJECT" \
  --display-name="Zenit UI Core visual preview" \
  --description="No-role runtime identity for synthetic-only UI preview."

note "Building immutable frontend image for $COMMIT."
gcloud builds submit . \
  --project="$PROJECT" --region="$REGION" \
  --config=cloudbuild.yaml \
  --service-account="projects/$PROJECT/serviceAccounts/$BUILDER" \
  --gcs-source-staging-dir="$STAGING" \
  --substitutions="_IMAGE=$IMAGE,_TAG=$TAG" \
  --quiet

note "Deploying separate service $SERVICE; no existing service changed."
gcloud run deploy "$SERVICE" \
  --project="$PROJECT" --region="$REGION" --platform=managed \
  --image="$IMAGE:$TAG" \
  --service-account="$IDENTITY" \
  --port=8080 --cpu=1 --memory=512Mi \
  --min-instances=0 --max-instances=1 \
  --concurrency=20 --timeout=60 \
  --ingress=all --allow-unauthenticated \
  --labels=zenit_scope=ui-core,zenit_purpose=visual-preview \
  --quiet

URL=$(gcloud run services describe "$SERVICE" \
  --project="$PROJECT" --region="$REGION" --format='value(status.url)')
case "$URL" in
  https://*.run.app) ;;
  *) die "Unexpected preview URL after deployment: $URL" ;;
esac
HEALTH=$(curl --fail --silent --show-error --retry 3 --retry-delay 3 \
  "$URL/__zenit_health") ||
  die "Preview exists but health probe failed. DO NOT blindly retry --deploy."
[ "$HEALTH" = ok ] ||
  die "Preview exists but health returned unexpected content."
note "Preview deployed and health endpoint verified."
printf 'PREVIEW_URL=%s\nPREVIEW_COMMIT=%s\nPREVIEW_SERVICE=%s\n' \
  "$URL" "$COMMIT" "$SERVICE"
