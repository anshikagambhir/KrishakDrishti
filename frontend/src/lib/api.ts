import {
  UserProfile,
  Farm,
  Field,
  IoTDevice,
  DeviceTelemetryReading,
  CropDiagnosis,
  WeatherCondition,
  MandiPriceRecord,
  CropMarketplaceListing,
  AlertNotification,
  FPOCase,
} from '../types/index';

// Always use same-origin /api and /uploads routes. Next.js proxies to BACKEND_URL
// on the server, so browser credentials / network do not need a CORS exception.
export const API_BASE = '';

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    return `${API_BASE}${url}`;
  }
  return url;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || errBody.message || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[API] Error calling ${endpoint}:`, message);
    throw err;
  }
}

export const api = {
  // Profiles & Authentication
  getProfile: (id: string = 'usr-farmer-001') => request<{ profile: UserProfile }>(`/api/auth/profile?id=${id}`),
  updateProfile: (id: string, updates: Partial<UserProfile>) =>
    request<{ profile: UserProfile; message: string }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates }),
    }),
  getUsers: () => request<{ profiles: UserProfile[] }>('/api/auth/users'),
  login: (credentials: { phoneNumber?: string; profileId?: string }) =>
    request<{ profile: UserProfile; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  signup: (data: { fullName: string; phoneNumber: string; preferredLanguage?: string; role?: string; fpoId?: string }) =>
    request<{ profile: UserProfile; token: string; message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  switchRole: (profileId: string) =>
    request<{ profile: UserProfile; message: string }>('/api/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    }),

  // Farms & Fields
  getFarms: (farmerId?: string) => request<{ farms: Farm[] }>(`/api/farms${farmerId ? `?farmerId=${farmerId}` : ''}`),
  getFarm: (id: string) => request<{ farm: Farm; fields: Field[] }>(`/api/farms/${id}`),
  createFarm: (farm: Partial<Farm>) =>
    request<{ farm: Farm; message: string }>('/api/farms', {
      method: 'POST',
      body: JSON.stringify(farm),
    }),
  updateFarm: (id: string, updates: Partial<Farm>) =>
    request<{ farm: Farm; message: string }>(`/api/farms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteFarm: (id: string) =>
    request<{ message: string }>(`/api/farms/${id}`, {
      method: 'DELETE',
    }),
  getFields: (farmId?: string, farmerId?: string) => {
    const params = new URLSearchParams();
    if (farmId) params.append('farmId', farmId);
    if (farmerId) params.append('farmerId', farmerId);
    return request<{ fields: Field[] }>(`/api/fields?${params.toString()}`);
  },
  getField: (id: string) => request<{ field: Field }>(`/api/fields/${id}`),
  createField: (field: any) =>
    request<{ field: Field; message: string }>('/api/fields', {
      method: 'POST',
      body: JSON.stringify(field),
    }),
  updateField: (id: string, updates: any) =>
    request<{ field: Field; message: string }>(`/api/fields/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteField: (id: string) =>
    request<{ message: string }>(`/api/fields/${id}`, {
      method: 'DELETE',
    }),
  getFieldOverlays: (fieldId: string) => request<{ overlays: Array<{ id: string; name: string; url: string }> }>(`/api/fields/${fieldId}/overlays`),
  saveFieldOverlay: (fieldId: string, overlay: any) =>
    request<{ overlay: unknown; message: string }>(`/api/fields/${fieldId}/overlays`, {
      method: 'POST',
      body: JSON.stringify(overlay),
    }),

  // Weather & Alerts
  getWeather: (lat?: number, lng?: number, location?: string, farmerId?: string, city?: string) => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (lat !== undefined && lng !== undefined) {
      params.append('lat', lat.toString());
      params.append('lng', lng.toString());
    }
    if (location) params.append('location', location);
    if (farmerId) params.append('farmerId', farmerId);
    return request<{ weather: WeatherCondition; activeAlerts: AlertNotification[]; newTriggeredAlertsCount: number; farmCoordinates: { lat: number; lng: number } }>(
      `/api/weather?${params.toString()}`
    );
  },
  getAlerts: (farmerId: string = 'usr-farmer-001') => request<{ alerts: AlertNotification[] }>(`/api/alerts?farmerId=${farmerId}`),
  acknowledgeAlert: (id: string, farmerId: string = 'usr-farmer-001') =>
    request<{ alert: AlertNotification; message: string }>(`/api/alerts/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ farmerId }),
    }),

  // Mandi
  getMandiPrices: (filters?: { commodity?: string; state?: string; district?: string; market?: string }) => {
    const params = new URLSearchParams();
    if (filters?.commodity && filters.commodity !== 'All') params.append('commodity', filters.commodity);
    if (filters?.state && filters.state !== 'All') params.append('state', filters.state);
    if (filters?.market && filters.market !== 'All') params.append('market', filters.market);
    return request<{
      records: MandiPriceRecord[];
      total: number;
      sourceAttribution: string;
      isLiveFeed: boolean;
      availableFilters: { commodities: string[]; states: string[]; markets: string[] };
      dataStatus?: string;
      retrievalTime?: string;
      blockerDetails?: string;
    }>(`/api/mandi?${params.toString()}`);
  },
  compareMandiMarkets: (commodity: string = 'Onion') =>
    request<{ commodity: string; comparison: Array<{ market: string; state: string; modalPrice: number; variancePct: number }>; sourceAttribution: string; isLiveFeed: boolean }>(
      `/api/mandi/compare?commodity=${encodeURIComponent(commodity)}`
    ),

  // Crop Marketplace (Buy & Sell Produce)
  getMarketplaceListings: (filters?: { crop?: string; state?: string; type?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.crop && filters.crop !== 'All') params.append('crop', filters.crop);
    if (filters?.state && filters.state !== 'All') params.append('state', filters.state);
    if (filters?.type && filters.type !== 'All') params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    return request<{
      listings: CropMarketplaceListing[];
      totalCount: number;
      metrics: {
        totalQuintalsAvailable: number;
        activeFarmerSellers: number;
        commoditiesAvailable: string[];
      };
      sourceAttribution: string;
      retrievalTime: string;
    }>(`/api/marketplace/listings?${params.toString()}`);
  },
  createMarketplaceListing: (payload: Partial<CropMarketplaceListing>) =>
    request<{ message: string; listing: CropMarketplaceListing }>('/api/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  contactMarketplaceSeller: (payload: { listingId: string; buyerName?: string; buyerPhone?: string; requestedQuintals?: number }) =>
    request<{ success: boolean; farmerName: string; farmerPhone: string; whatsappUrl: string; message: string }>(
      '/api/marketplace/contact',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  // IoT
  getDevices: (farmerId?: string) => request<{ devices: IoTDevice[] }>(`/api/iot/devices${farmerId ? `?farmerId=${farmerId}` : ''}`),
  registerDevice: (device: any) =>
    request<{ device: IoTDevice; message: string }>('/api/iot/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    }),
  getTelemetry: (deviceId?: string, fieldId?: string, limit: number = 30) => {
    const params = new URLSearchParams();
    if (deviceId) params.append('deviceId', deviceId);
    if (fieldId) params.append('fieldId', fieldId);
    params.append('limit', limit.toString());
    return request<{ readings: DeviceTelemetryReading[] }>(`/api/iot/telemetry?${params.toString()}`);
  },
  triggerSimulatorTick: () =>
    request<{ message: string; readingsGenerated: number; readings: DeviceTelemetryReading[]; pumpActive: boolean }>('/api/iot/simulator/tick', {
      method: 'POST',
    }),
  getPumpStatus: () =>
    request<{ pumpActive: boolean; flowRateLpm: number; wattageKw: number; lastToggled: string }>('/api/iot/pump/status'),
  togglePump: (active?: boolean) =>
    request<{ success: boolean; pumpActive: boolean; message: string; flowRateLpm: number; wattageKw: number }>(
      '/api/iot/pump/toggle',
      {
        method: 'POST',
        body: JSON.stringify({ active }),
      }
    ),
  injectSimulatorScenario: (scenario: 'drought' | 'optimal' | 'waterlogging' | 'heatwave') =>
    request<{ success: boolean; scenario: string; readings: DeviceTelemetryReading[]; pumpActive: boolean; message: string }>(
      '/api/iot/simulator/scenario',
      {
        method: 'POST',
        body: JSON.stringify({ scenario }),
      }
    ),

  // Crop Health Diagnostics
  getCropDiagnoses: (fieldId?: string, farmerId?: string) => {
    const params = new URLSearchParams();
    if (fieldId) params.append('fieldId', fieldId);
    if (farmerId) params.append('farmerId', farmerId);
    return request<{ diagnoses: CropDiagnosis[] }>(`/api/diagnoses?${params.toString()}`);
  },
  analyzeCropHealth: async (formData: FormData): Promise<{ diagnosis: CropDiagnosis; message: string }> => {
    const res = await fetch(`${API_BASE}/api/diagnoses/analyze`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Crop analysis request failed');
    }
    return await res.json();
  },

  // AI Assistant Chatbot
  chatWithAssistant: (message: string, farmerId: string = 'usr-farmer-001', preferredLanguage: string = 'hi') =>
    request<{ reply: string; suggestedActions: string[]; linksToScreens: Array<{ label: string; href: string }>; timestamp: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, farmerId, preferredLanguage }),
    }),

  // FPO Coordinator Workspace
  getFPOMembers: () => request<{ members: UserProfile[] }>('/api/fpo/members'),
  getFPOCases: () => request<{ cases: FPOCase[] }>('/api/fpo/cases'),
  assignFPOCase: (caseId: string, updates: { assignedExpertName: string; status?: string; expertNotes?: string }) =>
    request<{ case: FPOCase; message: string }>(`/api/fpo/cases/${caseId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getFPOMetrics: () => request<{ totalMembers: number; totalAcreage: number; activeCases: number; resolvedCases: number }>('/api/fpo/metrics'),

  // Voice Hotline / IVR Simulator
  simulateVoiceCall: (payload: { action: string; callerNumber?: string; digit?: string; spokenText?: string; language?: string; sessionId?: string }) =>
    request<any>('/api/voice/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // WhatsApp Webhook Simulator
  simulateWhatsApp: (payload: { senderNumber?: string; text?: string; hasImage?: boolean; imageUrl?: string }) =>
    request<{
      success: boolean;
      sentMessage?: string;
      responseMessages?: string[];
      replySent?: string;
      [key: string]: any;
    }>('/api/webhooks/whatsapp/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
