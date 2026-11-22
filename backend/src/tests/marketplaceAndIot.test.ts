import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createTestServer, TestServerInstance } from './testServer.js';

describe('Marketplace, IoT Ingestion & AI Advisory Verification Suite', () => {
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

  it('1. Marketplace: Retrieve crop listings and verify privacy-masked farmer contacts', async () => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.ok(Array.isArray(data.listings), 'Should return listings array');
    assert.ok(data.listings.length > 0, 'Should have seeded listings');
    assert.ok(data.metrics, 'Metrics block should be computed');
    assert.ok(data.metrics.totalQuintalsAvailable >= 0);

    for (const listing of data.listings) {
      assert.strictEqual(
        listing.farmerPhone,
        'DEMO ACCOUNT',
        'Farmer contact number must be masked in public listings'
      );
    }
  });

  it('2. Marketplace: Filter listings by crop name and state', async () => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings?crop=Wheat&state=Punjab`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.ok(Array.isArray(data.listings));
    for (const item of data.listings) {
      assert.strictEqual(item.cropName, 'Wheat');
      assert.strictEqual(item.state, 'Punjab');
    }
  });

  it('3. Marketplace: Create new produce listing with validation', async () => {
    // 3a. Reject invalid payload
    const invalidRes = await fetch(`${API_BASE}/api/marketplace/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName: 'Paddy' }), // missing quantity and price
    });
    assert.strictEqual(invalidRes.status, 400, 'Must reject incomplete produce listing');

    // 3b. Create valid produce listing
    const validListing = {
      farmerId: 'usr-farmer-001',
      cropName: 'Mustard (सरसों)',
      variety: 'Pusa Bold',
      quantityQuintals: 35,
      expectedPricePerQtl: 5450,
      state: 'Punjab',
      district: 'Ludhiana',
    };

    const validRes = await fetch(`${API_BASE}/api/marketplace/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validListing),
    });
    assert.strictEqual(validRes.status, 201, 'Should publish new crop listing with 201');
    const validData = await validRes.json();
    assert.ok(validData.listing.id);
    assert.strictEqual(validData.listing.cropName, validListing.cropName);
  });

  it('4. Marketplace Contact Flow: Fictional sample sellers cannot initiate real outbound WhatsApp messages', async () => {
    const listRes = await fetch(`${API_BASE}/api/marketplace/listings`);
    const listData = await listRes.json();
    const targetListing = listData.listings[0];

    const contactRes = await fetch(`${API_BASE}/api/marketplace/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: targetListing.id }),
    });

    assert.strictEqual(
      contactRes.status,
      409,
      'Contacting demonstration listing must return 409 Conflict rather than attempting real messaging'
    );
  });

  it('5. IoT Device Provisioning: Register new device and enforce serial code uniqueness', async () => {
    const testCode = `ESP32-TEST-${Date.now()}`;
    const newDevicePayload = {
      deviceCode: testCode,
      deviceName: 'North Acreage Moisture Node',
      deviceType: 'soil_sensor',
      farmerId: 'usr-farmer-001',
      isSimulated: true,
    };

    const res = await fetch(`${API_BASE}/api/iot/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDevicePayload),
    });

    assert.strictEqual(res.status, 201, 'Device registration should succeed with 201');
    const data = await res.json();
    assert.strictEqual(data.device.deviceCode, testCode);

    // Duplicate code must be rejected
    const duplicateRes = await fetch(`${API_BASE}/api/iot/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDevicePayload),
    });
    assert.strictEqual(duplicateRes.status, 409, 'Duplicate device serial must return 409 Conflict');
  });

  it('6. IoT Telemetry Ingestion: Ingest sensor telemetry and retrieve historical data', async () => {
    const telemetryPayload = {
      deviceCode: 'SOIL-NPK-LDH-02', // existing seeded device
      soilMoisturePct: 38.4,
      soilTemperatureC: 22.1,
      airTemperatureC: 26.5,
      humidityPct: 58.0,
      batteryPct: 94,
    };

    const postRes = await fetch(`${API_BASE}/api/iot/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetryPayload),
    });

    assert.strictEqual(postRes.status, 201, 'Telemetry ingestion should return 201');
    const postData = await postRes.json();
    assert.ok(postData.readingId, 'Telemetry reading ID should be assigned');

    // Retrieve historical telemetry
    const getRes = await fetch(`${API_BASE}/api/iot/telemetry?limit=5`);
    assert.strictEqual(getRes.status, 200);
    const getData = await getRes.json();
    assert.ok(Array.isArray(getData.readings));
    assert.ok(getData.readings.length > 0);
  });

  it('7. AI Advisory Chat: Responds to agronomic inquiries with localized farmer context', async () => {
    const chatPayload = {
      message: 'What should I do for yellow rust prevention in wheat crop?',
      farmerId: 'usr-farmer-001',
      preferredLanguage: 'hi',
    };

    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatPayload),
    });

    assert.strictEqual(res.status, 200, 'AI chat should return 200');
    const data = await res.json();
    assert.ok(data.reply || data.text, 'Chat response must contain reply text');
    assert.ok(Array.isArray(data.suggestedActions), 'AI response should provide suggested follow-ups');
  });
});
