import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, addDays, eachDayOfInterval, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ActivityIcon, Heart, Moon, Dumbbell, Activity, Thermometer, ThermometerSun } from "lucide-react";

// Simulated data for wearable devices
const wearableData = {
  heartRate: [
    { date: "2025-04-01", avg: 72, min: 58, max: 135, resting: 64 },
    { date: "2025-04-02", avg: 75, min: 56, max: 142, resting: 65 },
    { date: "2025-04-03", avg: 71, min: 55, max: 128, resting: 62 },
    { date: "2025-04-04", avg: 78, min: 60, max: 152, resting: 67 },
    { date: "2025-04-05", avg: 73, min: 58, max: 140, resting: 63 },
    { date: "2025-04-06", avg: 70, min: 57, max: 125, resting: 62 },
  ],
  sleep: [
    { date: "2025-04-01", deep: 1.5, light: 4.2, rem: 1.8, awake: 0.5, total: 8.0, score: 85 },
    { date: "2025-04-02", deep: 1.3, light: 3.8, rem: 1.6, awake: 0.8, total: 7.5, score: 78 },
    { date: "2025-04-03", deep: 1.7, light: 4.5, rem: 2.0, awake: 0.3, total: 8.5, score: 92 },
    { date: "2025-04-04", deep: 1.2, light: 3.5, rem: 1.5, awake: 0.6, total: 6.8, score: 73 },
    { date: "2025-04-05", deep: 1.6, light: 4.3, rem: 1.9, awake: 0.4, total: 8.2, score: 88 },
    { date: "2025-04-06", deep: 1.4, light: 4.0, rem: 1.7, awake: 0.6, total: 7.7, score: 82 },
  ],
  activity: [
    { date: "2025-04-01", steps: 8742, caloriesBurned: 2350, activeMinutes: 45, distance: 4.2 },
    { date: "2025-04-02", steps: 10567, caloriesBurned: 2780, activeMinutes: 63, distance: 5.1 },
    { date: "2025-04-03", steps: 6421, caloriesBurned: 2100, activeMinutes: 30, distance: 3.1 },
    { date: "2025-04-04", steps: 12845, caloriesBurned: 3050, activeMinutes: 75, distance: 6.2 },
    { date: "2025-04-05", steps: 9562, caloriesBurned: 2500, activeMinutes: 55, distance: 4.6 },
    { date: "2025-04-06", steps: 11234, caloriesBurned: 2850, activeMinutes: 68, distance: 5.4 },
  ],
  bloodOxygen: [
    { date: "2025-04-01", avg: 98, min: 95 },
    { date: "2025-04-02", avg: 97, min: 94 },
    { date: "2025-04-03", avg: 99, min: 96 },
    { date: "2025-04-04", avg: 98, min: 95 },
    { date: "2025-04-05", avg: 97, min: 93 },
    { date: "2025-04-06", avg: 98, min: 95 },
  ],
  temperature: [
    { date: "2025-04-01", temperature: 36.6, deviation: 0.0 },
    { date: "2025-04-02", temperature: 36.7, deviation: 0.1 },
    { date: "2025-04-03", temperature: 36.5, deviation: -0.1 },
    { date: "2025-04-04", temperature: 36.4, deviation: -0.2 },
    { date: "2025-04-05", temperature: 36.8, deviation: 0.2 },
    { date: "2025-04-06", temperature: 36.6, deviation: 0.0 },
  ],
  stress: [
    { date: "2025-04-01", score: 35, category: "Low" },
    { date: "2025-04-02", score: 42, category: "Medium" },
    { date: "2025-04-03", score: 28, category: "Low" },
    { date: "2025-04-04", score: 65, category: "High" },
    { date: "2025-04-05", score: 45, category: "Medium" },
    { date: "2025-04-06", score: 38, category: "Low" },
  ],
  recovery: [
    { date: "2025-04-01", score: 82, recommendation: "Light activity" },
    { date: "2025-04-02", score: 75, recommendation: "Light activity" },
    { date: "2025-04-03", score: 90, recommendation: "Full training" },
    { date: "2025-04-04", score: 65, recommendation: "Rest day" },
    { date: "2025-04-05", score: 85, recommendation: "Full training" },
    { date: "2025-04-06", score: 78, recommendation: "Light activity" },
  ],
  hrv: [
    { date: "2025-04-01", value: 45 },
    { date: "2025-04-02", value: 48 },
    { date: "2025-04-03", value: 52 },
    { date: "2025-04-04", value: 38 },
    { date: "2025-04-05", value: 50 },
    { date: "2025-04-06", value: 47 },
  ],
};

