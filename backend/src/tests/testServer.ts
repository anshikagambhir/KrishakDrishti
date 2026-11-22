import http from 'node:http';
import { AddressInfo } from 'node:net';

// Ensure test environment flags are set before server and store are evaluated
process.env.NODE_ENV = 'test';
process.env.DEMO_MODE = 'true';
process.env.IOT_SIMULATOR_ENABLED = 'false';
delete process.env.VERCEL;

import { app } from '../server.js';

export interface TestServerInstance {
  server: http.Server;
  baseUrl: string;
  close: () => Promise<void>;
}

export async function createTestServer(): Promise<TestServerInstance> {
  delete process.env.VERCEL;
  process.env.NODE_ENV = 'test';
  process.env.DEMO_MODE = 'true';
  process.env.IOT_SIMULATOR_ENABLED = 'false';

  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  return {
    server,
    baseUrl,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
