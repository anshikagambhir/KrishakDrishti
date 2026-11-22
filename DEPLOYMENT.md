# KrishakDrishti — Deployment & Operations Guide

This guide provides deployment instructions for KrishakDrishti across local development, Docker Compose containerization, and dual-service Vercel deployment.

---

## 1. Local Development (Dual Process)

Requires **Node.js 20+** or **Node.js 24+**.

### Terminal 1: Backend API (Port 5000)
```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

### Terminal 2: Frontend Next.js App (Port 3000)
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The Next.js frontend proxies `/api/*` and `/uploads/*` requests to `http://localhost:5000` via server-side rewrites.

---

## 2. Docker Compose Deployment (Single Command)

A production-ready `docker-compose.yml` is provided at the repository root:

```bash
# Build and start both services in background
npm run docker:up

# Stop all services
npm run docker:down
```

- **Frontend**: Exposed on port `3000`
- **Backend**: Exposed on port `5000`
- **Volume Mounts**: Uploads and JSON data stores are persisted to `./backend/data`

---

## 3. Dual-Project Vercel Deployment

KrishakDrishti is designed as a decoupled two-service architecture:

### Step 1: Deploy Backend Service
1. Connect the GitHub repository to Vercel.
2. Select Root Directory: **`backend`**.
3. Framework Preset: **Other** (Express REST entrypoint: `api/index.ts`).
4. Build Command: `npm run build`.
5. Environment Variables:
   - `DEMO_MODE=true` (Required for public portfolio demo)
   - `IOT_SIMULATOR_ENABLED=false` (Serverless functions should not run interval loops)
   - `GEMINI_API_KEY` (Optional: your Google Gemini API key)
   - `FRONTEND_ORIGIN=https://<your-frontend>.vercel.app`
6. Verify deployment by checking `https://<backend-project>.vercel.app/api/health`.

### Step 2: Deploy Frontend Next.js App
1. In Vercel, create another project importing the same GitHub repository.
2. Select Root Directory: **`frontend`**.
3. Framework Preset: **Next.js**.
4. Environment Variables:
   - `BACKEND_URL=https://<backend-project>.vercel.app` (do not add trailing slash)
5. Deploy and visit `https://<frontend-project>.vercel.app`.

---

## 4. Verification & Quality Assurance Pipeline

Execute the comprehensive quality gate locally or in CI:

```powershell
# Run the complete test and build pipeline
npm run check
```

This automated command executes:
1. `build:backend`: TypeScript compilation (`tsc`)
2. `backend:smoke`: 6 HTTP security smoke checks (identity masking, token privacy, webhook signature)
3. `test:backend`: 59 unit, integration, and E2E tests across 7 test suites
4. `test:frontend`: 17 frontend tests (A11y, API client, and 23-language localization)
5. `typecheck`: Strict TypeScript validation (`tsc --noEmit`)
6. `verify:images`: Verification of all 11 static image assets
7. `build:frontend`: Next.js 16.4.6 Turbopack production build with 16 prerendered routes
