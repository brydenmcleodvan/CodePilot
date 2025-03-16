import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { useAuth } from "@/lib/auth";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Sun, Cloud, CloudDrizzle, CloudLightning } from "lucide-react";

// Define types for mood entries
interface MoodEntry {
  id: number;
  userId: number;
  date: Date;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  sleep: number; // hours
  categories: string[];
  notes: string | null;
  factors: string[];
}

// Color mapping for mood levels
const moodColors = {
  1: "#3b0404", // Very dark red (terrible)
  2: "#a70000", // Dark red (very bad)
  3: "#e35d5b", // Lighter red (bad)
  4: "#ff9e7a", // Orange (somewhat bad)
  5: "#ffcb77", // Yellow-orange (neutral/low)
  6: "#ffe566", // Yellow (neutral)
  7: "#d3e09f", // Light green (somewhat good)
  8: "#a0e548", // Yellow-green (good)
  9: "#53c66b", // Green (very good)
  10: "#15a362", // Deep green (excellent)
};

// Mood emoji mapping
const moodEmojis = {
  1: "😭", // Terrible
  2: "😢", // Very Bad
  3: "😔", // Bad
  4: "😕", // Somewhat Bad
  5: "😐", // Neutral/Low
  6: "🙂", // Neutral
  7: "😊", // Somewhat Good
  8: "😃", // Good
  9: "😁", // Very Good
  10: "🤩", // Excellent
};

// Mood labels
const moodLabels = {
  1: "Terrible",
  2: "Very Bad",
  3: "Bad",
  4: "Somewhat Bad",
  5: "Neutral/Low",
  6: "Neutral",
  7: "Somewhat Good",
  8: "Good",
  9: "Very Good",
  10: "Excellent",
};

// Icons for mood categories
const categoryIcons = {
  "personal": <Sun className="h-4 w-4" />,
  "work": <Cloud className="h-4 w-4" />,
  "social": <CloudDrizzle className="h-4 w-4" />,
  "health": <CloudLightning className="h-4 w-4" />,
};

