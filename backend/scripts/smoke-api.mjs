/** Local-only verification; no provider credentials or external network required. */
import assert from 'node:assert/strict';
process.env.VERCEL = '1';
process.env.DEMO_MODE = 'true';
process.env.NODE_ENV = 'production';
process.env.IOT_SIMULATOR_ENABLED = 'false';
delete process.env.GEMINI_API_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
const { server } = await import('../dist/server.js');
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
let passed = 0;
async function check(label, run) {
  await run(); passed++; console.log(`PASS: ${label}`);
}
try {
  await check('healthy API + explicit demo mode', async () => {
    const response = await fetch(`${url}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.features.demoMode, true);
    assert.equal(body.features.serverlessStateEphemeral, true);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  });
  await check('public profiles contain no phone numbers', async () => {
    const { profiles } = await (await fetch(`${url}/api/auth/users`)).json();
    assert.ok(profiles.length > 0);
    assert.ok(profiles.every(p => p.phoneNumber === 'DEMO ACCOUNT'));
  });
  await check('device tokens are not listed', async () => {
    const { devices } = await (await fetch(`${url}/api/iot/devices`)).json();
    assert.ok(devices.length > 0);
    assert.ok(devices.every(d => !Object.hasOwn(d, 'apiToken')));
  });
  await check('sample listings cannot initiate real WhatsApp', async () => {
    const res = await fetch(`${url}/api/marketplace/listings`);
    const data = await res.json();
    assert.ok(data.listings.length > 0);
    assert.ok(data.listings.every(l => l.farmerPhone === 'DEMO ACCOUNT'));
    const contact = await fetch(`${url}/api/marketplace/contact`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ listingId: data.listings[0].id }) });
    assert.equal(contact.status, 409);
  });
  await check('anonymous signup never creates admin users', async () => {
    const r = await fetch(`${url}/api/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fullName: 'Demo Test', phoneNumber: '+910000000001', role: 'admin' }) });
    const d = await r.json();
    assert.equal(r.status, 201);
    assert.equal(d.profile.role, 'farmer');
  });
  await check('WhatsApp webhook requires secret and signature', async () => {
    const r = await fetch(`${url}/api/webhooks/whatsapp`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    assert.equal(r.status, 503);
  });
  console.log(`\n${passed} smoke checks passed.`);
} finally {
  await new Promise(resolve => server.close(resolve));
}
