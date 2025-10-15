/**
 * Pathway API Service
 * Connects frontend dashboard to Pathway backend for real-time data
 */

export interface PathwayTrafficData {
  status: 'Heavy' | 'Moderate' | 'Smooth';
  congestion_level: number;
  vehicle_count: number;
  average_speed: number;
  incident_count: number;
  timestamp: string;
  source: string;
}

export interface PathwayAQIData {
  aqi: number;
  category: string;
  pm2_5: number;
  pm10: number;
  timestamp: string;
  source: string;
  confidence: number;
}

export interface PathwayCrowdData {
  density: number;
  change_rate: number;
  capacity_utilization: number;
  timestamp: string;
  source: string;
  confidence: number;
}

export interface PathwayNoiseData {
  level: number;
  source: string;
  timestamp: string;
  source_type: string;
  confidence: number;
}

export interface PathwayResponseTimes {
  medical: number;
  fire: number;
  police: number;
  traffic: number;
  rescue: number;
  timestamp: string;
  source: string;
  incidents_this_hour: number;
}

export interface PathwayIncidents {
  medical: number;
  fire: number;
  traffic: number;
  natural: number;
  total: number;
  timestamp: string;
  source: string;
}

export interface PathwayDashboardData {
  location: string;
  overall_score: number;
  last_updated: string;
  traffic: PathwayTrafficData;
  aqi: PathwayAQIData;
  crowd: PathwayCrowdData;
  noise: PathwayNoiseData;
  response_times: PathwayResponseTimes;
  incidents: PathwayIncidents;
  metrics: {
    traffic_score: number;
    air_quality_score: number;
    crowd_safety_score: number;
  };
}

export interface PathwayAnalytics {
  timestamp: string;
  source: string;
  analytics: Record<string, any>;
  data_sources_health: Record<string, any>;
  stream_history_length: Record<string, number>;
}

export interface PathwayUnifiedStream {
  timestamp: string;
  source: string;
  pipeline_status: string;
  unified_sources_count: number;
  locations_count: number;
  data: Record<string, PathwayDashboardData>;
}

class PathwayAPIService {
  private baseUrl = 'http://localhost:8000';
  private isConnected = false;
  
  constructor() {
    this.checkConnection();
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      
      if (response.ok) {
        this.isConnected = true;
        console.log('🚀 Pathway backend connected');
        return true;
      }
    } catch (error) {
      console.log('❌ Pathway backend not available:', error);
      this.isConnected = false;
    }
    return false;
  }

  async getDashboardData(location: string): Promise<PathwayDashboardData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pathway/dashboard/${encodeURIComponent(location)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 Pathway dashboard data for ${location}:`, data);
      return data;
    } catch (error) {
      console.error('Error fetching Pathway dashboard data:', error);
      return null;
    }
  }

  async getUnifiedStream(location?: string): Promise<PathwayUnifiedStream | null> {
    try {
      const url = location 
        ? `${this.baseUrl}/api/pathway/unified-stream?location=${encodeURIComponent(location)}`
        : `${this.baseUrl}/api/pathway/unified-stream`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Pathway unified stream:', error);
      return null;
    }
  }

  async getAnalytics(): Promise<PathwayAnalytics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pathway/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Pathway analytics:', error);
      return null;
    }
  }

  async getDataSourcesStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pathway/data-sources`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Pathway data sources status:', error);
      return null;
    }
  }

  isPathwayConnected(): boolean {
    return this.isConnected;
  }

  // Real-time data subscription simulation
  subscribeToLocationUpdates(
    location: string, 
    callback: (data: PathwayDashboardData) => void,
    intervalMs: number = 5000
  ): NodeJS.Timeout {
    return setInterval(async () => {
      const data = await this.getDashboardData(location);
      if (data) {
        callback(data);
      }
    }, intervalMs);
  }

  // Subscribe to unified stream updates
  subscribeToUnifiedStream(
    callback: (data: PathwayUnifiedStream) => void,
    intervalMs: number = 3000
  ): NodeJS.Timeout {
    return setInterval(async () => {
      const data = await this.getUnifiedStream();
      if (data) {
        callback(data);
      }
    }, intervalMs);
  }

  // Get all available locations with live data
  async getAllLocationsData(): Promise<Record<string, PathwayDashboardData>> {
    try {
      const unifiedStream = await this.getUnifiedStream();
      return unifiedStream?.data || {};
    } catch (error) {
      console.error('Error fetching all locations data:', error);
      return {};
    }
  }

  // Convert Pathway data to chart format
  convertToChartData(pathwayData: PathwayDashboardData): any {
    return {
      location: pathwayData.location,
      trafficData: {
        status: pathwayData.traffic.status,
        congestion_level: pathwayData.traffic.congestion_level,
        vehicle_count: pathwayData.traffic.vehicle_count,
        timestamp: pathwayData.traffic.timestamp
      },
      aqiData: {
        aqi: pathwayData.aqi.aqi,
        category: pathwayData.aqi.category,
        pm2_5: pathwayData.aqi.pm2_5,
        pm10: pathwayData.aqi.pm10,
        timestamp: pathwayData.aqi.timestamp
      },
      crowdData: {
        density: pathwayData.crowd.density,
        change_rate: pathwayData.crowd.change_rate,
        capacity_utilization: pathwayData.crowd.capacity_utilization,
        timestamp: pathwayData.crowd.timestamp
      },
      noiseData: {
        level: pathwayData.noise.level,
        source: pathwayData.noise.source,
        timestamp: pathwayData.noise.timestamp
      },
      responseTimesData: {
        medical: pathwayData.response_times.medical,
        fire: pathwayData.response_times.fire,
        police: pathwayData.response_times.police,
        traffic: pathwayData.response_times.traffic,
        rescue: pathwayData.response_times.rescue,
        timestamp: pathwayData.response_times.timestamp
      },
      incidentData: {
        medical: pathwayData.incidents.medical,
        fire: pathwayData.incidents.fire,
        traffic: pathwayData.incidents.traffic,
        natural: pathwayData.incidents.natural,
        total: pathwayData.incidents.total,
        timestamp: pathwayData.incidents.timestamp
      },
      metrics: pathwayData.metrics,
      overall_score: pathwayData.overall_score,
      last_updated: pathwayData.last_updated
    };
  }
}

export const pathwayAPIService = new PathwayAPIService();
export default pathwayAPIService;
