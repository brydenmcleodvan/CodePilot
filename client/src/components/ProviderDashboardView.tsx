import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, TrendingUp, TrendingDown, Users, Activity, Calendar, Search, Filter } from 'lucide-react';

interface PatientSummary {
  id: number;
  name: string;
  email: string;
  lastActive: string;
  riskFlags: string[];
  goalsCompleted: number;
  totalGoals: number;
  streakCount: number;
  healthScore: number;
  recentSymptoms: string[];
  missedAppointments: number;
}

interface ProviderAnalytics {
  totalPatients: number;
  activePatients: number;
  riskPatients: number;
  avgHealthScore: number;
  goalsCompletionRate: number;
  appointmentAttendanceRate: number;
  patientEngagementTrend: 'up' | 'down' | 'stable';
  recentAlerts: {
    id: string;
    patientName: string;
    type: 'risk' | 'missed_goal' | 'symptom' | 'appointment';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }[];
}

export default function ProviderDashboardView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const { data: analytics, isLoading: analyticsLoading } = useQuery<ProviderAnalytics>({
    queryKey: ['/api/provider/analytics'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: patients, isLoading: patientsLoading } = useQuery<PatientSummary[]>({
    queryKey: ['/api/provider/patients', searchTerm, riskFilter, sortBy],
    refetchInterval: 60000 // Refresh every minute
  });

  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (riskFilter === 'high-risk') {
      return matchesSearch && patient.riskFlags.length > 0;
    }
    if (riskFilter === 'low-engagement') {
      return matchesSearch && patient.goalsCompleted < patient.totalGoals * 0.5;
    }
    
    return matchesSearch;
  }) || [];

  const getRiskSeverity = (flags: string[]) => {
    if (flags.some(flag => flag.includes('critical'))) return 'high';
    if (flags.length > 2) return 'medium';
    if (flags.length > 0) return 'low';
    return 'none';
  };

  const getEngagementColor = (completed: number, total: number) => {
    const rate = total > 0 ? completed / total : 0;
    if (rate >= 0.8) return 'text-green-600';
    if (rate >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor patient health outcomes and engagement</p>
        </div>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Review
        </Button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.activePatients || 0} active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Patients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics?.riskPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgHealthScore?.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-green-600 flex items-center">
              {analytics?.patientEngagementTrend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
              {analytics?.patientEngagementTrend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
              {analytics?.patientEngagementTrend || 'stable'} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((analytics?.goalsCompletionRate || 0) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all patients
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">Patient Overview</TabsTrigger>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>Monitor and filter your patient roster</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search patients by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Patients</SelectItem>
                      <SelectItem value="high-risk">High Risk</SelectItem>
                      <SelectItem value="low-engagement">Low Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="risk">Risk Level</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="last-active">Last Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Patient List */}
              {patientsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading patient data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-semibold text-lg">{patient.name}</h3>
                                <p className="text-sm text-gray-600">{patient.email}</p>
                              </div>
                              {patient.riskFlags.length > 0 && (
                                <Badge variant={getRiskSeverity(patient.riskFlags) === 'high' ? 'destructive' : 'secondary'}>
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {getRiskSeverity(patient.riskFlags)} risk
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-gray-500">Goals Progress</p>
                                <p className={`font-semibold ${getEngagementColor(patient.goalsCompleted, patient.totalGoals)}`}>
                                  {patient.goalsCompleted}/{patient.totalGoals}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Current Streak</p>
                                <p className="font-semibold">{patient.streakCount} days</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Health Score</p>
                                <p className="font-semibold">{patient.healthScore}/100</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Last Active</p>
                                <p className="font-semibold">{patient.lastActive}</p>
                              </div>
                            </div>

                            {patient.recentSymptoms.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Recent Symptoms:</p>
                                <div className="flex flex-wrap gap-1">
                                  {patient.recentSymptoms.map((symptom, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {symptom}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              Send Message
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredPatients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No patients found matching your filters.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts & Notifications</CardTitle>
              <CardDescription>Stay informed about patient health events requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.recentAlerts?.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{alert.patientName}</p>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {alert.severity}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    No recent alerts. All patients are within normal parameters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Goal Completion Rate</span>
                    <span className="font-semibold">{((analytics?.goalsCompletionRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Appointment Attendance</span>
                    <span className="font-semibold">{((analytics?.appointmentAttendanceRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Patients</span>
                    <span className="font-semibold">{analytics?.activePatients || 0}/{analytics?.totalPatients || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>High Risk Patients</span>
                    <Badge variant="destructive">{analytics?.riskPatients || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Medium Risk Patients</span>
                    <Badge variant="secondary">
                      {Math.max(0, (analytics?.totalPatients || 0) - (analytics?.riskPatients || 0) - Math.floor((analytics?.totalPatients || 0) * 0.7))}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low Risk Patients</span>
                    <Badge variant="outline">
                      {Math.floor((analytics?.totalPatients || 0) * 0.7)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}