# Storefront Docker, CI, and Docker Hub Publishing

## Goal

Replace the mixed development/production Docker setup with a minimal, non-root Next.js 16 standalone production image; make that exact image easy to build and run locally against the Laravel API; strengthen the existing GitHub CI workflow; add a separate Docker publishing workflow that creates multi-architecture images and pushes them to a public Docker Hub repository; and document every local and GitHub/Docker Hub setup step for a solo developer.

## Language agreed on

- **Local Docker run**: run the production standalone image locally on port `3000`, while Laravel continues to run on the host machine and is reached from the container through `host.docker.internal`.
- **CI**: validate source code on pushes to `develop` and `main`, and on pull requests to `main`, without publishing an image.
- **CD / Docker publish**: build and push an immutable container from `main`, semantic version tags, or a manually dispatched workflow.
- **Public image**: Docker Hub repository visibility is public; GitHub uses a scoped Docker Hub access token to push, while anyone may pull without credentials.
- **Production image**: `next build` output with `output: "standalone"`, served by `node server.js` as a non-root user. It never runs `next dev` or installs dependencies at runtime.

## Failure diagnosis

This is Failure Mode 1: a specific container/workflow configuration is broken.

### Root causes

- The current runner stage mixes two incompatible models: it copies `.next/standalone`, then copies source and package files, runs `npm install` under `NODE_ENV=production`, and starts `npm run dev`.
- `NODE_ENV=production` omits development dependencies, so the development server cannot resolve `@tailwindcss/postcss`. The pasted ESLint 9.5 warning also comes from the container resolving a stale dependency set instead of using the current lockfile-only production build.
- The runner creates user/group `app`, but standalone assets are copied with ownership `nextjs:nodejs`, which do not exist in that Dockerfile.
- The runner exposes port `5173`, while Next.js defaults to `3000` and the standalone server should be explicitly configured for `3000`.
- The current repository has only `.github/workflows/CI.yaml`; there is no Docker build/push workflow.
- `Dockerfile` and `.dockerignore` are staged as empty files and modified only in the working tree (`AM`). GitHub Actions can only see committed and pushed content.

## Relevant files inspected

- `AGENTS.md`
- `CLAUDE.md`
- `Dockerfile`
- `.dockerignore`
- `.gitignore`
- `.env.example`
- `next.config.ts`
- `package.json`
- `package-lock.json`
- `postcss.config.mjs`
- `tsconfig.json`
- `.github/workflows/CI.yaml`
- `lib/api/client.ts`
- Installed Next.js 16.3.2 deployment, self-hosting, environment-variable, and standalone-output documentation
- Official Docker GitHub Actions, Buildx, Docker Hub token, and image-publishing guidance
- Official GitHub Actions workflow-trigger guidance

## Laravel/API contract

No Laravel code or API response changes are required.

Runtime variables:

- `LARAVEL_API_URL`: server-side address used by the container to call Laravel.
- `MEDIA_BASE_URL`: public media origin used by Next.js image handling.

Local container defaults:

- `LARAVEL_API_URL=http://host.docker.internal:8000`
- Existing public R2 media URL from `.env.example`

The Docker build also receives both values because `next.config.ts` serializes remote image patterns during `next build`. When the production Laravel/media hosts change, update the GitHub repository variables and rebuild the image.

## Implementation decisions

### Dockerfile

- Use `node:22-alpine` and Dockerfile syntax v1.
- `deps` stage: copy only package manifests and run deterministic `npm ci`, including build-time development dependencies.
- `builder` stage: copy installed modules and source; set telemetry off; accept non-secret URL build arguments; run `npm run build` once.
- `runner` stage: set `NODE_ENV=production`, port `3000`, and hostname `0.0.0.0`; create UID/GID `1001` non-root `nextjs/nodejs`; copy only `public`, `.next/standalone`, and `.next/static`; start `node server.js`.
- Do not run `npm install`, copy source, or use `next dev` in the runner.
- Do not bake credentials or `.env` files into any layer.

### Local Compose workflow

- Add `compose.yaml` as the simple local production-image runner.
- Build/tag `kokkonis-storefront:local` for the host architecture.
- Map `3000:3000`.
- Supply local Laravel and media URLs at build and runtime.
- Add `host.docker.internal:host-gateway` for Linux compatibility; Docker Desktop already supports the hostname.
- Add a lightweight health check against the local Next.js server.

### CI workflow

