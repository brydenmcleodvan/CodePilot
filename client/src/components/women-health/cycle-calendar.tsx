import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, differenceInDays, isSameDay, isWithinInterval, addMonths, getMonth, getYear } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { CycleEntry } from "@shared/schema";

// Color palettes for the different cycle phases
const cycleColors = {
  period: {
    light: "bg-pink-100 text-pink-800 border-pink-200",
    medium: "bg-pink-200 text-pink-800 border-pink-300",
    heavy: "bg-pink-300 text-pink-900 border-pink-400",
    spotting: "bg-pink-50 text-pink-700 border-pink-100"
  },
  fertile: "bg-teal-100 text-teal-800 border-teal-200",
  ovulation: "bg-emerald-100 text-emerald-800 border-emerald-200",
  luteal: "bg-indigo-50 text-indigo-700 border-indigo-100",
  follicular: "bg-blue-50 text-blue-700 border-blue-100",
  predicted: "bg-gray-50 text-gray-500 border-gray-200 border-dashed",
  today: "bg-primary/10 text-primary border-primary/20"
};

// Dummy data generator for the demo - in a real app this would come from the database
// This ensures we keep John Doe's profile intact while showing a demo for female users
const generateDemoCycleData = () => {
  const today = new Date();
  const lastPeriodStart = addDays(today, -18); // Period started 18 days ago
  const periodLength = 5; // 5 days of period
  const cycleLength = 28; // 28 day cycle
  const nextPeriodStart = addDays(lastPeriodStart, cycleLength); // Next period in 10 days
  const ovulationDay = addDays(lastPeriodStart, 14); // Ovulation typically around day 14
  
  const fertileWindowStart = addDays(ovulationDay, -5); // Fertile window starts 5 days before ovulation
  const fertileWindowEnd = addDays(ovulationDay, 1); // Fertile window ends 1 day after ovulation
  
  const demoEntries: CycleEntry[] = [];
  
  // Add period entries
  for (let i = 0; i < periodLength; i++) {
    const day = addDays(lastPeriodStart, i);
    let flow = "medium";
    
    if (i === 0) flow = "light"; // First day usually lighter
    else if (i === 1 || i === 2) flow = "heavy"; // Days 2-3 usually heaviest
    else if (i === periodLength - 1) flow = "spotting"; // Last day usually spotting
    
    demoEntries.push({
      id: i + 1,
      userId: 1,
      date: day,
      entryType: "period",
      flow: flow,
      symptoms: i === 1 ? ["cramps", "headache", "fatigue"] : i === 2 ? ["cramps", "bloating"] : [],
      mood: i === 1 ? "irritable" : i === 2 ? "sensitive" : "neutral",
      notes: i === 1 ? "Heavy day with significant cramps" : "",
      basal_temp: 36.4 + (i * 0.1), // Slight increase in basal temp during period
      cervical_fluid: null,
      ovulation_test: null,
      intimate: false,
      medications: i === 1 ? ["ibuprofen"] : []
    });
  }
  
  // Add fertile window entries
  for (let i = 0; i < 7; i++) {
    const day = addDays(fertileWindowStart, i);
    // Skip days that are already marked as period
    if (demoEntries.some(entry => isSameDay(new Date(entry.date), day))) {
      continue;
    }
    
    let entryType = "fertile";
    let cervicalFluid = "sticky";
    
    if (isSameDay(day, ovulationDay)) {
      entryType = "ovulation";
      cervicalFluid = "egg white";
    } else if (differenceInDays(day, ovulationDay) === -1) {
      cervicalFluid = "watery";
    } else if (differenceInDays(day, ovulationDay) === -2) {
      cervicalFluid = "creamy";
    }
    
    demoEntries.push({
      id: demoEntries.length + 1,
      userId: 1,
      date: day,
      entryType: entryType,
      flow: null,
      symptoms: isSameDay(day, ovulationDay) ? ["ovulation pain"] : [],
      mood: isSameDay(day, ovulationDay) ? "energetic" : "happy",
      notes: isSameDay(day, ovulationDay) ? "Ovulation confirmed with test" : "",
      basal_temp: isSameDay(day, ovulationDay) ? 36.9 : 36.7,
      cervical_fluid: cervicalFluid,
      ovulation_test: isSameDay(day, ovulationDay) ? "positive" : i === 3 ? "peak" : "negative",
      intimate: [2, 4].includes(i), // Intimate on a couple of days in the fertile window
      medications: []
    });
  }
  
  return {
    entries: demoEntries,
    analysis: {
      id: 1,
      userId: 1,
      cycleStartDate: lastPeriodStart,
      cycleEndDate: addDays(nextPeriodStart, -1),
      cycleDuration: cycleLength,
      periodDuration: periodLength,
      ovulationDate: ovulationDay,
      nextPeriodPrediction: nextPeriodStart,
      fertileWindowStart,
      fertileWindowEnd,
      notes: "Regular cycle with moderate symptoms",
      regularity: "regular",
      lutealPhaseLength: 14
    }
  };
};

