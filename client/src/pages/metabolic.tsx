import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Activity, 
  FileBarChart, 
  AlertTriangle, 
  Clock, 
  Utensils, 
  BarChart2,
  Brain,
  Droplets,
  Heart
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Link } from "wouter";
import { GlucoseChart } from "@/components/metabolic/glucose-chart";

export default function MetabolicHealthPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-dark-text dark:text-white mb-2">
            Metabolic Health
          </h1>
          <p className="text-body-text dark:text-gray-300">
            Monitor your metabolic biomarkers and optimize your health
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-light-blue-bg dark:bg-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Overview
              </TabsTrigger>
              <TabsTrigger value="glucose" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Glucose
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Trends
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Insights
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center text-sm text-body-text dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated: {format(new Date(), "MMM d, yyyy h:mm a")}</span>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 md:col-span-3 bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-dark-text dark:text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span>Metabolic Health Score</span>
                  </CardTitle>
                  <CardDescription className="text-body-text dark:text-gray-300">
                    Your overall metabolic health based on key biomarkers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <div className="md:col-span-2 flex flex-col items-center justify-center py-4">
                      <div className="relative w-48 h-48">
                        <svg className="w-full h-full" viewBox="0 0 120 120">
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="54" 
                            fill="none" 
                            stroke="#e2e8f0" 
                            strokeWidth="12" 
                            className="dark:stroke-gray-700"
                          />
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="54" 
                            fill="none" 
                            stroke="#4A90E2" 
                            strokeWidth="12" 
                            strokeDasharray="339.292" 
                            strokeDashoffset="84.823" 
                            className="transform -rotate-90 origin-center"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold text-dark-text dark:text-white">75</span>
                          <span className="text-sm text-body-text dark:text-gray-300">Good</span>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-body-text dark:text-gray-300">
                          Your metabolic health is better than 68% of people your age
                        </p>
                      </div>
                    </div>
                    
                    <div className="md:col-span-4 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Droplets className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-medium text-dark-text dark:text-white">Glucose</h3>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-xl font-bold text-dark-text dark:text-white">104</div>
                            <div className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              Normal
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-medium text-dark-text dark:text-white">Triglycerides</h3>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-xl font-bold text-dark-text dark:text-white">110</div>
                            <div className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              Optimal
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-medium text-dark-text dark:text-white">Insulin</h3>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-xl font-bold text-dark-text dark:text-white">8.2</div>
                            <div className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              Normal
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
                        <h3 className="font-medium text-dark-text dark:text-white mb-1">Recommendations</h3>
                        <ul className="text-sm text-body-text dark:text-gray-300 space-y-2 mt-2">
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            </div>
                            <span>Consider time-restricted eating to improve insulin sensitivity</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            </div>
                            <span>Add more fiber to your diet to stabilize blood glucose</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            </div>
                            <span>Track post-meal glucose response to identify trigger foods</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="col-span-1 md:col-span-2">
                <GlucoseChart />
              </div>
              
              <div className="col-span-1 space-y-6">
                <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
                      <Utensils className="h-5 w-5 text-primary" />
                      <span>Nutrition Impact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-dark-text dark:text-white mb-2">Foods with positive impact</h3>
                        <div className="space-y-2">
                          {[
                            { food: "Greek Yogurt", impact: "Stabilized glucose +12%" },
                            { food: "Avocado", impact: "Reduced insulin response +8%" },
                            { food: "Leafy Greens", impact: "Improved metabolic rate +5%" }
                          ].map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                              <span className="text-dark-text dark:text-white">{item.food}</span>
                              <span className="text-green-600 dark:text-green-400">{item.impact}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-dark-text dark:text-white mb-2">Foods with negative impact</h3>
                        <div className="space-y-2">
                          {[
                            { food: "White Bread", impact: "Glucose spike +45%" },
                            { food: "Sugary Drinks", impact: "Insulin surge +38%" }
                          ].map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                              <span className="text-dark-text dark:text-white">{item.food}</span>
                              <span className="text-red-600 dark:text-red-400">{item.impact}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full text-primary border-primary/30 hover:bg-primary/5">
                        <Link href="/nutrition">Connect to Nutrition Tracker</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <span>Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <div className="bg-green-100 dark:bg-green-900/30 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-dark-text dark:text-white font-medium mb-1">No Current Alerts</h3>
                      <p className="text-body-text dark:text-gray-300 text-sm">
                        Your metabolic markers are within healthy ranges
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Glucose Tab */}
          <TabsContent value="glucose" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <GlucoseChart />
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      <span>Glucose Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-sm text-body-text dark:text-gray-300">Average</span>
                        <span className="text-sm font-medium text-dark-text dark:text-white">104 mg/dL</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-sm text-body-text dark:text-gray-300">Standard Deviation</span>
                        <span className="text-sm font-medium text-dark-text dark:text-white">±12 mg/dL</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-sm text-body-text dark:text-gray-300">Time in Range</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">85%</span>
                      </div>
                      <Button variant="outline" className="w-full">Connect CGM</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Log Entry</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Add Manual Reading</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-dark-text dark:text-white">Long-term Trends</CardTitle>
                <CardDescription className="text-body-text dark:text-gray-300">
                  View your metabolic trends over time
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <p className="text-body-text dark:text-gray-300 mb-4">Trend visualization will appear here</p>
                <Button>Generate Report</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-dark-text dark:text-white">Metabolic Insights</CardTitle>
                <CardDescription className="text-body-text dark:text-gray-300">
                  Personalized insights based on your metabolic data
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <p className="text-body-text dark:text-gray-300 mb-4">
                  Insights will be generated as more data is collected
                </p>
                <Button>Connect More Data Sources</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}