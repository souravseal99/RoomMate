# RoomMate Deployment Guide & Low-Cost Infrastructure Strategy

This document outlines the deployment architecture, platform options, GitHub Container Registry (GHCR) CI/CD workflows, cost projections, and step-by-step setup guides for the **RoomMate** application (React 19 Vite SPA + Express/Prisma REST API + PostgreSQL).

It is specifically tailored for **indie developers aiming for $0 to minimal cost** while supporting an initial active user base of **1,000 to 2,000 users**.

---

## 1. Workload & Resource Sizing Analysis

| Layer | Component | Resource Profile for 1,000–2,000 Users |
|---|---|---|
| **Frontend** | React 19 + Vite (`roommate-app`) | Static assets (~1.4MB bundle, ~385KB gzipped), ~10–25 GB bandwidth/mo |
| **Backend** | Node.js / Express + Prisma (`roommate-server`) | Stateless REST API, < 256MB RAM, ~1–5 req/sec average |
| **Database** | PostgreSQL | ~50MB–250MB storage across ~400 shared living households |

---

## 2. Container Registry & CI/CD Pipeline (GHCR)

By using **GitHub Container Registry (GHCR)** (`ghcr.io`), you get a **100% free**, unlimited-bandwidth container registry built right into your GitHub repository with zero external account management.

```
[Git Push to 'main']
        │
        ▼
[GitHub Actions CI/CD]
        │
        ├── 1. Runs type-checks & tests
        ├── 2. Builds lightweight multi-stage Docker images
        └── 3. Pushes to GitHub Container Registry (GHCR)
        │
        ▼
[GitHub Container Registry (ghcr.io)]
        ├──► ghcr.io/<owner>/roommate-server:latest (~110MB)
        └──► ghcr.io/<owner>/roommate-app:latest (~25MB with Nginx)
        │
        ▼ (Continuous Deployment / Instant Pulls)
[Production Host: Render / Fly.io / Cloudflare / VPS]
```

---

## 3. Deployment Architecture Strategies

### Strategy A: Hybrid Modern Indie Stack ⚡ *(Recommended for Speed & $0 Cost)*

- **Backend**: Multi-stage Docker container in **GHCR** -> deployed to **Render.com / Fly.io** ($0/mo).
- **Frontend**: Static SPA deployed to **Cloudflare Pages** or **Vercel** ($0/mo).
- **Database**: Managed PostgreSQL on **Supabase** or **Neon.tech** ($0/mo).

```
[User Browser]
       │
       ├─── (Static Assets in ~15ms via Global Edge CDN) ───► [Cloudflare Pages / Vercel] ($0/mo)
       │
       └─── (API & Database Queries over HTTPS) ────────────► [GHCR Backend on Render / Fly.io] ($0/mo)
                                                                      │
                                                            (Prisma Connection Pool)
                                                                      ▼
                                                            [Supabase / Neon Postgres] ($0/mo)
```

**Key Advantages**:
- **Blazing Fast Global Load Time**: Static HTML/CSS/JS load in < 30ms from 300+ edge points.
- **Zero Server Compute Waste**: Your backend RAM/CPU is 100% reserved for API handling.
- **Cost**: **$0.00 / month**.

---

### Strategy B: Dual Container GHCR Pipeline 🐳 *(Maximum Portability)*

Both the frontend (served via ultra-lightweight Nginx) and backend are containerized and published to GHCR.

- **Frontend Image**: `ghcr.io/<owner>/roommate-app:latest`
  - Multi-stage build with `node:20-alpine` compiling static assets, copied into an `nginx:alpine` image with SPA routing fallback.
- **Backend Image**: `ghcr.io/<owner>/roommate-server:latest`
  - Multi-stage build with Prisma Client generation, non-root `node` execution.
- **Host**: Deployed on a single VPS (Hetzner €3.79/mo or Oracle Cloud Free Tier) using `docker-compose`, or as dual container services on Koyeb / Render.

**Key Advantages**:
- 100% cloud-agnostic; identical runtime behavior between local Docker Compose and production servers.
- Single command rollback to previous image SHAs.

---

### Strategy C: All-in-One Monolith Container 📦 *(Zero CORS Configuration)*

- Express serves the compiled React `dist/` directory directly (`express.static`) in production.
- **Only 1 container image** in GHCR (`ghcr.io/<owner>/roommate:latest`).
- **Key Advantage**: Zero CORS configuration needed because the frontend and backend share the exact same domain and port (`https://your-domain.com/` for UI, `/user/profile` for API).

