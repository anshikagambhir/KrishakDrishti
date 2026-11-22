# KrishakDrishti — Security Architecture & Vulnerability Audit Report

## Audit Scope & Standards

This security assessment covers the KrishakDrishti precision agriculture full-stack repository against **OWASP Top 10:2021**, **CWE Top 25**, and Google Cloud / Vercel cloud security baselines.

---

## 1. Vulnerability Scan & Dependency Manifest Audit
- `npm audit --prefix backend`: **0 vulnerabilities** found.
- `npm audit --prefix frontend`: **0 vulnerabilities** found.
- Outdated or deprecated dependencies eliminated.

---

## 2. Authentication, Authorization & Identity Defense

### Risk 1: Privilege Escalation in Public Signup
- **Threat**: Attackers could submit `{ role: "admin" }` or `{ role: "fpo_coordinator" }` to `POST /api/auth/signup` to access administrative FPO or regulatory controls.
- **Remediation**: `routes/auth.ts` explicitly overrides any supplied role with `'farmer'`. Only authenticated administrative database seeders can provision coordinator identities.
- **Verification**: Verified in `securityAndAuth.test.ts` (Test 3) — malicious signup returns role `'farmer'`.

### Risk 2: Cross-Tenant Data Tampering & IDOR
- **Threat**: Authenticated farmers altering or deleting field parcels belonging to other farmers.
- **Remediation**: `farms.ts` inspects requester identity (`x-farmer-id` / session profile) against parcel `farmerId`. Returns `403 Forbidden` if tenant identity does not match.
- **Verification**: Verified in `workflow.test.ts` (Step 9) — non-owner receives `403 Forbidden` when attempting deletion.

---

## 3. Input Validation & File Upload Hardening

### Risk 3: Disguised File Upload Exploitation & MIME Spoofing
- **Threat**: Uploading executable binaries, PHP/JS scripts, or SVG cross-site scripting vectors renamed as `.jpg` or `.png`.
- **Remediation**:
  1. Multer restricts incoming files to strictly `image/jpeg`, `image/png`, and `image/webp`.
  2. Byte-level magic signature inspection verifies initial header bytes:
     - JPEG: `0xFF 0xD8 0xFF`
     - PNG: `0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A`
     - WebP: `0x52 0x49 0x46 0x46` (RIFF) + `0x57 0x45 0x42 0x50` (WEBP)
  3. Rejects invalid files with HTTP `400 Bad Request`.
  4. Enforces 10MB maximum file size limit.
- **Verification**: Verified in `securityAndAuth.test.ts` (Test 6) — text payload spoofed as `image/jpeg` rejected.

### Risk 4: Directory Path Traversal Attacks
- **Threat**: Supplying `../../package.json` or `..%2f..%2f.env` to escape `/uploads` directory.
- **Remediation**: Static file server uses Express static configuration with `dotfiles: 'ignore'` and `index: false`. Path resolution checks reject escaping parents.
- **Verification**: Verified in `securityAndAuth.test.ts` (Test 7) — traversal returns `404` or `403`.

---

## 4. Network Defense, Rate Limiting & HTTP Headers

### Risk 5: Denial-of-Service / Abuse of AI Endpoints
- **Threat**: Repeatedly bombarding Gemini multimodal analysis or weather APIs, exhausting quotas.
- **Remediation**: Added in-memory token bucket rate limiter to `backend/src/server.ts` enforcing 200 requests/minute per client IP, returning `429 Too Many Requests` with `X-RateLimit-*` and `Retry-After` headers.

### Risk 6: Clickjacking, MIME Sniffing & Data Leaks
- **Remediation**: Standardized strict HTTP response headers across all routes:
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
  - `X-Frame-Options: DENY` (prevents clickjacking via iframes)
  - `Referrer-Policy: strict-origin-when-cross-origin` (prevents query param leakage)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
  - `Cache-Control: no-store` (prevents cached sensitive data on shared devices)

---

## 5. Sensitive Information & Credential Protection

### Risk 7: Exposure of Farmer PII & Hardware Tokens
- **Remediation**:
  - `routes/auth.ts`: Public profile listings replace actual phone numbers with `'DEMO ACCOUNT'`.
  - `routes/iot.ts`: Device enumeration strips `apiToken` via `publicDevice` sanitizer.
  - `routes/marketplace.ts`: Produce seller phone numbers masked in public queries.
- **Verification**: Verified in `smoke-api.mjs` and `securityAndAuth.test.ts` (Tests 2, 5).

---

## 6. Security Summary & Compliance State

| Control Category | OWASP Mapping | Implementation Status |
|---|---|---|
| Broken Access Control | A01:2021 | Remediated & Verified |
| Cryptographic Failures | A02:2021 | Cryptographic Random Hex Tokens |
| Injection | A03:2021 | Parameterized queries & sanitization |
| Insecure Design | A04:2021 | Decoupled agronomic fallback engines |
| Security Misconfiguration | A05:2021 | Strict Security Headers Enforced |
| Vulnerable & Outdated Components | A06:2021 | 0 npm vulnerabilities |
| Identification & Auth Failures | A07:2021 | Explicit demo boundary & role isolation |
| Software & Data Integrity Failures | A08:2021 | Byte-level image signature validation |
| Security Logging & Monitoring | A09:2021 | Structured audit logs |
| Server-Side Request Forgery (SSRF) | A10:2021 | Input coordinate bounds & whitelist |
