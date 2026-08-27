# Next.js Storefront: Docker and Docker Hub Handbook

This project uses one production image for local verification, Docker Hub, and the future Hetzner server. Keep using `npm run dev` for daily macOS development; use Docker to reproduce production.

## 1. What was broken

The old runner copied standalone output, installed packages again under `NODE_ENV=production`, copied the source tree, and ran `npm run dev`. Production installs omit `@tailwindcss/postcss`, while `next dev` requires it. It also created user `app`, copied files as nonexistent `nextjs:nodejs`, and exposed port `5173` instead of `3000`.

The corrected image builds once with locked dependencies and copies only the traced runtime output into a non-root runner.

## 2. Files

| File | Responsibility |
| --- | --- |
| `Dockerfile` | Multi-stage standalone production image |
| `.dockerignore` | Excludes secrets, local output, Git data, and documentation |
| `compose.yaml` | Runs the production image locally against host Laravel |
| `.github/workflows/CI.yaml` | Lint, route-aware typecheck, and production build |
| `.github/workflows/docker-publish.yaml` | Multi-platform Docker Hub publication |

Official references:

- [Next.js Docker deployment](https://nextjs.org/docs/app/getting-started/deploying#docker)
- [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [Docker GitHub Actions](https://docs.docker.com/build/ci/github-actions/)
- [Docker Hub access tokens](https://docs.docker.com/security/for-developers/access-tokens/)
- [Push images to Docker Hub](https://docs.docker.com/docker-hub/repos/manage/hub-images/push/)

## 3. Prerequisites

Install and start Docker Desktop:

```bash
docker version
docker compose version
```

Run Laravel on the host:

```bash
php artisan storage:link
php artisan serve --host=0.0.0.0 --port=8000
```

Only expose this development server on a trusted local network.

Laravel's local development media settings should be:

```dotenv
FILESYSTEM_DISK=public
MEDIA_DISK=public
MEDIA_CONVERSIONS_DISK=public
LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK=local
```

Spatie writes originals and conversions under `storage/app/public`. The
`public/storage` symlink exposes them at `http://localhost:8000/storage/*`.
Livewire temporary uploads stay private under `storage/app/private/livewire-tmp`
until the form moves accepted media into Spatie's public collection.

## 4. Local Compose workflow

From the storefront repository:

```bash
docker compose up --build
```

Open `http://localhost:3000`.

Compose defaults to:

```text
LARAVEL_API_URL=http://host.docker.internal:8000
MEDIA_BASE_URL=http://host.docker.internal:8000
```

`host.docker.internal` means the host machine from inside the container. The Compose file also maps Docker's host gateway for Linux compatibility.

Useful commands:

```bash
docker compose ps
docker compose logs --follow storefront
docker compose exec storefront id
docker compose down
```

`id` should report UID `1001`, confirming the process is non-root.

Background mode:

```bash
docker compose up --build --detach
docker compose ps
```

If port 3000 is occupied:

```bash
STOREFRONT_PORT=3001 docker compose up --build
```

## 5. Local configuration overrides

Compose reads shell variables or a local `.env`, which Git ignores:

```dotenv
STOREFRONT_PORT=3000
LARAVEL_API_URL=http://host.docker.internal:8000
MEDIA_BASE_URL=http://host.docker.internal:8000
```

These are service origins, not credentials. Never add API keys or Docker tokens here.

## 6. Run without Compose

Build:

```bash
docker build \
  --build-arg LARAVEL_API_URL=http://host.docker.internal:8000 \
  --build-arg MEDIA_BASE_URL=http://host.docker.internal:8000 \
  --tag kokkonis-storefront:local \
  .
```

Run:

```bash
docker run --rm \
  --name kokkonis-storefront \
  --publish 3000:3000 \
  --add-host host.docker.internal:host-gateway \
  --env LARAVEL_API_URL=http://host.docker.internal:8000 \
  --env MEDIA_BASE_URL=http://host.docker.internal:8000 \
  kokkonis-storefront:local
```

## 7. Why URLs are supplied twice

- Runtime values tell server-rendered Next.js code where Laravel currently lives
  and rebase Laravel-generated media URLs onto the container-reachable origin.
- Build values configure `next/image` remote origins because `next.config.ts` is serialized during `next build`.

Runtime variables can change the API address. If a new API or media hostname serves images, rebuild the image with that hostname allowed. Inside Docker, do not use `localhost:8000` for host Laravel; `localhost` means the container itself.

## 8. GitHub workflows

### CI Storefront

Runs on pushes to `develop` and `main`, pull requests targeting `main`, and manual dispatch. It executes:

```text
npm ci
npm run lint
npm run typecheck
npm run build
```

The typecheck script runs `next typegen` before `tsc`, so clean runners receive `PageProps` and `LayoutProps`.

### Publish Storefront Image

Runs on `main`, tags such as `v1.0.0`, and manual dispatch. It never publishes from pull requests or ordinary `develop` pushes.

It builds:

```text
linux/amd64
linux/arm64
```

This supports standard Hetzner x86 servers and Apple Silicon/ARM machines.

## 9. Create the public Docker Hub repository

1. Sign in to [Docker Hub](https://hub.docker.com/).
2. Select **Create repository**.
3. Name it `kokkonis-storefront`.
4. Select **Public** visibility.
5. Create it.

The image name becomes:

```text
YOUR_DOCKERHUB_USERNAME/kokkonis-storefront
```

Public users can pull anonymously. Publishing still requires authentication.

## 10. Configure Docker Hub and GitHub

In Docker Hub, open **Account settings → Personal access tokens**. Create a GitHub Actions token with Read/Write permission. Use this token, not your password.

In GitHub open:

```text
Settings → Secrets and variables → Actions → Secrets
```

Create:

```text
DOCKERHUB_USERNAME = your Docker Hub username
DOCKERHUB_TOKEN    = your Read/Write access token
```

Under **Variables**, create:

```text
LARAVEL_API_URL = the API URL compiled into the published image
MEDIA_BASE_URL  = the public R2/CDN media URL
```

The workflow has development fallbacks, but set real production origins before the Hetzner release.

## 11. Commit so Actions can see the setup

The Docker files were previously staged while empty and edited afterward. Restage the completed snapshots:

```bash
git status
git diff
git diff --cached

git add \
  Dockerfile \
  .dockerignore \
  compose.yaml \
  next.config.ts \
  package.json \
  package-lock.json \
  .github/workflows/CI.yaml \
  .github/workflows/docker-publish.yaml \
  docs/docker-storefront.md \
  prompts/storefront-docker-ci-docker-hub.md

git diff --cached
git commit -m "Add storefront Docker publishing pipeline"
git push origin develop
```

CI runs on `develop`. Publishing intentionally waits for `main`, a version tag, or manual dispatch. If a workflow is missing in GitHub, verify its YAML file exists in the remote branch, not only locally.

## 12. Publish through GitHub Actions

Recommended flow:

1. Validate on `develop`.
2. Merge into `main`.
3. The `main` push publishes `latest` and `sha-<commit>`.

Versioned release:

```bash
git checkout main
git pull --ff-only
git tag -a v1.0.0 -m "Storefront v1.0.0"
git push origin v1.0.0
```

This publishes `1.0.0` and `1.0` tags. Manual publication is available under **Actions → Publish Storefront Image → Run workflow**.

## 13. Verify the public image

```bash
docker pull YOUR_USERNAME/kokkonis-storefront:latest

docker run --rm \
  --name kokkonis-storefront-public \
  --publish 3000:3000 \
  --add-host host.docker.internal:host-gateway \
  --env LARAVEL_API_URL=http://host.docker.internal:8000 \
  --env MEDIA_BASE_URL=http://host.docker.internal:8000 \
  YOUR_USERNAME/kokkonis-storefront:latest

docker buildx imagetools inspect YOUR_USERNAME/kokkonis-storefront:latest
```

## 14. Optional direct local push

GitHub Actions is preferred because it creates both architectures and traceable tags. For a quick single-architecture push:

```bash
docker login --username YOUR_USERNAME
docker tag kokkonis-storefront:local YOUR_USERNAME/kokkonis-storefront:manual
docker push YOUR_USERNAME/kokkonis-storefront:manual
```

Paste the access token when prompted. Never put it directly in shell history.

## 15. Troubleshooting

### `Cannot find module '@tailwindcss/postcss'`

An old image is running. Confirm the final Docker command is `node server.js`, then:

```bash
docker compose down
docker compose build --no-cache storefront
docker compose up storefront
```

### Workflow does not run

Confirm the workflow is committed under `.github/workflows/`, GitHub Actions is enabled, and the branch matches its trigger. Publishing requires `main`, a `v*.*.*` tag, or manual dispatch.

### Docker Hub authentication fails

Recreate the token with Read/Write permission. The username must be the Docker account name, not an email. Confirm the public repository belongs to that account.

### Storefront cannot reach Laravel

Confirm Laravel listens on port 8000, inspect `docker compose logs storefront`, and use `host.docker.internal`. On Linux, bind Laravel to `0.0.0.0`.

### Uploaded image is missing

Run `php artisan storage:link` in Laravel, confirm the file exists under
`storage/app/public`, and clear cached configuration with `php artisan optimize:clear`.
Do not set `LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK=s3` for this local setup; that
would send the browser's temporary upload to S3/R2 before Spatie receives it.

### Remote image hostname is rejected

Update GitHub variables `LARAVEL_API_URL` and `MEDIA_BASE_URL`, then rebuild. Next.js image origins are serialized during build.

## 16. Hetzner follow-up

The next production phase should add a non-root server user, Docker Engine/Compose, a private application network, PostgreSQL and Laravel workers, Caddy or Nginx for TLS, firewall rules, server-side env files outside Git, backups, health monitoring, and rollback to immutable version tags. Do not expose the standalone Next.js server directly without a reverse proxy.
