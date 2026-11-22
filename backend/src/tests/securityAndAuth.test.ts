import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createTestServer, TestServerInstance } from './testServer.js';

describe('Security, Authorization & Data Protection Verification Suite', () => {
  let testServerInstance: TestServerInstance;
  let API_BASE: string;

  before(async () => {
    testServerInstance = await createTestServer();
    API_BASE = testServerInstance.baseUrl;
  });

  after(async () => {
    if (testServerInstance) {
      await testServerInstance.close();
    }
  });

  it('1. HTTP Security Headers: nosniff, frameguard and strict referrer policy', async () => {
    const res = await fetch(`${API_BASE}/api/health`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.strictEqual(res.headers.get('cache-control'), 'no-store');
  });

  it('2. Identity Protection: Public profile endpoints never expose real telephone numbers', async () => {
    const res = await fetch(`${API_BASE}/api/auth/users`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.profiles));
    assert.ok(data.profiles.length > 0);

    for (const profile of data.profiles) {
      assert.strictEqual(
        profile.phoneNumber,
        'DEMO ACCOUNT',
        `Phone number for ${profile.fullName} must be masked as DEMO ACCOUNT`
      );
    }
  });

  it('3. Privilege Escalation Prevention: Anonymous signup cannot register admin or coordinator roles', async () => {
    const maliciousSignup = {
      fullName: 'Attacker User',
      phoneNumber: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: 'admin',
    };

    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousSignup),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(
      data.profile.role,
      'farmer',
      'System must enforce default farmer role regardless of requested role'
    );
  });

  it('4. Cross-User Profile Isolation: Non-admin cannot modify another user\'s profile preferences', async () => {
    const targetUserId = 'usr-farmer-001';
    const unauthorizedActorId = 'usr-farmer-002';

    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-id': unauthorizedActorId,
      },
      body: JSON.stringify({
        id: targetUserId,
        preferredLanguage: 'ta',
      }),
    });

    assert.strictEqual(res.status, 403, 'Should reject unauthorized cross-profile mutation with 403 Forbidden');
  });

  it('5. Secret Protection: IoT device list never leaks device apiToken credentials', async () => {
    const res = await fetch(`${API_BASE}/api/iot/devices`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.devices.length > 0);

    for (const device of data.devices) {
      assert.strictEqual(
        device.apiToken,
        undefined,
        `Device ${device.deviceCode} must not leak its apiToken in public listing`
      );
    }
  });

  it('6. Upload Hardening: Rejects spoofed MIME types lacking genuine image magic bytes', async () => {
    const form = new FormData();
    // Provide a file claiming to be image/jpeg but containing plain text bytes
    const fakeJpegBytes = new TextEncoder().encode('GIF89a alert("xss") plain text exploit content');
    const blob = new Blob([fakeJpegBytes], { type: 'image/jpeg' });
    form.append('photo', blob, 'exploit.jpg');
    form.append('fieldId', 'field-101');
    form.append('farmerId', 'usr-farmer-001');

    const res = await fetch(`${API_BASE}/api/diagnoses/analyze`, {
      method: 'POST',
      body: form,
    });

    assert.strictEqual(res.status, 400, 'Must reject file with invalid magic bytes with 400 Bad Request');
    const data = await res.json();
    assert.ok(data.error.includes('signature') || data.error.includes('magic bytes'));
  });

  it('7. Directory Traversal Protection: Blocked from escaping static /uploads directory', async () => {
    const res = await fetch(`${API_BASE}/uploads/..%2f..%2fpackage.json`);
    assert.ok(
      res.status === 404 || res.status === 403,
      `Directory traversal must return 404 or 403, received ${res.status}`
    );
  });

  it('8. Webhook Security: Unauthenticated WhatsApp webhooks are rejected', async () => {
    const res = await fetch(`${API_BASE}/api/webhooks/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: [] }),
    });
    // In demo mode without configured secrets, webhook requires verify token or secret
    assert.ok(res.status >= 400, 'Unsigned webhook should be rejected');
  });
});