// Simulated medical record data
const medicalRecords = {
  labResults: [
    { 
      date: "2025-03-15", 
      type: "Blood Panel", 
      results: [
        { name: "Cholesterol (Total)", value: 185, unit: "mg/dL", reference: "< 200 mg/dL", status: "normal" },
        { name: "HDL Cholesterol", value: 62, unit: "mg/dL", reference: "> 40 mg/dL", status: "normal" },
        { name: "LDL Cholesterol", value: 110, unit: "mg/dL", reference: "< 130 mg/dL", status: "normal" },
        { name: "Triglycerides", value: 95, unit: "mg/dL", reference: "< 150 mg/dL", status: "normal" },
        { name: "Glucose (Fasting)", value: 92, unit: "mg/dL", reference: "70-99 mg/dL", status: "normal" },
        { name: "Zinc", value: 65, unit: "µg/dL", reference: "70-120 µg/dL", status: "low" },
        { name: "Vitamin D", value: 32, unit: "ng/mL", reference: "30-100 ng/mL", status: "normal" }
      ]
    },
    { 
      date: "2024-09-22", 
      type: "Blood Panel", 
      results: [
        { name: "Cholesterol (Total)", value: 195, unit: "mg/dL", reference: "< 200 mg/dL", status: "normal" },
        { name: "HDL Cholesterol", value: 58, unit: "mg/dL", reference: "> 40 mg/dL", status: "normal" },
        { name: "LDL Cholesterol", value: 125, unit: "mg/dL", reference: "< 130 mg/dL", status: "normal" },
        { name: "Triglycerides", value: 110, unit: "mg/dL", reference: "< 150 mg/dL", status: "normal" },
        { name: "Glucose (Fasting)", value: 96, unit: "mg/dL", reference: "70-99 mg/dL", status: "normal" },
        { name: "Zinc", value: 60, unit: "µg/dL", reference: "70-120 µg/dL", status: "low" },
        { name: "Vitamin D", value: 25, unit: "ng/mL", reference: "30-100 ng/mL", status: "low" }
      ]
    }
  ],
  vitalSigns: [
    { 
      date: "2025-04-01", 
      bloodPressure: { systolic: 122, diastolic: 78 },
      heartRate: 72,
      respiratoryRate: 16,
      temperature: 36.6,
      oxygenSaturation: 98
    },
    { 
      date: "2025-01-15", 
      bloodPressure: { systolic: 125, diastolic: 80 },
      heartRate: 75,
      respiratoryRate: 18,
      temperature: 36.7,
      oxygenSaturation: 97
    },
    { 
      date: "2024-09-22", 
      bloodPressure: { systolic: 128, diastolic: 82 },
      heartRate: 78,
      respiratoryRate: 17,
      temperature: 36.8,
      oxygenSaturation: 96
    }
  ],
  medications: [
    { 
      name: "Zinc Supplement",
      dosage: "50mg",
      frequency: "Once daily",
      startDate: "2025-03-20",
      endDate: null,
      prescribedBy: "Dr. Jane Smith"
    },
    { 
      name: "Vitamin D Supplement",
      dosage: "2000 IU",
      frequency: "Once daily",
      startDate: "2024-10-05",
      endDate: null,
      prescribedBy: "Dr. Jane Smith"
    }
  ],
  appointments: [
    {
      date: "2025-04-15",
      time: "10:30 AM",
      provider: "Dr. Jane Smith",
      department: "Primary Care",
      reason: "Follow-up appointment",
      location: "Health Center Building A, Room 305"
    },
    {
      date: "2025-05-10",
      time: "2:15 PM",
      provider: "Dr. Michael Chen",
      department: "Cardiology",
      reason: "Annual heart check-up",
      location: "Health Center Building B, Room 210"
    }
  ]
};

// Function to generate health activity data for the heat map
const generateHeatMapData = () => {
  const today = new Date();
  const startDate = subDays(today, 180); // Generate data for the last 6 months
  const dateRange = eachDayOfInterval({ start: startDate, end: today });
  
  return dateRange.map(date => {
    // Generate random activity score between 0-10
    const activityScore = Math.floor(Math.random() * 10);
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      value: activityScore
    };
  });
};

const heatMapData = generateHeatMapData();

// Color scale for the heat map
const getHeatMapColor = (value: number, date: string) => {
  // Add a few specific yellow and red days
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Make a specific day red (simulating a day with very poor health metrics)
  if (date === format(subDays(new Date(), 5), 'yyyy-MM-dd')) {
    return 'bg-red-500';
  }
  
  // Make some specific days yellow (moderate concern days)
  if (
    date === format(subDays(new Date(), 12), 'yyyy-MM-dd') ||
    date === format(subDays(new Date(), 25), 'yyyy-MM-dd') ||
    date === format(subDays(new Date(), 38), 'yyyy-MM-dd') ||
    date === format(subDays(new Date(), 47), 'yyyy-MM-dd')
  ) {
    return 'bg-yellow-400';
  }
  
  // Regular color scale based on value
  if (value >= 8) return 'bg-green-500';
  if (value >= 6) return 'bg-green-400';
  if (value >= 4) return 'bg-green-300';
  if (value >= 2) return 'bg-green-200';
  return 'bg-green-100';
};