- Preserve pushes to `main` and `develop`, and pull requests to `main`.
- Keep dependency caching and deterministic `npm ci`.
- Run `npm run lint`, `npm run typecheck`, and `npm run build`.
- Give the workflow a manual `workflow_dispatch` trigger so it can be tested from the Actions tab.
- Keep least-privilege read permissions and concurrency cancellation.

### Docker Hub workflow

- Add `.github/workflows/docker-publish.yaml`.
- Trigger on `main`, tags matching `v*.*.*`, and manual dispatch. Do not publish from pull requests or ordinary `develop` pushes.
- Use official checkout, QEMU, Buildx, Docker login, metadata, and build/push actions.
- Authenticate with repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
- Publish `${DOCKERHUB_USERNAME}/kokkonis-storefront` for `linux/amd64` and `linux/arm64`.
- Generate `latest` only for the default branch, `sha-<short-sha>` for traceability, and semantic-version tags for Git tags.
- Use GitHub Actions layer caching and attach provenance/SBOM metadata.
- Pass non-secret repository variables `LARAVEL_API_URL` and `MEDIA_BASE_URL` as build arguments, with safe development fallbacks.

## Files expected to change

- `Dockerfile`
- `.dockerignore`
- `compose.yaml` (new)
- `.github/workflows/CI.yaml`
- `.github/workflows/docker-publish.yaml` (new)
- `docs/docker-storefront.md` (new step-by-step handbook)

`next.config.ts` already has `output: "standalone"`; only normalize its formatting if needed. No dependency or application-code change is planned.

## Security

- Never commit Docker Hub tokens, Laravel credentials, R2 credentials, `.env`, or GitHub secrets.
- Use a Docker Hub personal access token with Read/Write scope, not the account password.
- Public repository visibility affects pulls, not whether push credentials are needed.
- Run the image as non-root and copy only runtime artifacts.
- Keep GitHub workflow permissions at `contents: read`.
- Treat Laravel/media URLs as public configuration, not secrets.
- A future Hetzner deployment should place a reverse proxy/TLS layer in front of the container rather than expose Next.js directly.

## Performance

- Use standalone output to avoid shipping the complete source tree and development dependencies.
- Use multi-stage builds and BuildKit cache mounts/layer caching where compatible.
- Keep package manifest copying before source copying to preserve dependency layers.
- Use GitHub Actions cache for Buildx.
- Do not use Docker for hot-reload development on macOS; use it to reproduce and test the production artifact, matching installed Next.js guidance.

## Error and empty states

- The container build fails immediately if `npm ci` or `next build` fails.
- The publish job never runs on a pull request.
- Missing Docker Hub credentials make only the publish workflow fail with a documented configuration step; they are not given fallbacks.
- Laravel unavailability continues to use the storefront's existing friendly server-rendered fallbacks; Docker does not conceal application errors.

## Acceptance criteria

- `docker build` completes using the lockfile and includes PostCSS only in the build stage.
- Runtime image contains no development server or runtime dependency installation.
- Container runs as non-root and responds on `http://localhost:3000`.
- Container reaches Laravel running on the host.
- `docker compose up --build` starts the same production image locally.
- CI can be manually dispatched and runs lint, typecheck, and production build.
- Docker workflow is visible in GitHub Actions after commit/push.
- Main pushes publish `latest` and `sha-*`; version tags publish semantic tags.
- Docker Hub image supports `linux/amd64` and `linux/arm64` and is publicly pullable.
- No secret is present in Git history, image layers, workflow output, or committed environment files.

## Checks to run after approval

- `npm run ci:check`
- `docker build --tag kokkonis-storefront:local .`
- `docker compose config`
- `docker compose up --build --detach`
- Inspect container user, health, logs, and `http://localhost:3000`
- `docker compose down`
- Validate workflow YAML structure and inspect the final diff

Docker Hub push itself will not be performed locally without the user's authenticated Docker account and explicit approval. The GitHub workflow will be prepared to perform it after secrets are configured and the changes are committed to the triggering branch.

## Manual rollout

1. Create `DOCKERHUB_USERNAME/kokkonis-storefront` on Docker Hub and select **Public**.
2. Create a Docker Hub access token with Read/Write permission.
3. Add GitHub Actions secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
4. Add GitHub repository variables `LARAVEL_API_URL` and `MEDIA_BASE_URL` for the image's allowed production origins.
5. Commit the complete files again (the current staged empty versions must be restaged), then push `develop` to verify CI.
6. Merge/push to `main` or manually dispatch the Docker workflow to publish.
7. Confirm Docker Hub displays both architectures and the expected tags.
8. Pull anonymously and run the published image locally.
