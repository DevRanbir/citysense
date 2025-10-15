"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { fakeDataService, AQIData } from "@/services/fake-data-service";

interface AQIDataPoint {
  time: string;
  aqi: number;
  timestamp?: string;
  category?: string;
}

const chartConfig = {
  aqi: {
    label: "AQI",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface LiveChart02Props {
  selectedLocation: string;
  enableLiveUpdates?: boolean;
}

export function LiveChart02({ selectedLocation, enableLiveUpdates = true }: LiveChart02Props) {
  const [aqiData, setAqiData] = useState<AQIDataPoint[]>([]);
  const [currentAQI, setCurrentAQI] = useState<AQIData | null>(null);
  const [isLiveEnabled, setIsLiveEnabled] = useState(enableLiveUpdates);
  const dataHistoryRef = useRef<AQIDataPoint[]>([]);

  // Initialize with sample data
  useEffect(() => {
    const baseData = [
      { time: "0:00", aqi: 125 },
      { time: "2:00", aqi: 118 },
      { time: "4:00", aqi: 130 },
      { time: "6:00", aqi: 142 },
      { time: "8:00", aqi: 165 },
      { time: "10:00", aqi: 155 },
      { time: "12:00", aqi: 148 },
      { time: "14:00", aqi: 152 },
      { time: "16:00", aqi: 168 },
      { time: "18:00", aqi: 175 },
      { time: "20:00", aqi: 158 },
      { time: "22:00", aqi: 135 },
      { time: "23:00", aqi: 128 },
    ];

    dataHistoryRef.current = baseData.map(item => ({
      ...item,
      timestamp: new Date().toISOString()
    }));
    setAqiData(dataHistoryRef.current);
  }, [selectedLocation]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isLiveEnabled) return;

    const unsubscribe = fakeDataService.subscribe((data) => {
      if (data.location === selectedLocation) {
        setCurrentAQI(data.aqi);
        
        // Add new data point to chart
        const now = new Date();
        const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const newDataPoint = {
          time: timeLabel,
          aqi: data.aqi.aqi,
          timestamp: data.aqi.timestamp,
          category: data.aqi.category
        };

        dataHistoryRef.current.push(newDataPoint);
        
        // Keep only last 12 points
        if (dataHistoryRef.current.length > 12) {
          dataHistoryRef.current = dataHistoryRef.current.slice(-12);
        }
        
        setAqiData([...dataHistoryRef.current]);
      }
    });

    // Get initial data
    const initialData = fakeDataService.getCurrentData(selectedLocation);
    setCurrentAQI(initialData.aqi);

    return unsubscribe;
  }, [selectedLocation, isLiveEnabled]);

  const getAQICategoryColor = (category: string) => {
    switch (category) {
      case 'Good': return 'bg-green-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Unhealthy': return 'bg-orange-500';
      case 'Very Unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              AQI Trend (Live Updates)
              <span className="text-sm font-normal text-gray-500 block">
                Location: {selectedLocation}
              </span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isLiveEnabled && currentAQI && (
              <Badge className={`${getAQICategoryColor(currentAQI.category)} text-white animate-pulse`}>
                🔄 LIVE
              </Badge>
            )}
            {currentAQI && (
              <div className="text-right">
                <Badge 
                  className={`${getAQICategoryColor(currentAQI.category)} text-white font-bold text-lg`}
                >
                  {currentAQI.aqi}
                </Badge>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {currentAQI.category}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={aqiData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 200]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={(props) => (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                  <p className="font-medium">AQI: {props.payload?.[0]?.value}</p>
                  <p className="text-sm text-gray-600">
                    Time: {props.label}
                  </p>
                  {props.payload?.[0]?.payload?.category && (
                    <p className="text-sm text-gray-600">
                      Category: {props.payload[0].payload.category}
                    </p>
                  )}
                </div>
              )}
            />
            <Line
              dataKey="aqi"
              type="natural"
              stroke="#22c55e"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
        
        {currentAQI && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            Last updated: {new Date(currentAQI.timestamp).toLocaleTimeString()} | 
            PM2.5: {currentAQI.pm25} | PM10: {currentAQI.pm10}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LiveChart02;