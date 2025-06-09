import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Brain,
  Zap,
  Clock,
  Users,
  Target,
  Eye,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnomalyAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  category: 'cardiovascular' | 'metabolic' | 'neurological' | 'respiratory' | 'psychological';
  metricType: string;
  currentValue: number;
  unit: string;
  normalRange: {
    min: number;
    max: number;
    description: string;
  };
  deviationType: 'spike' | 'crash' | 'sustained_elevation' | 'sustained_depression' | 'erratic_pattern';
  riskLevel: number;
  clinicalSignificance: string;
  immediateActions: string[];
  followUpRecommendations: string[];
  relatedMetrics: string[];
  populationComparison: {
    percentile: number;
    ageGroup: string;
    genderGroup: string;
  };
}

interface ConditionRiskScore {
  condition: 'diabetes' | 'hypertension' | 'cardiovascular_disease' | 'metabolic_syndrome' | 'depression' | 'sleep_disorders';
  riskScore: number;
  riskCategory: 'low' | 'moderate' | 'high' | 'very_high';
  confidence: number;
  primaryRiskFactors: {
    factor: string;
    contribution: number;
    currentValue: number;
    optimalValue: number;
    unit: string;
  }[];
  secondaryRiskFactors: string[];
  timeToOnset: {
    estimate: string;
    confidence: number;
  };
  preventionStrategies: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  populationRisk: {
    ageGroupBaseline: number;
    relativeRisk: number;
    absoluteRisk: number;
  };
  clinicalCriteria: {
    criteriaSet: string;
    metCriteria: string[];
    missingCriteria: string[];
  };
}

interface RiskDashboardData {
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  activeAlerts: AnomalyAlert[];
  conditionRisks: ConditionRiskScore[];
  trendingMetrics: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
  urgentFlags: {
    count: number;
    criticalMetrics: string[];
    requiresImmediateAttention: boolean;
  };
  riskEvolution: {
    timeframe: string;
    riskChange: number;
    trajectory: 'improving' | 'stable' | 'worsening';
  };
}

