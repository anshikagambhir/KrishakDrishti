# KrishakDrishti — Vercel Deployment

## Reality check

This is a **two-service prototype**. A frontend-only deployment will display the UI but backend-dependent features will not work. Vercel hosts individual serverless functions; it does not provide persistent local disks or durable Socket.IO connections. The Vercel configuration is appropriate for **public demonstration**, not permanent farmer records or physical hardware sessions.

## 1. Push the clean repository

Extract the ZIP. **Do not commit any `.env` files, `node_modules`, `.git`, previous uploaded photos, or `backend/data/krishak_db.json`.** For an existing GitHub repo, copy the code into the clone to preserve history.

## 2. Create Backend Vercel project

- Import the same GitHub repository into a new Vercel project.
- Root Directory: **`backend`**.
- Framework Preset: **Other** (Express REST API entrypoint: `api/index.ts`).
- Build Command: **`npm run build`**.
- Required environment variable: `DEMO_MODE=true` for public, synthetic-data demonstration.
- Optional: `GEMINI_API_KEY` (server-side only), `GEMINI_MODEL=gemini-2.5-flash`, `FRONTEND_ORIGIN=https://<frontend-project>.vercel.app`, `FRONTEND_PUBLIC_URL=https://<frontend-project>.vercel.app`, `WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET` if running a verified Meta webhook.
- Leave `SUPABASE_SERVICE_ROLE_KEY` unset in demo. The current Supabase store is not a fully synchronized persistent database.
- Set `IOT_SIMULATOR_ENABLED=false`; serverless requests still support the manual demo simulator tick, but no background interval.
- Deploy and visit **`https://<backend-project>.vercel.app/api/health`**. Verify `features.demoMode: true`.

**Security:** `DEMO_MODE=true` intentionally exposes fictional data and demo write endpoints. **Never enable it for real user/farm records.** `DEMO_MODE=false` fails closed because verified production authentication is not yet implemented.

## 3. Create Frontend Vercel project

- Import the same GitHub repository again, as a separate Vercel project.
- Root Directory: **`frontend`**.
- Framework Preset: **Next.js**.
- Environment variable **`BACKEND_URL=https://<backend-project>.vercel.app`** (no trailing `/api`, no trailing slash).
- No `NEXT_PUBLIC_API_URL` is needed: the frontend proxies its API to the backend at build-time.
- Deploy, then open the website. Banner should indicate backend online (or provide a visible configuration error).

**Critical:** If you change `BACKEND_URL`, redeploy the frontend so the Next.js rewrites update.

## 4. Basic final checks

- `https://<frontend>/api/health` returns API health, not an HTML 404.
- Dashboard loads; profile chooser uses only demo identities.
- Mandi/weather statuses identify fallback/benchmark values rather than claiming real-time if providers are inaccessible.
- Device controls are simulator-only; no real actuator is operated.
- Phone-camera/drone image sessions are short-lived and **will not persist/reliably sync between Vercel invocations**. Use a long-lived API host + Supabase Storage/DB for a real phone-to-laptop drone workflow.

## 5. Local check commands

```bash
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix backend run smoke
npm --prefix frontend run typecheck
npm --prefix frontend run build
```

See [SECURITY.md](SECURITY.md) before making the application publicly accessible.
