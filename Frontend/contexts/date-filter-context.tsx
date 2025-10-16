import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import { AggregatedData } from '@/services/firebase-date-filter-service';

interface DateFilterContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  filteredData: AggregatedData[];
  setFilteredData: (data: AggregatedData[]) => void;
  isFiltering: boolean;
  setIsFiltering: (filtering: boolean) => void;
  hasDateFilter: boolean;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const hasDateFilter = !!(dateRange?.from && dateRange?.to);

  return (
    <DateFilterContext.Provider
      value={{
        dateRange,
        setDateRange,
        filteredData,
        setFilteredData,
        isFiltering,
        setIsFiltering,
        hasDateFilter,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
}
