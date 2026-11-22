'use client';
import { useEffect, useState } from 'react';

/** Honest status reporting for public demonstrations. */
export default function DemoStatusBanner() {
  const [status, setStatus] = useState<'loading'|'online'|'offline'|'locked'>('loading');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal, cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('API unavailable'); return r.json(); })
      .then(data => setStatus(data?.features?.demoMode === false ? 'locked' : 'online'))
      .catch(() => { if (!controller.signal.aborted) setStatus('offline'); });
    return () => controller.abort();
  }, []);
  return (
    <div role="status" className="text-center px-3 py-2 text-xs font-medium bg-amber-50 text-amber-900 border-b border-amber-200">
      <strong>Demonstration platform:</strong> sample farmer data and simulated hardware; not a verified agricultural advisory service.
      {status === 'offline' && <span className="ml-2 text-red-700">Backend offline: configure BACKEND_URL in Vercel.</span>}
      {status === 'locked' && <span className="ml-2 text-red-700">Backend demo mode disabled; public API access is protected.</span>}
    </div>
  );
}