// Component for heat map calendar view
const HealthHeatMap = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth,
    end: endOfMonth
  });

  const getActivityForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const activity = heatMapData.find(item => item.date === dateString);
    return activity ? activity.value : 0;
  };

  const getPreviousMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };

  const getNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Health Activity Heat Map</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={getPreviousMonth}>
            Previous
          </Button>
          <span className="font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={getNextMonth}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
        
        {daysInMonth.map(date => {
          const activityValue = getActivityForDate(date);
          return (
            <div 
              key={date.toISOString()} 
              className={`aspect-square rounded-md flex items-center justify-center cursor-pointer hover:border hover:border-primary transition-all ${getHeatMapColor(activityValue, format(date, 'yyyy-MM-dd'))}`}
              title={`${format(date, 'MMM d, yyyy')}: Activity level ${activityValue}/10`}
            >
              <span className="text-xs font-medium text-gray-700">
                {format(date, 'd')}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between mt-4">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span className="text-xs">Low</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-300 rounded"></div>
          <span className="text-xs">Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs">High</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span className="text-xs">Warning</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-xs">Alert</span>
        </div>
      </div>
    </div>
  );
};

// Heart rate component
const HeartRateDashboard = () => {
  const lastRecord = wearableData.heartRate[wearableData.heartRate.length - 1];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Heart Rate</CardTitle>
          <Heart className="h-5 w-5 text-red-500" />
        </div>
        <CardDescription>Today's heart rate data from your Apple Watch</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Resting</p>
            <p className="text-2xl font-bold">{lastRecord.resting}</p>
            <p className="text-xs text-gray-400">BPM</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Average</p>
            <p className="text-2xl font-bold">{lastRecord.avg}</p>
            <p className="text-xs text-gray-400">BPM</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Maximum</p>
            <p className="text-2xl font-bold">{lastRecord.max}</p>
            <p className="text-xs text-gray-400">BPM</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={wearableData.heartRate}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'MM/dd')} 
              tickLine={false}
            />
            <YAxis domain={['dataMin - 10', 'dataMax + 10']} tickLine={false} axisLine={false} />
            <Tooltip 
              labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
              formatter={(value) => [`${value} BPM`, '']}
            />
            <Line 
              type="monotone" 
              dataKey="avg" 
              stroke="#4A90E2" 
              dot={true} 
              activeDot={{ r: 6 }} 
              name="Average"
            />
            <Line 
              type="monotone" 
              dataKey="resting" 
              stroke="#82ca9d" 
              dot={true} 
              name="Resting"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Sleep component
const SleepDashboard = () => {
  const lastRecord = wearableData.sleep[wearableData.sleep.length - 1];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Sleep</CardTitle>
          <Moon className="h-5 w-5 text-indigo-500" />
        </div>
        <CardDescription>Last night's sleep data from your Whoop Strap</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{lastRecord.total}</p>
            <p className="text-xs text-gray-400">hours</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Score</p>
            <p className="text-2xl font-bold">{lastRecord.score}</p>
            <p className="text-xs text-gray-400">/ 100</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Deep</p>
            <p className="text-2xl font-bold">{lastRecord.deep}</p>
            <p className="text-xs text-gray-400">hours</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="h-10 flex rounded-md overflow-hidden">
            <div 
              className="bg-indigo-900" 
              style={{ width: `${(lastRecord.deep / lastRecord.total) * 100}%` }}
              title={`Deep Sleep: ${lastRecord.deep} hours`}
            ></div>
            <div 
              className="bg-indigo-500" 
              style={{ width: `${(lastRecord.rem / lastRecord.total) * 100}%` }}
              title={`REM Sleep: ${lastRecord.rem} hours`}
            ></div>
            <div 
              className="bg-indigo-300" 
              style={{ width: `${(lastRecord.light / lastRecord.total) * 100}%` }}
              title={`Light Sleep: ${lastRecord.light} hours`}
            ></div>
            <div 
              className="bg-gray-300" 
              style={{ width: `${(lastRecord.awake / lastRecord.total) * 100}%` }}
              title={`Awake: ${lastRecord.awake} hours`}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <div>Deep</div>
            <div>REM</div>
            <div>Light</div>
            <div>Awake</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={wearableData.sleep}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'MM/dd')} 
              tickLine={false}
            />
            <YAxis ticks={[0, 2, 4, 6, 8, 10]} tickLine={false} axisLine={false} />
            <Tooltip 
              labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
              formatter={(value) => [`${value} hours`, '']}
            />
            <Legend />
            <Bar dataKey="deep" stackId="a" fill="#312e81" name="Deep" />
            <Bar dataKey="rem" stackId="a" fill="#6366f1" name="REM" />
            <Bar dataKey="light" stackId="a" fill="#a5b4fc" name="Light" />
            <Bar dataKey="awake" stackId="a" fill="#e5e7eb" name="Awake" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Activity component
const ActivityDashboard = () => {
  const lastRecord = wearableData.activity[wearableData.activity.length - 1];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Physical Activity</CardTitle>
          <ActivityIcon className="h-5 w-5 text-green-500" />
        </div>
        <CardDescription>Today's activity data from your Apple Watch</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Steps</p>
            <p className="text-2xl font-bold">{lastRecord.steps.toLocaleString()}</p>
            <div className="mt-1">
              <Progress value={(lastRecord.steps / 10000) * 100} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">{Math.round((lastRecord.steps / 10000) * 100)}% of 10,000 goal</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Active Minutes</p>
            <p className="text-2xl font-bold">{lastRecord.activeMinutes}</p>
            <div className="mt-1">
              <Progress value={(lastRecord.activeMinutes / 60) * 100} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">{Math.round((lastRecord.activeMinutes / 60) * 100)}% of 60 min goal</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Distance</p>
            <p className="text-2xl font-bold">{lastRecord.distance}</p>
            <p className="text-xs text-gray-400">miles</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Calories</p>
            <p className="text-2xl font-bold">{lastRecord.caloriesBurned.toLocaleString()}</p>
            <p className="text-xs text-gray-400">kcal</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={wearableData.activity}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'MM/dd')} 
              tickLine={false}
            />
            <YAxis domain={[0, 15000]} tickLine={false} axisLine={false} />
            <Tooltip 
              labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
              formatter={(value) => [`${value.toLocaleString()}`, '']}
            />
            <Area 
              type="monotone" 
              dataKey="steps" 
              stroke="#22c55e" 
              fill="#dcfce7" 
              name="Steps"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Recovery component (Whoop Recovery Score)
const RecoveryDashboard = () => {
  const lastRecord = wearableData.recovery[wearableData.recovery.length - 1];
  
  const getRecoveryColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Recovery</CardTitle>
          <Activity className="h-5 w-5 text-blue-500" />
        </div>
        <CardDescription>Today's recovery data from your Whoop Strap</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-32 h-32 mb-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold ${getRecoveryColor(lastRecord.score)}`}>{lastRecord.score}%</span>
            </div>
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={lastRecord.score >= 85 ? "#22c55e" : lastRecord.score >= 70 ? "#eab308" : "#ef4444"}
                strokeWidth="3"
                strokeDasharray={`${lastRecord.score}, 100`}
              />
            </svg>
          </div>
          <p className="text-center text-sm text-gray-500">Recommendation:</p>
          <p className="text-center font-medium">{lastRecord.recommendation}</p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-x-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Heart Rate Variability</p>
            <p className="text-xl font-bold">{wearableData.hrv[wearableData.hrv.length - 1].value} ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Resting Heart Rate</p>
            <p className="text-xl font-bold">{wearableData.heartRate[wearableData.heartRate.length - 1].resting} BPM</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={150} className="mt-4">
          <LineChart
            data={wearableData.recovery}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'MM/dd')} 
              tickLine={false}
            />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
            <Tooltip 
              labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
              formatter={(value) => [`${value}%`, 'Recovery Score']}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#4A90E2" 
              dot={true} 
              activeDot={{ r: 6 }} 
              name="Recovery Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Lab Results component
