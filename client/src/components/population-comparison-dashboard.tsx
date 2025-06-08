import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users,
  TrendingUp,
  Award,
  BarChart3,
  Target,
  Globe,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Equal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserComparison {
  metricType: string;
  userValue: number;
  unit: string;
  comparison: {
    percentileRank: number;
    interpretation: string;
    category: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
    populationMean: number;
    userVsMean: {
      difference: number;
      percentDifference: number;
      direction: 'above' | 'below' | 'equal';
    };
  };
  context: {
    demographicGroup: string;
    sampleDescription: string;
    dataSource: string;
    lastUpdated: string;
  };
  insights: {
    ranking: string;
    healthSignificance: string;
    recommendations: string[];
    riskFactors?: string[];
  };
}

interface PopulationComparisonReport {
  userId: number;
  userProfile: {
    age: number;
    gender: 'male' | 'female' | 'other';
    country: string;
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  };
  generatedAt: string;
  comparisons: UserComparison[];
  overallSummary: {
    strongAreas: string[];
    improvementAreas: string[];
    percentileRanking: 'top_10' | 'top_25' | 'above_average' | 'average' | 'below_average';
    demographicContext: string;
  };
  benchmarkInsights: {
    nationalComparisons: string[];
    ageGroupInsights: string[];
    genderSpecificNotes: string[];
    activityLevelComparisons: string[];
  };
  actionableRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    lifestyle: string[];
  };
}

