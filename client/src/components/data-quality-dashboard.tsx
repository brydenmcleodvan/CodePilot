import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Smartphone,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  Settings,
  Battery,
  Wifi,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DataQualityScore {
  overall: number;
  components: {
    consistency: number;
    plausibility: number;
    completeness: number;
    timeliness: number;
  };
  reliability: 'excellent' | 'good' | 'fair' | 'poor';
  confidence: number;
}

interface DataOutlier {
  id: string;
  metricId: number;
  metricType: string;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
  outlierType: 'impossible' | 'highly_unlikely' | 'inconsistent' | 'missing_context';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  expectedRange: {
    min: number;
    max: number;
    typical: number;
  };
  correctionSuggestions: {
    type: 'user_input' | 'device_sync' | 'algorithm_fix' | 'ignore';
    description: string;
    confidence: number;
  }[];
}

interface DeviceReliabilityScore {
  deviceId: string;
  deviceName: string;
  deviceType: 'wearable' | 'scale' | 'blood_pressure' | 'glucose_meter' | 'manual_entry';
  reliability: {
    overall: number;
    dataConsistency: number;
    syncReliability: number;
    accuracyScore: number;
    batteryHealth: number;
  };
  metrics: {
    metricType: string;
    qualityScore: number;
    outlierRate: number;
    missingDataRate: number;
    lastSync: string;
  }[];
  issues: {
    type: 'sync_failure' | 'battery_low' | 'calibration_needed' | 'sensor_drift' | 'user_error';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
    firstDetected: string;
  }[];
  trends: {
    period: '24h' | '7d' | '30d';
    reliabilityChange: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
  };
}

