"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pathwayAPIService, PathwayDashboardData } from "@/services/pathway-api-service";
import { Chart02 } from "@/components/chart-02";
import { Chart03 } from "@/components/chart-03";
import { 
  Activity, 
  Wifi, 
  Database, 
  Zap, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface PathwayLiveDashboardProps {
  selectedLocation: string;
  enablePathwayUpdates?: boolean;
}

export function PathwayLiveDashboard({ 
  selectedLocation, 
  enablePathwayUpdates = true 
}: PathwayLiveDashboardProps) {
  const [pathwayData, setPathwayData] = useState<PathwayDashboardData | null>(null);
  const [isPathwayConnected, setIsPathwayConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string>('');
  
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check Pathway connection on mount and when location changes
  useEffect(() => {
    checkPathwayConnection();
  }, []);

  // Real-time data updates
  useEffect(() => {
    if (!enablePathwayUpdates || !isPathwayConnected) return;

    // Subscribe to real-time updates
    updateIntervalRef.current = pathwayAPIService.subscribeToLocationUpdates(
      selectedLocation,
      handlePathwayDataUpdate,
      5000 // Update every 5 seconds
    );

    // Initial data fetch
    fetchPathwayData();

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [selectedLocation, enablePathwayUpdates, isPathwayConnected]);

  const checkPathwayConnection = async () => {
    setConnectionStatus('connecting');
    try {
      const connected = await pathwayAPIService.checkConnection();
      setIsPathwayConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      
      if (connected) {
        setError('');
        console.log('🔗 Pathway backend connected');
      } else {
        setError('Pathway backend not available');
        console.log('❌ Pathway backend not available');
      }
    } catch (err) {
      setConnectionStatus('disconnected');
      setIsPathwayConnected(false);
      setError('Pathway connection failed');
    }
  };

  const fetchPathwayData = async () => {
    try {
      const data = await pathwayAPIService.getDashboardData(selectedLocation);
      if (data) {
        setPathwayData(data);
        setLastUpdated(new Date(data.last_updated).toLocaleTimeString());
        setError('');
        console.log(`📊 Pathway data received for ${selectedLocation}`);
      }
    } catch (err) {
      console.error('Error fetching Pathway data:', err);
      setError('Failed to fetch Pathway data');
    }
  };

  const handlePathwayDataUpdate = (data: PathwayDashboardData) => {
    setPathwayData(data);
    setLastUpdated(new Date(data.last_updated).toLocaleTimeString());
    setUpdateCount(prev => prev + 1);
    setError('');
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (score: number) => {
    if (score >= 80) return { color: 'bg-green-500', text: 'Excellent' };
    if (score >= 60) return { color: 'bg-yellow-500', text: 'Good' };
    if (score >= 40) return { color: 'bg-orange-500', text: 'Moderate' };
    return { color: 'bg-red-500', text: 'Poor' };
  };

  const getTrafficStatusColor = (status: string) => {
    switch (status) {
      case 'Smooth': return 'text-green-600';
      case 'Moderate': return 'text-yellow-600';
      case 'Heavy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAQICategoryColor = (category: string) => {
    switch (category) {
      case 'Good': return 'text-green-600';
      case 'Moderate': return 'text-yellow-600';
      case 'Unhealthy': return 'text-orange-600';
      case 'Very Unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isPathwayConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Pathway Live Dashboard
            <Badge variant="destructive">Disconnected</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pathway Backend Not Available</h3>
            <p className="text-gray-600 mb-4">
              Connect to Pathway backend to see real-time data streams
            </p>
            <Button onClick={checkPathwayConnection}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconnect
            </Button>
            <div className="mt-4 text-sm text-gray-500">
              <p>Make sure you've started the Pathway backend:</p>
              <code className="bg-gray-100 p-2 rounded block mt-2 text-xs">
                python start-hackathon-demo.py
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Pathway Connection Status */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getConnectionIcon()}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Pathway Backend</span>
                  <Badge className="bg-green-500">
                    <Zap className="w-3 h-3 mr-1" />
                    ACTIVE
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Real-time data streams unified · Location: {selectedLocation}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">Updates</div>
                <div className="font-bold text-green-600">{updateCount}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Last Update</div>
                <div className="text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastUpdated}
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchPathwayData}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Data Cards */}
      {pathwayData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Overall Score */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Overall Score</div>
                <div className="text-2xl font-bold mb-2">{pathwayData.overall_score}</div>
                <Badge className={getStatusBadge(pathwayData.overall_score).color}>
                  {getStatusBadge(pathwayData.overall_score).text}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Status */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Traffic</div>
                <div className={`text-lg font-bold ${getTrafficStatusColor(pathwayData.traffic.status)} mb-1`}>
                  {pathwayData.traffic.status}
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round(pathwayData.traffic.congestion_level)}% congestion
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AQI */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Air Quality</div>
                <div className="text-xl font-bold mb-1">{pathwayData.aqi.aqi}</div>
                <div className={`text-sm ${getAQICategoryColor(pathwayData.aqi.category)}`}>
                  {pathwayData.aqi.category}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Medical Response</div>
                <div className="text-xl font-bold mb-1">{pathwayData.response_times.medical}m</div>
                <div className="text-sm text-gray-600">avg response</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Pathway Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source Status */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Data Stream Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Traffic API (HTTP)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Sensor MQTT/Kafka</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ambulance WebSocket</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default PathwayLiveDashboard;
