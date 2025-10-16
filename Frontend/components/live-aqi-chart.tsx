"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { firebaseLocationService, FirebaseLocationData } from "@/services/firebase-location-service";

interface LiveAQIChartProps {
  selectedLocation: string;
}

export function LiveAQIChart({ selectedLocation }: LiveAQIChartProps) {
  const [aqiData, setAqiData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize with empty data
    setAqiData([]);

    // Subscribe to Firebase real-time updates
    const unsubscribe = firebaseLocationService.subscribeToLocation(
      selectedLocation,
      (data: FirebaseLocationData | null) => {
        if (data) {
          // Estimate AQI based on vehicle count (more vehicles = higher pollution)
          // This is a simplified estimation. In reality, you'd use actual AQI sensors
          const estimatedAQI = Math.min(200, 50 + (data.cars * 5) + (data.people * 2));
          
          const category = 
            estimatedAQI <= 50 ? 'Good' :
            estimatedAQI <= 100 ? 'Moderate' :
            estimatedAQI <= 150 ? 'Unhealthy for Sensitive Groups' :
            'Unhealthy';

          const newValue = {
            time: new Date().toLocaleTimeString().slice(0, 5),
            aqi: Math.round(estimatedAQI),
            category: category,
          };
          
          setAqiData(prev => {
            const updated = [...prev, newValue];
            return updated.slice(-8); // Keep only last 8 points
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedLocation]);

  const chartConfig = {
    aqi: {
      label: "AQI Level",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          AQI Trend (Live Updates) - {selectedLocation}
        </CardTitle>
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
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Real-time updates every 3 seconds • Latest: {aqiData[aqiData.length - 1]?.aqi} AQI
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveAQIChart;