const LabResultsDashboard = () => {
  const latestResults = medicalRecords.labResults[0];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Lab Results</CardTitle>
          <Badge variant="outline">
            {format(parseISO(latestResults.date), 'MMM d, yyyy')}
          </Badge>
        </div>
        <CardDescription>Latest results from your medical records</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2 font-medium">Test</th>
                <th className="text-right pb-2 font-medium">Result</th>
                <th className="text-right pb-2 font-medium">Reference</th>
                <th className="text-right pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {latestResults.results.map((result, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-3">{result.name}</td>
                  <td className="py-3 text-right">{result.value} {result.unit}</td>
                  <td className="py-3 text-right text-gray-500">{result.reference}</td>
                  <td className="py-3 text-right">
                    <Badge variant={result.status === 'normal' ? 'outline' : result.status === 'low' ? 'secondary' : 'destructive'}>
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
        <div className="mt-4">
          <Button variant="outline" className="w-full">View All Lab Results</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Upcoming Appointments component
const AppointmentsDashboard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Upcoming Appointments</CardTitle>
        <CardDescription>Scheduled healthcare appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medicalRecords.appointments.map((appointment, i) => (
            <div key={i} className="p-4 border rounded-lg hover:border-primary transition-colors duration-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{appointment.reason}</h4>
                  <p className="text-sm text-gray-500">{appointment.provider} - {appointment.department}</p>
                </div>
                <Badge variant="outline">
                  {format(parseISO(appointment.date), 'MMM d')}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{appointment.time}</span>
                <span className="text-gray-500">{appointment.location}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="outline">View All</Button>
          <Button>Schedule Appointment</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Nutrition component
const NutritionDashboard = () => {
  // Simulated nutrition data
  const nutritionData = [
    { date: "2025-04-01", calories: 2145, protein: 112, carbs: 205, fats: 72, fiber: 28, hydration: 2800 },
    { date: "2025-04-02", calories: 2320, protein: 126, carbs: 225, fats: 77, fiber: 32, hydration: 3100 },
    { date: "2025-04-03", calories: 1980, protein: 98, carbs: 185, fats: 68, fiber: 25, hydration: 2600 },
    { date: "2025-04-04", calories: 2250, protein: 118, carbs: 215, fats: 74, fiber: 30, hydration: 2900 },
    { date: "2025-04-05", calories: 2410, protein: 132, carbs: 235, fats: 82, fiber: 35, hydration: 3200 },
    { date: "2025-04-06", calories: 2180, protein: 108, carbs: 210, fats: 75, fiber: 29, hydration: 2850 },
  ];
  
  const todayData = nutritionData[nutritionData.length - 1];
  
  // Macronutrient percentages
  const proteinPct = Math.round((todayData.protein * 4) / todayData.calories * 100);
  const carbsPct = Math.round((todayData.carbs * 4) / todayData.calories * 100);
  const fatsPct = Math.round((todayData.fats * 9) / todayData.calories * 100);
  
  // Goal progress
  const calorieGoal = 2200;
  const proteinGoal = 120;
  const waterGoal = 3000;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Nutrition</CardTitle>
          <i className="ri-restaurant-line text-orange-500 text-lg"></i>
        </div>
        <CardDescription>Today's nutrition data from your food tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm text-gray-500 mb-1">Calories</h4>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{todayData.calories}</span>
              <span className="text-sm text-gray-500">/ {calorieGoal} kcal</span>
            </div>
            <Progress 
              value={(todayData.calories / calorieGoal) * 100} 
              className="h-2 mt-2" 
            />
          </div>
          <div>
            <h4 className="text-sm text-gray-500 mb-1">Protein</h4>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{todayData.protein}g</span>
              <span className="text-sm text-gray-500">/ {proteinGoal}g</span>
            </div>
            <Progress 
              value={(todayData.protein / proteinGoal) * 100} 
              className="h-2 mt-2" 
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm text-gray-500 mb-2">Macronutrient Breakdown</h4>
          <div className="h-8 flex rounded-md overflow-hidden">
            <div 
              className="bg-blue-500" 
              style={{ width: `${proteinPct}%` }}
              title={`Protein: ${proteinPct}%, ${todayData.protein}g`}
            ></div>
            <div 
              className="bg-yellow-500" 
              style={{ width: `${carbsPct}%` }}
              title={`Carbs: ${carbsPct}%, ${todayData.carbs}g`}
            ></div>
            <div 
              className="bg-green-500" 
              style={{ width: `${fatsPct}%` }}
              title={`Fats: ${fatsPct}%, ${todayData.fats}g`}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
              <span>Protein {proteinPct}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-1"></div>
              <span>Carbs {carbsPct}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
              <span>Fats {fatsPct}%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm text-gray-500 mb-1">Fiber</h4>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold">{todayData.fiber}g</span>
              <span className="text-sm text-gray-500">/ 30g</span>
            </div>
            <Progress 
              value={(todayData.fiber / 30) * 100} 
              className="h-2 mt-2" 
            />
          </div>
          <div>
            <h4 className="text-sm text-gray-500 mb-1">Hydration</h4>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold">{todayData.hydration}ml</span>
              <span className="text-sm text-gray-500">/ {waterGoal}ml</span>
            </div>
            <Progress 
              value={(todayData.hydration / waterGoal) * 100} 
              className="h-2 mt-2" 
            />
          </div>
        </div>
        
        <Button variant="outline" className="w-full">
          <i className="ri-add-line mr-1"></i> Log Meal
        </Button>
      </CardContent>
    </Card>
  );
};

// Medication Adherence component
const MedicationAdherenceDashboard = () => {
  // Simulated medication adherence data
  const medicationSchedule = [
    { 
      id: 1,
      name: "Zinc Supplement",
      dosage: "50mg",
      schedule: "1x daily (morning)",
      timeOfDay: "morning",
      taken: true,
      nextDose: "Tomorrow, 8:00 AM"
    },
    { 
      id: 2,
      name: "Vitamin D Supplement",
      dosage: "2000 IU",
      schedule: "1x daily (morning)",
      timeOfDay: "morning",
      taken: true,
      nextDose: "Tomorrow, 8:00 AM"
    },
    { 
      id: 3,
      name: "Multivitamin",
      dosage: "1 tablet",
      schedule: "1x daily (with meal)",
      timeOfDay: "afternoon",
      taken: false,
      nextDose: "Today, 12:30 PM"
    },
    { 
      id: 4,
      name: "Probiotic",
      dosage: "1 capsule",
      schedule: "1x daily (evening)",
      timeOfDay: "evening",
      taken: false,
      nextDose: "Today, 8:00 PM"
    }
  ];
  
  // Medication adherence stats
  const adherenceStats = {
    weeklyAdherence: 92,
    monthlyAdherence: 88,
    streakDays: 12
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Medication Adherence</CardTitle>
          <Badge variant={adherenceStats.weeklyAdherence > 90 ? "outline" : "secondary"}>
            {adherenceStats.weeklyAdherence}% Adherence
          </Badge>
        </div>
        <CardDescription>Track your medication schedule and adherence</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Today's Schedule</h4>
            <span className="text-xs text-gray-500">{format(new Date(), 'EEEE, MMMM d')}</span>
          </div>
          
          <div className="space-y-3">
            {medicationSchedule.map(med => (
              <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    med.taken ? 'bg-green-500' : 
                    med.timeOfDay === 'morning' ? 'bg-amber-500' : 
                    med.timeOfDay === 'afternoon' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-xs text-gray-500">{med.dosage} • {med.schedule}</p>
                  </div>
                </div>
                {med.taken ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Taken
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline">Take Now</Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Weekly</p>
            <p className="text-xl font-bold text-primary">{adherenceStats.weeklyAdherence}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Monthly</p>
            <p className="text-xl font-bold text-primary">{adherenceStats.monthlyAdherence}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Streak</p>
            <p className="text-xl font-bold text-primary">{adherenceStats.streakDays} days</p>
          </div>
        </div>
        
        <Button variant="outline" className="w-full">
          <i className="ri-calendar-line mr-1"></i> Medication Schedule
        </Button>
      </CardContent>
    </Card>
  );
};

// Enhanced Fitness Metrics component
const FitnessMetricsDashboard = () => {
  // Simulated fitness data
  const fitnessData = {
    vo2Max: 48.2,
    restingHeartRate: 62,
    hrv: 48,
    trainingLoad: {
      current: 680,
      optimal: [550, 750],
      status: "optimal" // "low", "optimal", "high"
    },
    workouts: [
      {
        date: "2025-04-06",
        type: "Running",
        duration: 45,
        distance: 6.2,
        calories: 520,
        avgHeartRate: 162
      },
      {
        date: "2025-04-04",
        type: "Strength Training",
        duration: 60,
        calories: 450,
        avgHeartRate: 145
      },
      {
        date: "2025-04-03",
        type: "Cycling",
        duration: 75,
        distance: 25.8,
        calories: 690,
        avgHeartRate: 158
      }
    ]
  };
  
  // Training readiness calculation (simplified example)
  const calculateReadiness = (hrv: number, rhr: number) => {
    const score = 100 - (rhr - 45) + (hrv - 30) / 2;
    return Math.min(Math.max(Math.round(score), 0), 100);
  };
  
  const readinessScore = calculateReadiness(fitnessData.hrv, fitnessData.restingHeartRate);
  
  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Fitness Metrics</CardTitle>
          <Dumbbell className="h-5 w-5 text-violet-500" />
        </div>
        <CardDescription>Advanced fitness and training metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h4 className="text-sm text-gray-500 mb-1">Training Readiness</h4>
            <p className={`text-3xl font-bold ${getReadinessColor(readinessScore)}`}>
              {readinessScore}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {readinessScore >= 80 ? 'Ready for intense training' :
               readinessScore >= 60 ? 'Moderate training advised' : 'Recovery day recommended'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h4 className="text-sm text-gray-500 mb-1">VO₂ Max</h4>
            <p className="text-3xl font-bold text-primary">{fitnessData.vo2Max}</p>
            <p className="text-xs text-gray-500 mt-1">
              {fitnessData.vo2Max >= 50 ? 'Excellent' : 
               fitnessData.vo2Max >= 45 ? 'Good' : 
               fitnessData.vo2Max >= 40 ? 'Above Average' : 'Average'} cardio fitness
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm text-gray-500 mb-2">7-Day Training Load</h4>
          <div className="relative pt-6 pb-2">
            <div className="h-3 bg-gray-200 rounded-full">
              <div 
                className={`h-3 rounded-full ${
                  fitnessData.trainingLoad.status === 'optimal' ? 'bg-green-500' :
                  fitnessData.trainingLoad.status === 'low' ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${(fitnessData.trainingLoad.current / 1000) * 100}%`
                }}
              ></div>
            </div>
            <div 
              className="absolute h-full border-l border-dashed border-green-600"
              style={{ 
                left: `${(fitnessData.trainingLoad.optimal[0] / 1000) * 100}%`,
                top: 0
              }}
            ></div>
            <div 
              className="absolute h-full border-l border-dashed border-green-600"
              style={{ 
                left: `${(fitnessData.trainingLoad.optimal[1] / 1000) * 100}%`,
                top: 0
              }}
            ></div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0</span>
              <span>250</span>
              <span>500</span>
              <span>750</span>
              <span>1000</span>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className={`text-sm ${
              fitnessData.trainingLoad.status === 'optimal' ? 'text-green-600' :
              fitnessData.trainingLoad.status === 'low' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {fitnessData.trainingLoad.current} - {
                fitnessData.trainingLoad.status === 'optimal' ? 'Optimal Load' :
                fitnessData.trainingLoad.status === 'low' ? 'Underconditioned' : 'Overreaching'
              }
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm text-gray-500 mb-2">Recent Workouts</h4>
          <div className="space-y-3">
            {fitnessData.workouts.map((workout, i) => (
              <div key={i} className="border rounded-lg p-3 flex justify-between">
                <div>
                  <div className="flex items-center">
                    <i className={`mr-2 ${
                      workout.type === 'Running' ? 'ri-run-line text-blue-500' :
                      workout.type === 'Cycling' ? 'ri-bike-line text-green-500' :
                      'ri-fitness-line text-orange-500'
                    }`}></i>
                    <span className="font-medium">{workout.type}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {workout.duration} min • {workout.calories} kcal
                    {workout.distance && ` • ${workout.distance} ${workout.type === 'Running' ? 'mi' : 'km'}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {format(parseISO(workout.date), 'MMM d')}
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <Heart className="h-3 w-3 text-red-500 mr-1" />
                    <span>{workout.avgHeartRate} bpm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Button variant="outline" className="w-full">
          <i className="ri-calendar-event-line mr-1"></i> All Workouts
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Health Dashboard Component
const HealthDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-2">Health Dashboard</h2>
        <p className="text-gray-600">Comprehensive health data from your wearables and medical records</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="wearables">Wearables</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="fitness">Fitness</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HeartRateDashboard />
                <SleepDashboard />
                <ActivityDashboard />
                <RecoveryDashboard />
              </div>
            </TabsContent>
            <TabsContent value="wearables" className="mt-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                  <h3 className="text-lg font-medium mb-4">Connected Devices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <i className="ri-watch-line text-primary text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Apple Watch Series 9</h4>
                        <p className="text-sm text-gray-500">Connected • Last sync: 10 minutes ago</p>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <i className="ri-heart-pulse-line text-primary text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Whoop Strap 4.0</h4>
                        <p className="text-sm text-gray-500">Connected • Last sync: 25 minutes ago</p>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <i className="ri-scales-line text-primary text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Smart Scale</h4>
                        <p className="text-sm text-gray-500">Connected • Last sync: 2 days ago</p>
                      </div>
                    </div>
                    <div className="border border-dashed rounded-lg p-4 flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <i className="ri-add-line text-gray-400 text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Add New Device</h4>
                        <p className="text-sm text-gray-500">Connect additional health trackers</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HeartRateDashboard />
                  <SleepDashboard />
                  <ActivityDashboard />
                  <RecoveryDashboard />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="medical" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LabResultsDashboard />
                <AppointmentsDashboard />
                <MedicationAdherenceDashboard />
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Medical Records</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div className="flex items-center">
                        <i className="ri-file-text-line text-primary mr-2"></i>
                        <div>
                          <p className="font-medium">Annual Physical</p>
                          <p className="text-xs text-gray-500">Dr. Jane Smith • Primary Care</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Jan 15, 2025</p>
                        <Button variant="link" className="p-0 h-auto text-xs">View</Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div className="flex items-center">
                        <i className="ri-heart-pulse-line text-primary mr-2"></i>
                        <div>
                          <p className="font-medium">Cardiology Checkup</p>
                          <p className="text-xs text-gray-500">Dr. Michael Chen • Cardiology</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Oct 10, 2024</p>
                        <Button variant="link" className="p-0 h-auto text-xs">View</Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div className="flex items-center">
                        <i className="ri-test-tube-line text-primary mr-2"></i>
                        <div>
                          <p className="font-medium">Blood Work</p>
                          <p className="text-xs text-gray-500">MedPath Labs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Sep 22, 2024</p>
                        <Button variant="link" className="p-0 h-auto text-xs">View</Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">View All Records</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="fitness" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FitnessMetricsDashboard />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Heart Rate Zones</CardTitle>
                    <CardDescription>Training distribution by heart rate zone</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Zone 5 (Maximum: 181-200 bpm)</span>
                          <span className="text-sm text-gray-500">12 min</span>
                        </div>
                        <Progress value={8} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Zone 4 (Hard: 162-180 bpm)</span>
                          <span className="text-sm text-gray-500">48 min</span>
                        </div>
                        <Progress value={32} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Zone 3 (Moderate: 143-161 bpm)</span>
                          <span className="text-sm text-gray-500">85 min</span>
                        </div>
                        <Progress value={56} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Zone 2 (Light: 124-142 bpm)</span>
                          <span className="text-sm text-gray-500">135 min</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Zone 1 (Very Light: 105-123 bpm)</span>
                          <span className="text-sm text-gray-500">80 min</span>
                        </div>
                        <Progress value={54} className="h-2" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Weekly Training Distribution</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                          data={[
                            { day: 'Mon', zone1: 15, zone2: 25, zone3: 10, zone4: 5, zone5: 0 },
                            { day: 'Tue', zone1: 10, zone2: 20, zone3: 15, zone4: 10, zone5: 5 },
                            { day: 'Wed', zone1: 5, zone2: 10, zone3: 5, zone4: 0, zone5: 0 },
                            { day: 'Thu', zone1: 20, zone2: 30, zone3: 25, zone4: 15, zone5: 0 },
                            { day: 'Fri', zone1: 10, zone2: 15, zone3: 10, zone4: 8, zone5: 2 },
                            { day: 'Sat', zone1: 15, zone2: 25, zone3: 15, zone4: 5, zone5: 5 },
                            { day: 'Sun', zone1: 5, zone2: 10, zone3: 5, zone4: 5, zone5: 0 }
                          ]}
                          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="zone5" stackId="a" fill="#ef4444" name="Zone 5" />
                          <Bar dataKey="zone4" stackId="a" fill="#f97316" name="Zone 4" />
                          <Bar dataKey="zone3" stackId="a" fill="#eab308" name="Zone 3" />
                          <Bar dataKey="zone2" stackId="a" fill="#84cc16" name="Zone 2" />
                          <Bar dataKey="zone1" stackId="a" fill="#22c55e" name="Zone 1" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Body Composition</CardTitle>
                    <CardDescription>Data from smart scale measurements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Weight</p>
                        <p className="text-2xl font-bold">172.5 lbs</p>
                        <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                          <i className="ri-arrow-down-line"></i>
                          <span>1.5 lbs (30d)</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Body Fat</p>
                        <p className="text-2xl font-bold">16.8%</p>
                        <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                          <i className="ri-arrow-down-line"></i>
                          <span>0.5% (30d)</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Muscle Mass</span>
                          <span className="text-sm font-medium">68.3 lbs</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Bone Mass</span>
                          <span className="text-sm font-medium">7.8 lbs</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Water</span>
                          <span className="text-sm font-medium">60.2%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">BMI</span>
                          <span className="text-sm font-medium">23.4</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">View Detailed History</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Activity Goals</CardTitle>
                    <CardDescription>Track your progress toward fitness goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <div>
                            <h4 className="font-medium">Weekly Active Minutes</h4>
                            <p className="text-sm text-gray-500">Target: 300 minutes</p>
                          </div>
                          <span className="text-lg font-medium">276/300</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <div>
                            <h4 className="font-medium">10K Steps Daily</h4>
                            <p className="text-sm text-gray-500">Days reached: 5/7 this week</p>
                          </div>
                          <span className="text-lg font-medium">5/7</span>
                        </div>
                        <Progress value={71} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <div>
                            <h4 className="font-medium">Strength Training</h4>
                            <p className="text-sm text-gray-500">Target: 3 sessions/week</p>
                          </div>
                          <span className="text-lg font-medium">2/3</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <div>
                            <h4 className="font-medium">Running Distance</h4>
                            <p className="text-sm text-gray-500">Target: 20 miles/week</p>
                          </div>
                          <span className="text-lg font-medium">16.8/20</span>
                        </div>
                        <Progress value={84} className="h-2" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-6">
                      <i className="ri-settings-line mr-1"></i> Adjust Goals
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="nutrition" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NutritionDashboard />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Meal History</CardTitle>
                    <CardDescription>Recent meals and nutritional information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Breakfast</h4>
                          <span className="text-sm text-gray-500">8:15 AM</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline">Greek Yogurt</Badge>
                          <Badge variant="outline">Granola</Badge>
                          <Badge variant="outline">Blueberries</Badge>
                          <Badge variant="outline">Honey</Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>380 kcal</span>
                          <span>28g protein</span>
                          <span>48g carbs</span>
                          <span>9g fat</span>
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Lunch</h4>
                          <span className="text-sm text-gray-500">12:30 PM</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline">Grilled Chicken</Badge>
                          <Badge variant="outline">Quinoa</Badge>
                          <Badge variant="outline">Avocado</Badge>
                          <Badge variant="outline">Mixed Greens</Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>620 kcal</span>
                          <span>42g protein</span>
                          <span>58g carbs</span>
                          <span>24g fat</span>
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Snack</h4>
                          <span className="text-sm text-gray-500">3:45 PM</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline">Protein Shake</Badge>
                          <Badge variant="outline">Banana</Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>280 kcal</span>
                          <span>24g protein</span>
                          <span>32g carbs</span>
                          <span>4g fat</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">View Full Log</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Nutrition Goals</CardTitle>
                    <CardDescription>Your personalized nutrition targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Daily Protein Target</h4>
                          <span className="text-green-600 font-medium">On Track</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current: 108g</span>
                          <span>Target: 120g</span>
                        </div>
                        <Progress value={90} className="h-2" />
                        <p className="text-xs text-gray-500 mt-2">
                          Aim for 1.6-2.2g per kg of bodyweight to support muscle maintenance and recovery.
                        </p>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Hydration</h4>
                          <span className="text-amber-600 font-medium">Needs Attention</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current: 1850ml</span>
                          <span>Target: 3000ml</span>
                        </div>
                        <Progress value={62} className="h-2" />
                        <p className="text-xs text-gray-500 mt-2">
                          Proper hydration supports exercise recovery, nutrient transport, and overall health.
                        </p>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Fiber Intake</h4>
                          <span className="text-amber-600 font-medium">Needs Attention</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current: 22g</span>
                          <span>Target: 30g</span>
                        </div>
                        <Progress value={73} className="h-2" />
                        <p className="text-xs text-gray-500 mt-2">
                          Adequate fiber promotes digestive health and may help manage hunger and blood sugar.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-6">
                      <i className="ri-settings-line mr-1"></i> Adjust Nutrition Targets
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Supplements</CardTitle>
                    <CardDescription>Your current supplement regimen</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                            <i className="ri-capsule-line"></i>
                          </div>
                          <div>
                            <h4 className="font-medium">Zinc Supplement</h4>
                            <p className="text-sm text-gray-500">50mg once daily</p>
                            <p className="text-xs text-gray-500 mt-1">For immune support and addressing deficiency</p>
                          </div>
                        </div>
                        <Badge variant="outline">Prescribed</Badge>
                      </div>
                      <div className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-1">
                            <i className="ri-sun-line"></i>
                          </div>
                          <div>
                            <h4 className="font-medium">Vitamin D</h4>
                            <p className="text-sm text-gray-500">2000 IU once daily</p>
                            <p className="text-xs text-gray-500 mt-1">For bone health and immune function</p>
                          </div>
                        </div>
                        <Badge variant="outline">Prescribed</Badge>
                      </div>
                      <div className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1">
                            <i className="ri-medicine-bottle-line"></i>
                          </div>
                          <div>
                            <h4 className="font-medium">Multivitamin</h4>
                            <p className="text-sm text-gray-500">1 tablet daily with meal</p>
                            <p className="text-xs text-gray-500 mt-1">General nutritional support</p>
                          </div>
                        </div>
                        <Badge variant="outline">Self-added</Badge>
                      </div>
                      <div className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-1">
                            <i className="ri-test-tube-line"></i>
                          </div>
                          <div>
                            <h4 className="font-medium">Probiotic</h4>
                            <p className="text-sm text-gray-500">1 capsule daily</p>
                            <p className="text-xs text-gray-500 mt-1">For gut health and digestion</p>
                          </div>
                        </div>
                        <Badge variant="outline">Self-added</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline">
                        <i className="ri-information-line mr-1"></i> Supplement Info
                      </Button>
                      <Button>
                        <i className="ri-add-line mr-1"></i> Add Supplement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="trends" className="mt-4">
              <div className="grid grid-cols-1 gap-6">
                <HealthHeatMap />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Long-term Health Trends</CardTitle>
                    <CardDescription>6-month view of key health metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Select Metric</p>
                      <Select defaultValue="heartRate">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="heartRate">Resting Heart Rate</SelectItem>
                          <SelectItem value="sleep">Sleep Duration</SelectItem>
                          <SelectItem value="steps">Daily Steps</SelectItem>
                          <SelectItem value="recovery">Recovery Score</SelectItem>
                          <SelectItem value="hrv">Heart Rate Variability</SelectItem>
                          <SelectItem value="weight">Body Weight</SelectItem>
                          <SelectItem value="bodyFat">Body Fat Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={[...wearableData.heartRate, ...wearableData.heartRate].map((item, index) => ({
                          ...item,
                          date: format(addDays(parseISO(item.date), index * 7), 'yyyy-MM-dd')
                        }))}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(parseISO(date), 'MM/dd')} 
                          tickLine={false}
                        />
                        <YAxis 
                          domain={[50, 90]} 
                          tickLine={false} 
                          axisLine={false} 
                          label={{ 
                            value: 'BPM', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                          }} 
                        />
                        <Tooltip 
                          labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                          formatter={(value) => [`${value} BPM`, 'Resting Heart Rate']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="resting" 
                          stroke="#4A90E2" 
                          dot={false} 
                          name="Resting Heart Rate"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Correlations</CardTitle>
                    <CardDescription>Relationships between different health metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Sleep Quality vs Recovery Score</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center text-sm mb-3">
                            <i className="ri-information-line text-primary mr-2"></i>
                            <span>Strong positive correlation (r = 0.78)</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Better sleep quality consistently leads to higher recovery scores the following day.
                            Your deep sleep duration shows the strongest correlation with recovery metrics.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Activity Level vs Resting Heart Rate</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center text-sm mb-3">
                            <i className="ri-information-line text-primary mr-2"></i>
                            <span>Moderate negative correlation (r = -0.52)</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Periods of higher regular activity correlate with lower resting heart rate,
                            suggesting improved cardiovascular fitness during active periods.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Nutrition Quality vs Energy Levels</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center text-sm mb-3">
                            <i className="ri-information-line text-primary mr-2"></i>
                            <span>Positive correlation (r = 0.62)</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Days with balanced nutrition (adequate protein, complex carbs, and healthy fats)
                            show improved energy levels and workout performance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Health Insights</CardTitle>
              <CardDescription>Based on your connected data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <i className="ri-heart-pulse-line"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700">Zinc Deficiency</h4>
                    <p className="text-sm text-gray-600">Your latest lab results show below-normal zinc levels. This could impact your immune function.</p>
                    <Button variant="link" className="p-0 h-auto text-sm" size="sm">
                      See recommendations
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                    <i className="ri-moon-line"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-700">Sleep Consistency</h4>
                    <p className="text-sm text-gray-600">Your sleep schedule varies by more than 1 hour across weekdays. More consistent timing could improve quality.</p>
                    <Button variant="link" className="p-0 h-auto text-sm" size="sm">
                      See recommendations
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <i className="ri-walk-line"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700">Activity Streak</h4>
                    <p className="text-sm text-gray-600">You've met your step goal 5 days in a row! Keep up the great work.</p>
                    <Button variant="link" className="p-0 h-auto text-sm" size="sm">
                      View details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <MedicationAdherenceDashboard />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Healthmap AI Analysis</CardTitle>
              <CardDescription>Personalized health insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Sleep-Activity Relationship</h4>
                  <p className="text-sm text-blue-700">
                    Our AI has detected a pattern where your sleep quality improves significantly when you exercise before 6pm. 
                    Consider scheduling your workouts earlier in the day for optimal recovery.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Nutrition Insight</h4>
                  <p className="text-sm text-blue-700">
                    Your energy levels show significant improvement on days with higher protein intake (over 25g) at breakfast.
                    This pattern is especially strong on workout days.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Stress Management</h4>
                  <p className="text-sm text-blue-700">
                    Your HRV patterns indicate potential stress accumulation in mid-week. Consider implementing mindfulness
                    practices on Wednesday and Thursday to prevent recovery decline.
                  </p>
                </div>
              </div>
              
              <Button className="w-full mt-4">
                <i className="ri-ai-generate mr-1"></i> Get Full AI Health Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;