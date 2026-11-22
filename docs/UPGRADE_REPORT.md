# Production-readiness audit · KrishakDrishti

## Fixes applied

1. **Clean source export:** Excluded all `.env` files, source Git history, installed dependencies, Windows-local Vercel project metadata, personal/test uploads, local JSON data and tunnel state.
2. **Explicit demo/production boundary:** Backend defaults to denying all API endpoints (except health) in production without `DEMO_MODE=true`. This avoids accidental exposure of unprotected live farmer data. Public demo is labelled as such in the UI.
3. **Account-role hardening:** Demo signup cannot self-assign elevated roles. Profile enumeration no longer exposes phone numbers; fictitious demo sessions are not presented as real authentication.
4. **Device credentials:** Device API no longer returns private tokens in device listings, and new tokens use cryptographic randomness instead of `Math.random()`.
5. **Marketplace privacy:** Fictional listings do not expose phone numbers or open WhatsApp chats to potentially real phone numbers; UI now displays an explanation.
6. **Webhook:** Removed static verification token and added Meta signature verification against the raw request body when a secret exists.
7. **Uploads:** Reduced photo upload limits and MIME checks; on Vercel, transient data URLs avoid writes to read-only serverless filesystem. This is **not persistent storage**.
8. **Vercel runtime:** Disabled background simulator on serverless; removed stale development tunnel and hardcoded private Wi-Fi upload URLs. Local data-store writes are skipped on Vercel.
9. **Frontend API:** Consistent same-origin API/asset routing through Next.js `BACKEND_URL` rewrites. Added visible status banner and small-screen navbar layout fix.
10. **Error handling:** Reduced exposed internal error details in production and added basic security headers.
11. **CI and checks:** Added local HTTP smoke tests, improved CI jobs, and adjusted outdated provider-model/weather-status assertions to recognize valid fallbacks.
12. **Docs:** Replaced misleading production-ready claims with explicit feature status, two-project Vercel instructions and security limitations.

## Verified in this environment

- Backend TypeScript `tsc --noEmit`: passed.
- Frontend TypeScript `tsc --noEmit`: passed.
- Backend TypeScript production compile: passed.
- 6 local HTTP smoke assertions: passed. Includes health, demo identity response masking, device tokens, marketplace demo safety, signup permissions and unsigned webhook rejection.
- Core backend suite: **23/23 tests passed** after fixing fallback-weather caching and outdated model/provider assertions (tests compiled to JS using the local TypeScript compiler and run using Node's test runner). Live provider connections were not required.
- Full Next.js build **not independently completed in this environment** because uploaded `node_modules` include Windows binaries and internet access was unavailable for a Linux SWC binary. Run `npm ci && npm run build` in a fresh network-enabled environment or CI.

## Still requires external setup / engineering

- **Frontend and backend each need their own Vercel deployment**, with `BACKEND_URL` configured.
- **No durable Vercel persistence:** farm CRUD, diagnosis uploads, device simulation state and drone sessions may reset on cold starts or across instances. Supabase mirroring does not supply a real synchronized database layer. Do not store real users' data in the demo.
- **No secure production authentication:** demo profile selection is intentionally public. Real multi-user access requires authenticated sessions, authorization and robust ownership checks on all APIs.
- **No live provider guarantees:** Gemini, weather, Mandi, Meta, Twilio, and Supabase integration need authenticated accounts, provider approvals/quotas and live tests. The demo uses documented fallbacks.
- **No physical drone/IoT validation:** serverless cannot sustain multi-device Socket.IO sessions or physical actuator control. A dedicated backend and secure device provisioning are needed.
- **No measured real-device browser responsiveness or Lighthouse score.** Check visually after deployment.

**This release is safer and clearer for a portfolio/demo, not a fully secure production agriculture service.**
