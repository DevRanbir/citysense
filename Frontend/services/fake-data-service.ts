// Simple Fake Data Service for Real-Time Dashboard Updates
export interface TrafficData {
  location: string;
  status: 'Heavy' | 'Moderate' | 'Smooth';
  congestion_level: number;
  timestamp: string;
}

export interface AQIData {
  location: string;
  aqi: number;
  category: string;
  timestamp: string;
  pm25: number;
  pm10: number;
}

export interface CrowdData {
  location: string;
  density: number;
  timestamp: string;
  change_rate: number;
}

export interface NoiseData {
  location: string;
  level: number;
  timestamp: string;
  source: string;
}

export interface ResponseTimeData {
  location: string;
  medical: number;
  fire: number;
  police: number;
  traffic: number;
  rescue: number;
  timestamp: string;
}

export interface IncidentData {
  location: string;
  medical: number;
  fire: number;
  traffic: number;
  crime: number;
  natural: number;
  total: number;
  timestamp: string;
}

export interface DashboardData {
  location: string;
  traffic: TrafficData;
  aqi: AQIData;
  crowd: CrowdData;
  noise: NoiseData;
  response_times: ResponseTimeData;
  incidents: IncidentData;
}

class FakeDataService {
  private listeners: ((data: DashboardData) => void)[] = [];
  private currentData: Map<string, DashboardData> = new Map();
  private locations = [
    "Madhya Marg", "Dakshin Marg", "Shanti Path", 
    "Jan Marg", "Vikas Marg", "Sector 17 Market Road"
  ];

  constructor() {
    // Initialize with default data for all locations
    this.locations.forEach(location => {
      this.currentData.set(location, this.generateLocationData(location));
    });
  }