export default function PopulationComparisonDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Fetch population comparison report
  const { data: comparisonReport, isLoading } = useQuery<PopulationComparisonReport>({
    queryKey: ['/api/population-comparison'],
    refetchInterval: 24 * 60 * 60 * 1000, // Refresh daily
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'above_average': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'average': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'below_average': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getPercentileIcon = (percentile: number) => {
    if (percentile >= 90) return '🏆';
    if (percentile >= 75) return '🥈';
    if (percentile >= 50) return '📊';
    if (percentile >= 25) return '📈';
    return '📉';
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'above': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'below': return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'equal': return <Equal className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const formatMetricName = (metricType: string) => {
    return metricType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Sample data for demonstration
  const sampleReport: PopulationComparisonReport = {
    userId: 1,
    userProfile: {
      age: 32,
      gender: 'male',
      country: 'US',
      activityLevel: 'moderately_active'
    },
    generatedAt: new Date().toISOString(),
    comparisons: [
      {
        metricType: 'heart_rate',
        userValue: 68,
        unit: 'bpm',
        comparison: {
          percentileRank: 78,
          interpretation: 'Above average for 25-34 year-old males',
          category: 'above_average',
          populationMean: 72,
          userVsMean: {
            difference: -4,
            percentDifference: -5.6,
            direction: 'below'
          }
        },
        context: {
          demographicGroup: '25-34 year-old males',
          sampleDescription: 'Based on 15,420 participants',
          dataSource: 'American Heart Association 2023',
          lastUpdated: '2023'
        },
        insights: {
          ranking: 'Above average - you rank in the top 25% of 25-34 year-old males',
          healthSignificance: 'Your heart rate shows good cardiovascular health',
          recommendations: [
            'Continue regular cardio exercise',
            'Focus on consistency',
            'Consider interval training'
          ]
        }
      },
      {
        metricType: 'steps',
        userValue: 9200,
        unit: 'steps/day',
        comparison: {
          percentileRank: 85,
          interpretation: 'Excellent - top 15% of 25-34 year-old males',
          category: 'above_average',
          populationMean: 7200,
          userVsMean: {
            difference: 2000,
            percentDifference: 27.8,
            direction: 'above'
          }
        },
        context: {
          demographicGroup: '25-34 year-old males',
          sampleDescription: 'Based on 8,750 participants',
          dataSource: 'CDC National Health Survey 2023',
          lastUpdated: '2023'
        },
        insights: {
          ranking: 'Excellent performance - you rank in the top 15% of 25-34 year-old males',
          healthSignificance: 'You meet and exceed daily activity guidelines',
          recommendations: [
            'Maintain your active lifestyle',
            'Consider fitness challenges',
            'Add strength training'
          ]
        }
      },
      {
        metricType: 'sleep',
        userValue: 6.8,
        unit: 'hours',
        comparison: {
          percentileRank: 42,
          interpretation: 'Below average for 25-34 year-old males',
          category: 'below_average',
          populationMean: 7.2,
          userVsMean: {
            difference: -0.4,
            percentDifference: -5.6,
            direction: 'below'
          }
        },
        context: {
          demographicGroup: '25-34 year-old males',
          sampleDescription: 'Based on 12,300 participants',
          dataSource: 'National Sleep Foundation 2023',
          lastUpdated: '2023'
        },
        insights: {
          ranking: 'Below average - opportunity for improvement compared to 25-34 year-old males',
          healthSignificance: 'Additional sleep could improve your health and wellbeing',
          recommendations: [
            'Prioritize 7+ hours sleep',
            'Create bedtime routine',
            'Improve sleep hygiene'
          ],
          riskFactors: [
            'Immune system weakness',
            'Cognitive performance decline',
            'Weight management issues'
          ]
        }
      },
      {
        metricType: 'weight',
        userValue: 82,
        unit: 'kg',
        comparison: {
          percentileRank: 55,
          interpretation: 'Average for 25-34 year-old males',
          category: 'average',
          populationMean: 88.7,
          userVsMean: {
            difference: -6.7,
            percentDifference: -7.6,
            direction: 'below'
          }
        },
        context: {
          demographicGroup: '25-34 year-old males',
          sampleDescription: 'Based on 4,200 participants',
          dataSource: 'WHO Global Health Observatory 2023',
          lastUpdated: '2023'
        },
        insights: {
          ranking: 'Average performance for 25-34 year-old males',
          healthSignificance: 'Your weight is within normal range for your demographic',
          recommendations: [
            'Maintain current weight management strategies',
            'Focus on body composition over weight',
            'Continue balanced nutrition'
          ]
        }
      }
    ],
    overallSummary: {
      strongAreas: ['steps', 'heart_rate'],
      improvementAreas: ['sleep'],
      percentileRanking: 'above_average',
      demographicContext: 'Compared to 25-34 year-old males with moderately_active activity level'
    },
    benchmarkInsights: {
      nationalComparisons: [
        'Your metrics are compared against latest national health survey data',
        'Benchmarks include CDC, WHO, and major research institutions',
        'Data represents diverse population samples from 2023 studies'
      ],
      ageGroupInsights: [
        'Your age group typically shows highest performance in cardiovascular health',
        '25-34 year-olds often focus on maintaining peak performance',
        'Age-related changes in metabolism and recovery are considered in comparisons'
      ],
      genderSpecificNotes: [
        'Men in your age group typically excel in certain health metrics',
        'Gender-specific health considerations are factored into recommendations',
        'Hormonal and physiological differences are accounted for in comparisons'
      ],
      activityLevelComparisons: [
        'As a moderately_active individual, your metrics reflect your lifestyle',
        'Activity level significantly influences expected health parameters',
        'Your peer group shows similar patterns in key health indicators'
      ]
    },
    actionableRecommendations: {
      immediate: [
        'Continue current health practices that are working well',
        'Fine-tune areas showing room for improvement'
      ],
      shortTerm: [
        'Set specific targets to reach 50th percentile in improvement areas',
        'Track progress weekly against population benchmarks',
        'Adjust lifestyle factors that most impact lagging metrics'
      ],
      longTerm: [
        'Aim to reach top 25% in your key health priorities',
        'Maintain excellence in current strong areas',
        'Build sustainable habits that improve with age'
      ],
      lifestyle: [
        'Align daily routines with evidence-based health practices',
        'Consider your demographic trends when setting realistic goals',
        'Use population data to validate the effectiveness of interventions'
      ]
    }
  };

  const displayData = comparisonReport || sampleReport;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <span>Population Comparison</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            See how your health metrics compare to national averages and similar demographics
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Your Demographic</div>
          <div className="font-medium">
            {displayData.userProfile.age}-year-old {displayData.userProfile.gender} • {displayData.userProfile.activityLevel.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-blue-600" />
            <span>Overall Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {displayData.overallSummary.percentileRanking.replace('_', ' ').toUpperCase()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {displayData.overallSummary.demographicContext}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-green-600">Strong Areas</h4>
              <div className="space-y-1">
                {displayData.overallSummary.strongAreas.map((area, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900/30 mr-2">
                    {formatMetricName(area)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-orange-600">Improvement Areas</h4>
              <div className="space-y-1">
                {displayData.overallSummary.improvementAreas.map((area, index) => (
                  <Badge key={index} className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 mr-2">
                    {formatMetricName(area)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparisons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparisons">Metric Comparisons</TabsTrigger>
          <TabsTrigger value="insights">Benchmark Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="context">Data Context</TabsTrigger>
        </TabsList>

        <TabsContent value="comparisons" className="space-y-6">
          {/* Metric Comparisons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayData.comparisons.map((comparison, index) => (
              <motion.div
                key={comparison.metricType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 hover:shadow-lg transition-shadow cursor-pointer ${getCategoryColor(comparison.comparison.category)}`} onClick={() => setSelectedMetric(comparison.metricType)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{formatMetricName(comparison.metricType)}</span>
                          <span className="text-2xl">{getPercentileIcon(comparison.comparison.percentileRank)}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getCategoryColor(comparison.comparison.category)}>
                            {comparison.comparison.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {comparison.comparison.percentileRank}th percentile
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {comparison.userValue} {comparison.unit}
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          {getDirectionIcon(comparison.comparison.userVsMean.direction)}
                          <span className={
                            comparison.comparison.userVsMean.direction === 'above' ? 'text-green-600' :
                            comparison.comparison.userVsMean.direction === 'below' ? 'text-red-600' :
                            'text-gray-600'
                          }>
                            {Math.abs(comparison.comparison.userVsMean.percentDifference).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Percentile Visualization */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Population Percentile</span>
                        <span>{comparison.comparison.percentileRank}th</span>
                      </div>
                      <Progress value={comparison.comparison.percentileRank} className="h-3" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0th</span>
                        <span>50th</span>
                        <span>100th</span>
                      </div>
                    </div>

                    {/* Interpretation */}
                    <div>
                      <p className="text-sm font-medium mb-1">Interpretation:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comparison.comparison.interpretation}
                      </p>
                    </div>

                    {/* Population Comparison */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Population Average</p>
                          <p className="font-medium">{comparison.comparison.populationMean} {comparison.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Your Value</p>
                          <p className="font-medium">{comparison.userValue} {comparison.unit}</p>
                        </div>
                      </div>
                    </div>

                    {/* Health Significance */}
                    <div>
                      <p className="text-sm font-medium mb-1">Health Significance:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comparison.insights.healthSignificance}
                      </p>
                    </div>

                    {/* Risk Factors (if any) */}
                    {comparison.insights.riskFactors && comparison.insights.riskFactors.length > 0 && (
                      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 dark:text-orange-200">
                          <strong>Potential risks:</strong> {comparison.insights.riskFactors.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Data Source */}
                    <div className="text-xs text-gray-500">
                      Source: {comparison.context.dataSource} • {comparison.context.sampleDescription}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Benchmark Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span>National Comparisons</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.benchmarkInsights.nationalComparisons.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Age Group Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.benchmarkInsights.ageGroupInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>Gender-Specific Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.benchmarkInsights.genderSpecificNotes.map((note, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>Activity Level Comparisons</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.benchmarkInsights.activityLevelComparisons.map((comparison, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{comparison}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Immediate Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {displayData.actionableRecommendations.immediate.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Short-Term Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {displayData.actionableRecommendations.shortTerm.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Long-Term Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {displayData.actionableRecommendations.longTerm.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Lifestyle Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {displayData.actionableRecommendations.lifestyle.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="context" className="space-y-6">
          {/* Data Context and Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span>Data Sources & Methodology</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Authoritative Sources</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span><strong>CDC National Health Survey:</strong> Comprehensive U.S. population health data</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span><strong>WHO Global Health Observatory:</strong> International health statistics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span><strong>American Heart Association:</strong> Cardiovascular health benchmarks</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span><strong>National Sleep Foundation:</strong> Sleep research and norms</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Demographic Matching</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <p><strong>Your Profile:</strong></p>
                      <p>Age: {displayData.userProfile.age} years</p>
                      <p>Gender: {displayData.userProfile.gender}</p>
                      <p>Activity: {displayData.userProfile.activityLevel.replace('_', ' ')}</p>
                      <p>Country: {displayData.userProfile.country}</p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Comparisons are made against the most similar demographic groups in our database, 
                      ensuring relevant and meaningful benchmarks for your specific profile.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Sizes and Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayData.comparisons.slice(0, 3).map((comparison, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{formatMetricName(comparison.metricType)}</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Sample Size:</strong> {comparison.context.sampleDescription}</p>
                    <p><strong>Source:</strong> {comparison.context.dataSource}</p>
                    <p><strong>Year:</strong> {comparison.context.lastUpdated}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}