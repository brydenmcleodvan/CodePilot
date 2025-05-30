import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Stethoscope,
  Users,
  FileText,
  Activity,
  AlertTriangle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Heart,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Provider Dashboard View Component
 * Secure clinical interface for healthcare professionals
 */
export function ProviderDashboardView({ userId, userRole, className = "" }) {
  const [providerMode, setProviderMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Verify provider access and fetch authorized patients
  const { data: providerData, isLoading: providerLoading } = useQuery({
    queryKey: ['/api/provider/access'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/provider/access');
      return res.json();
    },
    enabled: userRole === 'clinician' && providerMode,
    retry: 1
  });

  // Fetch patient list with search
  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/provider/patients', searchQuery],
    queryFn: async () => {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const res = await apiRequest('GET', `/api/provider/patients${params}`);
      return res.json();
    },
    enabled: providerMode && !!providerData?.authorized,
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch selected patient details
  const { data: patientDetails, isLoading: patientLoading } = useQuery({
    queryKey: ['/api/provider/patient', selectedPatient?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/provider/patient/${selectedPatient.id}`);
      return res.json();
    },
    enabled: !!selectedPatient && providerMode
  });

  // Generate patient report
  const generateReportMutation = useMutation({
    mutationFn: async (patientId) => {
      const res = await apiRequest('POST', `/api/provider/patient/${patientId}/report`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Patient health report is ready for download"
      });
      // Trigger download
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      }
    }
  });

  // Check if user is authorized clinician
  if (userRole !== 'clinician') {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <CardTitle>Provider Dashboard</CardTitle>
            <Badge variant="outline">Clinical Access</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Provider Mode</span>
            <Switch
              checked={providerMode}
              onCheckedChange={setProviderMode}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!providerMode ? (
          <ProviderModePrompt />
        ) : providerLoading ? (
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p>Verifying provider credentials...</p>
          </div>
        ) : !providerData?.authorized ? (
          <UnauthorizedAccess />
        ) : (
          <ProviderInterface 
            patientsData={patientsData}
            patientsLoading={patientsLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            patientDetails={patientDetails}
            patientLoading={patientLoading}
            onGenerateReport={(patientId) => generateReportMutation.mutate(patientId)}
            generatingReport={generateReportMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Provider Mode Prompt Component
 */
function ProviderModePrompt() {
  return (
    <div className="text-center py-8">
      <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Provider Dashboard</h3>
      <p className="text-gray-600 mb-4">
        Enable Provider Mode to access patient health data and clinical tools
      </p>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Clinical Features:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Patient health summaries and vital trends</li>
          <li>• Risk alerts and anomaly flagging</li>
          <li>• Downloadable clinical reports</li>
          <li>• Secure patient data access</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Unauthorized Access Component
 */
function UnauthorizedAccess() {
  return (
    <div className="text-center py-8">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
      <p className="text-gray-600 mb-4">
        Your account does not have active clinical privileges. Contact your administrator to request provider access.
      </p>
      <Badge className="bg-red-100 text-red-800">
        Provider Authorization Required
      </Badge>
    </div>
  );
}

/**
 * Main Provider Interface Component
 */
function ProviderInterface({ 
  patientsData, 
  patientsLoading, 
  searchQuery, 
  setSearchQuery,
  selectedPatient, 
  setSelectedPatient,
  patientDetails,
  patientLoading,
  onGenerateReport,
  generatingReport
}) {
  const patients = patientsData?.patients || [];

  return (
    <div className="space-y-6">
      {/* Provider Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{patientsData?.total_patients || 0}</div>
          <div className="text-sm text-gray-600">Active Patients</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{patientsData?.active_alerts || 0}</div>
          <div className="text-sm text-gray-600">Active Alerts</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{patientsData?.improving_patients || 0}</div>
          <div className="text-sm text-gray-600">Improving</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{patientsData?.reports_generated || 0}</div>
          <div className="text-sm text-gray-600">Reports Today</div>
        </div>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patients">Patient List</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="reports">Clinical Reports</TabsTrigger>
        </TabsList>

        {/* Patient List Tab */}
        <TabsContent value="patients">
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search patients by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>

            {/* Patient List */}
            {patientsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {patients.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatient?.id === patient.id}
                    onSelect={() => setSelectedPatient(patient)}
                    onGenerateReport={() => onGenerateReport(patient.id)}
                    generatingReport={generatingReport}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts">
          <AlertsPanel patientsData={patientsData} />
        </TabsContent>

        {/* Clinical Reports Tab */}
        <TabsContent value="reports">
          <ReportsPanel />
        </TabsContent>
      </Tabs>

      {/* Selected Patient Details */}
      {selectedPatient && (
        <PatientDetailsPanel 
          patient={selectedPatient}
          details={patientDetails}
          loading={patientLoading}
          onGenerateReport={() => onGenerateReport(selectedPatient.id)}
          generatingReport={generatingReport}
        />
      )}
    </div>
  );
}

/**
 * Patient Card Component
 */
function PatientCard({ patient, isSelected, onSelect, onGenerateReport, generatingReport }) {
  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {patient.name?.charAt(0) || 'P'}
            </span>
          </div>
          
          <div>
            <h4 className="font-medium">{patient.name || 'Patient'}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>ID: {patient.id}</span>
              <span>•</span>
              <span>Age: {patient.age || 'N/A'}</span>
              {patient.last_sync && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(patient.last_sync).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {patient.risk_level && (
            <Badge className={getRiskColor(patient.risk_level)}>
              {patient.risk_level} risk
            </Badge>
          )}
          
          {patient.active_alerts > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {patient.active_alerts} alerts
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onGenerateReport();
            }}
            disabled={generatingReport}
          >
            <FileText className="h-4 w-4 mr-1" />
            Report
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Patient Details Panel Component
 */
function PatientDetailsPanel({ patient, details, loading, onGenerateReport, generatingReport }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Patient Details...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Patient Overview: {patient.name}</CardTitle>
          <Button
            onClick={onGenerateReport}
            disabled={generatingReport}
          >
            <Download className="h-4 w-4 mr-1" />
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-semibold mb-2">Recent Vitals</h4>
            <div className="space-y-2">
              {details?.recent_vitals?.map((vital, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{vital.metric}</span>
                  <span className="font-medium">{vital.value} {vital.unit}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No recent vitals available</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Health Trends</h4>
            <div className="space-y-2">
              {details?.health_trends?.map((trend, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{trend.metric}</span>
                  <div className="flex items-center gap-1">
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <Heart className="h-3 w-3 text-blue-500" />
                    )}
                    <span>{trend.change}</span>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No trend data available</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Alerts Panel Component
 */
function AlertsPanel({ patientsData }) {
  const alerts = patientsData?.recent_alerts || [];

  return (
    <div className="space-y-3">
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No active alerts</p>
        </div>
      ) : (
        alerts.map((alert, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{alert.patient_name}</h4>
                <p className="text-sm text-gray-600">{alert.alert_message}</p>
              </div>
              <Badge className={`${
                alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                alert.severity === 'warning' ? 'bg-orange-100 text-orange-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {alert.severity}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/**
 * Reports Panel Component
 */
function ReportsPanel() {
  return (
    <div className="text-center py-8">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Clinical Reports</h3>
      <p className="text-gray-600 mb-4">
        Generate and download patient health reports
      </p>
      <Button variant="outline">
        <Calendar className="h-4 w-4 mr-1" />
        Schedule Reports
      </Button>
    </div>
  );
}

export default ProviderDashboardView;