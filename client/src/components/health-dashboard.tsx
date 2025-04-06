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
const getHeatMapColor = (value: number) => {
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
              className={`aspect-square rounded-md flex items-center justify-center cursor-pointer hover:border hover:border-primary transition-all ${getHeatMapColor(activityValue)}`}
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
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span className="text-xs">Medium-Low</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-300 rounded"></div>
          <span className="text-xs">Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span className="text-xs">Medium-High</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs">High</span>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="wearables">Wearables</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
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
          
          <AppointmentsDashboard />
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;