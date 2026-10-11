# Cloud Run deployment preparation (not yet activated)

This directory contains the static-serving configuration for the public Design Lab frontend.

- Multi-stage Docker build: Node.js 22 builds Vite; nginx serves static files on port 8080.
- Health endpoint: `/healthz`.
- No Laravel API, database, customer assets, credentials, or runtime environment variables.
- Build locally with `docker build -t zenit-design-lab:local .` and test with `docker run --rm -p 8080:8080 zenit-design-lab:local`.
- The frontend root is `/`. Storybook is built in CI but not served by this container.
- No cloud resources, billing changes, service accounts, IAM permissions, or deployment workflows are created by this PR.

Before deployment: verify the existing GCP project, Artifact Registry repository, CI identity and required permissions; confirm regional resource costs, billing budget alerts and scaling limits; explicitly authorize any cloud resource creation and public ingress. Use a distinct Cloud Run service name (e.g. `zenit-design-lab`), keep the Platform LABS service unchanged, and pin base images by digest for production deployment.
