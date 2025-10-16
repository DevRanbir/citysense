"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
  differenceInDays,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { firebaseDateFilterService, AvailableDateRange } from "@/services/firebase-date-filter-service";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DatePickerProps {
  selectedLocation?: string;
  onDateRangeChange?: (range: DateRange | undefined, hour?: number) => void;
  onFilterApplied?: (hasFilter: boolean) => void;
}

interface DatePreset {
  label: string;
  range: DateRange | null;
  daysRequired: number;
}

export default function DatePicker({ 
  selectedLocation, 
  onDateRangeChange,
  onFilterApplied 
}: DatePickerProps) {
  const today = new Date();
  const [month, setMonth] = useState(today);
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedHour, setSelectedHour] = useState<number | undefined>();
  const [availableRange, setAvailableRange] = useState<AvailableDateRange | null>(null);
  const [loading, setLoading] = useState(false);
  const [datePresets, setDatePresets] = useState<DatePreset[]>([]);

  // Fetch available date range when location changes
  useEffect(() => {
    const fetchAvailableRange = async () => {
      if (!selectedLocation) return;
      
      setLoading(true);
      try {
        const range = await firebaseDateFilterService.getAvailableDateRange(selectedLocation);
        setAvailableRange(range);
        
        // Generate dynamic date presets based on available data
        if (range.earliestDate && range.latestDate) {
          const presets = generateDatePresets(range.earliestDate, range.latestDate);
          setDatePresets(presets);
          
          // Set initial date to the most recent available data range
          const defaultPreset = presets.find(p => p.range !== null);
          if (defaultPreset && defaultPreset.range) {
            setDate(defaultPreset.range);
          }
        }
      } catch (error) {
        console.error('Error fetching available date range:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableRange();
  }, [selectedLocation]);

  // Generate date presets based on available data
  const generateDatePresets = (earliestDate: Date, latestDate: Date): DatePreset[] => {
    const totalDays = differenceInDays(latestDate, earliestDate) + 1;
    const presets: DatePreset[] = [];

    // Today (if data exists)
    if (differenceInDays(latestDate, today) >= 0) {
      presets.push({
        label: 'Today',
        range: { from: today, to: today },
        daysRequired: 1
      });
    }

    // Yesterday (if data exists)
    const yesterday = subDays(today, 1);
    if (differenceInDays(yesterday, earliestDate) >= 0) {
      presets.push({
        label: 'Yesterday',
        range: { from: yesterday, to: yesterday },
        daysRequired: 1
      });
    }

    // Last X days (dynamic based on available data)
    const possibleRanges = [7, 14, 30, 60, 90];
    for (const days of possibleRanges) {
      if (totalDays >= days) {
        const from = subDays(latestDate, days - 1);
        if (from >= earliestDate) {
          presets.push({
            label: `Last ${days} days`,
            range: { from, to: latestDate },
            daysRequired: days
          });
        }
      } else if (totalDays >= Math.ceil(days / 2)) {
        // If we don't have full range, show what we have
        presets.push({
          label: `Last ${totalDays} days (available)`,
          range: { from: earliestDate, to: latestDate },
          daysRequired: totalDays
        });
        break;
      }
    }

    // Month to date (if data exists in current month)
    const monthStart = startOfMonth(today);
    if (monthStart >= earliestDate) {
      presets.push({
        label: 'Month to date',
        range: { from: monthStart, to: latestDate },
        daysRequired: differenceInDays(latestDate, monthStart) + 1
      });
    }

    // Last month (if data exists)
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));
    if (lastMonthStart >= earliestDate) {
      presets.push({
        label: 'Last month',
        range: { from: lastMonthStart, to: lastMonthEnd },
        daysRequired: differenceInDays(lastMonthEnd, lastMonthStart) + 1
      });
    }

    // All available data
    presets.push({
      label: `All data (${totalDays} days)`,
      range: { from: earliestDate, to: latestDate },
      daysRequired: totalDays
    });

    return presets.filter(p => p.range !== null);
  };

  // Notify parent when date or hour changes
  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(date, selectedHour);
    }
    if (onFilterApplied) {
      onFilterApplied(!!(date?.from && date?.to));
    }
  }, [date, selectedHour, onDateRangeChange, onFilterApplied]);

  // Format hour for display
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Check if selected date range is a single day (for hour picker)
  const isSingleDay = date?.from && date?.to && 
    format(date.from, 'yyyy-MM-dd') === format(date.to, 'yyyy-MM-dd');

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start min-w-62">
            <CalendarIcon
              size={16}
              className="opacity-40 -ms-1 group-hover:text-foreground shrink-0 transition-colors"
              aria-hidden="true"
            />
            <span className={cn("truncate", !date && "text-muted-foreground")}>
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")}
                    {!isSingleDay && (
                      <> - {format(date.to, "LLL dd, y")}</>
                    )}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                loading ? "Loading..." : "Pick a date range"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="flex max-sm:flex-col">
            {/* Date Presets */}
            <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-40">
              <div className="h-full sm:border-e">
                {loading ? (
                  <div className="flex flex-col gap-2 px-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : availableRange && availableRange.totalDetections > 0 ? (
                  <div className="flex flex-col px-2">
                    <div className="mb-2 px-2 py-1 text-xs text-muted-foreground">
                      {availableRange.totalDetections} detections
                    </div>
                    {datePresets.map((preset, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          if (preset.range) {
                            setDate(preset.range);
                            setMonth(preset.range.to || preset.range.from || today);
                            setSelectedHour(undefined); // Reset hour when changing date
                          }
                        }}
                      >
                        <div className="flex flex-col items-start">
                          <span>{preset.label}</span>
                          {preset.daysRequired > 1 && (
                            <span className="text-xs text-muted-foreground">
                              {preset.daysRequired} days
                            </span>
                          )}
                        </div>
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                      onClick={() => {
                        setDate(undefined);
                        setSelectedHour(undefined);
                      }}
                    >
                      Clear filter
                    </Button>
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No data available for {selectedLocation}
                  </div>
                )}
              </div>
            </div>

            {/* Calendar */}
            {availableRange && availableRange.earliestDate && availableRange.latestDate && (
              <Calendar
                mode="range"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                    setSelectedHour(undefined); // Reset hour when changing date
                  }
                }}
                month={month}
                onMonthChange={setMonth}
                className="p-2"
                disabled={[
                  { before: availableRange.earliestDate },
                  { after: availableRange.latestDate }
                ]}
                fromDate={availableRange.earliestDate}
                toDate={availableRange.latestDate}
              />
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Hour Picker - Only show for single day selection */}
      {isSingleDay && availableRange && availableRange.availableHours.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[140px] justify-start">
              <Clock size={16} className="opacity-40 -ms-1 mr-2" />
              <span className={cn("truncate", selectedHour === undefined && "text-muted-foreground")}>
                {selectedHour !== undefined ? formatHour(selectedHour) : "All hours"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filter by hour</Label>
              <Select
                value={selectedHour?.toString()}
                onValueChange={(value) => {
                  setSelectedHour(value === "all" ? undefined : parseInt(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All hours</SelectItem>
                  {availableRange.availableHours.map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {formatHour(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {availableRange.availableHours.length} hours with data
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