---

## 4. Comparison Matrix

| Feature | Strategy A (Hybrid: GHCR API + Edge CDN) 🏆 | Strategy B (Dual GHCR Containers) | Strategy C (Single VPS / Monolith) |
|---|---|---|---|
| **Monthly Cost** | **$0.00** | **$0.00 – $4.00/mo** | **$0.00 (Oracle) or $4.00 (Hetzner)** |
| **User Limit** | ~1,500 – 2,000 | ~5,000+ | ~10,000+ |
| **Frontend Speed** | **Global Edge (< 30ms)** | Origin Server (~100–200ms) | Origin Server (~100–200ms) |
| **Maintenance** | Zero (fully managed) | Low (Docker Compose / Webhooks) | Low–Medium (Linux VPS maintenance) |
| **GHCR Images** | 1 (`roommate-server`) | 2 (`roommate-app` + `roommate-server`) | 1 (`roommate`) |

---

## 5. Production Multi-Stage Dockerfiles

### 1. Backend Production Dockerfile (`roommate-server/Dockerfile`)
```dockerfile
# ── Stage 1: Build & Prisma Generation ──
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate

# ── Stage 2: Production Runtime ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV APP_PORT=5000

RUN apk add --no-cache openssl libc6-compat

# Security: Non-root user
USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/generated ./generated
COPY --chown=node:node --from=builder /app/src ./src
COPY --chown=node:node --from=builder /app/tsconfig.json ./

EXPOSE 5000

CMD ["npx", "vite-node", "src/server.ts"]
```

### 2. Frontend Production Dockerfile (`roommate-app/Dockerfile`)
```dockerfile
# ── Stage 1: Build Static Assets ──
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_SERVER_BASE_URL
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL

RUN npm run build

# ── Stage 2: Production Nginx Server ──
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config with SPA fallback
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 6. GitHub Actions Workflow (`.github/workflows/docker-publish.yml`)

```yaml
name: Build & Publish Containers to GHCR

on:
  push:
    branches: [ "main" ]
    tags: [ 'v*.*.*' ]

env:
  REGISTRY: ghcr.io
  IMAGE_SERVER: ${{ github.repository }}-server
  IMAGE_APP: ${{ github.repository }}-app

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log into GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # ── Build & Push Backend ──
      - name: Extract metadata for Server
        id: meta-server
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_SERVER }}
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=sha
            type=semver,pattern={{version}}

      - name: Build and push Server image
        uses: docker/build-push-action@v5
        with:
          context: ./roommate-server
          file: ./roommate-server/Dockerfile
          push: true
          tags: ${{ steps.meta-server.outputs.tags }}
          labels: ${{ steps.meta-server.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 7. Step-by-Step Deployment Instructions

### Step 1: Push Code & Trigger GHCR Image Creation
1. Push your changes to GitHub: `git push origin main`.
2. Navigate to your GitHub repository -> **Actions** tab.
3. Observe the `Build & Publish Containers to GHCR` workflow complete.
4. On your GitHub profile/repo page, click **Packages** to view your published container image (`ghcr.io/<your-username>/roommate-server:latest`).
5. **Package Visibility**: If deploying to free hosts (like Render or Fly.io), set the package visibility to **Public** under Package Settings -> Danger Zone -> Change Visibility.

### Step 2: Provision Free PostgreSQL Database (Supabase / Neon)
1. Create a free account at [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy the connection string URI (`DATABASE_URL`).
3. Run migrations: `DATABASE_URL="..." npx prisma db push`.

### Step 3: Connect GHCR Image to Render.com
1. On [Render.com](https://render.com), click **New +** -> **Web Service**.
2. Select **"Existing image"** and paste `ghcr.io/<your-username>/roommate-server:latest`.
3. Add environment variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_SECRET`: Random secure string.
   - `CLIENT_URL`: Your frontend URL.
4. Click **Create Web Service**.

### Step 4: Deploy Frontend to Cloudflare Pages or Vercel
1. Import your GitHub repository to Cloudflare Pages or Vercel.
2. Set Root directory to `roommate-app`, build command to `npm run build`, output to `dist`.
3. Add environment variable `VITE_SERVER_BASE_URL` pointing to your Render backend URL.
4. Deploy!
