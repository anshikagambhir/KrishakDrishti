export type UserRole = 'farmer' | 'fpo_coordinator' | 'agri_expert' | 'admin';

export interface UserProfile {
  id: string;
  supabaseAuthId?: string;
  fullName: string;
  phoneNumber: string;
  preferredLanguage: string;
  role: UserRole;
  fpoId?: string;
  avatarUrl?: string;
  locationConsent: boolean;
  alertConsent: {
    sms: boolean;
    voice: boolean;
    whatsapp: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  state: string;
  district: string;
  subDistrict?: string;
  village?: string;
  pincode?: string;
  totalAreaAcres: number;
  centerCoordinates: {
    lat: number;
    lng: number;
  };
  irrigationSource?: string;
  soilType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  id: string;
  farmId: string;
  farmerId: string;
  name: string;
  cropName: string;
  cropVariety?: string;
  sowingDate: string;
  expectedHarvestDate?: string;
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Grain Filling' | 'Maturity';
  areaAcres: number;
  boundaryGeoJson?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  healthStatus: 'Optimal' | 'Good' | 'Watch' | 'At Risk' | 'Critical';
  createdAt: string;
  updatedAt: string;
}

export type DeviceType = 'esp32_cam' | 'soil_sensor' | 'microclimate_station' | 'irrigation_node';

export interface IoTDevice {
  id: string;
  deviceCode: string;
  deviceName: string;
  deviceType: DeviceType;
  farmerId: string;
  farmId?: string;
  fieldId?: string;
  apiToken?: string;
  isActive: boolean;
  isSimulated: boolean;
  lastHeartbeat?: string;
  firmwareVersion: string;
  batteryPct: number;
  createdAt: string;
}

export interface DeviceTelemetryReading {
  id: string;
  deviceId: string;
  fieldId?: string;
  soilMoisturePct?: number;
  soilTemperatureC?: number;
  airTemperatureC?: number;
  humidityPct?: number;
  nitrogenMgKg?: number;
  phosphorusMgKg?: number;
  potassiumMgKg?: number;
  batteryPct?: number;
  signalRssi?: number;
  recordedAt: string;
}

export interface CropDiagnosis {
  id: string;
  fieldId: string;
  farmerId: string;
  imageUrl: string;
  source: 'web_upload' | 'esp32_cam' | 'whatsapp' | 'drone' | 'drone_scanner' | 'preset_sample' | string;
  cropDetected: string;
  primaryIssue: string;
  severity: 'low' | 'moderate' | 'high' | 'severe' | string;
  confidencePct: number;
  visibleEvidence: string;
  actionableSteps: string[];
  preventativeMeasures: string[];
  disclaimer: string;
  escalationNeeded: boolean;
  escalationNotes?: string;
  followUpQuestions?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  provider?: 'gemini' | 'offline_pathology_engine' | 'mistral' | string;
  dataStatus?: 'live' | 'fallback' | 'cached' | 'mocked_fallback' | string;
  modelUsed?: string;
  fallbackReason?: string;
  createdAt: string;
}

export interface WeatherCondition {
  timestamp: string;
  locationName: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  relativeHumidityPct: number;
  windSpeedKmh: number;
  precipitationProbabilityPct: number;
  weatherCode: number;
  weatherDescription: string;
  agriculturalImpact: string;
  forecastDaily: Array<{
    date: string;
    tempMaxC: number;
    tempMinC: number;
    precipitationMm: number;
    description: string;
  }>;
  units?: {
    temperature: string;
    humidity: string;
    windSpeed: string;
    precipitation: string;
  };
  dataStatus?: 'live' | 'cached' | 'fallback';
}

export interface MandiPriceRecord {
  id: string;
  commodity: string;
  commodityHi: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  priceDate: string;
  trend: 'up' | 'down' | 'stable';
  msp?: number;
  historicalTrend?: Array<{
    date: string;
    modalPrice: number;
  }>;
}

export interface CropMarketplaceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  cropName: string;
  cropNameHi: string;
  variety: string;
  quantityQuintals: number;
  expectedPricePerQtl: number;
  apmcModalPrice: number;
  qualityGrade: string;
  state: string;
  district: string;
  mandi: string;
  harvestDate: string;
  imageUrl?: string;
  description?: string;
  listingType: 'sell' | 'buy_request';
  status: 'active' | 'negotiating' | 'sold';
  createdAt: string;
}

export interface AlertNotification {
  id: string;
  farmerId: string;
  fieldId?: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  type: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface FPOCase {
  id: string;
  fpoId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  fieldId: string;
  fieldName: string;
  cropName: string;
  diagnosisId?: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedExpertName: string;
  status: 'open' | 'investigating' | 'resolved';
  expertNotes?: string;
  createdAt: string;
}
