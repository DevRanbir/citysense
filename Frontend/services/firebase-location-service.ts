import { getDatabase, ref, onValue, off, get } from 'firebase/database';
import { app } from '@/lib/firebase';

// Location mapping based on backend structure
export const FIREBASE_LOCATIONS = {
  'Canmore Alberta': {
    firebaseKey: 'Canmore Alberta',
    displayName: 'Canmore Alberta',
    description: 'Main Street Livecam, Canmore, Alberta',
    youtubeId: '_0wPODlF9wU',
    coords: { lat: 51.0892, lng: -115.3576 }
  },
  'Koh Samui Thailand': {
    firebaseKey: 'Koh Samui Thailand',
    displayName: 'Koh Samui Thailand',
    description: 'Bondi Aussie Bar & Grill | Chaweng',
    youtubeId: 'VR-x3HdhKLQ',
    coords: { lat: 9.5125, lng: 100.0147 }
  },
  'Bangkok Thailand': {
    firebaseKey: 'Bangkok Thailand',
    displayName: 'Bangkok Thailand',
    description: 'El Gaucho | Soi 11 | Sukhumvit Road',
    youtubeId: 'UemFRPrl1hk',
    coords: { lat: 13.7563, lng: 100.5018 }
  },
  '4 Corners Downtown': {
    firebaseKey: '4 Corners Downtown',
    displayName: '4 Corners Downtown',
    description: '4 Corners Camera Downtown',
    youtubeId: 'ByED80IKdIU',
    coords: { lat: 40.7128, lng: -74.0060 }
  }
};

export interface FirebaseLocationData {
  cars: number;
  people: number;
  timestamp: string;
  traffic_level: string;
  pedestrian_level: string;
  vehicle_breakdown: {
    cars: number;
    motorcycles: number;
    buses: number;
    trucks: number;
    bicycles: number;
  };
}

export interface LocationDetection {
  timestamp: string;
  data: FirebaseLocationData;
}

class FirebaseLocationService {
  private db: any;
  private listeners: Map<string, any> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.db = getDatabase(app);
    }
  }

  /**
   * Get all available locations from Firebase
   */
  async getAvailableLocations(): Promise<string[]> {
    if (!this.db) return Object.keys(FIREBASE_LOCATIONS);

    try {
      const locationsRef = ref(this.db, 'locations');
      const snapshot = await get(locationsRef);
      
      if (snapshot.exists()) {
        return Object.keys(snapshot.val());
      }
      return Object.keys(FIREBASE_LOCATIONS);
    } catch (error) {
      console.error('Error fetching locations:', error);
      return Object.keys(FIREBASE_LOCATIONS);
    }
  }

  /**
   * Get the latest data for a specific location
   */
  async getLatestData(locationName: string): Promise<FirebaseLocationData | null> {
    if (!this.db) return null;

    const locationConfig = FIREBASE_LOCATIONS[locationName as keyof typeof FIREBASE_LOCATIONS];
    if (!locationConfig) {
      console.warn(`Location ${locationName} not found in configuration`);
      return null;
    }

    try {
      const latestRef = ref(this.db, `locations/${locationConfig.firebaseKey}/latest`);
      const snapshot = await get(latestRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as FirebaseLocationData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching latest data for ${locationName}:`, error);
      return null;
    }
  }

  /**
   * Subscribe to real-time updates for a specific location
   */
  subscribeToLocation(
    locationName: string,
    callback: (data: FirebaseLocationData | null) => void
  ): () => void {
    if (!this.db) {
      console.warn('Firebase database not initialized');
      return () => {};
    }

    const locationConfig = FIREBASE_LOCATIONS[locationName as keyof typeof FIREBASE_LOCATIONS];
    if (!locationConfig) {
      console.warn(`Location ${locationName} not found in configuration`);
      return () => {};
    }

    const latestRef = ref(this.db, `locations/${locationConfig.firebaseKey}/latest`);
    
    const unsubscribe = onValue(latestRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as FirebaseLocationData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error subscribing to ${locationName}:`, error);
      callback(null);
    });

    // Store the listener for cleanup
    this.listeners.set(locationName, { ref: latestRef, unsubscribe });

    // Return cleanup function
    return () => {
      off(latestRef);
      this.listeners.delete(locationName);
    };
  }

  /**
   * Get historical detections for a location
   */
  async getDetections(
    locationName: string,
    limit: number = 50
  ): Promise<LocationDetection[]> {
    if (!this.db) return [];

    const locationConfig = FIREBASE_LOCATIONS[locationName as keyof typeof FIREBASE_LOCATIONS];
    if (!locationConfig) {
      console.warn(`Location ${locationName} not found in configuration`);
      return [];
    }

    try {
      const detectionsRef = ref(this.db, `locations/${locationConfig.firebaseKey}/detections`);
      const snapshot = await get(detectionsRef);
      
      if (snapshot.exists()) {
        const detections = snapshot.val();
        const detectionArray: LocationDetection[] = [];
        
        Object.keys(detections).forEach((key) => {
          detectionArray.push({
            timestamp: key,
            data: detections[key]
          });
        });
        
        // Sort by timestamp (newest first) and limit
        return detectionArray
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .slice(0, limit);
      }
      return [];
    } catch (error) {
      console.error(`Error fetching detections for ${locationName}:`, error);
      return [];
    }
  }

  /**
   * Get traffic status based on vehicle count
   */
  getTrafficStatus(vehicleCount: number): {
    status: string;
    dotColor: string;
  } {
    if (vehicleCount === 0) {
      return { status: 'Empty', dotColor: 'bg-gray-500' };
    } else if (vehicleCount <= 3) {
      return { status: 'Smooth', dotColor: 'bg-green-500' };
    } else if (vehicleCount <= 8) {
      return { status: 'Moderate', dotColor: 'bg-yellow-500' };
    } else if (vehicleCount <= 15) {
      return { status: 'Heavy', dotColor: 'bg-red-500' };
    } else {
      return { status: 'Congested', dotColor: 'bg-red-700' };
    }
  }

  /**
   * Get location configuration
   */
  getLocationConfig(locationName: string) {
    return FIREBASE_LOCATIONS[locationName as keyof typeof FIREBASE_LOCATIONS] || null;
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    this.listeners.forEach((listener) => {
      off(listener.ref);
    });
    this.listeners.clear();
  }
}

// Export singleton instance
export const firebaseLocationService = new FirebaseLocationService();