  // Subscribe to data updates
  subscribe(callback: (data: DashboardData) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of data changes
  private notifyListeners(data: DashboardData) {
    this.listeners.forEach(callback => callback(data));
  }

  // Generate realistic data for a location
  private generateLocationData(location: string): DashboardData {
    const baseLevels = this.getBaseLevels(location);
    const now = new Date().toISOString();

    return {
      location,
      traffic: this.generateTrafficData(location, baseLevels.traffic, now),
      aqi: this.generateAQIData(location, baseLevels.aqi, now),
      crowd: this.generateCrowdData(location, baseLevels.crowd, now),
      noise: this.generateNoiseData(location, baseLevels.noise, now),
      response_times: this.generateResponseData(location, baseLevels.response, now),
      incidents: this.generateIncidentData(location, baseLevels.incidents, now)
    };
  }

  private getBaseLevels(location: string) {
    const levels = {
      "Madhya Marg": { traffic: 85, aqi: 165, crowd: 1200, noise: 95, response: 8, incidents: 140 },
      "Dakshin Marg": { traffic: 65, aqi: 135, crowd: 850, noise: 85, response: 7, incidents: 115 },
      "Shanti Path": { traffic: 45, aqi: 85, crowd: 420, noise: 75, response: 6, incidents: 67 },
      "Jan Marg": { traffic: 70, aqi: 145, crowd: 980, noise: 88, response: 7, incidents: 110 },
      "Vikas Marg": { traffic: 90, aqi: 185, crowd: 1350, noise: 98, response: 9, incidents: 190 },
      "Sector 17 Market Road": { traffic: 35, aqi: 75, crowd: 280, noise: 65, response: 5, incidents: 85 }
    };
    return levels[location] || levels["Madhya Marg"];
  }

  private generateTrafficData(location: string, baseLevel: number, timestamp: string): TrafficData {
    const variation = Math.random() * 20 - 10; // ±10 variation
    const congestionLevel = Math.max(50, Math.min(100, baseLevel + variation));
    
    let status: 'Heavy' | 'Moderate' | 'Smooth';
    if (congestionLevel > 75) status = 'Heavy';
    else if (congestionLevel > 55) status = 'Moderate';
    else status = 'Smooth';

    return {
      location,
      status,
      congestion_level: Math.round(congestionLevel),
      timestamp
    };
  }

  private generateAQIData(location: string, baseLevel: number, timestamp: string): AQIData {
    const variation = Math.random() * 30 - 15; // ±15 variation
    const realAQI = Math.max(30, Math.min(300, baseLevel + variation));
    
    let category: string;
    if (realAQI < 50) category = 'Good';
    else if (realAQI < 100) category = 'Moderate';
    else if (realAQI < 150) category = 'Unhealthy';
    else category = 'Very Unhealthy';

    return {
      location,
      aqi: Math.round(realAQI),
      category,
      timestamp,
      pm25: Math.round(realAQI * 0.8),
      pm10: Math.round(realAQI * 1.2)
    };
  }

  private generateCrowdData(location: string, baseLevel: number, timestamp: string): CrowdData {
    const timeOfDay = new Date().getHours();
    let multiplier = 1.0;
    
    // Peak hours simulation
    if ([7, 8, 17, 18].includes(timeOfDay)) multiplier = 1.4;
    else if ([22, 23, 0, 1].includes(timeOfDay)) multiplier = 0.3;
    
    const variation = Math.random() * 100 - 50;
    const currentDensity = Math.max(50, baseLevel * multiplier + variation);

    return {
      location,
      density: Math.round(currentDensity),
      timestamp,
      change_rate: Math.round(Math.random() * 20 - 10) // ±10 people per minute
    };
  }

  private generateNoiseData(location: string, baseLevel: number, timestamp: string): NoiseData {
    const variation = Math.random() * 20 - 10;
    const level = Math.max(30, Math.min(120, baseLevel + variation));
    
    const sources = ['Traffic Heavy', 'Construction Work', 'Commercial Area', 'Mixed'] as const;
    const source = sources[Math.floor(Math.random() * sources.length)];

    return {
      location,
      level: Math.round(level),
      timestamp,
      source
    };
  }

  private generateResponseData(location: string, baseLevel: number, timestamp: string): ResponseTimeData {
    const variation = Math.random() * 4 - 2; // ±2 minutes
    const avgTime = baseLevel + variation;

    return {
      location,
      medical: Math.round((avgTime + Math.random() * 2 - 1) * 10) / 10,
      fire: Math.round((avgTime + Math.random() * 4 - 2) * 10) / 10,
      police: Math.round((avgTime + Math.random() * 2 - 1) * 10) / 10,
      traffic: Math.round((avgTime + Math.random() * 6 - 3) * 10) / 10,
      rescue: Math.round((avgTime + Math.random() * 8 - 4) * 10) / 10,
      timestamp
    };
  }

  private generateIncidentData(location: string, baseLevel: number, timestamp: string): IncidentData {
    const baseIncidents = baseLevel / 10; // Convert to hourly incidents
    const variation = Math.random() * 5 - 2.5;
    const totalIncidents = Math.max(0, baseIncidents + variation);

    return {
      location,
      medical: Math.round(totalIncidents * 0.4),
      fire: Math.round(totalIncidents * 0.15),
      traffic: Math.round(totalIncidents * 0.25),
      crime: Math.round(totalIncidents * 0.15),
      natural: Math.round(totalIncidents * 0.05),
      total: Math.round(totalIncidents),
      timestamp
    };
  }

  // Update data for a specific location
  updateLocationData(location: string) {
    const newData = this.generateLocationData(location);
    this.currentData.set(location, newData);
    this.notifyListeners(newData);
    console.log(`📊 Updated data for ${location}`);
  }

  // Update data for all locations
  updateAllLocationsData() {
    this.locations.forEach(location => {
      this.updateLocationData(location);
    });
    console.log('🔄 Updated data for all locations');
  }

  // Get current data for a location
  getCurrentData(location: string): DashboardData {
    return this.currentData.get(location) || this.generateLocationData(location);
  }

  // Get all current data
  getAllCurrentData(): Map<string, DashboardData> {
    return this.currentData;
  }

  // Simulate continuous updates (for demo purposes)
  startContinuousUpdates(intervalMs: number = 5000) {
    return setInterval(() => {
      this.updateAllLocationsData();
    }, intervalMs);
  }

  // Stop continuous updates
  stopContinuousUpdates(intervalId: NodeJS.Timeout) {
    clearInterval(intervalId);
  }
}

export const fakeDataService = new FakeDataService();
export default fakeDataService;
