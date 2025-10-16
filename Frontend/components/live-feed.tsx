"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/theme-context";
import { firebaseLocationService } from "@/services/firebase-location-service";

interface LiveFeedProps {
  selectedLocation: string;
}

export default function LiveFeed({ selectedLocation }: LiveFeedProps) {
  const { isDarkMode } = useTheme();

  // Get YouTube video ID from Firebase location service
  const locationConfig = firebaseLocationService.getLocationConfig(selectedLocation);
  const videoId = locationConfig?.youtubeId || "VR-x3HdhKLQ";

  return (
    <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <CardHeader>
        <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>
          Live Feed
        </CardTitle>
        <CardDescription className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
          Real-time video feed from {selectedLocation}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
            title={`Live Feed - ${selectedLocation}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}
