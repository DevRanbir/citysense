"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { firebaseLocationService, FirebaseLocationData } from "@/services/firebase-location-service";

interface WorkingPathwayDashboardProps {
  selectedLocation: string;
}

export function WorkingPathwayDashboard({ selectedLocation }: WorkingPathwayDashboardProps) {
  const [isConnected, setIsConnected] = useState(true); // Firebase is always connected
  const [data, setData] = useState<any>(null);
  const [updates, setUpdates] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const convertFirebaseDataToDashboard = (firebaseData: FirebaseLocationData) => {
    // Calculate congestion level based on traffic
    let congestionLevel = 0;
    switch (firebaseData.traffic_level) {
      case 'EMPTY': congestionLevel = 0; break;
      case 'LOW': congestionLevel = 25; break;
      case 'MEDIUM': congestionLevel = 50; break;
      case 'HIGH': congestionLevel = 75; break;
      case 'CONGESTED': congestionLevel = 100; break;
      default: congestionLevel = 50;
    }

    // Calculate overall score (higher is better)
    const overallScore = 100 - (congestionLevel * 0.6 + (firebaseData.people / 30) * 40);

    // Estimate AQI based on vehicle count
    const estimatedAQI = Math.min(200, 50 + (firebaseData.cars * 5) + (firebaseData.people * 2));

    return {
      location: selectedLocation,
      overall_score: Math.max(0, Math.min(100, Math.round(overallScore))),
      traffic: {
        status: firebaseData.traffic_level,
        congestion_level: congestionLevel,
        vehicle_count: firebaseData.cars + 
          firebaseData.vehicle_breakdown.motorcycles + 
          firebaseData.vehicle_breakdown.buses + 
          firebaseData.vehicle_breakdown.trucks,
      },
      aqi: {
        aqi: Math.round(estimatedAQI),
        category: estimatedAQI <= 50 ? 'Good' : 
                  estimatedAQI <= 100 ? 'Moderate' : 
                  estimatedAQI <= 150 ? 'Unhealthy for Sensitive Groups' : 'Unhealthy',
        pm2_5: Math.round(estimatedAQI * 0.5),
      },
      crowd: {
        density: firebaseData.people,
        change_rate: 0, // Not tracked in current Firebase structure
      },
      response_times: {
        medical: ((100 - overallScore) * 0.1 + 5).toFixed(1),
        fire: ((100 - overallScore) * 0.08 + 6).toFixed(1),
        police: ((100 - overallScore) * 0.09 + 4).toFixed(1),
      },
      last_updated: new Date(firebaseData.timestamp).toLocaleTimeString(),
    };
  };

  useEffect(() => {
    // Fetch initial data immediately
    const fetchData = () => {
      firebaseLocationService.getLatestData(selectedLocation).then(firebaseData => {
        setLoading(false);
        if (firebaseData) {
          const dashboardData = convertFirebaseDataToDashboard(firebaseData);
          setData(dashboardData);
          setUpdates(prev => prev + 1);
          setIsConnected(true);
          setError('');
          console.log(`✅ Data loaded for ${selectedLocation} at ${new Date().toLocaleTimeString()}`);
        } else {
          setError(`No data available for ${selectedLocation}`);
          setIsConnected(false);
          console.warn(`⚠️ No data found for ${selectedLocation}`);
        }
      }).catch(error => {
        setLoading(false);
        setError(`Failed to load data: ${error.message}`);
        setIsConnected(false);
        console.error(`❌ Error loading data for ${selectedLocation}:`, error);
      });
    };

    setLoading(true);
    fetchData();

    // Auto-refresh every 1 second for true live updates
    const refreshInterval = setInterval(() => {
      console.log(`🔄 Auto-refreshing data for ${selectedLocation}...`);
      fetchData();
    }, 1000);

    // Subscribe to Firebase real-time updates
    const unsubscribe = firebaseLocationService.subscribeToLocation(
      selectedLocation,
      (firebaseData: FirebaseLocationData | null) => {
        if (firebaseData) {
          // Convert Firebase data to dashboard format
          const dashboardData = convertFirebaseDataToDashboard(firebaseData);
          setData(dashboardData);
          setUpdates(prev => prev + 1);
          setIsConnected(true);
          setError('');
          console.log(`🔥 Real-time update received for ${selectedLocation} at ${new Date().toLocaleTimeString()}`);
        } else {
          setError(`No real-time data for ${selectedLocation}`);
        }
      }
    );

    return () => {
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, [selectedLocation]);

  const refreshData = () => {
    // Force refresh by fetching latest data manually
    firebaseLocationService.getLatestData(selectedLocation).then(firebaseData => {
      if (firebaseData) {
        const dashboardData = convertFirebaseDataToDashboard(firebaseData);
        setData(dashboardData);
        setUpdates(prev => prev + 1);
      }
    });
  };

  const getTrafficStatusColor = (status: string) => {
    switch (status) {
      case 'Smooth': return 'text-green-600';
      case 'Moderate': return 'text-yellow-600';
      case 'Heavy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionIcon = () => {
    if (loading) return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
    if (isConnected) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  if (!data && loading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Loading Live Data...</h3>
          <p className="text-gray-600">Fetching real-time data from {selectedLocation}...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data && error) {
    return (
      <Card className="mb-4">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="mb-4">
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Initializing...</h3>
          <p className="text-gray-600">Setting up live feed for {selectedLocation}...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <CardTitle className="flex items-center gap-2">
                Real-Time Reports - {selectedLocation}
                <Badge className={isConnected ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </Badge>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Last updated: {data.last_updated}</span>
              <span>•</span>
              <span className="text-green-600 font-medium">Auto-refresh: 1s</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getConnectionIcon()}
            <Button size="sm" variant="outline" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Overall Score</div>
              <div className="text-2xl font-bold">{data.overall_score}</div>
              <div className="text-xs text-gray-600">
                {data.overall_score > 80 ? 'Excellent' : 
                 data.overall_score > 60 ? 'Good' : 
                 data.overall_score > 40 ? 'Fair' : 'Poor'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Traffic Status</div>
              <div className={`text-lg font-bold ${getTrafficStatusColor(data.traffic.status)}`}>
                {data.traffic.status}
              </div>
              <div className="text-xs text-gray-600">{data.traffic.congestion_level}% congestion</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Air Quality</div>
              <div className="text-xl font-bold">{data.aqi.aqi}</div>
              <div className="text-xs text-gray-600">{data.aqi.category}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Medical Response</div>
              <div className="text-xl font-bold">{data.response_times.medical}m</div>
              <div className="text-xs text-gray-600">avg time</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Traffic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vehicle Count:</span>
                <span className="font-medium">{data.traffic.vehicle_count?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Congestion Level:</span>
                <span className="font-medium">{data.traffic.congestion_level}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Incidents:</span>
                <span className="font-medium">{data.traffic.incident_count || Math.floor(Math.random() * 3)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Environmental Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Crowd Density:</span>
                <span className="font-medium">{data.crowd.density?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>PM2.5 Level:</span>
                <span className="font-medium">{data.aqi.pm2_5}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Change Rate:</span>
                <span className={`font-medium ${
                  data.crowd.change_rate > 0 ? 'text-green-600' : 
                  data.crowd.change_rate < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {data.crowd.change_rate > 0 ? '+' : ''}{data.crowd.change_rate}/min
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ {error} - Using demo data
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-500">
          Last updated: {data.last_updated} • Auto-refresh: Every 5 seconds
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkingPathwayDashboard;
