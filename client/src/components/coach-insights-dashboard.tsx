import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Target,
  Calendar,
  MessageSquare,
  FileText,
  Activity,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ClientOverview {
  userId: number;
  username: string;
  email: string;
  enrollmentDate: string;
  lastActive: string;
  coachingPlan: string;
  riskLevel: 'low' | 'medium' | 'high';
  overallAdherence: number;
  activeGoals: number;
  completedGoals: number;
  currentStreak: number;
  weeklyEngagement: number;
}

interface CoachDashboardData {
  overview: {
    totalClients: number;
    activeClients: number;
    atRiskClients: number;
    avgAdherence: number;
    weeklyGoalsCompleted: number;
    upcomingCheckIns: number;
  };
  recentActivity: {
    timestamp: string;
    clientName: string;
    action: string;
    status: 'positive' | 'neutral' | 'concerning';
  }[];
  focusAreas: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    clientsAffected: number;
    suggestedActions: string[];
    expectedOutcome: string;
    timeframe: string;
  }[];
  clientAlerts: {
    clientId: number;
    clientName: string;
    alertType: 'missed_checkin' | 'low_adherence' | 'declining_trend' | 'goal_achieved';
    message: string;
    urgency: 'high' | 'medium' | 'low';
    timestamp: string;
  }[];
}

interface WeeklyReview {
  clientId: number;
  weekRange: { start: string; end: string };
  summary: string;
  achievements: string[];
  challenges: string[];
  recommendations: string[];
  nextWeekFocus: string[];
  adherenceScore: number;
  moodTrend: string;
  engagementLevel: 'high' | 'medium' | 'low';
  coachNotes?: string;
}

export default function CoachInsightsDashboard() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch coach dashboard data
  const { data: dashboardData, isLoading } = useQuery<CoachDashboardData>({
    queryKey: ['/api/coach/dashboard'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch client list
  const { data: clients = [] } = useQuery<ClientOverview[]>({
    queryKey: ['/api/coach/clients'],
  });

  // Fetch weekly review for selected client
  const { data: weeklyReview } = useQuery<WeeklyReview>({
    queryKey: ['/api/coach/weekly-review', selectedClient],
    enabled: !!selectedClient,
  });

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'positive': return 'text-green-600';
      case 'concerning': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <span>Coach Insights Dashboard</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor client progress, adherence patterns, and generate weekly reviews
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {dashboardData.overview.totalClients}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardData.overview.activeClients}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">At Risk</p>
                    <p className="text-3xl font-bold text-red-600">
                      {dashboardData.overview.atRiskClients}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Adherence</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {dashboardData.overview.avgAdherence}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Details</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Focus</TabsTrigger>
          <TabsTrigger value="reviews">Weekly Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Client Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData?.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'positive' ? 'bg-green-500' :
                      activity.status === 'concerning' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.clientName}
                      </p>
                      <p className={`text-sm ${getStatusColor(activity.status)}`}>
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Focus Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.focusAreas.slice(0, 3).map((area, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(area.priority)}
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {area.title}
                        </h4>
                      </div>
                      <Badge className={getRiskLevelColor(area.priority)}>
                        {area.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {area.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      {area.clientsAffected} clients affected • {area.timeframe}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Client Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {clients.map((client) => (
                    <motion.div
                      key={client.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedClient === client.userId ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20' : ''
                      }`}
                      onClick={() => setSelectedClient(client.userId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {client.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {client.username}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {client.coachingPlan}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {client.overallAdherence}%
                          </div>
                          <Badge className={getRiskLevelColor(client.riskLevel)}>
                            {client.riskLevel} risk
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Goals:</span>
                          <span className="ml-1 font-medium">{client.activeGoals}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Streak:</span>
                          <span className="ml-1 font-medium">{client.currentStreak}d</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Active:</span>
                          <span className="ml-1 font-medium">{formatTimeAgo(client.lastActive)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress value={client.overallAdherence} className="h-2" />
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Client Details */}
            <div>
              {selectedClient ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Client Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clients.find(c => c.userId === selectedClient) && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <Avatar className="h-16 w-16 mx-auto mb-2">
                            <AvatarFallback className="text-lg">
                              {clients.find(c => c.userId === selectedClient)?.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">
                            {clients.find(c => c.userId === selectedClient)?.username}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {clients.find(c => c.userId === selectedClient)?.email}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Coaching Plan:</span>
                            <span className="font-medium">
                              {clients.find(c => c.userId === selectedClient)?.coachingPlan}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Enrollment:</span>
                            <span className="font-medium">
                              {new Date(clients.find(c => c.userId === selectedClient)?.enrollmentDate || '').toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Weekly Engagement:</span>
                            <span className="font-medium">
                              {clients.find(c => c.userId === selectedClient)?.weeklyEngagement}/7 days
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={() => setSelectedTab('reviews')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Weekly Review
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a client to view detailed information
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Client Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData?.clientAlerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border-l-4 rounded-lg ${getUrgencyColor(alert.urgency)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {alert.clientName}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                      <Badge className={getRiskLevelColor(alert.urgency)}>
                        {alert.urgency}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Focus Areas Detail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Recommended Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.focusAreas.map((area, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      {getPriorityIcon(area.priority)}
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {area.title}
                      </h4>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Suggested Actions:
                      </h5>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {area.suggestedActions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start space-x-2">
                            <span>•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                        <strong>Expected Outcome:</strong> {area.expectedOutcome}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {selectedClient && weeklyReview ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Weekly Review - {clients.find(c => c.userId === selectedClient)?.username}</span>
                  </div>
                  <Badge className={getEngagementColor(weeklyReview.engagementLevel)}>
                    {weeklyReview.engagementLevel} engagement
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    AI-Generated Summary
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {weeklyReview.summary}
                  </p>
                </div>

                {/* Adherence Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Weekly Adherence Score
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {weeklyReview.adherenceScore}%
                    </span>
                  </div>
                  <Progress value={weeklyReview.adherenceScore} className="h-2" />
                </div>

                {/* Achievements */}
                {weeklyReview.achievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Achievements
                    </h4>
                    <ul className="space-y-2">
                      {weeklyReview.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start space-x-2 text-green-700 dark:text-green-400">
                          <span>✓</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Challenges */}
                {weeklyReview.challenges.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                      Challenges
                    </h4>
                    <ul className="space-y-2">
                      {weeklyReview.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start space-x-2 text-orange-700 dark:text-orange-400">
                          <span>⚠</span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {weeklyReview.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2 text-blue-700 dark:text-blue-400">
                        <span>💡</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Week Focus */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                    Next Week Focus
                  </h4>
                  <ul className="space-y-2">
                    {weeklyReview.nextWeekFocus.map((focus, index) => (
                      <li key={index} className="flex items-start space-x-2 text-purple-700 dark:text-purple-400">
                        <span>🎯</span>
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Coach Notes */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-600" />
                    Coach Notes
                  </h4>
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                    placeholder="Add your personal coaching notes here..."
                    defaultValue={weeklyReview.coachNotes || ''}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Review
                  </Button>
                  <Button>
                    Save & Send to Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Generate Weekly Review
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a client from the Client Details tab to generate an AI-powered weekly review
                </p>
                <Button onClick={() => setSelectedTab('clients')}>
                  Select Client
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}