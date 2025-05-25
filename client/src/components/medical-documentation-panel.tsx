import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Mail, 
  QrCode, 
  Share2, 
  Calendar,
  Clock,
  User,
  Heart,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PhysicianReport {
  reportId: string;
  generatedAt: string;
  reportPeriod: {
    start: string;
    end: string;
  };
  patientSummary: {
    demographics: any;
    primaryConcerns: string[];
    currentMedications: string[];
    allergies: string[];
    medicalHistory: string[];
  };
  keyFindings: {
    criticalAlerts: string[];
    significantTrends: string[];
    anomalies: string[];
    improvementAreas: string[];
  };
  vitalSignsSummary: {
    heartRate: {
      average: number;
      range: { min: number; max: number };
      trend: string;
      clinicalStatus: string;
    };
    sleepMetrics: {
      averageDuration: number;
      qualityScore: number;
      consistencyRating: string;
    };
    activityLevel: {
      dailySteps: number;
      weeklyExercise: number;
      fitnessCategory: string;
    };
  };
  riskAssessment: {
    cardiovascularRisk: {
      level: string;
      factors: string[];
      recommendations: string[];
    };
    metabolicRisk: {
      level: string;
      factors: string[];
      recommendations: string[];
    };
    mentalHealthRisk: {
      level: string;
      factors: string[];
      recommendations: string[];
    };
  };
  recommendedActions: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    referrals: string[];
  };
  dataQuality: {
    completeness: number;
    reliability: number;
    timespan: string;
    dataPoints: number;
  };
}

interface SharingOptions {
  qrCode: string;
  directEmailLink: string;
  secureDownloadLink: string;
  expirationDate: string;
}

