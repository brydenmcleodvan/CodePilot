import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Stethoscope,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  Download,
  Calendar,
  Activity,
  Heart,
  Brain,
  User,
  Clock,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Medical Provider Mode Component
 * B2B clinician workflows with patient trend analysis
 */
export function MedicalProviderMode() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reportType, setReportType] = useState('comprehensive');
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch provider dashboard
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/provider/dashboard'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/provider/dashboard');
      return res.json();
    }
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async ({ patientId, reportType }) => {
      const res = await apiRequest('POST', '/api/provider/generate-report', {
        patient_id: patientId,
        report_type: reportType
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: `${reportType} report ready for download`
      });
    }
  });

  const isDark = effectiveTheme === 'dark';
  const hasProviderAccess = dashboardData?.provider_info;

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

  if (!hasProviderAccess) {
    return <ProviderAccessRequest />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span>Provider Dashboard</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {dashboardData.provider_info.name} • {dashboardData.provider_info.specialty}
          </p>
        </div>
        
        <Badge className="bg-blue-100 text-blue-800">
          Clinical Mode
        </Badge>
      </div>

      {/* Provider Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{dashboardData.patient_overview.total_patients}</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{dashboardData.patient_overview.active_patients}</div>
            <div className="text-sm text-gray-600">Active Monitoring</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{dashboardData.patient_overview.high_risk_patients}</div>
            <div className="text-sm text-gray-600">High Risk</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{dashboardData.patient_overview.patients_needing_attention}</div>
            <div className="text-sm text-gray-600">Need Attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients">Patient Overview</TabsTrigger>
          <TabsTrigger value="alerts">Clinical Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients">
          <PatientOverviewPanel 
            patients={dashboardData.patients || []}
            onSelectPatient={setSelectedPatient}
          />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <ClinicalAlertsPanel alerts={dashboardData.recent_alerts || []} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportsPanel 
            onGenerateReport={(patientId, type) => 
              generateReportMutation.mutate({ patientId, reportType: type })
            }
            isGenerating={generateReportMutation.isPending}
          />
        </TabsContent>

        {/* Care Plans Tab */}
        <TabsContent value="care-plans">
          <CarePlansPanel />
        </TabsContent>
      </Tabs>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal 
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}

/**
 * Provider Access Request Component
 */
