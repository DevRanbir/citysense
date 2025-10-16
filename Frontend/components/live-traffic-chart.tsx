"use client";

import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { firebaseLocationService, FirebaseLocationData } from "@/services/firebase-location-service";

interface LiveTrafficChartProps {
  selectedLocation: string;
}

export function LiveTrafficChart({ selectedLocation }: LiveTrafficChartProps) {
  const [trafficData, setTrafficData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize with empty data
    setTrafficData([]);

    // Subscribe to Firebase real-time updates
    const unsubscribe = firebaseLocationService.subscribeToLocation(
      selectedLocation,
      (data: FirebaseLocationData | null) => {
        if (data) {
          // Calculate congestion percentage based on traffic level
          let congestion = 0;
          switch (data.traffic_level) {
            case 'EMPTY':
              congestion = 0;
              break;
            case 'LOW':
              congestion = 25;
              break;
            case 'MEDIUM':
              congestion = 50;
              break;
            case 'HIGH':
              congestion = 75;
              break;
            case 'CONGESTED':
              congestion = 100;
              break;
            default:
              congestion = 50;
          }

          const newValue = {
            time: new Date().toLocaleTimeString().slice(0, 5),
            congestion: congestion,
            status: data.traffic_level,
            vehicles: data.cars,
          };
          
          setTrafficData(prev => {
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
    congestion: {
      label: "Congestion %",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Traffic Congestion (Live Updates) - {selectedLocation}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={trafficData}
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
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={(props) => (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                  <p className="font-medium">Congestion: {props.payload?.[0]?.value}%</p>
                  <p className="text-sm text-gray-600">
                    Time: {props.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {props.payload?.[0]?.payload?.status}
                  </p>
                </div>
              )}
            />
            <Bar
              dataKey="congestion"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Real-time updates every 3 seconds • Status: {trafficData[trafficData.length - 1]?.status}
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveTrafficChart;