interface CycleCalendarProps {
  onDateSelect?: (date: Date) => void;
  showControls?: boolean;
}

export function CycleCalendar({ onDateSelect, showControls = true }: CycleCalendarProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  
  // In a real app, this would fetch from the server
  const { data: cycleData } = useQuery({
    queryKey: ["/api/cycle-data"],
    queryFn: () => Promise.resolve(generateDemoCycleData()),
    enabled: !!user && user.gender === "female",
  });
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    if (onDateSelect) onDateSelect(date);
  };
  
  const getDayClass = (date: Date) => {
    if (!cycleData) return "";
    const today = new Date();
    
    // Check if it's a period day
    const periodEntry = cycleData.entries.find(entry => 
      entry.entryType === "period" && isSameDay(new Date(entry.date), date)
    );
    
    if (periodEntry) {
      return cycleColors.period[periodEntry.flow as keyof typeof cycleColors.period];
    }
    
    // Check if it's an ovulation day
    const ovulationEntry = cycleData.entries.find(entry => 
      entry.entryType === "ovulation" && isSameDay(new Date(entry.date), date)
    );
    
    if (ovulationEntry) {
      return cycleColors.ovulation;
    }
    
    // Check if it's in the fertile window
    if (cycleData.analysis.fertileWindowStart && cycleData.analysis.fertileWindowEnd &&
        isWithinInterval(date, {
          start: new Date(cycleData.analysis.fertileWindowStart),
          end: new Date(cycleData.analysis.fertileWindowEnd)
        })) {
      return cycleColors.fertile;
    }
    
    // Check if it's a predicted period (future)
    const nextPeriod = cycleData.analysis.nextPeriodPrediction ? new Date(cycleData.analysis.nextPeriodPrediction) : null;
    if (nextPeriod && date > today) {
      for (let i = 0; i < 5; i++) { // Assuming 5 days of period
        if (isSameDay(date, addDays(nextPeriod, i))) {
          return cycleColors.predicted;
        }
      }
    }
    
    // Check if it's today
    if (isSameDay(date, today)) {
      return cycleColors.today;
    }
    
    // Luteal phase (after ovulation until next period)
    const ovulationDate = cycleData.analysis.ovulationDate ? new Date(cycleData.analysis.ovulationDate) : null;
    if (ovulationDate && date > ovulationDate && nextPeriod && date < nextPeriod) {
      return cycleColors.luteal;
    }
    
    // Follicular phase (after period, before ovulation)
    const cycleStartDate = cycleData.analysis.cycleStartDate ? new Date(cycleData.analysis.cycleStartDate) : null;
    if (cycleStartDate && date >= addDays(cycleStartDate, cycleData.analysis.periodDuration || 0) && 
        ovulationDate && date < ovulationDate) {
      return cycleColors.follicular;
    }
    
    return "";
  };
  
  const handlePreviousMonth = () => {
    setCalendarDate(prev => addMonths(prev, -1));
  };
  
  const handleNextMonth = () => {
    setCalendarDate(prev => addMonths(prev, 1));
  };
  
  const getDayContent = (date: Date) => {
    if (!cycleData) return null;
    
    const entries = cycleData.entries.filter(entry => 
      isSameDay(new Date(entry.date), date)
    );
    
    if (entries.length === 0) return null;
    
    const hasSymptoms = entries.some(entry => entry.symptoms && entry.symptoms.length > 0);
    const hasMood = entries.some(entry => entry.mood);
    const hasIntimate = entries.some(entry => entry.intimate);
    
    return (
      <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
        {hasSymptoms && <div className="w-1 h-1 rounded-full bg-red-400" />}
        {hasMood && <div className="w-1 h-1 rounded-full bg-purple-400" />}
        {hasIntimate && <div className="w-1 h-1 rounded-full bg-blue-400" />}
      </div>
    );
  };
  
  const getSelectedDayDetails = () => {
    if (!selectedDate || !cycleData) return null;
    
    const entries = cycleData.entries.filter(entry => 
      isSameDay(new Date(entry.date), selectedDate)
    );
    
    if (entries.length === 0) {
      // No entries for this day
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No data for {format(selectedDate, "MMMM d, yyyy")}</p>
          {showControls && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setIsAddingEntry(true)}
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Add entry
            </Button>
          )}
        </div>
      );
    }
    
    // Combine entries for this day
    const periodEntry = entries.find(entry => entry.entryType === "period");
    const ovulationEntry = entries.find(entry => entry.entryType === "ovulation");
    const fertileEntry = entries.find(entry => entry.entryType === "fertile");
    
    const allSymptoms = entries.flatMap(entry => entry.symptoms || []);
    const uniqueSymptoms = [...new Set(allSymptoms)];
    
    // Get the primary entry
    const primaryEntry = periodEntry || ovulationEntry || fertileEntry || entries[0];
    
    return (
      <div className="space-y-3 p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">{format(selectedDate, "MMMM d, yyyy")}</h3>
          {showControls && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsAddingEntry(true)}
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {periodEntry && (
            <Badge variant="outline" className={`${cycleColors.period[periodEntry.flow as keyof typeof cycleColors.period]}`}>
              {periodEntry.flow} flow
            </Badge>
          )}
          
          {ovulationEntry && (
            <Badge variant="outline" className={cycleColors.ovulation}>
              Ovulation
            </Badge>
          )}
          
          {fertileEntry && !ovulationEntry && (
            <Badge variant="outline" className={cycleColors.fertile}>
              Fertile
            </Badge>
          )}
          
          {primaryEntry.mood && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100">
              {primaryEntry.mood}
            </Badge>
          )}
          
          {primaryEntry.intimate && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
              Intimate
            </Badge>
          )}
        </div>
        
        {uniqueSymptoms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Symptoms</h4>
            <div className="flex flex-wrap gap-1.5">
              {uniqueSymptoms.map((symptom, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {primaryEntry.notes && (
          <div>
            <h4 className="text-sm font-medium mb-1">Notes</h4>
            <p className="text-sm text-muted-foreground">{primaryEntry.notes}</p>
          </div>
        )}
        
        {primaryEntry.basal_temp && (
          <div className="flex gap-4">
            <div>
              <h4 className="text-xs text-muted-foreground">Basal Temp</h4>
              <p className="text-sm font-medium">{primaryEntry.basal_temp}°C</p>
            </div>
            
            {primaryEntry.cervical_fluid && (
              <div>
                <h4 className="text-xs text-muted-foreground">Cervical Fluid</h4>
                <p className="text-sm font-medium">{primaryEntry.cervical_fluid}</p>
              </div>
            )}
            
            {primaryEntry.ovulation_test && (
              <div>
                <h4 className="text-xs text-muted-foreground">Ovulation Test</h4>
                <p className="text-sm font-medium">{primaryEntry.ovulation_test}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-dark-text dark:text-white flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span>Cycle Calendar</span>
        </CardTitle>
        <CardDescription className="text-body-text dark:text-gray-300">
          Track your cycle and fertile window
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-dark-text dark:text-white">
                {format(calendarDate, "MMMM yyyy")}
              </h3>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                </Button>
              </div>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={calendarDate}
              className="rounded-md border-light-blue-border dark:border-gray-700"
              classNames={{
                day_selected: "bg-primary text-primary-foreground",
                day: "text-sm p-0 relative h-9 w-9"
              }}
              components={{
                Day: ({ day, ...props }: any) => (
                  <div
                    className={`flex items-center justify-center h-9 w-9 p-0 font-normal aria-selected:opacity-100 ${getDayClass(day)}`}
                    {...props}
                  >
                    <time dateTime={format(day, 'yyyy-MM-dd')}>
                      {format(day, 'd')}
                    </time>
                    {getDayContent(day)}
                  </div>
                ),
              }}
            />
            
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${cycleColors.period.medium}`}></div>
                <span className="text-xs text-body-text dark:text-gray-300">Period</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${cycleColors.fertile}`}></div>
                <span className="text-xs text-body-text dark:text-gray-300">Fertile</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${cycleColors.ovulation}`}></div>
                <span className="text-xs text-body-text dark:text-gray-300">Ovulation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${cycleColors.predicted}`}></div>
                <span className="text-xs text-body-text dark:text-gray-300">Predicted</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md border-light-blue-border dark:border-gray-700">
            {getSelectedDayDetails()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}