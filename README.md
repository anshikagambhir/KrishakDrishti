# KrishakDrishti · कृषक दृष्टि

**A responsive agricultural-intelligence demonstration for Indian farmers and FPOs**

A Next.js 14 / React 18 dashboard backed by an Express + TypeScript API. The prototype combines crop-photo analysis, field mapping, weather conditions, mandi benchmarking, simulated IoT sensor telemetry, marketplace listings, multilingual assistance, and drone survey workflows.

> **Demo disclaimer:** Sample farmers, phone numbers, listings, device readings, and survey workflows are simulations. Weather and mandi data must be identified by their provider-reported status. Crop AI analysis is preliminary, not verified agronomic advice. Hardware/WhatsApp/IVR integrations are not physically provisioned by this repository.

## Screens

Dashboard · Farms · Field Map · Crop Health · Drone Scanner · Virtual Drone · Devices · Weather · Mandi Prices · Marketplace · Alerts · AI Assistant · FPO Hub · Profile.

## What is implemented

| Feature | Code | Current status |
|---|---|---|
| Farmer dashboard and navigation | `frontend/src/app`, `src/components` | Implemented UI, depends on backend |
| Farm/field management | `backend/src/routes/farms.ts` | Demo CRUD; local JSON / transient on Vercel |
| Crop pathology upload | `backend/src/routes/cropHealth.ts` | Gemini when configured, rule-based fallback otherwise |
| Weather forecasts | `backend/src/services/weatherService.ts` | Open-Meteo attempt; explicitly labelled fallback if unavailable |
| Mandi comparison | `backend/src/services/mandiService.ts` | Demo benchmark when live data API unavailable |
| IoT dashboard | `backend/src/routes/iot.ts` | Simulation; **not physical pump control** |
| Drone scanning | `backend/src/routes/droneScanner.ts` | Demo image processing; Vercel sessions ephemeral |
| Marketplace | `backend/src/routes/marketplace.ts` | Fictional seed listings; direct seller contact disabled in demo |
| WhatsApp & voice | `backend/src/routes/whatsapp.ts`, `voice.ts` | Simulators, no production delivery guarantee |
| Database | `backend/src/db/store.ts` | Local JSON for development, ephemeral Vercel demo. Supabase mirror is **not** a production database implementation |

## Local development

Requires Node.js 20 or later.

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. The Next.js server proxies `/api/*` and `/uploads/*` to `BACKEND_URL` (by default `http://localhost:5000`). **Do not place API secrets in any `NEXT_PUBLIC_*` variable.**

## Quality checks

```bash
npm --prefix backend run build
npm --prefix backend run smoke
npm --prefix frontend run typecheck
npm --prefix frontend run build
```

Backend smoke tests are local-only and do not require live credentials. Continuous integration also runs backend unit tests. `npm run smoke` intentionally starts an ephemeral in-process API without persisted farmer data.

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)**. For Vercel, this repository uses **two projects** (backend root `backend`, frontend root `frontend`). Set backend `DEMO_MODE=true`, and frontend `BACKEND_URL=https://<your-api-domain>`. Both projects must be deployed; deploying the Next.js folder alone leaves API features offline.

## Important limitations

- **Not safe as a production multi-user platform:** Current account switching is a demo identity selector, not secure user authentication or verified role-based access. Write operations are disabled by default in production unless `DEMO_MODE=true` is explicitly set. Real deployment needs authenticated identities, authorization at every route, and a persistent database.
- **Serverless persistence:** Vercel does not persist uploaded photos, active drone sessions, local database writes or Socket.IO connections. Files may be processed transiently but vanish after cold starts; cross-device pairing is not reliable on serverless. Use object storage, a real database and a long-lived backend for those features.
- **Third-party providers:** Gemini, data.gov.in, Supabase, WhatsApp Business and voice gateways require the owner's credentials/accounts, usage limits and live verification.
- **Provider availability:** Public weather/price APIs can fail; fallback data is **not live**.
- **Advisory safety:** Always consult local KVK/agricultural experts before applying field treatments.

## Security

Never commit `.env`, `.git`, uploaded customer photos, provider tokens or local database files. This upload originally contained environment files, which are **intentionally excluded** from this clean deliverable. **Rotate any keys that were ever included in a shared ZIP or committed to GitHub history**. See [SECURITY.md](SECURITY.md).

## Engineering changes

See [docs/UPGRADE_REPORT.md](docs/UPGRADE_REPORT.md) for concrete fixes and verification boundaries.
