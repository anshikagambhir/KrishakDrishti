# KrishakDrishti — Feature Verification & Agricultural Workflow Matrix

This checklist verifies every major agricultural workflow, route, and subsystem across live capabilities, fallbacks, and test status.

---

## Agricultural Workflow Matrix

| Workflow Domain | Screen Route | Primary Service / Route | Live Capability | Offline / Demo Fallback | Automated Test Coverage | Status |
|---|---|---|---|---|---|---|
| **Farmer Dashboard** | `/` | `src/app/page.tsx` | Aggregated view of farm acreage, weather conditions, active alerts & mandi rates | Seeded farm dataset & cached weather | E2E & Route prerender | Verified |
| **Farm & Parcel CRUD** | `/farms` | `backend/src/routes/farms.ts` | GeoJSON polygon parcel creation, acreage calculation, soil type & irrigation specs | In-memory / persistent JSON store | `api.test.ts` (9), `workflow.test.ts` (2) | Verified |
| **Crop Health AI** | `/crop-health` | `backend/src/routes/cropHealth.ts`, `geminiService.ts` | Multimodal Google Gemini foliar pathology analysis with confidence score | Offline Agronomic Pathology Engine with ICAR/PAU rules | `cropHealthVerification.test.ts` (1-8), `gemini.test.ts` (1-8) | Verified |
| **Weather & Microclimate** | `/weather` | `backend/src/routes/weather.ts`, `weatherService.ts` | Real-time Open-Meteo GPS weather forecast with temperature, humidity, wind & rain | Cached agricultural weather state with honest status tags | `api.test.ts` (2, 11), `integration.test.ts` (1) | Verified |
| **Agronomic Risk Engine** | `/alerts` | `backend/src/routes/alerts.ts`, `alertEngine.ts` | Automated risk triggers (frost, heavy rain, pest humidity) with 6-hour deduplication | Configurable simulation thresholds | `api.test.ts` (5, 12), `workflow.test.ts` (7) | Verified |
| **Mandi Price Intelligence** | `/mandi` | `backend/src/routes/mandi.ts`, `mandiService.ts` | Real APMC mandi prices with official unit (`₹ / Quintal`) & market comparison | Historical APMC benchmark dataset with variance indicators | `api.test.ts` (3, 13), `integration.test.ts` (2) | Verified |
| **Produce Marketplace** | `/marketplace` | `backend/src/routes/marketplace.ts` | Buy & sell listings with crop variety, expected price, modal price & quality grade | Privacy-masked contact workflow (`DEMO ACCOUNT`) | `marketplaceAndIot.test.ts` (1-4) | Verified |
| **IoT Telemetry Hub** | `/devices` | `backend/src/routes/iot.ts`, `iotSimulator.ts` | Real ESP32 telemetry ingestion endpoint with token authentication & heartbeat | Automated hardware simulation cycle (`tick`) with unref timers | `api.test.ts` (6), `marketplaceAndIot.test.ts` (5-6) | Verified |
| **GPS Cadastral Map** | `/field-map` | `src/app/field-map/page.tsx` | Leaflet-based interactive parcel boundaries, health overlays & GPS pinpoints | Offline vector polygons | Prerender & typecheck | Verified |
| **Virtual Drone Mission** | `/virtual-drone`, `/drone-scanner` | `backend/src/routes/droneScanner.ts` | Flight path mission control, battery monitoring & multispectral NDVI heatmap preview | Synthetic aerial scan samples | Prerender & typecheck | Verified |
| **Multilingual AI Assistant** | `/ai-assistant` | `backend/src/routes/ai.ts`, `geminiService.ts` | Context-aware agronomic chat grounded in farmer's registered crops, weather & mandi rates | Agronomic rule-based advisory with KVK consultation note | `gemini.test.ts` (8), `marketplaceAndIot.test.ts` (7) | Verified |
| **FPO Coordinator Hub** | `/fpo` | `backend/src/routes/fpo.ts` | Multi-farmer acreage aggregation, crop disease triage & expert assignment | Seeded FPO cooperative database | `api.test.ts` (8), `workflow.test.ts` (8) | Verified |
| **Farmer Profile & Roles** | `/profile` | `backend/src/routes/auth.ts` | Preference management, language selection (23 languages), role switching | Demo profile switcher with PII masking | `api.test.ts` (10), `securityAndAuth.test.ts` (2-4) | Verified |
| **Voice IVR Hotline** | Modal trigger | `backend/src/routes/voice.ts`, `voiceService.ts` | Multilingual telephone IVR menu simulation for non-internet feature phones | Synthetic audio dialogue tree | `api.test.ts` (7) | Verified |
| **WhatsApp Agronomy Bot** | Modal trigger | `backend/src/routes/whatsapp.ts` | Webhook simulation for photo disease analysis and weather alerts via chat | Meta signature verification with mock test dispatch | `smoke-api.mjs`, `securityAndAuth.test.ts` (8) | Verified |

---

## Route Prerendering Matrix (Next.js 16.4.6)

- [x] `/` — Prerendered static content
- [x] `/_not-found` — Prerendered static content
- [x] `/ai-assistant` — Prerendered static content
- [x] `/alerts` — Prerendered static content
- [x] `/crop-health` — Prerendered static content
- [x] `/devices` — Prerendered static content
- [x] `/drone-scanner` — Prerendered static content
- [x] `/farms` — Prerendered static content
- [x] `/field-map` — Prerendered static content
- [x] `/fpo` — Prerendered static content
- [x] `/mandi` — Prerendered static content
- [x] `/marketplace` — Prerendered static content
- [x] `/profile` — Prerendered static content
- [x] `/virtual-drone` — Prerendered static content
- [x] `/weather` — Prerendered static content
