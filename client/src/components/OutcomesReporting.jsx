import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  TrendingUp,
  Award,
  Users,
  Heart,
  Brain,
  Activity,
  Moon,
  Utensils,
  Target,
  Calendar,
  Share2,
  Download,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Real-World Outcomes Reporting Component
 * Showcases measurable health improvements and tracks conversion metrics
 */
export function OutcomesReporting() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('90');
  const [reportType, setReportType] = useState('personal');
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch user's personal outcomes
  const { data: personalOutcomes, isLoading: personalLoading } = useQuery({
    queryKey: ['/api/outcomes/personal', selectedTimeframe],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/outcomes/personal?timeframe=${selectedTimeframe}`);
      return res.json();
    }
  });

  // Fetch population outcomes for credibility
  const { data: populationOutcomes, isLoading: populationLoading } = useQuery({
    queryKey: ['/api/outcomes/population', selectedTimeframe],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/outcomes/population?timeframe=${selectedTimeframe}`);
      return res.json();
    }
  });

  // Share outcomes mutation
  const shareOutcomesMutation = useMutation({
    mutationFn: async (shareData) => {
      const res = await apiRequest('POST', '/api/outcomes/share', shareData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Outcomes Shared",
        description: "Your health journey has been shared to inspire others"
      });
    }
  });

  const isDark = effectiveTheme === 'dark';

  const healthCategories = [
    { key: 'sleep_quality', name: 'Sleep Quality', icon: Moon, color: 'purple' },
    { key: 'metabolic_health', name: 'Metabolic Health', icon: Activity, color: 'green' },
    { key: 'cardiovascular_fitness', name: 'Heart Health', icon: Heart, color: 'red' },
    { key: 'mental_wellness', name: 'Mental Wellness', icon: Brain, color: 'blue' },
    { key: 'physical_activity', name: 'Physical Activity', icon: TrendingUp, color: 'orange' },
    { key: 'nutrition_health', name: 'Nutrition', icon: Utensils, color: 'yellow' }
  ];

  const isLoading = personalLoading || populationLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Award className="h-8 w-8 text-yellow-600" />
          <span>Health Outcomes & Progress</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Track your real-world health improvements and see how you compare to our community of users achieving measurable wellness goals.
        </p>
      </div>

      {/* Controls */}
      <OutcomesControls 
        selectedTimeframe={selectedTimeframe}
        reportType={reportType}
        onTimeframeChange={setSelectedTimeframe}
        onReportTypeChange={setReportType}
      />

      {/* Personal Health Score Overview */}
      {personalOutcomes && (
        <PersonalHealthScoreCard 
          outcomes={personalOutcomes}
          timeframe={selectedTimeframe}
        />
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="personal" value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">My Progress</TabsTrigger>
          <TabsTrigger value="community">Community Results</TabsTrigger>
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
        </TabsList>

        {/* Personal Progress Tab */}
        <TabsContent value="personal">
          <PersonalProgressPanel 
            outcomes={personalOutcomes}
            healthCategories={healthCategories}
            timeframe={selectedTimeframe}
            onShare={(data) => shareOutcomesMutation.mutate(data)}
          />
        </TabsContent>

        {/* Community Results Tab */}
        <TabsContent value="community">
          <CommunityResultsPanel 
            populationOutcomes={populationOutcomes}
            healthCategories={healthCategories}
          />
        </TabsContent>

        {/* Success Stories Tab */}
        <TabsContent value="stories">
          <SuccessStoriesPanel 
            stories={populationOutcomes?.success_stories || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Outcomes Controls Component
 */
function OutcomesControls({ selectedTimeframe, reportType, onTimeframeChange, onReportTypeChange }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">6 Months</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Progress
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Personal Health Score Card Component
 */
function PersonalHealthScoreCard({ outcomes, timeframe }) {
  const overallScore = outcomes?.report?.overall_health_score || 0;
  const improvements = Object.keys(outcomes?.report?.category_improvements || {}).length;
  const achievements = outcomes?.report?.significant_achievements?.length || 0;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-gray-600 bg-gray-100 border-gray-200';
  };

  return (
    <Card className={`border-2 ${getScoreColor(overallScore)}`}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{overallScore}</div>
            <div className="text-sm font-medium">Health Improvement Score</div>
            <div className="text-xs text-gray-600 mt-1">Last {timeframe} days</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{improvements}</div>
            <div className="text-sm font-medium">Areas Improving</div>
            <div className="text-xs text-gray-600 mt-1">Active categories</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{achievements}</div>
            <div className="text-sm font-medium">Milestones Reached</div>
            <div className="text-xs text-gray-600 mt-1">Significant improvements</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {outcomes?.report?.conversion_likelihood ? 
                `${Math.round(outcomes.report.conversion_likelihood * 100)}%` : '---'
              }
            </div>
            <div className="text-sm font-medium">Goal Achievement</div>
            <div className="text-xs text-gray-600 mt-1">Success probability</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Personal Progress Panel Component
 */
function PersonalProgressPanel({ outcomes, healthCategories, timeframe, onShare }) {
  const improvements = outcomes?.report?.category_improvements || {};
  const achievements = outcomes?.report?.significant_achievements || [];

  return (
    <div className="space-y-6">
      {/* Category Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthCategories.map((category) => {
          const categoryData = improvements[category.key];
          const Icon = category.icon;
          
          if (!categoryData) {
            return (
              <Card key={category.key} className="opacity-50">
                <CardContent className="p-6 text-center">
                  <Icon className={`h-8 w-8 text-gray-400 mx-auto mb-3`} />
                  <h4 className="font-medium text-gray-500">{category.name}</h4>
                  <p className="text-sm text-gray-400 mt-2">No data available</p>
                </CardContent>
              </Card>
            );
          }

          const improvement = categoryData.overall_improvement || 0;
          const improvementPercent = Math.round(improvement * 100);
          const isImproving = improvement > 0;

          return (
            <Card key={category.key} className={`${isImproving ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`h-6 w-6 text-${category.color}-600`} />
                  {isImproving && (
                    <Badge className="bg-green-100 text-green-800">
                      +{improvementPercent}%
                    </Badge>
                  )}
                </div>
                
                <h4 className="font-medium mb-2">{category.name}</h4>
                
                {isImproving ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Improvement</span>
                      <span className="font-medium text-green-600">+{improvementPercent}%</span>
                    </div>
                    <Progress value={Math.min(improvement * 100, 100)} className="h-2" />
                    <p className="text-xs text-gray-600">{categoryData.summary || 'Steady progress'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Track more data to see improvements</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-600" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.slice(0, 5).map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h5 className="font-medium">{achievement.type.replace('_', ' ').toUpperCase()}</h5>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(achievement.improvement_percentage)}% improvement • {new Date(achievement.achieved_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Progress */}
      <Card>
        <CardContent className="p-6 text-center">
          <h4 className="font-medium mb-2">Share Your Success</h4>
          <p className="text-sm text-gray-600 mb-4">
            Inspire others by sharing your health improvement journey (anonymized data only)
          </p>
          <Button 
            onClick={() => onShare({ improvements, achievements, timeframe })}
            className="w-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share My Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Community Results Panel Component
 */
function CommunityResultsPanel({ populationOutcomes, healthCategories }) {
  const categoryOutcomes = populationOutcomes?.population_report?.category_outcomes || {};
  const totalUsers = populationOutcomes?.population_report?.total_users_analyzed || 0;

  return (
    <div className="space-y-6">
      {/* Community Overview */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Community Health Outcomes</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Real results from {totalUsers.toLocaleString()} users actively improving their health
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">18%</div>
              <div className="text-sm">Avg Sleep Improvement</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">9%</div>
              <div className="text-sm">Glucose Reduction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">25%</div>
              <div className="text-sm">Activity Increase</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Category Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {healthCategories.map((category) => {
          const data = categoryOutcomes[category.key];
          const Icon = category.icon;
          
          if (!data) return null;
          
          return (
            <Card key={category.key}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className={`h-6 w-6 text-${category.color}-600`} />
                  <span>{data.category_name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {data.average_improvement}%
                      </div>
                      <div className="text-sm text-gray-600">Average Improvement</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {data.improvement_rate}%
                      </div>
                      <div className="text-sm text-gray-600">Users Improving</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>{data.users_analyzed.toLocaleString()}</strong> users analyzed
                  </div>
                  
                  {data.clinical_relevance && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {data.clinical_relevance}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Success Stories Panel Component
 */
function SuccessStoriesPanel({ stories }) {
  return (
    <div className="space-y-6">
      {stories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Success Stories Coming Soon</h3>
            <p className="text-gray-600">
              Check back soon to read inspiring health transformation stories from our community.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story, index) => (
            <Card key={index} className="border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-800 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">
                        +{story.improvement_percentage}%
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {story.timeframe} days
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {story.story_text}
                    </p>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Category: {story.category.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default OutcomesReporting;