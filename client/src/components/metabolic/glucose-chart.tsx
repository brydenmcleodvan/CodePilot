import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Activity, Info, ChevronRight, BarChart2 } from "lucide-react";
import { format, subDays, startOfDay, addHours } from "date-fns";

interface GlucoseReading {
  timestamp: Date;
  value: number;
  mealContext?: string;
  notes?: string;
}

const getGlucoseLevel = (value: number): "low" | "normal" | "elevated" | "high" => {
  if (value < 70) return "low";
  if (value <= 110) return "normal";
  if (value <= 140) return "elevated";
  return "high";
};

const getGlucoseColor = (level: string): string => {
  switch (level) {
    case "low":
      return "text-blue-600 dark:text-blue-400";
    case "normal":
      return "text-green-600 dark:text-green-400";
    case "elevated":
      return "text-yellow-600 dark:text-yellow-400";
    case "high":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

const getGlucoseBg = (level: string): string => {
  switch (level) {
    case "low":
      return "bg-blue-100 dark:bg-blue-900/30";
    case "normal":
      return "bg-green-100 dark:bg-green-900/30";
    case "elevated":
      return "bg-yellow-100 dark:bg-yellow-900/30";
    case "high":
      return "bg-red-100 dark:bg-red-900/30";
    default:
      return "bg-gray-100 dark:bg-gray-700";
  }
};

// Generate sample data - in a real app, this would come from an API
const generateDemoData = (): GlucoseReading[] => {
  // 3 days of data, 6 readings per day
  const readings: GlucoseReading[] = [];
  
  for (let i = 0; i < 3; i++) {
    const day = subDays(startOfDay(new Date()), i);
    
    // Fasting morning
    readings.push({
      timestamp: addHours(day, 7),
      value: 85 + Math.floor(Math.random() * 15),
      mealContext: "Fasting",
      notes: "Morning reading before breakfast",
    });
    
    // After breakfast
    readings.push({
      timestamp: addHours(day, 9),
      value: 120 + Math.floor(Math.random() * 20),
      mealContext: "Postprandial",
      notes: "2 hours after breakfast",
    });
    
    // Before lunch
    readings.push({
      timestamp: addHours(day, 12),
      value: 90 + Math.floor(Math.random() * 10),
      mealContext: "Preprandial",
      notes: "Before lunch",
    });
    
    // After lunch
    readings.push({
      timestamp: addHours(day, 14),
      value: 110 + Math.floor(Math.random() * 25),
      mealContext: "Postprandial",
      notes: "2 hours after lunch",
    });
    
    // Before dinner
    readings.push({
      timestamp: addHours(day, 18),
      value: 95 + Math.floor(Math.random() * 10),
      mealContext: "Preprandial",
      notes: "Before dinner",
    });
    
    // After dinner
    readings.push({
      timestamp: addHours(day, 20),
      value: 125 + Math.floor(Math.random() * 20),
      mealContext: "Postprandial",
      notes: "2 hours after dinner",
    });
  }
  
  // Sort by timestamp from newest to oldest
  return readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export function GlucoseChart() {
  const [activeTab, setActiveTab] = useState("today");
  const [glucoseData, setGlucoseData] = useState<GlucoseReading[]>(generateDemoData);
  
  // Filter data based on the active tab
  const getFilteredData = (): GlucoseReading[] => {
    const today = startOfDay(new Date());
    if (activeTab === "today") {
      return glucoseData.filter(reading => reading.timestamp >= today);
    }
    if (activeTab === "week") {
      return glucoseData;
    }
    return glucoseData;
  };
  
  const filteredData = getFilteredData();
  
  // Calculate average
  const averageGlucose = filteredData.length 
    ? Math.round(filteredData.reduce((sum, reading) => sum + reading.value, 0) / filteredData.length) 
    : 0;
  
  // Find highest and lowest
  const highestReading = filteredData.length ? 
    filteredData.reduce((max, reading) => reading.value > max.value ? reading : max, filteredData[0]) : 
    null;
  
  const lowestReading = filteredData.length ? 
    filteredData.reduce((min, reading) => reading.value < min.value ? reading : min, filteredData[0]) : 
    null;
  
  // Calculate glucose trends
  const preprandialReadings = filteredData.filter(r => r.mealContext === "Preprandial");
  const postprandialReadings = filteredData.filter(r => r.mealContext === "Postprandial");
  
  const avgPreprandial = preprandialReadings.length 
    ? Math.round(preprandialReadings.reduce((sum, r) => sum + r.value, 0) / preprandialReadings.length) 
    : 0;
  
  const avgPostprandial = postprandialReadings.length 
    ? Math.round(postprandialReadings.reduce((sum, r) => sum + r.value, 0) / postprandialReadings.length) 
    : 0;
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-dark-text dark:text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>Blood Glucose Monitor</span>
        </CardTitle>
        <CardDescription className="text-body-text dark:text-gray-300">
          Track your glucose levels and trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="today" className="data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20">
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20">
              3-Day History
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20">
              Trends
            </TabsTrigger>
          </TabsList>
          
          {/* Today and Week Tabs - Display readings */}
          <TabsContent value="today" className="space-y-4">
            <div className="flex justify-between mb-4">
              <div className="text-sm text-body-text dark:text-gray-300">
                <div className="font-medium text-dark-text dark:text-white text-lg">{averageGlucose} mg/dL</div>
                <div>Average glucose level</div>
              </div>
              <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5 ">
                Add Reading
              </Button>
            </div>
            
            {filteredData.length === 0 ? (
              <div className="text-center py-6">
                <div className="bg-primary/10 dark:bg-primary/20 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-dark-text dark:text-white font-medium mb-1">No readings today</h3>
                <p className="text-body-text dark:text-gray-300 text-sm mb-4">
                  Add your first glucose reading to start tracking
                </p>
                <Button size="sm">Record Reading</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredData.map((reading, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-dark-text dark:text-white">
                          {format(reading.timestamp, "h:mm a")}
                        </span>
                        {reading.mealContext && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-body-text dark:text-gray-300">
                            {reading.mealContext}
                          </span>
                        )}
                      </div>
                      {reading.notes && (
                        <p className="text-xs text-body-text dark:text-gray-400 mt-1">
                          {reading.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-sm font-medium ${getGlucoseBg(getGlucoseLevel(reading.value))} ${getGlucoseColor(getGlucoseLevel(reading.value))}`}>
                        {reading.value} mg/dL
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="week" className="space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="text-sm text-body-text dark:text-gray-300">Average</div>
                  <div className="font-medium text-dark-text dark:text-white text-lg">{averageGlucose} mg/dL</div>
                </div>
                {highestReading && (
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="text-sm text-body-text dark:text-gray-300">Highest</div>
                    <div className={`font-medium text-lg ${getGlucoseColor(getGlucoseLevel(highestReading.value))}`}>
                      {highestReading.value} mg/dL
                    </div>
                  </div>
                )}
                {lowestReading && (
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="text-sm text-body-text dark:text-gray-300">Lowest</div>
                    <div className={`font-medium text-lg ${getGlucoseColor(getGlucoseLevel(lowestReading.value))}`}>
                      {lowestReading.value} mg/dL
                    </div>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5 whitespace-nowrap">
                View Full History
              </Button>
            </div>
            
            <div className="space-y-1">
              {Array.from(new Set(filteredData.map(r => 
                format(r.timestamp, 'yyyy-MM-dd')
              ))).map(date => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-dark-text dark:text-white my-3">
                    {format(new Date(date), 'EEEE, MMMM d')}
                  </h3>
                  <div className="space-y-2">
                    {filteredData
                      .filter(r => format(r.timestamp, 'yyyy-MM-dd') === date)
                      .map((reading, index) => (
                        <motion.div
                          key={`${date}-${index}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-dark-text dark:text-white">
                                {format(reading.timestamp, "h:mm a")}
                              </span>
                              {reading.mealContext && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-body-text dark:text-gray-300">
                                  {reading.mealContext}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-sm font-medium ${getGlucoseBg(getGlucoseLevel(reading.value))} ${getGlucoseColor(getGlucoseLevel(reading.value))}`}>
                            {reading.value} mg/dL
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="text-sm font-medium text-dark-text dark:text-white mb-1">Before Meals (Preprandial)</h3>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-dark-text dark:text-white">{avgPreprandial} mg/dL</div>
                  <div className={`px-2 py-1 rounded-full text-sm font-medium ${getGlucoseBg(getGlucoseLevel(avgPreprandial))} ${getGlucoseColor(getGlucoseLevel(avgPreprandial))}`}>
                    {getGlucoseLevel(avgPreprandial)}
                  </div>
                </div>
                <p className="text-xs text-body-text dark:text-gray-300 mt-2">
                  Target: 70-110 mg/dL
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="text-sm font-medium text-dark-text dark:text-white mb-1">After Meals (Postprandial)</h3>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-dark-text dark:text-white">{avgPostprandial} mg/dL</div>
                  <div className={`px-2 py-1 rounded-full text-sm font-medium ${getGlucoseBg(getGlucoseLevel(avgPostprandial))} ${getGlucoseColor(getGlucoseLevel(avgPostprandial))}`}>
                    {getGlucoseLevel(avgPostprandial)}
                  </div>
                </div>
                <p className="text-xs text-body-text dark:text-gray-300 mt-2">
                  Target: &lt;140 mg/dL (2 hours after meals)
                </p>
              </div>
            </div>
            
            <div className="flex items-center bg-primary/5 dark:bg-primary/10 p-3 rounded-lg">
              <div className="mr-3">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-dark-text dark:text-white">Full Analytics</h3>
                <p className="text-xs text-body-text dark:text-gray-300">
                  View detailed reports, patterns, and time-in-range metrics
                </p>
              </div>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                View Analytics <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}