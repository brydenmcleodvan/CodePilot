import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Shield,
  FileText,
  Clock,
  Users,
  Target
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface HealthScoreBreakdown {
  metricType: string;
  currentValue: number;
  normalizedScore: number;
  weight: number;
  contribution: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'caution';
  severity: 'emergency' | 'urgent' | 'moderate' | 'mild';
  metricType: string;
  currentValue: number;
  message: string;
  recommendation: string;
  requiresImmediateAction: boolean;
}

interface HealthScoreReport {
  overallScore: number;
  category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  breakdown: HealthScoreBreakdown[];
  trends: {
    weeklyChange: number;
    monthlyChange: number;
    direction: 'improving' | 'stable' | 'declining';
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    message: string;
    expectedImpact: string;
  }>;
}

interface RiskAssessment {
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  activeAlerts: HealthAlert[];
  riskFactors: Array<{
    factor: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    modifiable: boolean;
  }>;
}

export default function SummaryTab() {
  const { user } = useAuth();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch health score
  const { data: healthScore, isLoading: scoreLoading } = useQuery<HealthScoreReport>({
    queryKey: ["/api/health-score"],
    enabled: !!user,
  });

  // Fetch risk assessment and alerts
  const { data: riskAssessment, isLoading: riskLoading } = useQuery<RiskAssessment>({
    queryKey: ["/api/risk-assessment"],
    enabled: !!user,
  });

  // Fetch population comparison
  const { data: populationData } = useQuery({
    queryKey: ["/api/population-comparison"],
    enabled: !!user,
  });

  const handleDownloadReport = async () => {
    if (!user) return;
    
    setIsGeneratingReport(true);
    try {
      const response = await fetch('/api/doctor-report/pdf', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const reportData = await response.json();
        
        // Create and download the report
        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
          type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-yellow-600";
    if (score >= 40) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertSeverityBadge = (alert: HealthAlert) => {
    const variants = {
      emergency: "destructive",
      urgent: "destructive",
      moderate: "default",
      mild: "secondary"
    } as const;

    return (
      <Badge variant={variants[alert.severity] || "secondary"}>
        {alert.severity.toUpperCase()}
      </Badge>
    );
  };

  if (scoreLoading || riskLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const criticalAlerts = riskAssessment?.activeAlerts?.filter(a => a.type === 'critical') || [];
  const warningAlerts = riskAssessment?.activeAlerts?.filter(a => a.type === 'warning') || [];

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Health Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Health Score Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className={`text-5xl font-bold ${getScoreColor(healthScore?.overallScore || 0)}`}>
                  {healthScore?.overallScore || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  {healthScore?.category?.toUpperCase() || 'N/A'}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getTrendIcon(healthScore?.trends?.direction || 'stable')}
                <span className="text-sm text-muted-foreground">
                  {healthScore?.trends?.direction || 'stable'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-4">
              <Progress 
                value={healthScore?.overallScore || 0} 
                className="h-3"
              />
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r ${getScoreGradient(healthScore?.overallScore || 0)}`}
                style={{ width: `${healthScore?.overallScore || 0}%` }}
              />
            </div>

            {/* Score Breakdown */}
            {healthScore?.breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {healthScore.breakdown.slice(0, 6).map((metric) => (
                  <div key={metric.metricType} className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      {metric.metricType.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className={`text-lg font-semibold ${getScoreColor(metric.normalizedScore)}`}>
                      {Math.round(metric.normalizedScore)}
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Alerts */}
      <AnimatePresence>
        {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Health Alerts
                  <Badge variant="secondary">{criticalAlerts.length + warningAlerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Critical Alerts */}
                  {criticalAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getAlertSeverityBadge(alert)}
                          <span className="font-medium text-red-800 dark:text-red-200">
                            {alert.metricType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {alert.message}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Warning Alerts */}
                  {warningAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                    >
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getAlertSeverityBadge(alert)}
                          <span className="font-medium text-amber-800 dark:text-amber-200">
                            {alert.metricType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {alert.message}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Assessment Summary */}
      {riskAssessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Overall Risk Level</span>
                <Badge 
                  variant={
                    riskAssessment.overallRiskLevel === 'critical' ? 'destructive' :
                    riskAssessment.overallRiskLevel === 'high' ? 'destructive' :
                    riskAssessment.overallRiskLevel === 'moderate' ? 'default' : 'secondary'
                  }
                >
                  {riskAssessment.overallRiskLevel.toUpperCase()}
                </Badge>
              </div>

              {riskAssessment.riskFactors?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Risk Factors</h4>
                  {riskAssessment.riskFactors.slice(0, 3).map((factor, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{factor.factor}</span>
                      <Badge variant={factor.severity === 'high' ? 'destructive' : 'secondary'}>
                        {factor.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Population Comparison */}
      {populationData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Population Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {populationData.overallPercentile || 'N/A'}th
                  </div>
                  <div className="text-xs text-muted-foreground">Percentile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {populationData.ageGroupRanking || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Age Group Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor Report Export */}
              <Button
                onClick={handleDownloadReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center gap-2">
                  {isGeneratingReport ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  <div className="text-left">
                    <div className="font-medium">
                      {isGeneratingReport ? 'Generating...' : 'Download Medical Report'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PDF ready for physician sharing
                    </div>
                  </div>
                </div>
              </Button>

              {/* View Clinical Assessment */}
              <Button
                onClick={() => window.open('/api/clinical-assessment', '_blank')}
                className="flex items-center gap-2 h-auto p-4"
                variant="outline"
              >
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Clinical Assessment</div>
                  <div className="text-xs text-muted-foreground">
                    View detailed medical analysis
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      {healthScore?.recommendations && healthScore.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthScore.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                      className="mt-0.5"
                    >
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{rec.category}</div>
                      <div className="text-sm text-muted-foreground mt-1">{rec.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <strong>Expected Impact:</strong> {rec.expectedImpact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}