export default function MedicalDocumentationPanel() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedFormat, setSelectedFormat] = useState<'physician' | 'patient' | 'summary'>('physician');
  const [showSharingOptions, setShowSharingOptions] = useState(false);
  const { toast } = useToast();

  // Generate physician report
  const generateReportMutation = useMutation({
    mutationFn: async ({ timeframe, format }: { timeframe: string; format: string }) => {
      const response = await apiRequest('POST', '/api/medical-report/generate', { timeframe, format });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Medical Report Generated",
        description: "Your physician-ready report has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate medical report. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Download PDF report
  const downloadPDFMutation = useMutation({
    mutationFn: async ({ reportId, format }: { reportId: string; format: string }) => {
      const response = await apiRequest('GET', `/api/medical-report/${reportId}/pdf?format=${format}`);
      return response.blob();
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `medical-report-${variables.format}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your medical report PDF is downloading.",
      });
    }
  });

  // Get sharing options
  const getSharingOptionsMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest('POST', `/api/medical-report/${reportId}/sharing`);
      return response.json();
    },
    onSuccess: () => {
      setShowSharingOptions(true);
    }
  });

  // Sample report data for display
  const sampleReport: PhysicianReport = {
    reportId: 'PHY-1703123456789',
    generatedAt: new Date().toISOString(),
    reportPeriod: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    patientSummary: {
      demographics: {
        age: 32,
        gender: 'Non-binary',
        contact: 'user@healthmap.com'
      },
      primaryConcerns: ['Digital health monitoring', 'Wellness optimization', 'Preventive care'],
      currentMedications: ['No medications reported'],
      allergies: ['No known allergies'],
      medicalHistory: ['No significant medical history reported']
    },
    keyFindings: {
      criticalAlerts: [],
      significantTrends: [
        'Heart rate variability showing consistent improvement over 30-day period',
        'Sleep quality demonstrating stable patterns with 7.2-hour average duration',
        'Physical activity levels meeting recommended guidelines (8,400 daily steps average)'
      ],
      anomalies: [
        'Occasional elevated stress readings during weekday afternoons (2-4 PM)',
        'Weekend sleep schedule variance of ±1.5 hours from weekday pattern'
      ],
      improvementAreas: [
        'Hydration consistency could be enhanced (current: 6.2 glasses/day)',
        'Weekend activity levels 23% below weekday averages',
        'Evening screen time occasionally exceeds sleep hygiene recommendations'
      ]
    },
    vitalSignsSummary: {
      heartRate: {
        average: 72,
        range: { min: 58, max: 89 },
        trend: 'stable',
        clinicalStatus: 'normal'
      },
      sleepMetrics: {
        averageDuration: 7.2,
        qualityScore: 82,
        consistencyRating: 'good'
      },
      activityLevel: {
        dailySteps: 8400,
        weeklyExercise: 4,
        fitnessCategory: 'moderately active'
      }
    },
    riskAssessment: {
      cardiovascularRisk: {
        level: 'low-moderate',
        factors: ['Occasional sedentary periods during work hours', 'Stress response patterns during high workload'],
        recommendations: ['Increase regular cardio exercise to 150+ minutes/week', 'Implement stress management techniques', 'Consider standing desk or movement breaks']
      },
      metabolicRisk: {
        level: 'low',
        factors: ['No significant metabolic risk factors identified'],
        recommendations: ['Maintain current dietary patterns', 'Continue regular monitoring', 'Focus on hydration consistency']
      },
      mentalHealthRisk: {
        level: 'low-moderate',
        factors: ['Periodic stress elevation during work periods', 'Variable sleep schedule on weekends'],
        recommendations: ['Maintain work-life balance', 'Consider stress reduction activities', 'Establish consistent sleep routine']
      }
    },
    recommendedActions: {
      immediate: [
        'Continue current health monitoring routine',
        'Address hydration consistency',
        'Implement afternoon stress management'
      ],
      shortTerm: [
        'Increase cardiovascular exercise frequency to 5x/week',
        'Establish weekend sleep consistency protocol',
        'Optimize evening routine for sleep hygiene'
      ],
      longTerm: [
        'Establish comprehensive wellness program',
        'Consider quarterly health assessments',
        'Develop preventive care optimization strategy'
      ],
      referrals: [
        'Consider nutritionist consultation for hydration and dietary optimization',
        'Sleep specialist consultation if weekend sleep irregularity persists',
        'Stress management counselor for workplace stress optimization'
      ]
    },
    dataQuality: {
      completeness: 87.5,
      reliability: 94.2,
      timespan: 'month',
      dataPoints: 342
    }
  };

  const sampleSharingOptions: SharingOptions = {
    qrCode: 'https://healthmap.platform.com/medical-report/PHY-1703123456789?token=secure_token_here',
    directEmailLink: 'mailto:doctor@example.com?subject=Patient Health Report&body=Please find the secure medical report at: https://healthmap.platform.com/medical-report/PHY-1703123456789?token=secure_token_here',
    secureDownloadLink: 'https://healthmap.platform.com/download-report/PHY-1703123456789?token=secure_token_here',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  const handleGenerateReport = () => {
    generateReportMutation.mutate({ timeframe: selectedTimeframe, format: selectedFormat });
  };

  const handleDownloadPDF = () => {
    downloadPDFMutation.mutate({ reportId: sampleReport.reportId, format: selectedFormat });
  };

  const handleGetSharingOptions = () => {
    getSharingOptionsMutation.mutate(sampleReport.reportId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Link has been copied to your clipboard.",
    });
  };

  const getRiskLevelColor = (level: string) => {
    if (level.includes('low')) return 'text-green-600 bg-green-50 border-green-200';
    if (level.includes('moderate')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (level.includes('high')) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Shield className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <span>Medical Documentation</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate FHIR-compliant reports for healthcare professionals
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {getComplianceIcon('compliant')}
            <span className="ml-1">FHIR Compliant</span>
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Shield className="h-4 w-4 mr-1" />
            <span>HIPAA Ready</span>
          </Badge>
        </div>
      </div>

      {/* Report Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Generate Medical Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Report Period
              </label>
              <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Report Format
              </label>
              <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physician">Physician Report</SelectItem>
                  <SelectItem value="patient">Patient Summary</SelectItem>
                  <SelectItem value="summary">Executive Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Actions
              </label>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={downloadPDFMutation.isPending}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Medical-Grade Documentation
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  FHIR-compliant • HIPAA ready • Physician optimized
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleGetSharingOptions}>
              <Share2 className="h-4 w-4 mr-2" />
              Share with Doctor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview">Report Preview</TabsTrigger>
          <TabsTrigger value="timeline">Health Timeline</TabsTrigger>
          <TabsTrigger value="sharing">Doctor Sharing</TabsTrigger>
          <TabsTrigger value="compliance">FHIR Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          {/* Report Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Patient Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Demographics</p>
                  <p className="font-medium">
                    Age {sampleReport.patientSummary.demographics.age}, {sampleReport.patientSummary.demographics.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Primary Concerns</p>
                  <ul className="text-sm space-y-1">
                    {sampleReport.patientSummary.primaryConcerns.map((concern, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data Quality</p>
                  <div className="text-sm">
                    <span className="font-medium">{sampleReport.dataQuality.completeness}%</span> complete
                    <span className="mx-2">•</span>
                    <span className="font-medium">{sampleReport.dataQuality.dataPoints}</span> data points
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Vital Signs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Heart Rate</p>
                    <p className="text-lg font-bold">{sampleReport.vitalSignsSummary.heartRate.average} bpm</p>
                    <p className="text-xs text-gray-500">
                      Range: {sampleReport.vitalSignsSummary.heartRate.range.min}-{sampleReport.vitalSignsSummary.heartRate.range.max}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sleep</p>
                    <p className="text-lg font-bold">{sampleReport.vitalSignsSummary.sleepMetrics.averageDuration}h</p>
                    <p className="text-xs text-gray-500">
                      Quality: {sampleReport.vitalSignsSummary.sleepMetrics.qualityScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Activity</p>
                    <p className="text-lg font-bold">{sampleReport.vitalSignsSummary.activityLevel.dailySteps.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">steps/day avg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Exercise</p>
                    <p className="text-lg font-bold">{sampleReport.vitalSignsSummary.activityLevel.weeklyExercise}x</p>
                    <p className="text-xs text-gray-500">sessions/week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Risk Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded-lg border ${getRiskLevelColor(sampleReport.riskAssessment.cardiovascularRisk.level)}`}>
                  <p className="font-medium">Cardiovascular Risk</p>
                  <p className="text-sm capitalize">{sampleReport.riskAssessment.cardiovascularRisk.level}</p>
                </div>
                <div className={`p-3 rounded-lg border ${getRiskLevelColor(sampleReport.riskAssessment.metabolicRisk.level)}`}>
                  <p className="font-medium">Metabolic Risk</p>
                  <p className="text-sm capitalize">{sampleReport.riskAssessment.metabolicRisk.level}</p>
                </div>
                <div className={`p-3 rounded-lg border ${getRiskLevelColor(sampleReport.riskAssessment.mentalHealthRisk.level)}`}>
                  <p className="font-medium">Mental Health Risk</p>
                  <p className="text-sm capitalize">{sampleReport.riskAssessment.mentalHealthRisk.level}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Key Clinical Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Significant Trends
                </h4>
                <ul className="space-y-1">
                  {sampleReport.keyFindings.significantTrends.map((trend, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                      <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {sampleReport.keyFindings.anomalies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-600 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Notable Anomalies
                  </h4>
                  <ul className="space-y-1">
                    {sampleReport.keyFindings.anomalies.map((anomaly, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{anomaly}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Improvement Opportunities
                </h4>
                <ul className="space-y-1">
                  {sampleReport.keyFindings.improvementAreas.map((area, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-red-600 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Immediate Actions
                  </h4>
                  <ul className="space-y-2">
                    {sampleReport.recommendedActions.immediate.map((action, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-yellow-600 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Short-term (1-3 months)
                  </h4>
                  <ul className="space-y-2">
                    {sampleReport.recommendedActions.shortTerm.map((action, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Long-term (3+ months)
                  </h4>
                  <ul className="space-y-2">
                    {sampleReport.recommendedActions.longTerm.map((action, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {sampleReport.recommendedActions.referrals.length > 0 && (
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-purple-600 mb-2">Specialist Referrals</h4>
                  <ul className="space-y-1">
                    {sampleReport.recommendedActions.referrals.map((referral, index) => (
                      <li key={index} className="text-sm text-purple-700 dark:text-purple-300 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{referral}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {/* Health Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>30-Day Health Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '2024-01-20', event: 'Cardiovascular Assessment', type: 'measurement', value: 'Heart rate: 72 bpm, HRV: 45ms', status: 'normal' },
                  { date: '2024-01-18', event: 'Sleep Quality Analysis', type: 'measurement', value: 'Duration: 7.5h, Quality: 85%', status: 'good' },
                  { date: '2024-01-15', event: 'Physical Activity Report', type: 'measurement', value: '8,400 steps, 45min exercise', status: 'good' },
                  { date: '2024-01-12', event: 'Stress Level Alert', type: 'alert', value: 'Elevated stress during afternoon', status: 'attention' },
                  { date: '2024-01-10', event: 'Hydration Tracking', type: 'lifestyle', value: '6.2 glasses/day average', status: 'low' },
                  { date: '2024-01-08', event: 'Weight Measurement', type: 'measurement', value: '165 lbs (stable)', status: 'normal' },
                  { date: '2024-01-05', event: 'Blood Pressure Check', type: 'measurement', value: '118/76 mmHg', status: 'optimal' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 border-l-4 border-blue-200 bg-gray-50 dark:bg-gray-800 rounded-r-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'optimal' ? 'bg-green-500' :
                        item.status === 'good' ? 'bg-blue-500' :
                        item.status === 'normal' ? 'bg-gray-500' :
                        item.status === 'attention' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.event}</h4>
                        <span className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.value}</p>
                      <Badge className={`mt-2 ${
                        item.status === 'optimal' ? 'bg-green-100 text-green-800' :
                        item.status === 'good' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'normal' ? 'bg-gray-100 text-gray-800' :
                        item.status === 'attention' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          {/* Doctor Sharing Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>QR Code Sharing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                  <QrCode className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    QR code for secure report access
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Expires: {new Date(sampleSharingOptions.expirationDate).toLocaleDateString()}
                  </p>
                </div>
                <Button className="w-full" onClick={() => copyToClipboard(sampleSharingOptions.qrCode)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy QR Link
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Direct Email Sharing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Email Template Ready
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Pre-formatted email with secure download link and patient summary
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => window.open(sampleSharingOptions.directEmailLink)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Open Email Client
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => copyToClipboard(sampleSharingOptions.secureDownloadLink)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Secure Link
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Encrypted Transfer</p>
                    <p className="text-sm text-gray-600">End-to-end encryption</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Auto Expiration</p>
                    <p className="text-sm text-gray-600">7-day secure access</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">HIPAA Compliant</p>
                    <p className="text-sm text-gray-600">Healthcare ready</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Important:</strong> Shared links contain protected health information (PHI). 
                  Only share with authorized healthcare professionals. Links automatically expire after 7 days 
                  and are protected by secure tokens for privacy compliance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* FHIR Compliance Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>FHIR R4 Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Patient Resource</span>
                    <Badge className="bg-green-100 text-green-800">✓ Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Observation Resource</span>
                    <Badge className="bg-green-100 text-green-800">✓ Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DiagnosticReport Resource</span>
                    <Badge className="bg-green-100 text-green-800">✓ Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">LOINC Coding</span>
                    <Badge className="bg-green-100 text-green-800">✓ Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SNOMED CT Terms</span>
                    <Badge className="bg-green-100 text-green-800">✓ Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Security Standards</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HIPAA Compliance</span>
                    <Badge className="bg-green-100 text-green-800">✓ Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Encryption</span>
                    <Badge className="bg-green-100 text-green-800">✓ AES-256</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Access Controls</span>
                    <Badge className="bg-green-100 text-green-800">✓ Implemented</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Logging</span>
                    <Badge className="bg-green-100 text-green-800">✓ Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Minimization</span>
                    <Badge className="bg-green-100 text-green-800">✓ Applied</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Implementation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">FHIR Resource Mapping</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Patient:</strong> Demographics, identifiers, contact information</p>
                    <p><strong>Observation:</strong> Vital signs, measurements, assessments</p>
                    <p><strong>DiagnosticReport:</strong> Comprehensive health analysis</p>
                    <p><strong>Condition:</strong> Health conditions and risk factors</p>
                    <p><strong>CarePlan:</strong> Treatment recommendations and goals</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Data Standards</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>LOINC:</strong> Laboratory and clinical observations</p>
                    <p><strong>SNOMED CT:</strong> Clinical terminology</p>
                    <p><strong>ICD-10:</strong> Diagnosis and condition coding</p>
                    <p><strong>UCUM:</strong> Units of measure</p>
                    <p><strong>HL7:</strong> Healthcare data exchange standards</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Interoperability:</strong> Reports generated in FHIR R4 format are compatible with 
                  major electronic health record (EHR) systems including Epic, Cerner, Allscripts, and others. 
                  Data can be easily imported into healthcare provider workflows.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}