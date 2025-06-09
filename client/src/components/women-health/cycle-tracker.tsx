import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, CalendarClock, Droplets, ThermometerSun, Star, CalendarRange, AlertCircle } from "lucide-react";
import { format, differenceInDays, isBefore, addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { CycleCalendar } from "./cycle-calendar";

// Same demo data generator from cycle-calendar.tsx
const generateDemoCycleData = () => {
  const today = new Date();
  const lastPeriodStart = addDays(today, -18); // Period started 18 days ago
  const periodLength = 5; // 5 days of period
  const cycleLength = 28; // 28 day cycle
  const nextPeriodStart = addDays(lastPeriodStart, cycleLength); // Next period in 10 days
  const ovulationDay = addDays(lastPeriodStart, 14); // Ovulation typically around day 14
  
  const fertileWindowStart = addDays(ovulationDay, -5); // Fertile window starts 5 days before ovulation
  const fertileWindowEnd = addDays(ovulationDay, 1); // Fertile window ends 1 day after ovulation
  
  return {
    entries: [],
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

interface CyclePhase {
  name: string;
  description: string;
  icon: JSX.Element;
  currentPhase: boolean;
  color: string;
}

export function CycleTracker() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("overview");
  
  // In a real app, this would fetch from the server
  const { data: cycleData } = useQuery({
    queryKey: ["/api/cycle-data"],
    queryFn: () => Promise.resolve(generateDemoCycleData()),
    enabled: !!user && user.gender === "female",
  });
  
  const calculateCycleProgress = () => {
    if (!cycleData) return 0;
    
    const today = new Date();
    const cycleStart = new Date(cycleData.analysis.cycleStartDate);
    const nextPeriod = new Date(cycleData.analysis.nextPeriodPrediction);
    
    // If we're past the next period date, return 100%
    if (isBefore(nextPeriod, today)) {
      return 100;
    }
    
    // Calculate where we are in the cycle
    const totalCycleDays = cycleData.analysis.cycleDuration || 28;
    const daysElapsed = differenceInDays(today, cycleStart);
    
    return Math.min(100, Math.max(0, (daysElapsed / totalCycleDays) * 100));
  };
  
  const getCurrentPhase = (): CyclePhase => {
    if (!cycleData) {
      return {
        name: "Loading...",
        description: "Loading your cycle data",
        icon: <Clock className="h-5 w-5" />,
        currentPhase: false,
        color: "bg-gray-200 dark:bg-gray-700"
      };
    }
    
    const today = new Date();
    const cycleStart = new Date(cycleData.analysis.cycleStartDate);
    const periodEnd = addDays(cycleStart, cycleData.analysis.periodDuration || 5);
    const ovulationDate = cycleData.analysis.ovulationDate ? new Date(cycleData.analysis.ovulationDate) : null;
    const fertileStart = cycleData.analysis.fertileWindowStart ? new Date(cycleData.analysis.fertileWindowStart) : null;
    const fertileEnd = cycleData.analysis.fertileWindowEnd ? new Date(cycleData.analysis.fertileWindowEnd) : null;
    const nextPeriod = cycleData.analysis.nextPeriodPrediction ? new Date(cycleData.analysis.nextPeriodPrediction) : null;
    
    // Check if in period
    if (isBefore(today, periodEnd) && !isBefore(today, cycleStart)) {
      return {
        name: "Menstruation",
        description: "Your period is in progress",
        icon: <Droplets className="h-5 w-5" />,
        currentPhase: true,
        color: "bg-pink-100 dark:bg-pink-900/30"
      };
    }
    
    // Check if in fertile window
    if (fertileStart && fertileEnd && !isBefore(today, fertileStart) && isBefore(today, fertileEnd)) {
      return {
        name: "Fertile Window",
        description: "High chance of conception",
        icon: <Star className="h-5 w-5" />,
        currentPhase: true,
        color: "bg-teal-100 dark:bg-teal-900/30"
      };
    }
    
    // Check if ovulation day
    if (ovulationDate && isBefore(today, addDays(ovulationDate, 1)) && !isBefore(today, ovulationDate)) {
      return {
        name: "Ovulation Day",
        description: "Egg release from ovary",
        icon: <ThermometerSun className="h-5 w-5" />,
        currentPhase: true,
        color: "bg-emerald-100 dark:bg-emerald-900/30"
      };
    }
    
    // Check if follicular phase (after period, before ovulation)
    if (ovulationDate && isBefore(today, ovulationDate) && !isBefore(today, periodEnd)) {
      return {
        name: "Follicular Phase",
        description: "Body preparing for ovulation",
        icon: <CalendarClock className="h-5 w-5" />,
        currentPhase: true,
        color: "bg-blue-100 dark:bg-blue-900/30"
      };
    }
    
    // Check if luteal phase (after ovulation, before next period)
    if (nextPeriod && ovulationDate && !isBefore(today, ovulationDate) && isBefore(today, nextPeriod)) {
      return {
        name: "Luteal Phase",
        description: "Post-ovulation to next period",
        icon: <CalendarRange className="h-5 w-5" />,
        currentPhase: true,
        color: "bg-indigo-100 dark:bg-indigo-900/30"
      };
    }
    
    // Default - likely past expected period
    return {
      name: "Cycle Tracking",
      description: "Track your next cycle",
      icon: <AlertCircle className="h-5 w-5" />,
      currentPhase: false,
      color: "bg-gray-100 dark:bg-gray-800"
    };
  };
  
  const getNextEvents = () => {
    if (!cycleData) return [];
    
    const today = new Date();
    const events = [];
    
    // Next ovulation
    if (cycleData.analysis.ovulationDate) {
      const ovulationDate = new Date(cycleData.analysis.ovulationDate);
      if (isBefore(today, ovulationDate)) {
        events.push({
          name: "Ovulation",
          date: ovulationDate,
          daysAway: differenceInDays(ovulationDate, today),
          color: "text-emerald-600 dark:text-emerald-400"
        });
      }
    }
    
    // Fertile window start
    if (cycleData.analysis.fertileWindowStart) {
      const fertileStart = new Date(cycleData.analysis.fertileWindowStart);
      if (isBefore(today, fertileStart)) {
        events.push({
          name: "Fertile Window Begins",
          date: fertileStart,
          daysAway: differenceInDays(fertileStart, today),
          color: "text-teal-600 dark:text-teal-400"
        });
      }
    }
    
    // Next period
    if (cycleData.analysis.nextPeriodPrediction) {
      const nextPeriod = new Date(cycleData.analysis.nextPeriodPrediction);
      if (isBefore(today, nextPeriod)) {
        events.push({
          name: "Next Period",
          date: nextPeriod,
          daysAway: differenceInDays(nextPeriod, today),
          color: "text-pink-600 dark:text-pink-400"
        });
      }
    }
    
    // Sort by closest event
    return events.sort((a, b) => a.daysAway - b.daysAway);
  };
  
  const currentPhase = getCurrentPhase();
  const nextEvents = getNextEvents();
  const cycleProgress = calculateCycleProgress();
  
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-dark-text dark:text-white flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span>Cycle Tracker</span>
          </CardTitle>
          <CardDescription className="text-body-text dark:text-gray-300">
            Track and predict your menstrual cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className={`rounded-lg p-4 flex-1 ${currentPhase.color}`}>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                  {currentPhase.icon}
                </div>
                <div>
                  <h3 className="font-medium text-lg text-dark-text dark:text-white">{currentPhase.name}</h3>
                  <p className="text-sm text-body-text dark:text-gray-300">{currentPhase.description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 flex-1">
              <h3 className="text-dark-text dark:text-white font-medium mb-2">Cycle Progress</h3>
              <Progress value={cycleProgress} className="h-2 mb-2" />
              <p className="text-sm text-body-text dark:text-gray-300">
                Day {cycleData ? differenceInDays(new Date(), new Date(cycleData.analysis.cycleStartDate)) + 1 : "..."} of {cycleData?.analysis.cycleDuration || "..."} day cycle
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nextEvents.map((event, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <h3 className="text-dark-text dark:text-white font-medium">{event.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-body-text dark:text-gray-300 text-sm">{format(event.date, "MMM d")}</p>
                  <p className={`font-medium ${event.color}`}>
                    {event.daysAway === 0 ? "Today" : event.daysAway === 1 ? "Tomorrow" : `In ${event.daysAway} days`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-light-blue-border dark:border-gray-700 pt-4">
          <div>
            <p className="text-sm text-body-text dark:text-gray-300">
              {cycleData?.analysis.regularity === "regular" 
                ? "Your cycle appears to be regular" 
                : "Your cycle appears to be irregular"}
            </p>
          </div>
          <Button variant="outline" size="sm">
            <CalendarDays className="mr-1 h-4 w-4" />
            Log Today
          </Button>
        </CardFooter>
      </Card>
      
      <div className="flex space-x-1 mb-4">
        <Button
          variant={activeView === "overview" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("overview")}
        >
          Overview
        </Button>
        <Button
          variant={activeView === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("calendar")}
        >
          Calendar
        </Button>
      </div>
      
      {activeView === "calendar" && (
        <CycleCalendar />
      )}
      
      {activeView === "overview" && (
        <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-dark-text dark:text-white">Cycle Insights</CardTitle>
            <CardDescription className="text-body-text dark:text-gray-300">
              Understanding your reproductive health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium text-dark-text dark:text-white">Your Cycle Phases</h3>
                
                <div className="space-y-2">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <h4 className="font-medium text-dark-text dark:text-white flex items-center gap-1.5">
                      <Droplets className="h-4 w-4" /> Menstruation
                    </h4>
                    <p className="text-sm text-body-text dark:text-gray-300 mt-1">
                      Your period typically lasts {cycleData?.analysis.periodDuration || "5"} days. During this time, estrogen and progesterone are at their lowest.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <h4 className="font-medium text-dark-text dark:text-white flex items-center gap-1.5">
                      <CalendarClock className="h-4 w-4" /> Follicular Phase
                    </h4>
                    <p className="text-sm text-body-text dark:text-gray-300 mt-1">
                      This phase begins on day 1 of your period and ends with ovulation. Follicles in your ovaries mature during this time.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <h4 className="font-medium text-dark-text dark:text-white flex items-center gap-1.5">
                      <Star className="h-4 w-4" /> Fertile Window
                    </h4>
                    <p className="text-sm text-body-text dark:text-gray-300 mt-1">
                      Your fertile window typically begins 5 days before ovulation and ends 1 day after. This is when pregnancy is most likely.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <h4 className="font-medium text-dark-text dark:text-white flex items-center gap-1.5">
                      <ThermometerSun className="h-4 w-4" /> Ovulation
                    </h4>
                    <p className="text-sm text-body-text dark:text-gray-300 mt-1">
                      Typically occurs around day {cycleData?.analysis.ovulationDate ? differenceInDays(new Date(cycleData.analysis.ovulationDate), new Date(cycleData.analysis.cycleStartDate)) + 1 : "14"} of your cycle. An egg is released from your ovary.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <h4 className="font-medium text-dark-text dark:text-white flex items-center gap-1.5">
                      <CalendarRange className="h-4 w-4" /> Luteal Phase
                    </h4>
                    <p className="text-sm text-body-text dark:text-gray-300 mt-1">
                      This phase begins after ovulation and lasts until your next period. It typically lasts about {cycleData?.analysis.lutealPhaseLength || "14"} days.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-dark-text dark:text-white">Your Cycle Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="text-body-text dark:text-gray-300">Average Cycle Length</span>
                    <span className="font-medium text-dark-text dark:text-white">{cycleData?.analysis.cycleDuration || "28"} days</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="text-body-text dark:text-gray-300">Average Period Length</span>
                    <span className="font-medium text-dark-text dark:text-white">{cycleData?.analysis.periodDuration || "5"} days</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="text-body-text dark:text-gray-300">Luteal Phase Length</span>
                    <span className="font-medium text-dark-text dark:text-white">{cycleData?.analysis.lutealPhaseLength || "14"} days</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="text-body-text dark:text-gray-300">Cycle Regularity</span>
                    <span className="font-medium text-dark-text dark:text-white capitalize">{cycleData?.analysis.regularity || "Regular"}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
                  <h3 className="font-medium text-dark-text dark:text-white mb-2">Tracking Tips</h3>
                  <ul className="space-y-2 text-sm text-body-text dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      <span>Track basal body temperature daily, immediately upon waking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      <span>Note cervical fluid changes throughout your cycle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      <span>Log symptoms daily to identify patterns across cycles</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}