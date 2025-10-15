"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

interface WorkingPathwayDashboardProps {
  selectedLocation: string;
}

export function WorkingPathwayDashboard({ selectedLocation }: WorkingPathwayDashboardProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [updates, setUpdates] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkConnection();
    const interval = setInterval(() => {
      fetchData(); // Always fetch data, whether connected or not
    }, 3000); // Faster updates every 3 seconds
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const generateMockData = () => {
    return {
      location: selectedLocation,
      overall_score: Math.floor(Math.random() * 40) + 60,
      traffic: {
        status: ['Heavy', 'Moderate', 'Smooth'][Math.floor(Math.random() * 3)],
        congestion_level: Math.floor(Math.random() * 30) + 60,
        vehicle_count: Math.floor(Math.random() * 10000) + 5000,
      },
      aqi: {
        aqi: Math.floor(Math.random() * 50) + 100,
        category: ['Moderate', 'Unhealthy'][Math.floor(Math.random() * 2)],
        pm2_5: Math.floor(Math.random() * 30) + 80,
      },
      crowd: {
        density: Math.floor(Math.random() * 800) + 400,
        change_rate: Math.floor(Math.random() * 20) - 10,
      },
      response_times: {
        medical: (Math.random() * 5 + 5).toFixed(1),
        fire: (Math.random() * 3 + 6).toFixed(1),
        police: (Math.random() * 4 + 4).toFixed(1),
      },
      last_updated: new Date().toLocaleTimeString(),
    };
  };

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        setIsConnected(true);
        setError('');
        console.log('✅ Pathway backend is running!');
        fetchData();
      } else {
        setIsConnected(false);
        setError('Pathway backend not responding');
        generateMockData();
      }
    } catch (err) {
      setIsConnected(false);
      setError('Cannot connect to Pathway backend');
      generateMockData();
    }
  };

  const fetchData = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const url = `http://localhost:8000/api/pathway/dashboard/${encodeURIComponent(selectedLocation)}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const pathwayData = await response.json();
        setData(pathwayData);
        setError('');
        console.log('✅ Got Pathway data:', pathwayData.location);
      } else {
        console.log('❌ Pathway response error:', response.status);
        const mockData = generateMockData();
        setData(mockData);
      }
    } catch (err) {
      console.log('❌ Fetch error:', err);
      const mockData = generateMockData();
      setData(mockData);
    }
    setLoading(false);
    setUpdates(prev => prev + 1);
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

  if (!data) {
    return (
      <Card className="mb-4">
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Loading Real-Time Data...</h3>
          <p className="text-gray-600">Connecting to Pathway backend...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-Time Reports - {selectedLocation}
            <Badge className={isConnected ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
              {isConnected ? 'PATHWAY LIVE' : 'DEMO MODE'}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            {getConnectionIcon()}
            <span className="text-sm text-gray-600">
              Updates: {updates}
            </span>
            <Button size="sm" variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className="w-4 h-4" />
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