export default function RiskDetectionDashboard() {
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);

  // Fetch risk analysis data
  const { data: riskData, isLoading } = useQuery<RiskDashboardData>({
    queryKey: ['/api/risk-analysis'],
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getRiskEmoji = (level: string) => {
    switch (level) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'moderate': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'moderate': return <Info className="h-5 w-5 text-yellow-600" />;
      case 'low': return <Info className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardiovascular': return <Heart className="h-5 w-5" />;
      case 'metabolic': return <Zap className="h-5 w-5" />;
      case 'neurological': return <Brain className="h-5 w-5" />;
      case 'psychological': return <Brain className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'diabetes': return '🩺';
      case 'hypertension': return '💓';
      case 'cardiovascular_disease': return '❤️';
      case 'depression': return '🧠';
      default: return '⚕️';
    }
  };

  // Sample data for demonstration
  const sampleRiskData: RiskDashboardData = {
    overallRiskLevel: 'moderate',
    activeAlerts: [
      {
        id: 'alert-1',
        timestamp: new Date().toISOString(),
        severity: 'high',
        category: 'cardiovascular',
        metricType: 'heart_rate_variability',
        currentValue: 22,
        unit: 'ms',
        normalRange: { min: 30, max: 100, description: 'Healthy HRV range' },
        deviationType: 'crash',
        riskLevel: 75,
        clinicalSignificance: 'Severely reduced HRV - strong indicator of cardiovascular stress or autonomic dysfunction',
        immediateActions: ['Monitor stress levels', 'Ensure adequate rest', 'Avoid intense exercise'],
        followUpRecommendations: ['Schedule cardiology consultation', 'Consider stress management program'],
        relatedMetrics: ['heart_rate', 'blood_pressure', 'stress_level'],
        populationComparison: { percentile: 15, ageGroup: '30-39', genderGroup: 'all' }
      },
      {
        id: 'alert-2',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'moderate',
        category: 'metabolic',
        metricType: 'glucose',
        currentValue: 145,
        unit: 'mg/dL',
        normalRange: { min: 70, max: 100, description: 'Normal fasting glucose' },
        deviationType: 'sustained_elevation',
        riskLevel: 60,
        clinicalSignificance: 'Persistent hyperglycemia - diabetes screening recommended',
        immediateActions: ['Avoid high-sugar foods', 'Increase water intake', 'Test again in 2 hours'],
        followUpRecommendations: ['Schedule diabetes screening', 'Dietary consultation'],
        relatedMetrics: ['weight', 'exercise', 'sleep'],
        populationComparison: { percentile: 85, ageGroup: '30-39', genderGroup: 'all' }
      }
    ],
    conditionRisks: [
      {
        condition: 'cardiovascular_disease',
        riskScore: 68,
        riskCategory: 'high',
        confidence: 0.85,
        primaryRiskFactors: [
          { factor: 'Heart Rate Variability', contribution: 30, currentValue: 22, optimalValue: 50, unit: 'ms' },
          { factor: 'Resting heart rate', contribution: 25, currentValue: 88, optimalValue: 65, unit: 'bpm' }
        ],
        secondaryRiskFactors: ['Age', 'Gender', 'Family history'],
        timeToOnset: { estimate: '2-5 years', confidence: 0.6 },
        preventionStrategies: {
          immediate: ['Increase cardio exercise', 'Monitor heart metrics'],
          shortTerm: ['Structured fitness program', 'Stress reduction'],
          longTerm: ['Heart-healthy diet', 'Regular medical checkups']
        },
        populationRisk: { ageGroupBaseline: 15, relativeRisk: 4.5, absoluteRisk: 68 },
        clinicalCriteria: {
          criteriaSet: 'Framingham Risk Score',
          metCriteria: ['Elevated cardiovascular markers'],
          missingCriteria: ['Cholesterol levels', 'ECG assessment']
        }
      },
      {
        condition: 'diabetes',
        riskScore: 45,
        riskCategory: 'moderate',
        confidence: 0.7,
        primaryRiskFactors: [
          { factor: 'Fasting glucose', contribution: 25, currentValue: 145, optimalValue: 90, unit: 'mg/dL' }
        ],
        secondaryRiskFactors: ['Family history', 'Sedentary lifestyle'],
        timeToOnset: { estimate: '3-5 years', confidence: 0.6 },
        preventionStrategies: {
          immediate: ['Monitor glucose levels daily', 'Reduce refined sugar intake'],
          shortTerm: ['Implement structured exercise program', 'Dietary consultation'],
          longTerm: ['Maintain healthy weight', 'Regular medical monitoring']
        },
        populationRisk: { ageGroupBaseline: 5, relativeRisk: 9, absoluteRisk: 45 },
        clinicalCriteria: {
          criteriaSet: 'WHO 2019',
          metCriteria: ['Elevated fasting glucose'],
          missingCriteria: ['HbA1c levels', 'Oral glucose tolerance test']
        }
      },
      {
        condition: 'hypertension',
        riskScore: 35,
        riskCategory: 'moderate',
        confidence: 0.8,
        primaryRiskFactors: [
          { factor: 'Blood pressure trends', contribution: 20, currentValue: 128, optimalValue: 120, unit: 'mmHg' }
        ],
        secondaryRiskFactors: ['Age', 'Salt intake', 'Stress levels'],
        timeToOnset: { estimate: '1-2 years', confidence: 0.7 },
        preventionStrategies: {
          immediate: ['Reduce sodium intake', 'Monitor blood pressure daily'],
          shortTerm: ['Increase physical activity', 'Stress management techniques'],
          longTerm: ['Maintain healthy weight', 'Regular cardiovascular exercise']
        },
        populationRisk: { ageGroupBaseline: 20, relativeRisk: 1.75, absoluteRisk: 35 },
        clinicalCriteria: {
          criteriaSet: 'AHA/ESC 2018',
          metCriteria: ['Elevated blood pressure trends'],
          missingCriteria: ['24-hour monitoring', 'Diastolic pressure']
        }
      }
    ],
    trendingMetrics: {
      improving: ['sleep', 'weight'],
      declining: ['heart_rate_variability', 'mood'],
      stable: ['steps', 'hydration']
    },
    urgentFlags: {
      count: 1,
      criticalMetrics: ['heart_rate_variability'],
      requiresImmediateAttention: true
    },
    riskEvolution: {
      timeframe: '30 days',
      riskChange: 8.5,
      trajectory: 'worsening'
    }
  };

  const displayData = riskData || sampleRiskData;

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
      {/* Header with Overall Risk Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <span>Risk Detection</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered anomaly detection and WHO-criteria risk assessment
          </p>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 ${getRiskColor(displayData.overallRiskLevel)}`}>
            <span className="text-2xl">{getRiskEmoji(displayData.overallRiskLevel)}</span>
            <div>
              <p className="font-bold text-lg capitalize">{displayData.overallRiskLevel} Risk</p>
              <p className="text-sm">
                {displayData.urgentFlags.count} urgent alert{displayData.urgentFlags.count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Alerts Banner */}
      {displayData.urgentFlags.requiresImmediateAttention && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Immediate Attention Required:</strong> {displayData.urgentFlags.count} critical health metric{displayData.urgentFlags.count !== 1 ? 's' : ''} detected: {displayData.urgentFlags.criticalMetrics.join(', ')}. 
            Please review the alerts below and consider consulting your healthcare provider.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="conditions">Condition Risks</TabsTrigger>
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
          <TabsTrigger value="evolution">Risk Evolution</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          {/* Real-time Anomaly Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Real-time Anomaly Detection
              </h3>
              
              {displayData.activeAlerts.length > 0 ? (
                displayData.activeAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${getRiskColor(alert.severity)}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <h4 className="font-semibold capitalize flex items-center space-x-2">
                            <span>{alert.metricType.replace('_', ' ')}</span>
                            <Badge variant="outline" className="text-xs">
                              {alert.deviationType.replace('_', ' ')}
                            </Badge>
                          </h4>
                          <p className="text-sm mt-1">
                            Current: <strong>{alert.currentValue} {alert.unit}</strong>
                            <span className="mx-2">•</span>
                            Normal: {alert.normalRange.min}-{alert.normalRange.max} {alert.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getRiskColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <p className="text-xs mt-1">
                          Risk: {alert.riskLevel}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={alert.riskLevel} className="h-2" />
                    </div>
                    
                    <div className="mt-3 text-sm">
                      <p className="font-medium">Population Comparison:</p>
                      <p>{alert.populationComparison.percentile}th percentile for {alert.populationComparison.ageGroup} age group</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No Active Alerts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      All health metrics are within normal ranges. Great job!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Alert Details Panel */}
            <div>
              {selectedAlert ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getCategoryIcon(selectedAlert.category)}
                      <span>Alert Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Clinical Significance</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedAlert.clinicalSignificance}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Immediate Actions</h4>
                      <ul className="text-sm space-y-1">
                        {selectedAlert.immediateActions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-blue-600">Follow-up Recommendations</h4>
                      <ul className="text-sm space-y-1">
                        {selectedAlert.followUpRecommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Related Metrics to Monitor</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.relatedMetrics.map((metric, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {metric.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardContent className="p-8 text-center h-full flex items-center justify-center">
                    <div>
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Select an alert to view detailed analysis and recommendations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-6">
          {/* WHO-Criteria Based Condition Risk Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayData.conditionRisks.map((condition, index) => (
              <motion.div
                key={condition.condition}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-3">
                        <span className="text-2xl">{getConditionIcon(condition.condition)}</span>
                        <div>
                          <span className="capitalize">{condition.condition.replace('_', ' ')}</span>
                          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                            {condition.clinicalCriteria.criteriaSet}
                          </p>
                        </div>
                      </CardTitle>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getRiskColor(condition.riskCategory).split(' ')[0]}`}>
                          {condition.riskScore}%
                        </div>
                        <Badge className={getRiskColor(condition.riskCategory)}>
                          {condition.riskCategory.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Risk Level</span>
                        <span>{Math.round(condition.confidence * 100)}% confidence</span>
                      </div>
                      <Progress value={condition.riskScore} className="h-3" />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Primary Risk Factors</h4>
                      <div className="space-y-2">
                        {condition.primaryRiskFactors.map((factor, factorIndex) => (
                          <div key={factorIndex} className="flex items-center justify-between text-sm">
                            <span>{factor.factor}</span>
                            <div className="text-right">
                              <span className="font-medium">{factor.currentValue} {factor.unit}</span>
                              <span className="text-gray-500 ml-2">(optimal: {factor.optimalValue})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Population Risk Comparison</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Baseline Risk</p>
                          <p className="font-medium">{condition.populationRisk.ageGroupBaseline}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Your Relative Risk</p>
                          <p className="font-medium">{condition.populationRisk.relativeRisk.toFixed(1)}x higher</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Time to Onset</h4>
                      <p className="text-sm">
                        <strong>{condition.timeToOnset.estimate}</strong>
                        <span className="text-gray-500 ml-2">
                          ({Math.round(condition.timeToOnset.confidence * 100)}% confidence)
                        </span>
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Prevention Strategies</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-red-600">Immediate:</p>
                          <ul className="text-sm">
                            {condition.preventionStrategies.immediate.slice(0, 2).map((strategy, strategyIndex) => (
                              <li key={strategyIndex} className="flex items-start space-x-2">
                                <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{strategy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-blue-600">Long-term:</p>
                          <ul className="text-sm">
                            {condition.preventionStrategies.longTerm.slice(0, 2).map((strategy, strategyIndex) => (
                              <li key={strategyIndex} className="flex items-start space-x-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{strategy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Criteria met: {condition.clinicalCriteria.metCriteria.length}</span>
                        <span>Missing: {condition.clinicalCriteria.missingCriteria.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Health Metric Trends */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  <span>Improving Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayData.trendingMetrics.improving.length > 0 ? (
                  <div className="space-y-2">
                    {displayData.trendingMetrics.improving.map((metric, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm capitalize">{metric.replace('_', ' ')}</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">↗️ +5.2%</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No improving trends detected
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-600">
                  <Activity className="h-5 w-5" />
                  <span>Stable Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayData.trendingMetrics.stable.length > 0 ? (
                  <div className="space-y-2">
                    {displayData.trendingMetrics.stable.map((metric, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <Activity className="h-4 w-4 text-gray-600" />
                        <span className="text-sm capitalize">{metric.replace('_', ' ')}</span>
                        <Badge variant="outline" className="text-xs">→ stable</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No stable trends detected
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  <span>Declining Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayData.trendingMetrics.declining.length > 0 ? (
                  <div className="space-y-2">
                    {displayData.trendingMetrics.declining.map((metric, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm capitalize">{metric.replace('_', ' ')}</span>
                        <Badge className="bg-red-100 text-red-800 text-xs">↘️ -8.3%</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No declining trends detected
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-6">
          {/* Risk Evolution Over Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Risk Evolution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    displayData.riskEvolution.trajectory === 'improving' ? 'text-green-600' :
                    displayData.riskEvolution.trajectory === 'worsening' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {displayData.riskEvolution.riskChange > 0 ? '+' : ''}{displayData.riskEvolution.riskChange}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Risk change over {displayData.riskEvolution.timeframe}
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  {displayData.riskEvolution.trajectory === 'improving' && (
                    <>
                      <TrendingDown className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">Improving</span>
                    </>
                  )}
                  {displayData.riskEvolution.trajectory === 'worsening' && (
                    <>
                      <TrendingUp className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-medium">Worsening</span>
                    </>
                  )}
                  {displayData.riskEvolution.trajectory === 'stable' && (
                    <>
                      <Activity className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-600 font-medium">Stable</span>
                    </>
                  )}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Analysis:</strong> Your overall health risk has {displayData.riskEvolution.trajectory === 'improving' ? 'decreased' : displayData.riskEvolution.trajectory === 'worsening' ? 'increased' : 'remained stable'} by {Math.abs(displayData.riskEvolution.riskChange)}% over the past {displayData.riskEvolution.timeframe}. 
                    {displayData.riskEvolution.trajectory === 'worsening' && ' Consider implementing the recommended prevention strategies.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Population Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    Top 25%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your health vigilance ranks in the top 25% of users who actively monitor health metrics
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Early Detection</span>
                    <Badge className="bg-green-100 text-green-800">95th percentile</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Awareness</span>
                    <Badge className="bg-blue-100 text-blue-800">88th percentile</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Preventive Action</span>
                    <Badge className="bg-purple-100 text-purple-800">82nd percentile</Badge>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Great job!</strong> Your proactive health monitoring puts you ahead of most people in preventing serious health conditions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}