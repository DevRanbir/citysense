"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fakeDataService, DashboardData } from "@/services/fake-data-service";
import { RefreshCw, Play, Pause, Activity } from "lucide-react";

interface LiveDataControlsProps {
  selectedLocation: string;
  onDataUpdate?: (data: DashboardData) => void;
}

export function LiveDataControls({ selectedLocation, onDataUpdate }: LiveDataControlsProps) {
  const [isAutoEnabled, setIsAutoEnabled] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [currentData, setCurrentData] = useState<DashboardData | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Subscribe to data updates
  useEffect(() => {
    const unsubscribe = fakeDataService.subscribe((data) => {
      if (data.location === selectedLocation) {
        setCurrentData(data);
        setUpdateCount(prev => prev + 1);
        onDataUpdate?.(data);
      }
    });

    // Get initial data
    const initialData = fakeDataService.getCurrentData(selectedLocation);
    setCurrentData(initialData);
    onDataUpdate?.(initialData);

    return unsubscribe;
  }, [selectedLocation, onDataUpdate]);

  // Handle manual update
  const handleManualUpdate = () => {
    fakeDataService.updateLocationData(selectedLocation);
    setUpdateCount(prev => prev + 1);
  };

  // Toggle auto updates
  const toggleAutoUpdates = () => {
    if (isAutoEnabled) {
      // Stop auto updates
      if (intervalId) {
        fakeDataService.stopContinuousUpdates(intervalId);
        setIntervalId(null);
      }
      setIsAutoEnabled(false);
    } else {
      // Start auto updates
      const id = fakeDataService.startContinuousUpdates(3000); // Every 3 seconds
      setIntervalId(id);
      setIsAutoEnabled(true);
    }
  };

  const getStatusColor = () => {
    return isAutoEnabled ? 'bg-green-500' : 'bg-gray-500';
  };

  const getStatusText = () => {
    return isAutoEnabled ? 'AUTO LIVE' : 'MANUAL';
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Live Data Controls
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleManualUpdate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Update Data Now
          </Button>
          
          <Button
            onClick={toggleAutoUpdates}
            variant={isAutoEnabled ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isAutoEnabled ? (
              <>
                <Pause className="w-4 h-4" />
                Stop Auto Updates
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Auto Updates
              </>
            )}
          </Button>
          
          <Button
            onClick={() => fakeDataService.updateAllLocationsData()}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Update All Locations
          </Button>
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-2 bg-blue-50 dark:bg-blue┸900/20 rounded text-center">
            <div className="text-blue-600 dark:text-blue-400 font-medium">Location</div>
            <div className="text-blue-700 dark:text-blue-300 font-bold">{selectedLocation}</div>
          </div>
          
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">
            <div className="text-green-600 dark:text-green-400 font-medium">Updates</div>
            <div className="text-green-700 dark:text-green-300 font-bold">{updateCount}</div>
          </div>
          
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-center">
            <div className="text-purple-600 dark:text-purple-400 font-medium">AQI</div>
            <div className="text-purple-700 dark:text-purple-300 font-bold">
              {currentData?.aqi.aqi || '-'}
            </div>
          </div>
          
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-center">
            <div className="text-orange-600 dark:text-orange-400 font-medium">Traffic</div>
            <div className="text-orange-700 dark:text-orange-300 font-bold">
              {currentData?.traffic.status || '-'}
            </div>
          </div>
        </div>

        {currentData && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Last updated: {new Date(currentData.traffic.timestamp).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LiveDataControls;
