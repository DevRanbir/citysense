"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Chart01 } from "@/components/chart-01";
import { Chart02 } from "@/components/chart-02";
import { Chart03 } from "@/components/chart-03";
import { Chart04 } from "@/components/chart-04";
import { Chart05 } from "@/components/chart-05";
import LiveChart02 from "@/components/live-chart-02";
import LiveDataControls from "@/components/live-data-controls";
import WorkingPathwayDashboard from "@/components/working-pathway-dashboard";
import LiveFeed from "@/components/live-feed";
import LiveAQIChart from "@/components/live-aqi-chart";
import LiveTrafficChart from "@/components/live-traffic-chart";
import { ActionButtons } from "@/components/action-buttons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLoader } from "@/components/page-loader";
import { ProtectedRoute } from "@/components/protected-route";
import { useState, useEffect } from "react";
import { X, Bot } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { RiSparkling2Line } from "@remixicon/react";
import { firebaseLocationService, FIREBASE_LOCATIONS, FirebaseLocationData } from "@/services/firebase-location-service";
import { firebaseDateFilterService, AggregatedData } from "@/services/firebase-date-filter-service";
import { DateRange } from "react-day-picker";

// Custom Chatbox Trigger Component
function ChatboxTrigger({ 
  isSidebarOpen, 
  onToggle, 
  isDarkMode 
}: { 
  isSidebarOpen: boolean; 
  onToggle: () => void; 
  isDarkMode: boolean; 
}) {
  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className={`ms-1 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
        isDarkMode ? "text-gray-200 hover:text-white" : "text-gray-700 hover:text-gray-900"
      }`}
    >
      <RiSparkling2Line className={`w-4 h-4 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`} />
      <span className={`text-xs sm:text-sm font-medium  ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
        {isSidebarOpen ? "Close Chatbox" : "Open Chatbox"}
      </span>
    </Button>
  );
}

export default function Page() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default closed
  
  // Get available locations from Firebase
  const availableLocations = Object.keys(FIREBASE_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(availableLocations[0] || "Canmore Alberta");
  
  const [showSidebarTrigger, setShowSidebarTrigger] = useState(true);
  const [hasDateFilter, setHasDateFilter] = useState(false);
  
  const [locationData, setLocationData] = useState<FirebaseLocationData | null>(null);
  const [trafficData, setTrafficData] = useState<Array<{
    location: string;
    status: string;
    dotColor: string;
  }>>([]);
  
  // Date filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedHour, setSelectedHour] = useState<number | undefined>();
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fetch location data from Firebase
  useEffect(() => {
    const fetchTrafficData = async () => {
      const data = await Promise.all(
        availableLocations.map(async (location) => {
          const latest = await firebaseLocationService.getLatestData(location);
          const trafficStatus = latest 
            ? firebaseLocationService.getTrafficStatus(latest.cars)
            : { status: 'Unknown', dotColor: 'bg-gray-500' };
          
          return {
            location,
            status: trafficStatus.status,
            dotColor: trafficStatus.dotColor
          };
        })
      );
      setTrafficData(data);
    };

    fetchTrafficData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTrafficData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time updates for selected location (only when not in historical mode)
  useEffect(() => {
    if (isHistoricalMode) return;

    const unsubscribe = firebaseLocationService.subscribeToLocation(
      selectedLocation,
      (data) => {
        setLocationData(data);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedLocation, isHistoricalMode]);

  // Handle date range filtering
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (!dateRange?.from || !dateRange?.to) {
        setFilteredData([]);
        setIsFiltering(false);
        setIsHistoricalMode(false);
        return;
      }

      setIsFiltering(true);
      setIsHistoricalMode(true);
      
      try {
        // Check if single day
        const isSingleDay = dateRange.from.toDateString() === dateRange.to.toDateString();
        
        if (isSingleDay) {
          // Get hourly data for the selected day
          const hourlyData = await firebaseDateFilterService.getAggregatedByHour(
            selectedLocation,
            dateRange.from
          );
          
          // If hour filter is set, filter the hourly data
          const filtered = selectedHour !== undefined
            ? hourlyData.filter(d => d.hour === selectedHour)
            : hourlyData;
          
          // Convert HourlyData to AggregatedData format for charts
          const converted: AggregatedData[] = filtered.map(h => ({
            timestamp: h.hourLabel,
            averageCars: h.averageCars,
            averagePeople: h.averagePeople,
            maxCars: h.averageCars, // For hourly, use average as max/min
            maxPeople: h.averagePeople,
            minCars: h.averageCars,
            minPeople: h.averagePeople,
            trafficLevel: h.trafficLevel,
            pedestrianLevel: 'MEDIUM', // Default
            dataPoints: h.dataPoints
          }));
          
          setFilteredData(converted);
          console.log(`📊 Fetched ${converted.length} hours of data for ${selectedLocation}`, 
            selectedHour !== undefined ? `(filtered to hour ${selectedHour})` : '');
        } else {
          // Get daily aggregated data
          const aggregated = await firebaseDateFilterService.getAggregatedByDay({
            location: selectedLocation,
            startDate: dateRange.from,
            endDate: dateRange.to
          });
          
          setFilteredData(aggregated);
          console.log(`📊 Fetched ${aggregated.length} days of data for ${selectedLocation}`);
        }
      } catch (error) {
        console.error('Error fetching filtered data:', error);
        setFilteredData([]);
      } finally {
        setIsFiltering(false);
      }
    };

    fetchFilteredData();
  }, [dateRange, selectedHour, selectedLocation]);

  const handleDateRangeChange = (range: DateRange | undefined, hour?: number) => {
    setDateRange(range);
    setSelectedHour(hour);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Swipe gesture handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isRightToLeftSwipe = distance > minSwipeDistance;
    
    // Only close sidebar if it's open and user swipes right to left
    if (isRightToLeftSwipe && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Add touch event listeners when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener('touchstart', onTouchStart);
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);

      return () => {
        document.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, [isSidebarOpen, touchStart, touchEnd]);

  const handleExport = async () => {
    // Step 1: Close the sidebar
    setIsSidebarOpen(false);
    
    // Step 2: Hide the sidebar trigger button
    setShowSidebarTrigger(false);
    
    // Wait a bit for the UI to update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 3: Add report header to visible website
    const headerDiv = document.createElement('div');
    headerDiv.id = 'print-header';
    headerDiv.style.marginBottom = '2rem';
    headerDiv.style.padding = '1rem 0';
    headerDiv.style.borderBottom = '1px solid #e5e5e5';
    headerDiv.innerHTML = `
      <h1 style="text-align: left; color: #1f2937; font-size: 2rem; font-weight: bold; margin: 0;">
        Report-${selectedLocation}
      </h1>
    `;
    
    // Step 4: Add conclusion content to visible website
    const conclusionDiv = document.createElement('div');
    conclusionDiv.id = 'print-conclusion';
    conclusionDiv.style.marginTop = '3rem';
    conclusionDiv.style.padding = '2rem 1rem';
    conclusionDiv.style.borderTop = '2px solid #e5e5e5';
    conclusionDiv.style.backgroundColor = '#f9fafb';
    conclusionDiv.style.borderRadius = '8px';
    conclusionDiv.innerHTML = `
      <div style="color: #374151; line-height: 1.8; font-size: 14px;">
        <h3 style="color: #1f2937; font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Conclusions</h3>
        <p style="margin-bottom: 1rem;">
          Based on the comprehensive analysis of traffic patterns and emergency response data for ${selectedLocation}, 
          this report demonstrates the current operational status across ${trafficData.length} monitoring locations. 
          The integrated dashboard provides real-time insights into traffic congestion levels, emergency incident 
          distributions, and resource allocation efficiency.
        </p>
        <p style="margin-bottom: 1rem;">
          The data reveals critical patterns in urban mobility and emergency response capabilities, enabling 
          data-driven decision making for city management and emergency services coordination. Regular monitoring 
          of these metrics ensures optimal resource deployment and improved citizen safety standards.
        </p>
        <p style="text-align: center; margin-top: 2rem; font-weight: bold; font-style: italic;">
          Report generated on ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    `;
    
    // Get main content and add header and conclusion to visible website
    const mainContent = document.querySelector('.overflow-hidden');
    if (mainContent) {
      mainContent.insertBefore(headerDiv, mainContent.firstChild);
      mainContent.appendChild(conclusionDiv);
    }
    
    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 5: Add print styles
    const printStyles = document.createElement('style');
    printStyles.id = 'print-styles';
    printStyles.innerHTML = `
      @media print {
        @page {
          size: tabloid;
          margin: 0;
        }
        
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .sidebar,
        .sidebar-trigger,
        nav,
        .no-print:not(.keep-date-picker),
        header .flex.gap-3 > div:last-child,
        button[aria-label*="Export"],
        button[aria-label*="Demo"] {
          display: none !important;
        }
        
        ${!hasDateFilter ? '.no-print .date-picker { display: none !important; }' : ''}
        
        #print-conclusion {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          background-color: white !important;
          border-radius: 0 !important;
        }
        
        #print-header {
          display: block !important;
          visibility: visible !important;
        }
        
        header {
          border-bottom: none !important;
        }
      }
    `;
    document.head.appendChild(printStyles);
    
    // Step 6: Print the page
    window.print();
    
    // Step 7: Clean up after printing (hide conclusions and restore UI)
    setTimeout(() => {
      // Remove print styles
      const styles = document.getElementById('print-styles');
      if (styles) {
        styles.remove();
      }
      
      // Remove header and conclusion content from visible website
      const header = document.getElementById('print-header');
      const conclusion = document.getElementById('print-conclusion');
      if (header) header.remove();
      if (conclusion) conclusion.remove();
      
      // Restore sidebar trigger visibility
      setShowSidebarTrigger(true);
    }, 1000);
  };

  // Simulate date filter being applied (you can connect this to actual DatePicker state)
  const handleDateFilterChange = (hasFilter: boolean) => {
    setHasDateFilter(hasFilter);
  };

  return (
    <ProtectedRoute>
      <PageLoader>
        <div className={`flex min-h-screen ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        {/* Main Content */}
        <div className="flex flex-1">   
          <SidebarProvider 
            open={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
          >
            <AppSidebar selectedLocation={selectedLocation} />
            <SidebarInset>
            <div className="px-2 sm:px-4 md:px-6 lg:px-8 @container">
              <div className="w-full max-w-6xl mx-auto">
                <header className={`flex flex-wrap gap-2 sm:gap-3 min-h-16 sm:min-h-20 py-3 sm:py-4 shrink-0 items-center transition-all ease-linear`}>
                  {/* Left side - Replace SidebarTrigger with Chatbox text */}
                  <div className="flex flex-1 items-center gap-2">
                    {showSidebarTrigger && (
                      <>
                        {/* Desktop/PC - Custom ChatboxTrigger */}
                        <div className="hidden md:block">
                          <ChatboxTrigger 
                            isSidebarOpen={isSidebarOpen}
                            onToggle={handleSidebarToggle}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                        {/* Mobile/Tablet - Original SidebarTrigger */}
                        <div className="block md:hidden">
                          <SidebarTrigger className="ms-1">
                            <span className={`text-xs font-medium px-1 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>Chatbox</span>
                          </SidebarTrigger>
                        </div>
                      </>
                    )}
                    <div className="max-lg:hidden lg:contents">
                      <Separator
                        orientation="vertical"
                        className={`me-2 data-[orientation=vertical]:h-4 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}
                      />
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>Showing Report of </span>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger className={`w-36 sm:w-48 text-xs sm:text-sm ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                            {trafficData.map((item) => (
                              <SelectItem key={item.location} value={item.location} className={isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${item.dotColor}`}></div>
                                  <span className="text-xs sm:text-sm">{item.location}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Right side */}
                  <div className="no-print flex items-center gap-3">
                    <ActionButtons 
                      onExport={handleExport} 
                      hasDateFilter={hasDateFilter}
                      isDarkMode={isDarkMode}
                      toggleDarkMode={toggleDarkMode}
                      selectedLocation={selectedLocation}
                      onDateRangeChange={handleDateRangeChange}
                      onFilterApplied={handleDateFilterChange}
                    />
                  </div>
                </header>
                
                {/* Mobile-only location selector */}
                <div className={`lg:hidden mb-4 p-3 sm:p-4 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Report:</span>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className={`flex-1 max-w-xs ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                        {trafficData.map((item) => (
                          <SelectItem key={item.location} value={item.location} className={isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.dotColor}`}></div>
                              <span className="text-sm">{item.location}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Real-Time Reports - Only show in live mode */}
                {!isHistoricalMode && (
                  <div className="mb-4">
                    <WorkingPathwayDashboard selectedLocation={selectedLocation} />
                  </div>
                )}

                {/* Loading indicator for filtered data */}
                {isFiltering && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Loading historical data...
                      </span>
                    </div>
                  </div>
                )}

                {/* No data message */}
                {isHistoricalMode && !isFiltering && filteredData.length === 0 && (
                  <div className="mb-4 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      No data available for the selected date range. Please select a different date range.
                    </p>
                  </div>
                )}

                {/* Historical mode indicator */}
                {isHistoricalMode && filteredData.length > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        📊 Showing historical data: {filteredData.length} data points
                      </span>
                      {selectedHour !== undefined && (
                        <span className="text-xs text-purple-600 dark:text-purple-400">
                          (Filtered to {selectedHour}:00)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 auto-rows-min">
                    {/* Live Feed - Hide in historical mode */}
                    {!isHistoricalMode && <LiveFeed selectedLocation={selectedLocation} />}
                    
                    {/* Emergency Incidents - Always show */}
                    <Chart01 selectedLocation={selectedLocation} />
                    
                    {/* AQI Chart - Live vs Historical */}
                    {!isHistoricalMode ? (
                      <LiveAQIChart selectedLocation={selectedLocation} />
                    ) : (
                      <Chart02 
                        selectedLocation={selectedLocation} 
                        filteredData={filteredData}
                        isHistoricalMode={isHistoricalMode}
                      />
                    )}
                    
                    {/* Traffic Chart - Live vs Historical */}
                    {!isHistoricalMode ? (
                      <LiveTrafficChart selectedLocation={selectedLocation} />
                    ) : (
                      <Chart03 
                        selectedLocation={selectedLocation}
                        filteredData={filteredData}
                        isHistoricalMode={isHistoricalMode}
                      />
                    )}
                    
                    {/* Additional Charts with filtered data */}
                    <Chart04 
                      selectedLocation={selectedLocation}
                      filteredData={!isHistoricalMode ? undefined : filteredData}
                      isHistoricalMode={isHistoricalMode}
                    />
                    <Chart05 
                      selectedLocation={selectedLocation}
                      filteredData={!isHistoricalMode ? undefined : filteredData}
                      isHistoricalMode={isHistoricalMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
        </div>
        </div>
      </PageLoader>
    </ProtectedRoute>
  );
}
