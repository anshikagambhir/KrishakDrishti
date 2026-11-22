# Security & privacy warnings

## Scope

KrishakDrishti is a **public demo MVP**, not a production platform suitable for personal data, financial transactions, connected pumps, or protected farmland telemetry.

- The original uploaded archive contained `.env` values, including apparent provider credentials. This clean deliverable excludes those files and any local database/old uploaded photos. **Rotate/revoke any credential exposed via shared archives, Git history, screenshots or deployment logs.** In particular, revoke a leaked Supabase `service_role` key because it bypasses Row Level Security.
- Never put provider secrets in Next.js `NEXT_PUBLIC_*` variables.
- Production requests default to read/write denied except `/api/health` when `DEMO_MODE` is not enabled. `DEMO_MODE=true` is deliberately an insecure public demo using fictional seed records, not real authentication.
- Demo identity switcher is not user authentication, and demo tokens are not credentials. For real users, integrate authenticated sessions (e.g., Supabase Auth), signed sessions and route-level ownership checks before enabling production writes or reading private records.
- Device tokens are removed from general list responses; real-device ingestion still requires a device-specific bearer token. Replace all old device secrets when moving from demo to real hardware.
- WhatsApp webhook validates Meta's HMAC SHA-256 signature when `META_APP_SECRET` is configured. No real outbound WhatsApp send integration is claimed. The IVR simulator is not a verified telephony integration.
- File uploads are capped and constrained by MIME type, but full content scanning, object-store policies, throttling, provider quotas and per-user access controls still need implementation before public real-user use.
- No user-supplied local data or previous image uploads are bundled in this upgraded release.

## Vercel limitations

Vercel cannot act as a durable farmer database, image repository, realtime Socket.IO server, or persistent cross-device drone session host without external services. The in-memory/JSON fallback is for prototype demonstration only. A real release needs a durable SQL-backed store, secure object storage, and appropriate background/event architecture.
