import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from "@tanstack/react-query";
import { 
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  X,
  Eye,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Risk Alert Card Component
 * Displays active health alerts prominently at the top of dashboard
 */
export function RiskAlertCard({ userId, className = "" }) {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const { toast } = useToast();

  // Fetch active alerts with real-time updates
  const { data: alertsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/risk/alerts', 'active'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/risk/alerts?severity=all');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    enabled: !!userId
  });

  // Filter out dismissed alerts and only show active ones
  const activeAlerts = alertsData?.alerts?.filter(alert => 
    alert.status === 'active' && 
    !dismissedAlerts.has(alert.alert_id)
  ) || [];

  // Separate alerts by severity
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning');
  const infoAlerts = activeAlerts.filter(alert => alert.severity === 'info');

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    toast({
      title: "Alert Dismissed",
      description: "Alert has been temporarily hidden from dashboard"
    });
  };

  const getAlertIcon = (metricName) => {
    switch (metricName) {
      case 'heart_rate':
      case 'heart_rate_variability':
        return <Heart className="h-5 w-5" />;
      case 'blood_oxygen':
        return <Droplets className="h-5 w-5" />;
      case 'body_temperature':
        return <Thermometer className="h-5 w-5" />;
      case 'blood_pressure':
        return <Activity className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-300',
          badge: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-300',
          badge: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-300',
          badge: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-800 dark:text-gray-300',
          badge: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  // Don't render if no active alerts or still loading
  if (isLoading || activeAlerts.length === 0) {
    return null;
  }

  // Determine primary alert to display (highest severity)
  const primaryAlert = criticalAlerts[0] || warningAlerts[0] || infoAlerts[0];
  const colors = getSeverityColor(primaryAlert.severity);
  const totalAlerts = activeAlerts.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card className={`${colors.bg} ${colors.border} border-2`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${colors.badge}`}>
                  {getAlertIcon(primaryAlert.metric_name)}
                </div>
                <div>
                  <CardTitle className={`${colors.text} text-lg`}>
                    Health Alert: {primaryAlert.metric_display_name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={colors.badge}>
                      {primaryAlert.severity.toUpperCase()}
                    </Badge>
                    {totalAlerts > 1 && (
                      <Badge variant="outline">
                        +{totalAlerts - 1} more alert{totalAlerts > 2 ? 's' : ''}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(primaryAlert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismissAlert(primaryAlert.alert_id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className={`${colors.text}`}>
                <p className="font-medium mb-1">
                  Current Value: {primaryAlert.current_value} {primaryAlert.unit}
                </p>
                <p className="text-sm">
                  {primaryAlert.reason}
                </p>
              </div>

              {primaryAlert.requires_action && (
                <div className={`p-3 rounded-lg ${colors.badge} bg-opacity-50`}>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    ⚠️ Action Required: Please review this alert and consider appropriate measures.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Link href="/dashboard?tab=alerts">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    View All Alerts
                  </Button>
                </Link>
                
                <Link href="/risk-detection">
                  <Button size="sm" className="flex items-center">
                    Risk Dashboard
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* Show summary of other alerts if multiple exist */}
              {totalAlerts > 1 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Other active alerts:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeAlerts.slice(1, 4).map((alert) => (
                      <Badge
                        key={alert.alert_id}
                        variant="outline"
                        className="text-xs"
                      >
                        {alert.metric_display_name}
                      </Badge>
                    ))}
                    {totalAlerts > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{totalAlerts - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact Risk Alert Badge Component
 * For use in navigation or header areas
 */
export function RiskAlertBadge({ userId, onClick }) {
  const { data: alertsData } = useQuery({
    queryKey: ['/api/risk/alerts', 'badge'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/risk/alerts?severity=all');
      return res.json();
    },
    refetchInterval: 30000,
    enabled: !!userId
  });

  const activeAlerts = alertsData?.alerts?.filter(alert => alert.status === 'active') || [];
  const criticalCount = activeAlerts.filter(alert => alert.severity === 'critical').length;
  const totalCount = activeAlerts.length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AlertTriangle 
        className={`h-5 w-5 ${
          criticalCount > 0 ? 'text-red-500' : 'text-orange-500'
        }`} 
      />
      <motion.span
        className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-medium flex items-center justify-center text-white ${
          criticalCount > 0 ? 'bg-red-500' : 'bg-orange-500'
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {totalCount > 9 ? '9+' : totalCount}
      </motion.span>
    </motion.button>
  );
}

export default RiskAlertCard;