export default function MoodTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"calendar" | "add" | "trends">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // For new mood entry
  const [newMood, setNewMood] = useState<number>(7);
  const [newEnergy, setNewEnergy] = useState<number>(7);
  const [newSleep, setNewSleep] = useState<number>(8);
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [newNotes, setNewNotes] = useState<string>("");
  const [newFactors, setNewFactors] = useState<string[]>([]);

  // Fetch mood entries
  const { data: moodEntries = [], refetch } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood/entries"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && activeView !== "add",
  });

  // Get last 30 days for the calendar view
  const lastThirtyDays = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  }).reverse();

  // Find entry for a given date
  const findEntryForDate = (date: Date) => {
    return moodEntries.find(entry => 
      format(new Date(entry.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Handle mood entry submission
  const handleSubmitMood = async () => {
    try {
      const newEntry = {
        date: selectedDate,
        mood: newMood,
        energy: newEnergy,
        sleep: newSleep,
        categories: newCategories,
        notes: newNotes || null,
        factors: newFactors,
      };

      await apiRequest("POST", "/api/mood/entries", newEntry);

      toast({
        title: "Mood recorded",
        description: "Your mood entry has been saved successfully.",
      });

      // Reset form and go back to calendar view
      setNewMood(7);
      setNewEnergy(7);
      setNewSleep(8);
      setNewCategories([]);
      setNewNotes("");
      setNewFactors([]);
      setActiveView("calendar");
      refetch();
    } catch (error) {
      toast({
        title: "Error saving mood",
        description: "There was a problem saving your mood entry.",
        variant: "destructive",
      });
    }
  };

  // Toggle a category in the new entry
  const toggleCategory = (category: string) => {
    setNewCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Toggle a factor in the new entry
  const toggleFactor = (factor: string) => {
    setNewFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor) 
        : [...prev, factor]
    );
  };

  // Generate streak information
  const calculateStreak = () => {
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sortedEntries.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(sortedEntries[0].date);
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      if (format(new Date(sortedEntries[i].date), 'yyyy-MM-dd') === format(prevDate, 'yyyy-MM-dd')) {
        streak++;
        currentDate = new Date(sortedEntries[i].date);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate average mood for a given time period
  const calculateAverageMood = (days: number) => {
    const cutoffDate = subDays(new Date(), days);
    const relevantEntries = moodEntries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );
    
    if (relevantEntries.length === 0) return null;
    
    const sum = relevantEntries.reduce((acc, entry) => acc + entry.mood, 0);
    return (sum / relevantEntries.length).toFixed(1);
  };

  // Get color gradient based on mood value
  const getMoodGradient = (mood: number) => {
    const normalizedMood = Math.max(1, Math.min(10, Math.round(mood)));
    return moodColors[normalizedMood as keyof typeof moodColors];
  };

  // Generate weekly mood trend
  const generateWeeklyTrend = () => {
    const lastSevenDays = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });
    
    return lastSevenDays.map(day => {
      const entry = findEntryForDate(day);
      return {
        date: day,
        mood: entry?.mood || null,
        formattedDate: format(day, 'EEE')
      };
    });
  };

  // Get emoji for a mood value
  const getMoodEmoji = (mood: number) => {
    const normalizedMood = Math.max(1, Math.min(10, Math.round(mood)));
    return moodEmojis[normalizedMood as keyof typeof moodEmojis];
  };

  // Get text label for a mood value
  const getMoodLabel = (mood: number) => {
    const normalizedMood = Math.max(1, Math.min(10, Math.round(mood)));
    return moodLabels[normalizedMood as keyof typeof moodLabels];
  };

  // Weekly trend data
  const weeklyTrend = generateWeeklyTrend();
  
  // Current streak
  const currentStreak = calculateStreak();
  
  // Average moods
  const avgMoodWeek = calculateAverageMood(7);
  const avgMoodMonth = calculateAverageMood(30);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wellness Mood Tracker</CardTitle>
        <CardDescription>Track and visualize your daily mood and energy levels</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "calendar" | "add" | "trends")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="add">Add Entry</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="flex flex-col gap-2">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <h3 className="text-2xl font-bold">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</h3>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Weekly Average</p>
                    <h3 className="text-2xl font-bold flex items-center justify-center">
                      {avgMoodWeek ? (
                        <>
                          {getMoodEmoji(parseFloat(avgMoodWeek))} {avgMoodWeek}
                        </>
                      ) : 'N/A'}
                    </h3>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Monthly Average</p>
                    <h3 className="text-2xl font-bold flex items-center justify-center">
                      {avgMoodMonth ? (
                        <>
                          {getMoodEmoji(parseFloat(avgMoodMonth))} {avgMoodMonth}
                        </>
                      ) : 'N/A'}
                    </h3>
                  </CardContent>
                </Card>
              </div>
              
              {/* Weekly Mood Trend */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium">This Week's Mood</h3>
                <div className="flex justify-between h-24 gap-1">
                  {weeklyTrend.map((day, i) => {
                    const height = day.mood ? `${(day.mood / 10) * 100}%` : '0%';
                    const color = day.mood ? getMoodGradient(day.mood) : '#e5e7eb';
                    
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 text-xs">
                        <div className="w-full h-full relative flex items-end justify-center">
                          <div 
                            className="w-full rounded-t-sm" 
                            style={{ 
                              height,
                              backgroundColor: color,
                              transition: 'height 0.3s ease'
                            }} 
                          />
                        </div>
                        <div className="mt-1 text-muted-foreground">
                          {day.formattedDate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Monthly Calendar */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Last 30 Days</h3>
                <div className="grid grid-cols-7 gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Fill in empty cells for alignment */}
                  {Array.from({ length: lastThirtyDays[0].getDay() }, (_, i) => (
                    <div key={`empty-start-${i}`} className="h-10" />
                  ))}
                  
                  {/* Calendar days */}
                  {lastThirtyDays.map((date, i) => {
                    const entry = findEntryForDate(date);
                    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    
                    return (
                      <div 
                        key={i}
                        className={`aspect-square flex flex-col items-center justify-center rounded-md border cursor-pointer transition-colors ${
                          isToday ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => {
                          setSelectedDate(date);
                          if (entry) {
                            // View details if there's an entry
                            // Future enhancement
                          } else {
                            // Add new entry
                            setActiveView("add");
                          }
                        }}
                      >
                        <div className="text-xs mb-1">{format(date, 'd')}</div>
                        {entry ? (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                            style={{ backgroundColor: getMoodGradient(entry.mood) }}
                          >
                            {getMoodEmoji(entry.mood)}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                            +
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Add Entry View */}
          <TabsContent value="add" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                How are you feeling today?
              </h3>
              <div className="text-sm text-muted-foreground">
                {format(selectedDate, 'MMMM d, yyyy')}
              </div>
            </div>
            
            {/* Mood Selection */}
            <div className="space-y-2">
              <Label htmlFor="mood-slider">Mood Level {getMoodEmoji(newMood)}</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs">Low</span>
                <Slider
                  id="mood-slider"
                  min={1}
                  max={10}
                  step={1}
                  value={[newMood]}
                  onValueChange={(value) => setNewMood(value[0])}
                  className="flex-1"
                />
                <span className="text-xs">High</span>
              </div>
              <div className="text-sm text-center font-medium" style={{ color: getMoodGradient(newMood) }}>
                {getMoodLabel(newMood)}
              </div>
            </div>
            
            {/* Energy Level */}
            <div className="space-y-2">
              <Label htmlFor="energy-slider">Energy Level</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs">Low</span>
                <Slider
                  id="energy-slider"
                  min={1}
                  max={10}
                  step={1}
                  value={[newEnergy]}
                  onValueChange={(value) => setNewEnergy(value[0])}
                  className="flex-1"
                />
                <span className="text-xs">High</span>
              </div>
            </div>
            
            {/* Sleep Duration */}
            <div className="space-y-2">
              <Label htmlFor="sleep-input">Hours of Sleep</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs">0h</span>
                <Slider
                  id="sleep-slider"
                  min={0}
                  max={12}
                  step={0.5}
                  value={[newSleep]}
                  onValueChange={(value) => setNewSleep(value[0])}
                  className="flex-1"
                />
                <span className="text-xs">12h</span>
              </div>
              <div className="text-sm text-center">
                {newSleep} hours
              </div>
            </div>
            
            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {["personal", "work", "social", "health"].map((category) => (
                  <Badge
                    key={category}
                    variant={newCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Contributing Factors */}
            <div className="space-y-2">
              <Label>Contributing Factors</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "work stress", "good sleep", "exercise", "nutrition", 
                  "social connection", "achievement", "relaxation", "health issue"
                ].map((factor) => (
                  <Badge
                    key={factor}
                    variant={newFactors.includes(factor) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleFactor(factor)}
                  >
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder="How are you feeling? What happened today?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveView("calendar")}>
                Cancel
              </Button>
              <Button onClick={handleSubmitMood}>
                Save Entry
              </Button>
            </div>
          </TabsContent>
          
          {/* Trends View */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mood Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((level) => {
                    const count = moodEntries.filter(entry => Math.round(entry.mood) === level).length;
                    const percentage = moodEntries.length > 0 
                      ? Math.round((count / moodEntries.length) * 100) 
                      : 0;
                    
                    return (
                      <div key={level} className="flex items-center mb-1">
                        <div className="w-16 flex items-center">
                          <span className="text-sm mr-2">{level}</span>
                          <span>{getMoodEmoji(level)}</span>
                        </div>
                        <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
                          <div 
                            className="h-full rounded-sm"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getMoodGradient(level)
                            }} 
                          />
                        </div>
                        <div className="w-12 text-right text-xs text-muted-foreground">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              
              {/* Common Factors */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  {moodEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No mood data available</p>
                  ) : (
                    <div className="space-y-2">
                      {/* Count factors and sort by frequency */}
                      {Object.entries(
                        moodEntries.flatMap(entry => entry.factors)
                          .reduce((acc, factor) => {
                            acc[factor] = (acc[factor] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([factor, count]) => (
                          <div key={factor} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{factor}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Correlations */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sleep vs. Mood Correlation</CardTitle>
                </CardHeader>
                <CardContent>
                  {moodEntries.length < 3 ? (
                    <div className="py-8 text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Need more entries to show correlations
                      </p>
                    </div>
                  ) : (
                    <div className="h-40 flex items-end">
                      {/* Simple visualization showing relationship between sleep and mood */}
                      {/* In a real app, this would be a scatter plot */}
                      <div className="flex items-end justify-between w-full gap-1">
                        {moodEntries.slice(-7).map((entry, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div 
                              className="w-8 rounded-t-sm" 
                              style={{ 
                                height: `${(entry.mood / 10) * 100}px`,
                                backgroundColor: getMoodGradient(entry.mood)
                              }}
                            />
                            <div 
                              className="w-8 rounded-t-sm bg-blue-300 opacity-50" 
                              style={{ 
                                height: `${(entry.sleep / 12) * 100}px`
                              }}
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(new Date(entry.date), 'MM/dd')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-300 mr-1" />
                      Sleep
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                      Mood
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}