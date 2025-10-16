"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AggregatedData } from "@/services/firebase-date-filter-service";

// Location-specific AQI data
const locationAQIData = {
  "Madhya Marg": [
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
  ],
  "Dakshin Marg": [
    { time: "0:00", aqi: 95 },
    { time: "2:00", aqi: 88 },
    { time: "4:00", aqi: 92 },
    { time: "6:00", aqi: 108 },
    { time: "8:00", aqi: 125 },
    { time: "10:00", aqi: 118 },
    { time: "12:00", aqi: 112 },
    { time: "14:00", aqi: 115 },
    { time: "16:00", aqi: 128 },
    { time: "18:00", aqi: 135 },
    { time: "20:00", aqi: 118 },
    { time: "22:00", aqi: 105 },
    { time: "23:00", aqi: 98 },
  ],
  "Shanti Path": [
    { time: "0:00", aqi: 65 },
    { time: "2:00", aqi: 58 },
    { time: "4:00", aqi: 62 },
    { time: "6:00", aqi: 72 },
    { time: "8:00", aqi: 85 },
    { time: "10:00", aqi: 78 },
    { time: "12:00", aqi: 75 },
    { time: "14:00", aqi: 82 },
    { time: "16:00", aqi: 88 },
    { time: "18:00", aqi: 92 },
    { time: "20:00", aqi: 78 },
    { time: "22:00", aqi: 68 },
    { time: "23:00", aqi: 62 },
  ],
  "Jan Marg": [
    { time: "0:00", aqi: 105 },
    { time: "2:00", aqi: 98 },
    { time: "4:00", aqi: 110 },
    { time: "6:00", aqi: 122 },
    { time: "8:00", aqi: 145 },
    { time: "10:00", aqi: 138 },
    { time: "12:00", aqi: 132 },
    { time: "14:00", aqi: 135 },
    { time: "16:00", aqi: 148 },
    { time: "18:00", aqi: 155 },
    { time: "20:00", aqi: 138 },
    { time: "22:00", aqi: 115 },
    { time: "23:00", aqi: 108 },
  ],
  "Vikas Marg": [
    { time: "0:00", aqi: 135 },
    { time: "2:00", aqi: 128 },
    { time: "4:00", aqi: 140 },
    { time: "6:00", aqi: 152 },
    { time: "8:00", aqi: 175 },
    { time: "10:00", aqi: 168 },
    { time: "12:00", aqi: 158 },
    { time: "14:00", aqi: 162 },
    { time: "16:00", aqi: 178 },
    { time: "18:00", aqi: 185 },
    { time: "20:00", aqi: 168 },
    { time: "22:00", aqi: 145 },
    { time: "23:00", aqi: 138 },
  ],
  "Sector 17 Market Road": [
    { time: "0:00", aqi: 55 },
    { time: "2:00", aqi: 48 },
    { time: "4:00", aqi: 52 },
    { time: "6:00", aqi: 62 },
    { time: "8:00", aqi: 75 },
    { time: "10:00", aqi: 68 },
    { time: "12:00", aqi: 65 },
    { time: "14:00", aqi: 72 },
    { time: "16:00", aqi: 78 },
    { time: "18:00", aqi: 82 },
    { time: "20:00", aqi: 68 },
    { time: "22:00", aqi: 58 },
    { time: "23:00", aqi: 52 },
  ],
};

const chartConfig = {
  aqi: {
    label: "AQI",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface Chart02Props {
  selectedLocation?: string;
  filteredData?: AggregatedData[];
  isHistoricalMode?: boolean;
}

export function Chart02({ selectedLocation = "Madhya Marg", filteredData, isHistoricalMode }: Chart02Props) {
  // Estimate AQI from vehicle count (similar to LiveAQIChart)
  const estimateAQI = (cars: number): number => {
    // Simple estimation: more cars = higher AQI
    // This is a simplified model - real AQI would need air quality sensors
    if (cars < 5) return 50; // Good
    if (cars < 15) return 100; // Moderate
    if (cars < 25) return 150; // Unhealthy for Sensitive Groups
    if (cars < 35) return 200; // Unhealthy
    return 250; // Very Unhealthy
  };

  let aqiData: any[];
  
  if (isHistoricalMode && filteredData && filteredData.length > 0) {
    // Use filtered historical data
    aqiData = filteredData.map((data, index) => ({
      time: data.timestamp.includes(':') ? data.timestamp : `Point ${index + 1}`,
      aqi: estimateAQI(data.averageCars),
      cars: Math.round(data.averageCars),
      people: Math.round(data.averagePeople)
    }));
  } else {
    // Use default static data
    aqiData = locationAQIData[selectedLocation as keyof typeof locationAQIData] || locationAQIData["Madhya Marg"];
  }

  const chartConfig = {
    aqi: {
      label: "AQI",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {isHistoricalMode ? 'AQI Trend (Historical)' : 'AQI Trend (24h)'}
          <span className="text-sm font-normal text-gray-500 block">
            Location: {selectedLocation}
            {isHistoricalMode && filteredData && (
              <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                ({filteredData.length} data points)
              </span>
            )}
          </span>
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
              domain={[0, 250]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="aqi"
              type="natural"
              stroke="#22c55e"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
