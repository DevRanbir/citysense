"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/theme-context";
import { firebaseLocationService } from "@/services/firebase-location-service";

interface LiveFeedProps {
  selectedLocation: string;
}

export default function LiveFeed({ selectedLocation }: LiveFeedProps) {
  const { isDarkMode } = useTheme();
  const [showOverlay, setShowOverlay] = useState(true);

  // Get YouTube video ID from Firebase location service
  const locationConfig = firebaseLocationService.getLocationConfig(selectedLocation);
  const videoId = locationConfig?.youtubeId || "VR-x3HdhKLQ";

  // Hide overlay after 5 seconds
  useEffect(() => {
    setShowOverlay(true);
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, [selectedLocation, videoId]);

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
          
          {/* Loading overlay to hide YouTube title screen */}
          {showOverlay && (
            <div 
              className={`absolute top-0 left-0 w-full h-full rounded-lg flex items-center justify-center z-10 ${
                isDarkMode ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 border-4 rounded-full animate-spin ${
                    isDarkMode 
                      ? "border-gray-700 border-t-lime-400" 
                      : "border-gray-300 border-t-lime-500"
                  }`}></div>
                </div>
                <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Loading live feed...
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
