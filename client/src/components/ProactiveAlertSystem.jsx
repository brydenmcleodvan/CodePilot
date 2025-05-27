import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Shield,
  AlertTriangle,
  Heart,
  Brain,
  Activity,
  Thermometer,
  Clock,
  TrendingUp,
  TrendingDown,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  Info,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Proactive Alert & Risk System Component
 * Real-time health monitoring with intervention alerts
 */
export function ProactiveAlertSystem() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch current alerts
  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['/api/alerts/current'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/alerts/current');
      return res.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch risk scores
  const { data: riskData } = useQuery({
    queryKey: ['/api/alerts/risk-scores'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/alerts/risk-scores');
      return res.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch alert history
  const { data: historyData } = useQuery({
    queryKey: ['/api/alerts/history'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/alerts/history');
      return res.json();
    }
  });

  // Dismiss alert mutation
  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      const res = await apiRequest('POST', `/api/alerts/${alertId}/dismiss`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/alerts/current']);
      toast({
        title: "Alert Dismissed",
        description: "The alert has been marked as acknowledged."
      });
    }
  });

  const alerts = alertsData?.alerts || [];
  const riskScores = riskData?.risk_scores || {};
  const alertHistory = historyData?.history || [];
  const isDark = effectiveTheme === 'dark';

  const riskCategories = [
    {
      id: 'burnout_risk',
      name: 'Burnout Risk',
      icon: Brain,
      description: 'Overall stress and exhaustion assessment'
    },
    {
      id: 'cardiovascular_risk',
      name: 'Heart Health',
      icon: Heart,
      description: 'Cardiovascular system monitoring'
    },
    {
      id: 'mental_health_risk',
      name: 'Mental Wellness',
      icon: Brain,
      description: 'Emotional and psychological wellbeing'
    },
    {
      id: 'metabolic_risk',
      name: 'Metabolic Health',
      icon: Activity,
      description: 'Metabolism and energy processing'
    }
  ];

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
          <Shield className="h-8 w-8 text-green-600" />
          <span>Health Safety Net</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Your proactive health monitoring system watches over your wellbeing 24/7, 
          detecting risks and alerting you before problems become serious.
        </p>
      </div>

      {/* System Status */}
      <Card className={`border-2 ${alertsEnabled ? 'border-green-200 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-800 dark:to-blue-900/20' : 'border-gray-200'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${alertsEnabled ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Shield className={`h-8 w-8 ${alertsEnabled ? 'text-green-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {alertsEnabled ? 'Monitoring Active' : 'Monitoring Paused'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {alertsEnabled ? 'Your health is being continuously monitored' : 'Health monitoring is currently disabled'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {alerts.length} Active Alerts
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(riskScores).length} Risk Factors Tracked
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Enable Alerts</p>
                <Switch 
                  checked={alertsEnabled} 
                  onCheckedChange={setAlertsEnabled}
                />
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Active Health Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <ActiveAlert 
                  key={alert.id || index} 
                  alert={alert}
                  onDismiss={(alertId) => dismissAlertMutation.mutate(alertId)}
                />
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Risk Scores Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskCategories.map((category) => {
          const risk = riskScores[category.id];
          return (
            <RiskScoreCard
              key={category.id}
              category={category}
              risk={risk}
            />
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Risk Overview</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <RiskOverviewPanel riskScores={riskScores} />
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <AlertRulesPanel />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <AlertHistoryPanel history={alertHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Active Alert Component
 */
function ActiveAlert({ alert, onDismiss }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      case 'low': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium': return <Info className="h-5 w-5 text-orange-600" />;
      case 'low': return <Bell className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getSeverityIcon(alert.severity)}
          <div className="flex-1">
            <h4 className="font-semibold">{alert.rule_name || 'Health Alert'}</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {alert.message}
            </p>
            
            {alert.data && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(alert.data).map(([key, value]) => (
                    <span key={key} className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      {key.replace('_', ' ')}: {typeof value === 'number' ? value.toFixed(1) : value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {alert.context?.suggested_actions && (
              <div className="mt-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  Suggested Action: {alert.context.suggested_actions[0]}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs ${
            alert.severity === 'high' ? 'bg-red-100 text-red-800' :
            alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {alert.severity} priority
          </Badge>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDismiss(alert.id)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Risk Score Card Component
 */
function RiskScoreCard({ category, risk }) {
  if (!risk) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <category.icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-500">{category.name}</h3>
          <p className="text-sm text-gray-400 mt-1">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <category.icon className={`h-6 w-6 ${
            risk.level === 'high' ? 'text-red-600' :
            risk.level === 'medium' ? 'text-orange-600' :
            'text-green-600'
          }`} />
          <Badge className={getRiskColor(risk.level)}>
            {risk.level} risk
          </Badge>
        </div>
        
        <h3 className="font-semibold mb-1">{category.name}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {category.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Risk Score</span>
            <span className="font-medium">{Math.round(risk.score * 100)}%</span>
          </div>
          <Progress 
            value={risk.score * 100} 
            className={`h-2 ${
              risk.level === 'high' ? '[&>div]:bg-red-500' :
              risk.level === 'medium' ? '[&>div]:bg-orange-500' :
              '[&>div]:bg-green-500'
            }`}
          />
        </div>
        
        {risk.recommendations && risk.recommendations.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 {risk.recommendations[0]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Risk Overview Panel
 */
function RiskOverviewPanel({ riskScores }) {
  const overallRisk = Object.values(riskScores).reduce((max, risk) => {
    const scoreValue = risk?.score || 0;
    return scoreValue > max ? scoreValue : max;
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Health Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
              overallRisk > 0.7 ? 'bg-red-100 dark:bg-red-900/20' :
              overallRisk > 0.4 ? 'bg-orange-100 dark:bg-orange-900/20' :
              'bg-green-100 dark:bg-green-900/20'
            }`}>
              <span className={`text-2xl font-bold ${
                overallRisk > 0.7 ? 'text-red-600' :
                overallRisk > 0.4 ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {Math.round(overallRisk * 100)}
              </span>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold">
                {overallRisk > 0.7 ? 'High Risk' :
                 overallRisk > 0.4 ? 'Medium Risk' :
                 'Low Risk'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {overallRisk > 0.7 ? 'Consider immediate attention to high-risk areas' :
                 overallRisk > 0.4 ? 'Monitor key risk factors closely' :
                 'Your health metrics look good overall'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(riskScores).map(([riskType, risk]) => (
          <Card key={riskType}>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 capitalize">
                {riskType.replace('_', ' ')}
              </h4>
              
              {risk.factors && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Contributing Factors:</p>
                  {Object.entries(risk.factors).slice(0, 3).map(([factor, value]) => (
                    <div key={factor} className="flex justify-between text-xs">
                      <span>{factor.replace('_', ' ')}</span>
                      <span className={value > 0.7 ? 'text-red-600' : value > 0.4 ? 'text-orange-600' : 'text-green-600'}>
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Alert Rules Panel
 */
function AlertRulesPanel() {
  const alertRules = [
    { name: 'Heart Rate Anomaly', type: 'cardiovascular', enabled: true, severity: 'high' },
    { name: 'HRV Decline', type: 'cardiovascular', enabled: true, severity: 'medium' },
    { name: 'Sleep Disruption', type: 'sleep', enabled: true, severity: 'medium' },
    { name: 'Mood Decline', type: 'mental_health', enabled: true, severity: 'high' },
    { name: 'Stress Elevation', type: 'mental_health', enabled: true, severity: 'medium' },
    { name: 'Blood Pressure Alert', type: 'vitals', enabled: true, severity: 'high' }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Alert Rule Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{rule.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{rule.type.replace('_', ' ')}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={
                    rule.severity === 'high' ? 'bg-red-100 text-red-800' :
                    rule.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {rule.severity}
                  </Badge>
                  <Switch checked={rule.enabled} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Alert History Panel
 */
function AlertHistoryPanel({ history }) {
  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Alert History</h3>
            <p className="text-gray-600">
              Your alert history will appear here as the system monitors your health.
            </p>
          </CardContent>
        </Card>
      ) : (
        history.map((alert, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{alert.rule_name}</h4>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <Badge className={
                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {alert.severity}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default ProactiveAlertSystem;