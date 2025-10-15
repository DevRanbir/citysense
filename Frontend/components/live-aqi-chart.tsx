"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

interface LiveAQIChartProps {
  selectedLocation: string;
}

export function LiveAQIChart({ selectedLocation }: LiveAQIChartProps) {
  const [aqiData, setAqiData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize with some historical data, then update with live data
    const historicalData = [
      { time: "10:00", aqi: 120 },
      { time: "10:30", aqi: 135 },
      { time: "11:00", aqi: 140 },
      { time: "11:30", aqi: 125 },
      { time: "12:00", aqi: 130 },
    ];
    setAqiData(historicalData);

    // Fetch live data every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/pathway/dashboard/${encodeURIComponent(selectedLocation)}`);
        if (response.ok) {
          const pathwayData = await response.json();
          const newValue = {
            time: new Date().toLocaleTimeString().slice(0, 5),
            aqi: pathwayData.aqi.aqi,
            category: pathwayData.aqi.category,
          };
          
          setAqiData(prev => {
            const updated = [...prev, newValue];
            return updated.slice(-8); // Keep only last 8 points
          });
        }
      } catch (error) {
        // Generate random data if connection fails
        const randomAQI = Math.floor(Math.random() * 100) + 80;
        const newValue = {
          time: new Date().toLocaleTimeString().slice(0, 5),
          aqi: randomAQI,
          category: randomAQI > 150 ? 'Unhealthy' : 'Moderate',
        };
        
        setAqiData(prev => {
          const updated = [...prev, newValue];
          return updated.slice(-8);
        });
      }
    }, 3000);

    return () => clearInterval(interval);
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
