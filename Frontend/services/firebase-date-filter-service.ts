import { firebaseLocationService, FirebaseLocationData, LocationDetection } from './firebase-location-service';
import { startOfDay, endOfDay, startOfHour, endOfHour, parseISO, isWithinInterval, format } from 'date-fns';

export interface DateFilterOptions {
  location: string;
  startDate: Date;
  endDate: Date;
  hourFilter?: number; // Optional: filter by specific hour (0-23)
}

export interface AggregatedData {
  timestamp: string;
  averageCars: number;
  averagePeople: number;
  maxCars: number;
  maxPeople: number;
  minCars: number;
  minPeople: number;
  trafficLevel: string;
  pedestrianLevel: string;
  dataPoints: number;
}

export interface HourlyData {
  hour: number;
  hourLabel: string;
  averageCars: number;
  averagePeople: number;
  trafficLevel: string;
  dataPoints: number;
}

export interface AvailableDateRange {
  location: string;
  earliestDate: Date | null;
  latestDate: Date | null;
  totalDetections: number;
  availableHours: number[]; // Hours that have data
}

class FirebaseDateFilterService {
  
  /**
   * Get available date range for a location
   */
  async getAvailableDateRange(locationName: string): Promise<AvailableDateRange> {
    try {
      const detections = await firebaseLocationService.getDetections(locationName, 1000);
      
      if (detections.length === 0) {
        return {
          location: locationName,
          earliestDate: null,
          latestDate: null,
          totalDetections: 0,
          availableHours: []
        };
      }

      // Parse timestamps and find earliest/latest
      const dates = detections.map(d => this.parseTimestampKey(d.timestamp)).filter(d => d !== null) as Date[];
      const hours = new Set(dates.map(d => d.getHours()));

      return {
        location: locationName,
        earliestDate: new Date(Math.min(...dates.map(d => d.getTime()))),
        latestDate: new Date(Math.max(...dates.map(d => d.getTime()))),
        totalDetections: detections.length,
        availableHours: Array.from(hours).sort((a, b) => a - b)
      };
    } catch (error) {
      console.error('Error getting available date range:', error);
      return {
        location: locationName,
        earliestDate: null,
        latestDate: null,
        totalDetections: 0,
        availableHours: []
      };
    }
  }

  /**
   * Get filtered detections based on date range
   */
  async getFilteredDetections(options: DateFilterOptions): Promise<LocationDetection[]> {
    try {
      // Fetch all detections (you may want to implement pagination for large datasets)
      const allDetections = await firebaseLocationService.getDetections(options.location, 1000);
      
      // Filter by date range
      const filtered = allDetections.filter(detection => {
        const detectionDate = this.parseTimestampKey(detection.timestamp);
        if (!detectionDate) return false;

        const isInRange = isWithinInterval(detectionDate, {
          start: startOfDay(options.startDate),
          end: endOfDay(options.endDate)
        });

        // If hour filter is specified, also filter by hour
        if (options.hourFilter !== undefined) {
          return isInRange && detectionDate.getHours() === options.hourFilter;
        }

        return isInRange;
      });

      return filtered;
    } catch (error) {
      console.error('Error getting filtered detections:', error);
      return [];
    }
  }

