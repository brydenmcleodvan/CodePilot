import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Stethoscope,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Clock,
  Target,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ClinicalTrend {
  parameter: string;
  direction: 'improving' | 'declining' | 'stable' | 'fluctuating';
  magnitude: 'significant' | 'moderate' | 'mild';
  timeframe: string;
  values: {
    current: number;
    previous: number;
    change: number;
    percentChange: number;
  };
  clinicalSignificance: 'high' | 'medium' | 'low';
  riskFactors: string[];
}

interface ClinicalAssessment {
  id: string;
  userId: number;
  assessmentType: 'preliminary' | 'trend_analysis' | 'risk_stratification';
  condition: {
    name: string;
    icd10Code: string;
    probability: number;
    severity: 'mild' | 'moderate' | 'severe';
    urgency: 'routine' | 'urgent' | 'emergent';
  };
  clinicalIndicators: {
    parameter: string;
    value: number;
    unit: string;
    normalRange: {
      min: number;
      max: number;
    };
    status: 'normal' | 'borderline' | 'abnormal' | 'critical';
    trend: 'improving' | 'stable' | 'worsening';
  }[];
  riskFactors: {
    factor: string;
    presence: 'confirmed' | 'suspected' | 'absent';
    impact: 'high' | 'medium' | 'low';
    modifiable: boolean;
  }[];
  assessment: {
    summary: string;
    clinicalReasoning: string;
    differentialDiagnosis: string[];
    redFlags: string[];
  };
  confidence: number;
  disclaimer: string;
  generatedAt: string;
}

interface ClinicalIntervention {
  id: string;
  category: 'lifestyle' | 'dietary' | 'exercise' | 'sleep' | 'stress_management' | 'monitoring' | 'medical_referral';
  intervention: string;
  rationale: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  priority: 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short_term' | 'long_term';
  specificActions: {
    action: string;
    frequency: string;
    duration: string;
    target: string;
    monitoring: string[];
  }[];
  expectedOutcomes: {
    parameter: string;
    expectedChange: string;
    timeToEffect: string;
    measurementFrequency: string;
  }[];
  contraindications: string[];
  clinicalGuidelines: {
    organization: string;
    guideline: string;
    recommendationClass: string;
  }[];
}

interface ClinicalDecisionReport {
  userId: number;
  generatedAt: string;
  dataQuality: {
    completeness: number;
    consistency: number;
    timeframe: string;
  };
  trends: ClinicalTrend[];
  assessments: ClinicalAssessment[];
  interventions: ClinicalIntervention[];
  monitoring: {
    recommendedFrequency: string;
    keyParameters: string[];
    alertThresholds: {
      parameter: string;
      threshold: number;
      direction: 'above' | 'below';
      action: string;
    }[];
  };
  followUp: {
    recommended: boolean;
    timeframe: string;
    specialist: string;
    urgency: 'routine' | 'urgent' | 'emergent';
    reason: string;
  };
  disclaimer: string;
}

