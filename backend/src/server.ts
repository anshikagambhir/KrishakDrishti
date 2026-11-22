import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import farmsRoutes from './routes/farms.js';
import cropHealthRoutes from './routes/cropHealth.js';
import weatherRoutes from './routes/weather.js';
import mandiRoutes from './routes/mandi.js';
import iotRoutes from './routes/iot.js';
import alertsRoutes from './routes/alerts.js';
import aiRoutes from './routes/ai.js';
import fpoRoutes from './routes/fpo.js';
import whatsappRoutes from './routes/whatsapp.js';
import voiceRoutes from './routes/voice.js';
import droneScannerRoutes from './routes/droneScanner.js';
import marketplaceRoutes from './routes/marketplace.js';
import { iotSimulator } from './services/iotSimulator.js';

dotenv.config();

export const demoMode = process.env.DEMO_MODE === 'true' || (process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE !== 'false');
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN?.split(',').map(s => s.trim()) || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({ origin: allowedOrigins, methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '4mb', verify: (req: any, _res, buf) => { req.rawBody = Buffer.from(buf); } }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Static file serving for uploaded crop photos (hardened against index traversal and dotfiles)
const uploadDir = path.resolve(process.cwd(), 'data', 'uploads');
app.use('/uploads', express.static(uploadDir, {
  dotfiles: 'ignore',
  index: false,
  maxAge: '1d',
}));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'KrishakDrishti Agricultural Core Hub',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    features: {
      productionDatabase: false, // No authenticated, synchronized SQL persistence yet.
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
      weatherProvider: 'Open-Meteo (fallback when offline)',
      mandiLiveProviderConfigured: Boolean(process.env.DATA_GOV_IN_API_KEY || process.env.AGMARKNET_API_KEY),
      iotSimulation: true,
      whatsappWebhookConfigured: Boolean(process.env.META_APP_SECRET && process.env.WHATSAPP_VERIFY_TOKEN),
      voiceIVRSimulation: true,
      droneVirtualScanner: true,
      demoMode,
      localFilePersistence: !Boolean(process.env.VERCEL),
      serverlessStateEphemeral: Boolean(process.env.VERCEL),
    },
  });
});

// This application currently has a demo identity switcher, NOT secure production auth.
// Fail closed for write operations unless an operator explicitly enables a public demo.
// Provider webhooks must use provider-side verification before enabling in production.
app.use('/api', (req, res, next) => {
  if (!demoMode && !['OPTIONS'].includes(req.method)) {
    return res.status(503).json({ error: 'Write operations are disabled until production authentication is configured. Set DEMO_MODE=true only for a public demo with fictional data.' });
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', farmsRoutes);
app.use('/api', cropHealthRoutes);
app.use('/api', weatherRoutes);
app.use('/api', mandiRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api', alertsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/fpo', fpoRoutes);
app.use('/api/webhooks/whatsapp', whatsappRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/drone', droneScannerRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Socket.IO Realtime Telemetry Broadcasts
io.on('connection', (socket) => {
  console.log('[Socket.IO] Farmer or Dashboard client connected:', socket.id);

  socket.on('subscribe_field', (fieldId: string) => {
    socket.join(`field_${fieldId}`);
    console.log(`[Socket.IO] Client ${socket.id} joined room field_${fieldId}`);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Client disconnected:', socket.id);
  });
});

// Start IoT Hardware Simulator in development
if (!process.env.VERCEL && demoMode && process.env.IOT_SIMULATOR_ENABLED !== 'false') {
  iotSimulator.start(60);
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[GlobalErrorHandler]', err);
  res.status(500).json({
    error: 'Internal KrishakDrishti Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Request could not be processed.' : (err.message || 'Unknown error occurred'),
  });
});

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌱 KrishakDrishti Agricultural Backend running on port ${PORT}`);
    console.log(`   API Health: http://localhost:${PORT}/api/health`);
    console.log(`   Weather:    http://localhost:${PORT}/api/weather`);
    console.log(`   Mandi:      http://localhost:${PORT}/api/mandi`);
    console.log(`=======================================================`);
  });
}

export default app;
export { app, server, io };
