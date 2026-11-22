import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveImageUrl, API_BASE } from '../lib/api.js';

describe('Frontend API Client & Asset Resolution Test Suite', () => {
  it('1. resolveImageUrl: Correctly handles relative /uploads paths', () => {
    const input = '/uploads/diag-12345.jpg';
    const resolved = resolveImageUrl(input);
    assert.strictEqual(resolved, `${API_BASE}/uploads/diag-12345.jpg`);
  });

  it('2. resolveImageUrl: Preserves remote HTTPS image URLs intact', () => {
    const remoteUrl = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80';
    assert.strictEqual(resolveImageUrl(remoteUrl), remoteUrl);
  });

  it('3. resolveImageUrl: Preserves base64 data URIs intact for ephemeral previews', () => {
    const dataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
    assert.strictEqual(resolveImageUrl(dataUri), dataUri);
  });

  it('4. resolveImageUrl: Preserves browser blob URLs intact for local file selection', () => {
    const blobUrl = 'blob:http://localhost:3000/1234-5678-90ab';
    assert.strictEqual(resolveImageUrl(blobUrl), blobUrl);
  });

  it('5. resolveImageUrl: Safely returns empty string on null or undefined input', () => {
    assert.strictEqual(resolveImageUrl(null), '');
    assert.strictEqual(resolveImageUrl(undefined), '');
    assert.strictEqual(resolveImageUrl(''), '');
  });

  it('6. API_BASE: Ensures same-origin proxy pattern is configured for zero CORS leaks', () => {
    // API_BASE must be empty string so requests hit Next.js rewrites natively
    assert.strictEqual(API_BASE, '');
  });
});
