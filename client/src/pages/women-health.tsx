import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Baby, UserCog, Activity, CircleHelp, Info, Settings2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CycleTracker } from "@/components/women-health/cycle-tracker";
import { CycleCalendar } from "@/components/women-health/cycle-calendar";
import { SymptomLogger } from "@/components/women-health/symptom-logger";
import { Switch } from "@/components/ui/switch";

export default function WomenHealthPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // State for user preferences
  const [showMenstrualTracking, setShowMenstrualTracking] = useState(false);
  const [trackFertility, setTrackFertility] = useState(false);
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [preferredGender, setPreferredGender] = useState(user?.gender || "male");
  
  // Load user preferences when component mounts
  useEffect(() => {
    if (user) {
      try {
        const preferences = user.preferences ? JSON.parse(user.preferences) : {};
        setShowMenstrualTracking(preferences.showMenstrualTracking || false);
        setTrackFertility(preferences.trackFertility || false);
        setCycleLength(preferences.cycleLength || "28");
        setPeriodLength(preferences.periodLength || "5");
        setPreferredGender(user.gender || "male");
      } catch (error) {
        console.error("Error parsing user preferences:", error);
      }
    }
  }, [user]);

  const queryClient = useQueryClient();
  
  // Mutation to update user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: any) => {
      return apiRequest("POST", "/api/user/preferences", preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    },
  });
  
  const handleSavePreferences = () => {
    const preferences = {
      showMenstrualTracking,
      trackFertility,
      cycleLength,
      periodLength
    };
    
    // Save preferences to user profile
    updatePreferencesMutation.mutate({ 
      preferences: JSON.stringify(preferences),
      gender: preferredGender
    });
  };

  // Check if the user is eligible to see women's health features (female gender)
  const shouldShowWomensHealth = () => {
    return preferredGender === "female" && showMenstrualTracking;
  };
  
  // If user is not yet set, show loading state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-dark-text dark:text-white mb-2">
            Women's Health
          </h1>
          <p className="text-body-text dark:text-gray-300">
            Track your cycle, symptoms, and reproductive health
          </p>
        </div>
        
        {!shouldShowWomensHealth() && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-primary" />
                Menstrual & Fertility Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Available for women's health profiles</AlertTitle>
                <AlertDescription>
                  This feature is designed for tracking menstrual cycles and fertility windows.
                  Update your profile preferences below to enable these features.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gender">Gender Selection</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      type="button" 
                      variant={preferredGender === "male" ? "default" : "outline"}
                      onClick={() => setPreferredGender("male")}
                    >
                      Male
                    </Button>
                    <Button 
                      type="button"
                      variant={preferredGender === "female" ? "default" : "outline"}
                      onClick={() => setPreferredGender("female")}
                    >
                      Female
                    </Button>
                  </div>
                </div>
                
                {preferredGender === "female" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="menstrual-tracking">Enable Menstrual Cycle Tracking</Label>
                        <p className="text-sm text-muted-foreground">
                          Track your period, symptoms, and fertility windows
                        </p>
                      </div>
                      <Switch
                        id="menstrual-tracking"
                        checked={showMenstrualTracking}
                        onCheckedChange={setShowMenstrualTracking}
                      />
                    </div>
                    
                    {showMenstrualTracking && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="fertility-tracking">Track Fertility Windows</Label>
                            <p className="text-sm text-muted-foreground">
                              Calculate and display fertile days and ovulation predictions
                            </p>
                          </div>
                          <Switch
                            id="fertility-tracking"
                            checked={trackFertility}
                            onCheckedChange={setTrackFertility}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cycle-length">Average Cycle Length (days)</Label>
                            <Input
                              id="cycle-length"
                              type="number"
                              value={cycleLength}
                              onChange={(e) => setCycleLength(e.target.value)}
                              min="20"
                              max="45"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="period-length">Average Period Length (days)</Label>
                            <Input
                              id="period-length"
                              type="number"
                              value={periodLength}
                              onChange={(e) => setPeriodLength(e.target.value)}
                              min="1"
                              max="10"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={handleSavePreferences} 
                  className="w-full"
                  disabled={updatePreferencesMutation.isPending}
                >
                  {updatePreferencesMutation.isPending ? 
                    "Saving..." : 
                    "Save Preferences"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {shouldShowWomensHealth() && (
          <>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="logger">Log Symptoms</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview">
                <CycleTracker />
              </TabsContent>
              
              <TabsContent value="calendar">
                <CycleCalendar showControls={true} />
              </TabsContent>
              
              <TabsContent value="logger">
                <SymptomLogger />
              </TabsContent>
              
              <TabsContent value="insights">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Cycle Insights
                    </CardTitle>
                    <CardDescription>
                      Trends and patterns from your cycle data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Insights will appear here</AlertTitle>
                      <AlertDescription>
                        After tracking for at least 3 cycles, you'll receive personalized insights about your patterns and health.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <Calendar className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-xl font-medium mb-2">Track More Cycles</h3>
                      <p className="text-muted-foreground max-w-md">
                        Continue logging your cycles and symptoms to unlock personalized insights and predictions about your reproductive health.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-primary" />
                      Women's Health Settings
                    </CardTitle>
                    <CardDescription>
                      Customize your tracking preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="menstrual-tracking">Enable Menstrual Cycle Tracking</Label>
                          <p className="text-sm text-muted-foreground">
                            Track your period, symptoms, and fertility windows
                          </p>
                        </div>
                        <Switch
                          id="menstrual-tracking"
                          checked={showMenstrualTracking}
                          onCheckedChange={setShowMenstrualTracking}
                        />
                      </div>
                      
                      {showMenstrualTracking && (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="fertility-tracking">Track Fertility Windows</Label>
                              <p className="text-sm text-muted-foreground">
                                Calculate and display fertile days and ovulation predictions
                              </p>
                            </div>
                            <Switch
                              id="fertility-tracking"
                              checked={trackFertility}
                              onCheckedChange={setTrackFertility}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cycle-length">Average Cycle Length (days)</Label>
                              <Input
                                id="cycle-length"
                                type="number"
                                value={cycleLength}
                                onChange={(e) => setCycleLength(e.target.value)}
                                min="20"
                                max="45"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="period-length">Average Period Length (days)</Label>
                              <Input
                                id="period-length"
                                type="number"
                                value={periodLength}
                                onChange={(e) => setPeriodLength(e.target.value)}
                                min="1"
                                max="10"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="preferred-gender">Gender in Health Profile</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Button 
                                type="button" 
                                variant={preferredGender === "male" ? "default" : "outline"}
                                onClick={() => setPreferredGender("male")}
                              >
                                Male
                              </Button>
                              <Button 
                                type="button"
                                variant={preferredGender === "female" ? "default" : "outline"}
                                onClick={() => setPreferredGender("female")}
                              >
                                Female
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <Button 
                        onClick={handleSavePreferences} 
                        className="w-full mt-6"
                        disabled={updatePreferencesMutation.isPending}
                      >
                        {updatePreferencesMutation.isPending ? 
                          "Saving..." : 
                          "Save Preferences"
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleHelp className="h-5 w-5 text-primary" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto flex flex-col items-start p-4 hover:bg-muted justify-start text-left">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-base font-medium">Understanding Your Cycle</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Learn about the phases of your menstrual cycle and hormonal changes
                      </p>
                    </Button>
                    
                    <Button variant="outline" className="h-auto flex flex-col items-start p-4 hover:bg-muted justify-start text-left">
                      <div className="flex items-center mb-2">
                        <Baby className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-base font-medium">Fertility Awareness</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Understand ovulation, fertile windows, and natural family planning
                      </p>
                    </Button>
                    
                    <Button variant="outline" className="h-auto flex flex-col items-start p-4 hover:bg-muted justify-start text-left">
                      <div className="flex items-center mb-2">
                        <UserCog className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-base font-medium">Reproductive Health</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Resources on PCOS, endometriosis, and other common conditions
                      </p>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}