function ProviderAccessRequest() {
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleAccessRequest = () => {
    setRequestSubmitted(true);
  };

  return (
    <Card className="max-w-2xl mx-auto mt-12">
      <CardContent className="p-12 text-center">
        <Stethoscope className="h-16 w-16 text-blue-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Medical Provider Access</h2>
        
        {!requestSubmitted ? (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Access to the Provider Dashboard requires medical credential verification.
              This feature is designed for licensed healthcare professionals to monitor patient health trends.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-green-600 mx-auto" />
                <h4 className="font-semibold">Clinical Reports</h4>
                <p className="text-sm text-gray-600">Comprehensive patient summaries</p>
              </div>
              <div className="space-y-2">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto" />
                <h4 className="font-semibold">Trend Analysis</h4>
                <p className="text-sm text-gray-600">Long-term health pattern insights</p>
              </div>
              <div className="space-y-2">
                <Heart className="h-8 w-8 text-red-600 mx-auto" />
                <h4 className="font-semibold">Care Plans</h4>
                <p className="text-sm text-gray-600">Custom treatment protocols</p>
              </div>
            </div>
            
            <Button onClick={handleAccessRequest} size="lg">
              Request Provider Access
            </Button>
          </>
        ) : (
          <>
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Access Request Submitted</h3>
            <p className="text-gray-600">
              Your request for provider access has been submitted for review. 
              You will be contacted within 1-2 business days for credential verification.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Patient Overview Panel Component
 */
function PatientOverviewPanel({ patients, onSelectPatient }) {
  return (
    <div className="space-y-4">
      {patients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Patients Assigned</h3>
            <p className="text-gray-600">
              Patients will appear here once they authorize data sharing with your practice.
            </p>
          </CardContent>
        </Card>
      ) : (
        patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onSelect={() => onSelectPatient(patient)}
          />
        ))
      )}
    </div>
  );
}

/**
 * Patient Card Component
 */
function PatientCard({ patient, onSelect }) {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            
            <div>
              <h4 className="font-semibold">{patient.name}</h4>
              <div className="text-sm text-gray-600 space-x-3">
                <span>Age: {patient.age}</span>
                <span>•</span>
                <span>Last sync: {patient.last_sync}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getRiskColor(patient.risk_level)}>
              {patient.risk_level} risk
            </Badge>
            
            {patient.alerts > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {patient.alerts} alerts
              </Badge>
            )}
            
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
        
        {patient.recent_metrics && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">BP:</span>
              <span className="ml-1 font-medium">{patient.recent_metrics.blood_pressure}</span>
            </div>
            <div>
              <span className="text-gray-600">HR:</span>
              <span className="ml-1 font-medium">{patient.recent_metrics.heart_rate} bpm</span>
            </div>
            <div>
              <span className="text-gray-600">Weight:</span>
              <span className="ml-1 font-medium">{patient.recent_metrics.weight} lbs</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Clinical Alerts Panel Component
 */
function ClinicalAlertsPanel({ alerts }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      case 'low': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
            <p className="text-gray-600">
              Clinical alerts will appear here when patient data indicates attention is needed.
            </p>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert, index) => (
          <Card key={index} className={`border-2 ${getPriorityColor(alert.priority)}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 mt-1 ${
                    alert.priority === 'high' ? 'text-red-600' :
                    alert.priority === 'medium' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                  
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                    
                    {alert.patient && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Patient:</span> {alert.patient.name}
                      </div>
                    )}
                    
                    {alert.recommendation && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-1">
                          Recommendation
                        </h5>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {alert.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Badge className={`${
                  alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                  alert.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.priority} priority
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

/**
 * Reports Panel Component
 */
function ReportsPanel({ onGenerateReport, isGenerating }) {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportType, setReportType] = useState('comprehensive');

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Health Summary' },
    { value: 'cardiovascular', label: 'Cardiovascular Assessment' },
    { value: 'metabolic', label: 'Metabolic Health Report' },
    { value: 'mental_health', label: 'Mental Wellness Summary' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Patient Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient1">John Doe</SelectItem>
                  <SelectItem value="patient2">Jane Smith</SelectItem>
                  <SelectItem value="patient3">Michael Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={() => onGenerateReport(selectedPatient, reportType)}
            disabled={!selectedPatient || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { patient: 'John Doe', type: 'Comprehensive', date: '2024-01-15', status: 'Ready' },
              { patient: 'Jane Smith', type: 'Cardiovascular', date: '2024-01-14', status: 'Ready' },
              { patient: 'Michael Johnson', type: 'Metabolic', date: '2024-01-13', status: 'Ready' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{report.patient}</h4>
                  <p className="text-sm text-gray-600">{report.type} Report • {report.date}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Care Plans Panel Component
 */
function CarePlansPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Care Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                patient: 'John Doe',
                condition: 'Hypertension Management',
                progress: 75,
                nextReview: '2024-01-20'
              },
              {
                patient: 'Jane Smith',
                condition: 'Diabetes Type 2',
                progress: 60,
                nextReview: '2024-01-18'
              }
            ].map((plan, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{plan.patient}</h4>
                  <Badge variant="outline">Active</Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{plan.condition}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-gray-600">Next Review: {plan.nextReview}</span>
                  <Button variant="outline" size="sm">
                    View Plan
                  </Button>
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
 * Patient Detail Modal Component
 */
function PatientDetailModal({ patient, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{patient.name} - Detailed View</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Blood Pressure</span>
                    <span className="font-medium">125/82 mmHg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heart Rate</span>
                    <span className="font-medium">72 bpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight</span>
                    <span className="font-medium">165 lbs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>BP Trend</span>
                    <Badge className="bg-green-100 text-green-800">Improving</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight Trend</span>
                    <Badge className="bg-blue-100 text-blue-800">Stable</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Medication Adherence</span>
                    <Badge className="bg-yellow-100 text-yellow-800">85%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicalProviderMode;