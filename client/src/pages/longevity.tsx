import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileBarChart, HeartPulse, Brain, Activity, Dna, BarChart2, ChevronDown, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LongevityScoreCard } from "@/components/longevity/longevity-score-card";
import { BiologicalAgeCalculator } from "@/components/longevity/biological-age-calculator";

// Mock data - in a real app would come from API
const longevityData = {
  biologicalAge: 39.2,
  chronologicalAge: 43,
  score: 82,
  trend: 4,
  lastUpdated: "2025-04-15T10:30:00Z",
  insights: [
    {
      id: "heart-health",
      category: "Heart Health",
      icon: HeartPulse,
      status: "Excellent",
      value: 95,
      change: 3,
      description: "Your heart health markers are in the optimal range. Your resting heart rate and blood pressure levels indicate excellent cardiovascular fitness."
    },
    {
      id: "metabolic-health",
      category: "Metabolic Health",
      icon: Activity,
      status: "Good",
      value: 78,
      change: 5,
      description: "Your metabolic health is good. Your fasting glucose levels and insulin sensitivity are within healthy ranges, though there's room for improvement."
    },
    {
      id: "cognitive-health",
      category: "Cognitive Health",
      icon: Brain,
      status: "Very Good",
      value: 85,
      change: 2,
      description: "Your cognitive health markers show strong performance. Regular mental stimulation and quality sleep are contributing positively."
    },
    {
      id: "genetic-factors",
      category: "Genetic Factors",
      icon: Dna,
      status: "Moderate",
      value: 65,
      change: 0,
      description: "Your genetic analysis shows moderate longevity potential. While some genetic factors are favorable, there are areas that require lifestyle optimization."
    }
  ],
  healthMetrics: [
    { date: "2025-03", biologicalAge: 40.1 },
    { date: "2025-02", biologicalAge: 40.5 },
    { date: "2025-01", biologicalAge: 41.2 },
    { date: "2024-12", biologicalAge: 41.8 },
    { date: "2024-11", biologicalAge: 42.3 },
    { date: "2024-10", biologicalAge: 42.6 }
  ],
  recommendations: [
    {
      id: "exercise",
      title: "Increase High-Intensity Interval Training",
      description: "Adding 2 more HIIT sessions per week can further improve your metabolic health and cardiovascular fitness.",
      impact: "high"
    },
    {
      id: "nutrition",
      title: "Increase Omega-3 Fatty Acid Intake",
      description: "Your omega-3 to omega-6 ratio could be improved. Consider adding more fatty fish or a high-quality supplement.",
      impact: "medium"
    },
    {
      id: "sleep",
      title: "Extend Deep Sleep Duration",
      description: "Your sleep monitoring indicates lower than optimal deep sleep. Work on sleep hygiene to improve this vital recovery period.",
      impact: "high"
    }
  ]
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'excellent':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    case 'very good':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    case 'good':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    case 'moderate':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
    case 'fair':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
    case 'poor':
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  }
};

// Impact color mapping
const getImpactColor = (impact: string) => {
  switch (impact.toLowerCase()) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
    case 'low':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  }
};