  /**
   * Aggregate data by day
   */
  async getAggregatedByDay(options: DateFilterOptions): Promise<AggregatedData[]> {
    const detections = await this.getFilteredDetections(options);
    
    // Group by day
    const groupedByDay = new Map<string, FirebaseLocationData[]>();
    
    detections.forEach(detection => {
      const date = this.parseTimestampKey(detection.timestamp);
      if (!date) return;
      
      const dayKey = format(date, 'yyyy-MM-dd');
      
      if (!groupedByDay.has(dayKey)) {
        groupedByDay.set(dayKey, []);
      }
      groupedByDay.get(dayKey)!.push(detection.data);
    });

    // Aggregate each day
    const aggregated: AggregatedData[] = [];
    
    groupedByDay.forEach((data, dayKey) => {
      const cars = data.map(d => d.cars);
      const people = data.map(d => d.people);
      
      aggregated.push({
        timestamp: dayKey,
        averageCars: this.average(cars),
        averagePeople: this.average(people),
        maxCars: Math.max(...cars),
        maxPeople: Math.max(...people),
        minCars: Math.min(...cars),
        minPeople: Math.min(...people),
        trafficLevel: this.getMostCommonValue(data.map(d => d.traffic_level)),
        pedestrianLevel: this.getMostCommonValue(data.map(d => d.pedestrian_level)),
        dataPoints: data.length
      });
    });

    return aggregated.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Aggregate data by hour for a specific day
   */
  async getAggregatedByHour(location: string, date: Date): Promise<HourlyData[]> {
    const detections = await this.getFilteredDetections({
      location,
      startDate: startOfDay(date),
      endDate: endOfDay(date)
    });

    // Group by hour
    const groupedByHour = new Map<number, FirebaseLocationData[]>();
    
    detections.forEach(detection => {
      const detectionDate = this.parseTimestampKey(detection.timestamp);
      if (!detectionDate) return;
      
      const hour = detectionDate.getHours();
      
      if (!groupedByHour.has(hour)) {
        groupedByHour.set(hour, []);
      }
      groupedByHour.get(hour)!.push(detection.data);
    });

    // Aggregate each hour
    const aggregated: HourlyData[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const data = groupedByHour.get(hour) || [];
      
      if (data.length > 0) {
        const cars = data.map(d => d.cars);
        const people = data.map(d => d.people);
        
        aggregated.push({
          hour,
          hourLabel: this.formatHour(hour),
          averageCars: this.average(cars),
          averagePeople: this.average(people),
          trafficLevel: this.getMostCommonValue(data.map(d => d.traffic_level)),
          dataPoints: data.length
        });
      } else {
        // Include empty hours with zero data
        aggregated.push({
          hour,
          hourLabel: this.formatHour(hour),
          averageCars: 0,
          averagePeople: 0,
          trafficLevel: 'EMPTY',
          dataPoints: 0
        });
      }
    }

    return aggregated;
  }

  /**
   * Get traffic comparison across date ranges
   */
  async getComparison(
    location: string,
    range1: { start: Date; end: Date },
    range2: { start: Date; end: Date }
  ): Promise<{
    range1: AggregatedData[];
    range2: AggregatedData[];
  }> {
    const [data1, data2] = await Promise.all([
      this.getAggregatedByDay({
        location,
        startDate: range1.start,
        endDate: range1.end
      }),
      this.getAggregatedByDay({
        location,
        startDate: range2.start,
        endDate: range2.end
      })
    ]);

    return {
      range1: data1,
      range2: data2
    };
  }

  /**
   * Parse timestamp key (format: YYYYMMDD_HHMMSS)
   */
  private parseTimestampKey(timestampKey: string): Date | null {
    try {
      // Format: 20241016_143022
      const [datePart, timePart] = timestampKey.split('_');
      
      if (!datePart || !timePart) return null;
      
      const year = parseInt(datePart.substring(0, 4));
      const month = parseInt(datePart.substring(4, 6)) - 1; // Months are 0-indexed
      const day = parseInt(datePart.substring(6, 8));
      
      const hours = parseInt(timePart.substring(0, 2));
      const minutes = parseInt(timePart.substring(2, 4));
      const seconds = parseInt(timePart.substring(4, 6));
      
      return new Date(year, month, day, hours, minutes, seconds);
    } catch (error) {
      console.error('Error parsing timestamp key:', timestampKey, error);
      return null;
    }
  }

  /**
   * Calculate average of numbers
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
  }

  /**
   * Get most common value in array
   */
  private getMostCommonValue(values: string[]): string {
    if (values.length === 0) return 'UNKNOWN';
    
    const counts = new Map<string, number>();
    values.forEach(v => {
      counts.set(v, (counts.get(v) || 0) + 1);
    });
    
    let maxCount = 0;
    let mostCommon = values[0];
    
    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = value;
      }
    });
    
    return mostCommon;
  }

  /**
   * Format hour (0-23) to readable string
   */
  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }

  /**
   * Get summary statistics for a date range
   */
  async getSummaryStats(options: DateFilterOptions): Promise<{
    totalDetections: number;
    avgCarsPerHour: number;
    avgPeoplePerHour: number;
    peakTrafficHour: string;
    peakTrafficCount: number;
    quietestHour: string;
    quietestCount: number;
  }> {
    const detections = await this.getFilteredDetections(options);
    
    if (detections.length === 0) {
      return {
        totalDetections: 0,
        avgCarsPerHour: 0,
        avgPeoplePerHour: 0,
        peakTrafficHour: 'N/A',
        peakTrafficCount: 0,
        quietestHour: 'N/A',
        quietestCount: 0
      };
    }

    // Group by hour to find peaks
    const hourlyTotals = new Map<number, number>();
    
    detections.forEach(detection => {
      const date = this.parseTimestampKey(detection.timestamp);
      if (!date) return;
      
      const hour = date.getHours();
      const total = (hourlyTotals.get(hour) || 0) + detection.data.cars;
      hourlyTotals.set(hour, total);
    });

    let peakHour = 0;
    let peakCount = 0;
    let quietestHour = 0;
    let quietestCount = Infinity;

    hourlyTotals.forEach((count, hour) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
      if (count < quietestCount) {
        quietestCount = count;
        quietestHour = hour;
      }
    });

    const allCars = detections.map(d => d.data.cars);
    const allPeople = detections.map(d => d.data.people);

    return {
      totalDetections: detections.length,
      avgCarsPerHour: this.average(allCars),
      avgPeoplePerHour: this.average(allPeople),
      peakTrafficHour: this.formatHour(peakHour),
      peakTrafficCount: peakCount,
      quietestHour: this.formatHour(quietestHour),
      quietestCount: quietestCount === Infinity ? 0 : quietestCount
    };
  }
}

// Export singleton instance
export const firebaseDateFilterService = new FirebaseDateFilterService();