export default function ClinicalDecisionSupportDashboard() {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<string | null>(null);

  // Fetch clinical decision support report
  const { data: clinicalReport, isLoading } = useQuery<ClinicalDecisionReport>({
    queryKey: ['/api/clinical-decision-support'],
    refetchInterval: 4 * 60 * 60 * 1000, // Refresh every 4 hours
  });

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'fluctuating': return <Activity className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMagnitudeColor = (magnitude: string) => {
    switch (magnitude) {
      case 'significant': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'mild': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergent': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'routine': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'borderline': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'abnormal': return <XCircle className="h-4 w-4 text-orange-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dietary': return '🥗';
      case 'exercise': return '💪';
      case 'sleep': return '😴';
      case 'stress_management': return '🧘';
      case 'monitoring': return '📊';
      case 'medical_referral': return '👩‍⚕️';
      case 'lifestyle': return '🌟';
      default: return '📋';
    }
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  // Sample data for demonstration
  const sampleReport: ClinicalDecisionReport = {
    userId: 1,
    generatedAt: new Date().toISOString(),
    dataQuality: {
      completeness: 82,
      consistency: 91,
      timeframe: '30 days'
    },
    trends: [
      {
        parameter: 'glucose',
        direction: 'declining',
        magnitude: 'moderate',
        timeframe: '14 days',
        values: {
          current: 118.5,
          previous: 108.2,
          change: 10.3,
          percentChange: 9.5
        },
        clinicalSignificance: 'high',
        riskFactors: ['Worsening glucose trend', 'Elevated glucose levels']
      },
      {
        parameter: 'blood_pressure',
        direction: 'stable',
        magnitude: 'mild',
        timeframe: '14 days',
        values: {
          current: 128.4,
          previous: 126.8,
          change: 1.6,
          percentChange: 1.3
        },
        clinicalSignificance: 'medium',
        riskFactors: ['Borderline hypertension']
      }
    ],
    assessments: [
      {
        id: 'assessment-glucose-1',
        userId: 1,
        assessmentType: 'preliminary',
        condition: {
          name: 'Prediabetes (impaired glucose metabolism)',
          icd10Code: 'R73.03',
          probability: 75,
          severity: 'mild',
          urgency: 'routine'
        },
        clinicalIndicators: [
          {
            parameter: 'Fasting Glucose',
            value: 118.5,
            unit: 'mg/dL',
            normalRange: { min: 70, max: 99 },
            status: 'abnormal',
            trend: 'worsening'
          }
        ],
        riskFactors: [
          {
            factor: 'Elevated glucose levels',
            presence: 'confirmed',
            impact: 'high',
            modifiable: true
          },
          {
            factor: 'Sedentary lifestyle',
            presence: 'suspected',
            impact: 'medium',
            modifiable: true
          }
        ],
        assessment: {
          summary: 'Analysis suggests prediabetes (impaired glucose metabolism) based on glucose patterns',
          clinicalReasoning: 'Average glucose of 118.5 mg/dL exceeds normal thresholds. Glucose trend is declining.',
          differentialDiagnosis: ['Type 2 Diabetes', 'Prediabetes', 'Insulin resistance', 'Metabolic syndrome'],
          redFlags: []
        },
        confidence: 75,
        disclaimer: 'This assessment is for informational purposes only and does not constitute medical advice.',
        generatedAt: new Date().toISOString()
      },
      {
        id: 'assessment-bp-1',
        userId: 1,
        assessmentType: 'preliminary',
        condition: {
          name: 'Elevated Blood Pressure',
          icd10Code: 'R03.0',
          probability: 65,
          severity: 'mild',
          urgency: 'routine'
        },
        clinicalIndicators: [
          {
            parameter: 'Systolic Blood Pressure',
            value: 128.4,
            unit: 'mmHg',
            normalRange: { min: 90, max: 120 },
            status: 'borderline',
            trend: 'stable'
          }
        ],
        riskFactors: [
          {
            factor: 'Borderline hypertension',
            presence: 'confirmed',
            impact: 'medium',
            modifiable: true
          }
        ],
        assessment: {
          summary: 'Blood pressure analysis indicates elevated blood pressure',
          clinicalReasoning: 'Average systolic BP of 128.4 mmHg exceeds normal ranges',
          differentialDiagnosis: ['Essential hypertension', 'Secondary hypertension', 'White coat hypertension'],
          redFlags: []
        },
        confidence: 65,
        disclaimer: 'This assessment is for informational purposes only and does not constitute medical advice.',
        generatedAt: new Date().toISOString()
      }
    ],
    interventions: [
      {
        id: 'intervention-diet-1',
        category: 'dietary',
        intervention: 'Mediterranean Diet with Carbohydrate Modification',
        rationale: 'Mediterranean diet with reduced refined carbohydrates improves glucose control and insulin sensitivity',
        evidenceLevel: 'A',
        priority: 'high',
        timeframe: 'immediate',
        specificActions: [
          {
            action: 'Reduce refined carbohydrate intake',
            frequency: 'Daily',
            duration: 'Ongoing',
            target: '<45% of total calories',
            monitoring: ['Blood glucose', 'HbA1c', 'Weight']
          },
          {
            action: 'Increase fiber intake',
            frequency: 'Daily',
            duration: 'Ongoing',
            target: '25-35g per day',
            monitoring: ['Glucose response', 'Satiety']
          }
        ],
        expectedOutcomes: [
          {
            parameter: 'Fasting glucose',
            expectedChange: '10-20% reduction',
            timeToEffect: '4-8 weeks',
            measurementFrequency: 'Weekly'
          }
        ],
        contraindications: ['Active eating disorder', 'Severe malnutrition'],
        clinicalGuidelines: [
          {
            organization: 'American Diabetes Association',
            guideline: 'Standards of Medical Care in Diabetes 2023',
            recommendationClass: 'Class I'
          }
        ]
      },
      {
        id: 'intervention-exercise-1',
        category: 'exercise',
        intervention: 'Structured Exercise Program',
        rationale: 'Regular physical activity improves insulin sensitivity and glucose uptake',
        evidenceLevel: 'A',
        priority: 'high',
        timeframe: 'immediate',
        specificActions: [
          {
            action: 'Moderate-intensity aerobic exercise',
            frequency: '150 minutes per week',
            duration: 'Ongoing',
            target: '5 days per week, 30 minutes',
            monitoring: ['Heart rate', 'Blood glucose pre/post exercise']
          },
          {
            action: 'Resistance training',
            frequency: '2-3 times per week',
            duration: 'Ongoing',
            target: 'Major muscle groups',
            monitoring: ['Strength progression', 'Glucose response']
          }
        ],
        expectedOutcomes: [
          {
            parameter: 'Insulin sensitivity',
            expectedChange: '15-25% improvement',
            timeToEffect: '2-4 weeks',
            measurementFrequency: 'Monthly'
          }
        ],
        contraindications: ['Uncontrolled hypertension >180/110', 'Recent cardiac event'],
        clinicalGuidelines: [
          {
            organization: 'American College of Sports Medicine',
            guideline: 'Exercise and Type 2 Diabetes',
            recommendationClass: 'Class I'
          }
        ]
      }
    ],
    monitoring: {
      recommendedFrequency: 'Weekly',
      keyParameters: ['Fasting Glucose', 'Systolic Blood Pressure'],
      alertThresholds: [
        {
          parameter: 'Fasting Glucose',
          threshold: 126,
          direction: 'above',
          action: 'Urgent medical consultation'
        },
        {
          parameter: 'Systolic Blood Pressure',
          threshold: 180,
          direction: 'above',
          action: 'Immediate medical attention'
        }
      ]
    },
    followUp: {
      recommended: true,
      timeframe: '4-6 weeks',
      specialist: 'Primary care physician',
      urgency: 'routine',
      reason: 'High-probability clinical findings requiring professional evaluation'
    },
    disclaimer: 'IMPORTANT MEDICAL DISCLAIMER: This assessment is for informational purposes only and does not constitute medical advice, diagnosis, or treatment.'
  };

  const displayData = clinicalReport || sampleReport;

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
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Stethoscope className="h-8 w-8 text-purple-600" />
            </div>
            <span>Clinical Decision Support</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered preliminary assessments with ICD-10 aligned insights and evidence-based interventions
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Data Quality</div>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">{displayData.dataQuality.completeness}% Complete</div>
            <div className="text-sm text-gray-500">•</div>
            <div className="text-sm font-medium">{displayData.dataQuality.consistency}% Consistent</div>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>MEDICAL DISCLAIMER:</strong> This assessment is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for proper medical evaluation.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="assessments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="trends">Clinical Trends</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="followup">Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-6">
          {/* Clinical Assessments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayData.assessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 hover:shadow-lg transition-shadow cursor-pointer ${getUrgencyColor(assessment.condition.urgency)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center space-x-2 mb-2">
                          <span>{assessment.condition.name}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getUrgencyColor(assessment.condition.urgency)}>
                            {assessment.condition.urgency}
                          </Badge>
                          <Badge variant="outline">
                            ICD-10: {assessment.condition.icd10Code}
                          </Badge>
                          <Badge variant="outline">
                            {assessment.condition.probability}% probability
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500 mb-1">Confidence</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {assessment.confidence}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Clinical Indicators */}
                    <div>
                      <h4 className="font-medium mb-2">Clinical Indicators</h4>
                      <div className="space-y-2">
                        {assessment.clinicalIndicators.map((indicator, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(indicator.status)}
                              <span className="font-medium text-sm">{indicator.parameter}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {indicator.value} {indicator.unit}
                              </div>
                              <div className="text-xs text-gray-500">
                                Normal: {indicator.normalRange.min}-{indicator.normalRange.max} {indicator.unit}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assessment Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Clinical Summary</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {assessment.assessment.summary}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Reasoning:</strong> {assessment.assessment.clinicalReasoning}
                      </p>
                    </div>

                    {/* Risk Factors */}
                    <div>
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <div className="space-y-1">
                        {assessment.riskFactors.map((risk, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${
                                risk.impact === 'high' ? 'bg-red-500' :
                                risk.impact === 'medium' ? 'bg-orange-500' :
                                'bg-yellow-500'
                              }`}></span>
                              <span>{risk.factor}</span>
                            </span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {risk.presence}
                              </Badge>
                              {risk.modifiable && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  Modifiable
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Red Flags */}
                    {assessment.assessment.redFlags.length > 0 && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          <strong>Red Flags:</strong> {assessment.assessment.redFlags.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Differential Diagnosis */}
                    <div>
                      <h4 className="font-medium mb-2">Differential Diagnosis</h4>
                      <div className="flex flex-wrap gap-1">
                        {assessment.assessment.differentialDiagnosis.map((diagnosis, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {diagnosis}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Clinical Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayData.trends.map((trend, index) => (
              <motion.div
                key={trend.parameter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{trend.parameter.replace('_', ' ')}</span>
                      {getTrendIcon(trend.direction)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Current Value</p>
                        <p className="text-2xl font-bold">{trend.values.current}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Previous Value</p>
                        <p className="text-lg text-gray-700 dark:text-gray-300">{trend.values.previous}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Change:</span>
                      <span className={`text-sm font-medium ${
                        trend.values.change > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {trend.values.change > 0 ? '+' : ''}{trend.values.change} 
                        ({trend.values.percentChange > 0 ? '+' : ''}{trend.values.percentChange}%)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Magnitude:</span>
                        <Badge className={getMagnitudeColor(trend.magnitude)}>
                          {trend.magnitude}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Clinical Significance:</span>
                        <Badge className={
                          trend.clinicalSignificance === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30' :
                          trend.clinicalSignificance === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30'
                        }>
                          {trend.clinicalSignificance}
                        </Badge>
                      </div>
                    </div>

                    {trend.riskFactors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Associated Risks:</p>
                        <ul className="space-y-1">
                          {trend.riskFactors.map((risk, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          {/* Clinical Interventions */}
          <div className="space-y-4">
            {displayData.interventions.map((intervention, index) => (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(intervention.category)}</span>
                        <div>
                          <CardTitle className="text-lg">{intervention.intervention}</CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getEvidenceColor(intervention.evidenceLevel)}>
                              Evidence Level {intervention.evidenceLevel}
                            </Badge>
                            <Badge className={
                              intervention.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30' :
                              intervention.priority === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' :
                              'bg-green-100 text-green-800 dark:bg-green-900/30'
                            }>
                              {intervention.priority} priority
                            </Badge>
                            <Badge variant="outline">{intervention.timeframe}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Rationale */}
                    <div>
                      <h4 className="font-medium mb-2">Clinical Rationale</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {intervention.rationale}
                      </p>
                    </div>

                    {/* Specific Actions */}
                    <div>
                      <h4 className="font-medium mb-2">Specific Actions</h4>
                      <div className="space-y-3">
                        {intervention.specificActions.map((action, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <h5 className="font-medium text-sm mb-2">{action.action}</h5>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500">Frequency:</span> {action.frequency}
                              </div>
                              <div>
                                <span className="text-gray-500">Target:</span> {action.target}
                              </div>
                              <div>
                                <span className="text-gray-500">Duration:</span> {action.duration}
                              </div>
                              <div>
                                <span className="text-gray-500">Monitoring:</span> {action.monitoring.join(', ')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expected Outcomes */}
                    <div>
                      <h4 className="font-medium mb-2">Expected Outcomes</h4>
                      <div className="space-y-2">
                        {intervention.expectedOutcomes.map((outcome, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span>{outcome.parameter}:</span>
                            <span className="font-medium text-green-600">{outcome.expectedChange}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clinical Guidelines */}
                    <div>
                      <h4 className="font-medium mb-2">Supporting Guidelines</h4>
                      <div className="space-y-1">
                        {intervention.clinicalGuidelines.map((guideline, idx) => (
                          <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>{guideline.organization}:</strong> {guideline.guideline} ({guideline.recommendationClass})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contraindications */}
                    {intervention.contraindications.length > 0 && (
                      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 dark:text-orange-200">
                          <strong>Contraindications:</strong> {intervention.contraindications.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoring Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Monitoring Protocol</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Recommended Frequency</h4>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30">
                  {displayData.monitoring.recommendedFrequency}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-3">Key Parameters to Monitor</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {displayData.monitoring.keyParameters.map((param, idx) => (
                    <Badge key={idx} variant="outline" className="justify-center">
                      {param}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Alert Thresholds</h4>
                <div className="space-y-3">
                  {displayData.monitoring.alertThresholds.map((threshold, idx) => (
                    <div key={idx} className="border border-red-200 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{threshold.parameter}</span>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30">
                          {threshold.direction} {threshold.threshold}
                        </Badge>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Action:</strong> {threshold.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followup" className="space-y-6">
          {/* Follow-up Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Follow-up Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Recommendation</h4>
                  <div className={`p-4 rounded-lg ${
                    displayData.followUp.recommended 
                      ? 'bg-green-50 border border-green-200 dark:bg-green-900/20' 
                      : 'bg-gray-50 border border-gray-200 dark:bg-gray-900/20'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {displayData.followUp.recommended ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-600" />
                      )}
                      <span className="font-medium">
                        {displayData.followUp.recommended ? 'Follow-up Recommended' : 'No Immediate Follow-up Required'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {displayData.followUp.reason}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Timeframe:</span>
                      <span className="font-medium">{displayData.followUp.timeframe}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Specialist:</span>
                      <span className="font-medium">{displayData.followUp.specialist}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Urgency:</span>
                      <Badge className={getUrgencyColor(displayData.followUp.urgency)}>
                        {displayData.followUp.urgency}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {displayData.followUp.recommended && (
                <div className="mt-6">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}