export default function LongevityPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch longevity data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/longevity'],
    queryFn: async () => {
      // In a real app, this would be an API call
      return new Promise(resolve => {
        setTimeout(() => resolve(longevityData), 800);
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-dark-text dark:text-white mb-2">
            Longevity Tracking
          </h1>
          <p className="text-body-text dark:text-gray-300">
            Monitor your biological age and optimize longevity factors
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-light-blue-bg dark:bg-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Overview
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Health Insights
              </TabsTrigger>
              <TabsTrigger value="calculator" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Age Calculator
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                History
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center text-sm text-body-text dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated: {isLoading ? "Loading..." : formatDate(data?.lastUpdated || new Date().toISOString())}</span>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <LongevityScoreCard
                  biologicalAge={data?.biologicalAge || 0}
                  chronologicalAge={data?.chronologicalAge || 0}
                  score={data?.score || 0}
                  trend={data?.trend || 0}
                  isLoading={isLoading}
                />
              </div>
              <div className="md:col-span-2">
                <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      <span>Key Health Factors</span>
                    </CardTitle>
                    <CardDescription className="text-body-text dark:text-gray-300">
                      Your most important longevity indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {data?.insights.map((insight, index) => (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                                  <insight.icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium text-dark-text dark:text-white">{insight.category}</h3>
                              </div>
                              <Badge className={`${getStatusColor(insight.status)}`}>
                                {insight.status}
                              </Badge>
                            </div>
                            <div className="ml-10">
                              <div className="text-sm text-body-text dark:text-gray-300">
                                {insight.description}
                              </div>
                              <div className="mt-2 flex items-center gap-3">
                                <div className="text-sm font-medium text-dark-text dark:text-white">
                                  Score: {insight.value}/100
                                </div>
                                {insight.change !== 0 && (
                                  <div className={`text-xs font-medium ${insight.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {insight.change > 0 ? `▲ +${insight.change}` : `▼ ${insight.change}`} pts
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
                  <FileBarChart className="h-5 w-5 text-primary" />
                  <span>Top Recommendations</span>
                </CardTitle>
                <CardDescription className="text-body-text dark:text-gray-300">
                  Personalized suggestions to improve your longevity score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
                    <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.recommendations.map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-dark-text dark:text-white">{rec.title}</h3>
                          <Badge className={`${getImpactColor(rec.impact)} ml-2`}>
                            {rec.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-body-text dark:text-gray-300 mb-3">
                          {rec.description}
                        </p>
                        <Button variant="outline" size="sm" className="w-full text-primary border-primary/30 hover:bg-primary/5">
                          Learn More
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6 mt-6">
            <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-dark-text dark:text-white">Detailed Health Insights</CardTitle>
                <CardDescription className="text-body-text dark:text-gray-300">
                  Comprehensive analysis of your longevity factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="text-body-text dark:text-gray-300 mb-2">This section is under development</div>
                      <Button>Run Full Analysis</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6 mt-6">
            <BiologicalAgeCalculator />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6 mt-6">
            <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-dark-text dark:text-white">Biological Age History</CardTitle>
                <CardDescription className="text-body-text dark:text-gray-300">
                  Track changes in your biological age over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full mr-4">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-sm text-body-text dark:text-gray-300">
                        <p className="mb-1 font-medium text-dark-text dark:text-white">Your biological age has improved!</p>
                        <p>
                          Your biological age has decreased by {(data?.healthMetrics[0].biologicalAge - data?.healthMetrics[data?.healthMetrics.length - 1].biologicalAge).toFixed(1)} years 
                          over the past {data?.healthMetrics.length} months. Continue your current health practices to maintain this positive trend.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-dark-text dark:text-white mb-3">Recent Measurements</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                              <th className="pb-2 font-medium text-body-text dark:text-gray-300">Date</th>
                              <th className="pb-2 font-medium text-body-text dark:text-gray-300">Biological Age</th>
                              <th className="pb-2 font-medium text-body-text dark:text-gray-300">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data?.healthMetrics.map((metric, index) => {
                              const prevMetric = index < data.healthMetrics.length - 1 ? data.healthMetrics[index + 1] : null;
                              const change = prevMetric ? (metric.biologicalAge - prevMetric.biologicalAge).toFixed(1) : null;
                              
                              return (
                                <tr key={metric.date} className="border-b border-gray-100 dark:border-gray-800">
                                  <td className="py-3 text-dark-text dark:text-white">{metric.date}</td>
                                  <td className="py-3 text-dark-text dark:text-white">{metric.biologicalAge}</td>
                                  <td className="py-3">
                                    {change && (
                                      <span className={`${parseFloat(change) < 0 ? 'text-green-600 dark:text-green-400' : parseFloat(change) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {parseFloat(change) < 0 ? '▼ ' : parseFloat(change) > 0 ? '▲ ' : ''}
                                        {change}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}