interface DataQualityReport {
  userId: number;
  generatedAt: string;
  timeframe: {
    start: string;
    end: string;
  };
  overallQuality: DataQualityScore;
  outliers: DataOutlier[];
  deviceReliability: DeviceReliabilityScore[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  insights: {
    dataIntegrityTrends: string[];
    devicePerformance: string[];
    userBehaviorPatterns: string[];
  };
}

export default function DataQualityDashboard() {
  const [dismissedOutliers, setDismissedOutliers] = useState<Set<string>>(new Set());
  const [correctedOutliers, setCorrectedOutliers] = useState<Set<string>>(new Set());

  // Fetch data quality report
  const { data: qualityReport, isLoading } = useQuery<DataQualityReport>({
    queryKey: ['/api/data-quality/report'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return '🟢';
    if (score >= 75) return '🟡';
    if (score >= 60) return '🟠';
    return '🔴';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'wearable': return <Smartphone className="h-5 w-5" />;
      case 'scale': return <Activity className="h-5 w-5" />;
      case 'manual_entry': return <Eye className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const handleDismissOutlier = (outlierId: string) => {
    setDismissedOutliers(prev => new Set([...prev, outlierId]));
  };

  const handleCorrectOutlier = (outlierId: string) => {
    setCorrectedOutliers(prev => new Set([...prev, outlierId]));
  };

  // Sample data for demonstration
  const sampleReport: DataQualityReport = {
    userId: 1,
    generatedAt: new Date().toISOString(),
    timeframe: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    overallQuality: {
      overall: 87,
      components: {
        consistency: 92,
        plausibility: 88,
        completeness: 85,
        timeliness: 83
      },
      reliability: 'good',
      confidence: 0.89
    },
    outliers: [
      {
        id: 'outlier-1',
        metricId: 123,
        metricType: 'heart_rate',
        value: 300,
        unit: 'bpm',
        timestamp: new Date().toISOString(),
        source: 'apple_watch',
        outlierType: 'impossible',
        severity: 'critical',
        description: 'Heart rate value of 300 bpm is physiologically impossible',
        expectedRange: { min: 60, max: 100, typical: 75 },
        correctionSuggestions: [
          {
            type: 'user_input',
            description: 'Please verify and re-enter the correct value',
            confidence: 0.9
          },
          {
            type: 'device_sync',
            description: 'Check if device needs recalibration',
            confidence: 0.7
          }
        ]
      },
      {
        id: 'outlier-2',
        metricId: 124,
        metricType: 'steps',
        value: 0,
        unit: 'steps',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'fitbit',
        outlierType: 'inconsistent',
        severity: 'medium',
        description: 'Zero steps recorded during active hours is unusual',
        expectedRange: { min: 2000, max: 15000, typical: 8000 },
        correctionSuggestions: [
          {
            type: 'device_sync',
            description: 'Check if device was worn properly',
            confidence: 0.8
          }
        ]
      }
    ],
    deviceReliability: [
      {
        deviceId: 'apple_watch',
        deviceName: 'Apple Watch',
        deviceType: 'wearable',
        reliability: {
          overall: 94,
          dataConsistency: 96,
          syncReliability: 98,
          accuracyScore: 92,
          batteryHealth: 89
        },
        metrics: [
          {
            metricType: 'heart_rate',
            qualityScore: 95,
            outlierRate: 2,
            missingDataRate: 1,
            lastSync: new Date().toISOString()
          },
          {
            metricType: 'steps',
            qualityScore: 93,
            outlierRate: 3,
            missingDataRate: 2,
            lastSync: new Date().toISOString()
          }
        ],
        issues: [],
        trends: {
          period: '7d',
          reliabilityChange: 2,
          qualityTrend: 'improving'
        }
      },
      {
        deviceId: 'fitbit',
        deviceName: 'Fitbit Device',
        deviceType: 'wearable',
        reliability: {
          overall: 78,
          dataConsistency: 82,
          syncReliability: 75,
          accuracyScore: 80,
          batteryHealth: 65
        },
        metrics: [
          {
            metricType: 'steps',
            qualityScore: 80,
            outlierRate: 8,
            missingDataRate: 5,
            lastSync: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        ],
        issues: [
          {
            type: 'battery_low',
            severity: 'medium',
            description: 'Device battery is running low, affecting sync reliability',
            recommendation: 'Charge device to maintain consistent data collection',
            firstDetected: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        trends: {
          period: '7d',
          reliabilityChange: -5,
          qualityTrend: 'declining'
        }
      },
      {
        deviceId: 'manual',
        deviceName: 'Manual Entry',
        deviceType: 'manual_entry',
        reliability: {
          overall: 91,
          dataConsistency: 95,
          syncReliability: 100,
          accuracyScore: 88,
          batteryHealth: 100
        },
        metrics: [
          {
            metricType: 'weight',
            qualityScore: 92,
            outlierRate: 1,
            missingDataRate: 10,
            lastSync: new Date().toISOString()
          }
        ],
        issues: [],
        trends: {
          period: '7d',
          reliabilityChange: 1,
          qualityTrend: 'stable'
        }
      }
    ],
    recommendations: {
      immediate: [
        'Review critical data outliers for heart rate readings',
        'Check Fitbit device battery and charging status'
      ],
      shortTerm: [
        'Calibrate devices showing consistency issues',
        'Establish regular data review routine'
      ],
      longTerm: [
        'Consider upgrading devices with poor reliability scores',
        'Implement automated quality monitoring alerts'
      ]
    },
    insights: {
      dataIntegrityTrends: [
        'Overall data quality has improved 5% this week',
        'Manual entries show highest accuracy rates',
        'Device sync reliability is 94% across all sources'
      ],
      devicePerformance: [
        'Apple Watch provides most consistent data',
        'Fitbit showing declining performance due to battery issues',
        'Manual entries have lowest outlier rates'
      ],
      userBehaviorPatterns: [
        'Data quality improves with regular device charging',
        'Manual verification increases overall accuracy',
        'Weekend data gaps most common issue'
      ]
    }
  };

  const displayData = qualityReport || sampleReport;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Overall Quality Score */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <span>Data Quality</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor data integrity across all health tracking devices
          </p>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 ${getQualityColor(displayData.overallQuality.overall)}`}>
            <span className="text-2xl">{getQualityIcon(displayData.overallQuality.overall)}</span>
            <div>
              <p className="font-bold text-lg">{displayData.overallQuality.overall}%</p>
              <p className="text-sm capitalize">{displayData.overallQuality.reliability}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {displayData.outliers.some(o => o.severity === 'critical') && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Critical Data Issues Detected:</strong> {displayData.outliers.filter(o => o.severity === 'critical').length} outlier{displayData.outliers.filter(o => o.severity === 'critical').length !== 1 ? 's' : ''} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Quality Overview</TabsTrigger>
          <TabsTrigger value="outliers">Data Outliers</TabsTrigger>
          <TabsTrigger value="devices">Device Reliability</TabsTrigger>
          <TabsTrigger value="insights">Quality Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quality Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(displayData.overallQuality.components).map(([component, score], index) => (
              <motion.div
                key={component}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">{component}</CardTitle>
                      <span className="text-2xl">{getQualityIcon(score)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold">{score}%</div>
                      <Progress value={score} className="h-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {component === 'consistency' && 'How consistent your data is over time'}
                        {component === 'plausibility' && 'How realistic your data values are'}
                        {component === 'completeness' && 'How much data you have vs expected'}
                        {component === 'timeliness' && 'How up-to-date your data is'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{displayData.outliers.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Data Outliers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{displayData.deviceReliability.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connected Devices</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(displayData.overallQuality.confidence * 100)}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outliers" className="space-y-6">
          {/* Data Outliers */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Data Outliers Requiring Attention
            </h3>
            
            {displayData.outliers.length > 0 ? (
              <div className="space-y-4">
                {displayData.outliers
                  .filter(outlier => !dismissedOutliers.has(outlier.id))
                  .map((outlier, index) => (
                    <motion.div
                      key={outlier.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border-l-4 ${getSeverityColor(outlier.severity)}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge className={getSeverityColor(outlier.severity)}>
                                  {outlier.severity}
                                </Badge>
                                <Badge variant="outline">
                                  {outlier.outlierType.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {outlier.source}
                                </span>
                              </div>
                              
                              <h4 className="font-semibold text-lg mb-2">
                                {outlier.metricType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Outlier
                              </h4>
                              
                              <p className="text-gray-700 dark:text-gray-300 mb-3">
                                {outlier.description}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">Current Value:</p>
                                  <p className="text-lg font-bold text-red-600">
                                    {outlier.value} {outlier.unit}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium mb-2">Expected Range:</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {outlier.expectedRange.min} - {outlier.expectedRange.max} {outlier.unit}
                                    <br />
                                    <span className="text-xs">Typical: {outlier.expectedRange.typical} {outlier.unit}</span>
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-2">Correction Suggestions:</p>
                                <div className="space-y-2">
                                  {outlier.correctionSuggestions.map((suggestion, suggestionIndex) => (
                                    <div key={suggestionIndex} className="flex items-start space-x-2">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                      <div className="flex-1">
                                        <span className="text-sm">{suggestion.description}</span>
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          {Math.round(suggestion.confidence * 100)}% confidence
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleCorrectOutlier(outlier.id)}
                                disabled={correctedOutliers.has(outlier.id)}
                              >
                                {correctedOutliers.has(outlier.id) ? 'Corrected' : 'Mark Corrected'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDismissOutlier(outlier.id)}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-4 text-xs text-gray-500">
                            Detected: {new Date(outlier.timestamp).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Data Outliers
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All your health data appears to be within normal ranges. Great job!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          {/* Device Reliability Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayData.deviceReliability.map((device, index) => (
              <motion.div
                key={device.deviceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device.deviceType)}
                        <div>
                          <CardTitle>{device.deviceName}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {device.deviceType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold">{device.reliability.overall}%</div>
                        <span className="text-lg">{getQualityIcon(device.reliability.overall)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Reliability Components */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Activity className="h-4 w-4" />
                          <span className="text-sm">Consistency</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={device.reliability.dataConsistency} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{device.reliability.dataConsistency}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Wifi className="h-4 w-4" />
                          <span className="text-sm">Sync</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={device.reliability.syncReliability} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{device.reliability.syncReliability}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Target className="h-4 w-4" />
                          <span className="text-sm">Accuracy</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={device.reliability.accuracyScore} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{device.reliability.accuracyScore}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Battery className="h-4 w-4" />
                          <span className="text-sm">Battery</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={device.reliability.batteryHealth} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{device.reliability.batteryHealth}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Device Issues */}
                    {device.issues.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Current Issues:</h4>
                        <div className="space-y-2">
                          {device.issues.map((issue, issueIndex) => (
                            <div key={issueIndex} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-sm">{issue.description}</p>
                                  <p className="text-xs mt-1">{issue.recommendation}</p>
                                </div>
                                <Badge className={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metrics Performance */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Metric Performance:</h4>
                      <div className="space-y-2">
                        {device.metrics.map((metric, metricIndex) => (
                          <div key={metricIndex} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{metric.metricType.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <span>{metric.qualityScore}%</span>
                              <Badge variant="outline" className="text-xs">
                                {metric.outlierRate}% outliers
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        {device.trends.qualityTrend === 'improving' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : device.trends.qualityTrend === 'declining' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="text-sm capitalize">{device.trends.qualityTrend}</span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Last sync: {new Date(device.metrics[0]?.lastSync).toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Quality Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Data Integrity Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.insights.dataIntegrityTrends.map((trend, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{trend}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <span>Device Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.insights.devicePerformance.map((insight, index) => (
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
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span>User Behavior</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.insights.userBehaviorPatterns.map((pattern, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Improvement Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-red-600 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Immediate
                  </h4>
                  <ul className="space-y-2">
                    {displayData.recommendations.immediate.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-yellow-600 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Short Term
                  </h4>
                  <ul className="space-y-2">
                    {displayData.recommendations.shortTerm.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Long Term
                  </h4>
                  <ul className="space-y-2">
                    {displayData.recommendations.longTerm.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}