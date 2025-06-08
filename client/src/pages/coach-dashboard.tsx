import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  Calendar,
  Bell,
  Activity,
  Heart,
  Shield,
  Download,
  Moon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Client {
  id: number;
  name: string;
  email: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastSession: string;
  activeAlerts: number;
  metrics: {
    heartRate: number;
    steps: number;
    sleep: number;
    weight: number;
  };
}

interface SessionNote {
  id: number;
  clientId: number;
  note: string;
  timestamp: string;
  tags: string[];
}

export default function CoachDashboardPage() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const [sessionTags, setSessionTags] = useState("");

  // Fetch coach's clients
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/coach/clients'],
    queryFn: async () => {
      // Mock data for now - would connect to real API
      return [
        {
          id: 1,
          name: "Sarah Johnson",
          email: "sarah@example.com",
          healthScore: 85,
          riskLevel: 'low',
          lastSession: "2024-01-15",
          activeAlerts: 0,
          metrics: { heartRate: 72, steps: 8500, sleep: 7.5, weight: 140 }
        },
        {
          id: 2,
          name: "Mike Chen",
          email: "mike@example.com",
          healthScore: 72,
          riskLevel: 'medium',
          lastSession: "2024-01-12",
          activeAlerts: 2,
          metrics: { heartRate: 85, steps: 6200, sleep: 6.2, weight: 175 }
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          email: "emily@example.com",
          healthScore: 91,
          riskLevel: 'low',
          lastSession: "2024-01-16",
          activeAlerts: 0,
          metrics: { heartRate: 68, steps: 12000, sleep: 8.1, weight: 125 }
        },
        {
          id: 4,
          name: "David Wilson",
          email: "david@example.com",
          healthScore: 58,
          riskLevel: 'high',
          lastSession: "2024-01-10",
          activeAlerts: 4,
          metrics: { heartRate: 95, steps: 3500, sleep: 5.8, weight: 200 }
        }
      ];
    }
  });

  // Add session note mutation
  const addSessionNoteMutation = useMutation({
    mutationFn: async (noteData: { clientId: number; note: string; tags: string[] }) => {
      const res = await apiRequest('POST', '/api/coach/session-notes', noteData);
      return res.json();
    },
    onSuccess: () => {
      setSessionNote("");
      setSessionTags("");
      toast({
        title: "Session Note Added",
        description: "Successfully recorded session notes for client",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/session-notes'] });
    },
    onError: () => {
      toast({
        title: "Failed to Add Note",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Export client report mutation
  const exportReportMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const res = await apiRequest('POST', `/api/coach/export-report/${clientId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Exported",
        description: "Client health report has been generated",
      });
    },
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSessionNote = () => {
    if (!selectedClient || !sessionNote.trim()) return;
    
    const tags = sessionTags.split(',').map(tag => tag.trim()).filter(Boolean);
    addSessionNoteMutation.mutate({
      clientId: selectedClient.id,
      note: sessionNote,
      tags
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Coach Dashboard</h1>
              <p className="text-gray-600">Manage and monitor your clients' health journey</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{clients.length} Clients</span>
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Client List</span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredClients.map((client) => (
                  <motion.div
                    key={client.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedClient?.id === client.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{client.name}</h3>
                          {client.activeAlerts > 0 && (
                            <Badge variant="destructive" className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{client.activeAlerts}</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{client.email}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className={`text-sm font-medium ${getScoreColor(client.healthScore)}`}>
                              {client.healthScore}
                            </span>
                          </div>
                          <Badge className={`text-xs ${getRiskColor(client.riskLevel)}`}>
                            {client.riskLevel} risk
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Progress value={client.healthScore} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Client Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {selectedClient ? (
                <motion.div
                  key={selectedClient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Client Summary */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                          <CardDescription>Health Overview & Metrics</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportReportMutation.mutate(selectedClient.id)}
                            disabled={exportReportMutation.isPending}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Session
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Heart Rate</p>
                          <p className="text-lg font-semibold">{selectedClient.metrics.heartRate} bpm</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Steps</p>
                          <p className="text-lg font-semibold">{selectedClient.metrics.steps.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Moon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Sleep</p>
                          <p className="text-lg font-semibold">{selectedClient.metrics.sleep}h</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Weight</p>
                          <p className="text-lg font-semibold">{selectedClient.metrics.weight} lbs</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Overall Health Score</p>
                          <p className={`text-3xl font-bold ${getScoreColor(selectedClient.healthScore)}`}>
                            {selectedClient.healthScore}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Risk Level</p>
                          <Badge className={`${getRiskColor(selectedClient.riskLevel)} text-sm px-3 py-1`}>
                            <Shield className="h-4 w-4 mr-1" />
                            {selectedClient.riskLevel.charAt(0).toUpperCase() + selectedClient.riskLevel.slice(1)} Risk
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Session</p>
                          <p className="text-sm font-medium">{new Date(selectedClient.lastSession).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Session Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Session Notes</span>
                      </CardTitle>
                      <CardDescription>
                        Record observations, progress, and action items from your coaching session
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Session Notes</label>
                        <Textarea
                          placeholder="Record your observations, client progress, concerns, and action items..."
                          value={sessionNote}
                          onChange={(e) => setSessionNote(e.target.value)}
                          rows={4}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                        <Input
                          placeholder="e.g., nutrition, exercise, stress, sleep, goals"
                          value={sessionTags}
                          onChange={(e) => setSessionTags(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleAddSessionNote}
                        disabled={!sessionNote.trim() || addSessionNoteMutation.isPending}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {addSessionNoteMutation.isPending ? 'Saving...' : 'Save Session Note'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Real-time Alerts */}
                  {selectedClient.activeAlerts > 0 && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-800">
                          <Bell className="h-5 w-5" />
                          <span>Active Health Alerts</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="font-medium text-red-800">Elevated Heart Rate Detected</p>
                                <p className="text-sm text-red-600">HR above 95 bpm for 2+ hours</p>
                              </div>
                            </div>
                            <Badge variant="destructive">Critical</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                              <div>
                                <p className="font-medium text-yellow-800">Low Activity Level</p>
                                <p className="text-sm text-yellow-600">Below target steps for 3 days</p>
                              </div>
                            </div>
                            <Badge variant="secondary">Moderate</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Client</h3>
                  <p className="text-gray-600">Choose a client from the list to view their health data and manage sessions</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}