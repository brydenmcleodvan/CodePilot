import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  Clock, 
  Shield, 
  Star, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Phone,
  MessageSquare,
  User,
  Award,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TelehealthProvider {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  experience: string;
  languages: string[];
  bio: string;
  nextAvailable: string;
  consultationCost: number;
}

interface TelehealthTriage {
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  recommendedSpecialty: string;
  reasonForReferral: string;
  suggestedProviders: TelehealthProvider[];
  autoSchedule: boolean;
  estimatedWaitTime: string;
}

interface TelehealthSession {
  id: string;
  providerId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  meetingUrl?: string;
  cost: number;
}

export default function TelehealthPage() {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<TelehealthProvider | null>(null);
  const [showTriage, setShowTriage] = useState(false);
  const [sessionType, setSessionType] = useState<'emergency' | 'routine' | 'follow-up' | 'mental-health'>('routine');

  // Get user's health triage assessment
  const { data: triage, isLoading: triageLoading } = useQuery<TelehealthTriage>({
    queryKey: ['/api/telehealth/triage'],
    queryFn: async () => {
      // Mock triage data - would connect to real telehealth routing system
      return {
        urgencyLevel: 'medium',
        recommendedSpecialty: 'cardiologist',
        reasonForReferral: 'Elevated heart rate detected over the past 48 hours. AI monitoring suggests cardiac consultation for evaluation.',
        suggestedProviders: [
          {
            id: 'dr_smith_cardio',
            name: 'Dr. Sarah Smith',
            specialty: ['Cardiologist', 'Internal Medicine'],
            rating: 4.8,
            experience: '15 years',
            languages: ['English', 'Spanish'],
            bio: 'Board-certified cardiologist specializing in preventive cardiac care and heart disease management.',
            nextAvailable: '2:30 PM Today',
            consultationCost: 120
          },
          {
            id: 'dr_jones_cardio',
            name: 'Dr. Michael Jones',
            specialty: ['Cardiologist'],
            rating: 4.9,
            experience: '18 years',
            languages: ['English'],
            bio: 'Experienced cardiologist with expertise in arrhythmia management and cardiac risk assessment.',
            nextAvailable: '4:15 PM Today',
            consultationCost: 135
          }
        ],
        autoSchedule: false,
        estimatedWaitTime: '2-4 hours'
      };
    },
    enabled: showTriage
  });

  // Get user's upcoming sessions
  const { data: userSessions = [] } = useQuery<TelehealthSession[]>({
    queryKey: ['/api/telehealth/sessions'],
    queryFn: async () => {
      // Mock session data
      return [
        {
          id: 'session_123',
          providerId: 'dr_smith_cardio',
          scheduledAt: '2024-01-20T14:30:00Z',
          duration: 30,
          status: 'scheduled',
          meetingUrl: 'https://secure.healthmap.video/session/abc123',
          cost: 120
        }
      ];
    }
  });

  // Schedule session mutation
  const scheduleSessionMutation = useMutation({
    mutationFn: async (sessionData: { providerId: string; type: string; preferredTime?: string }) => {
      const res = await apiRequest('POST', '/api/telehealth/schedule', sessionData);
      return res.json();
    },
    onSuccess: (session) => {
      toast({
        title: "Session Scheduled Successfully",
        description: `Your appointment with ${selectedProvider?.name} is confirmed for ${new Date(session.scheduledAt).toLocaleString()}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/telehealth/sessions'] });
      setSelectedProvider(null);
    },
    onError: () => {
      toast({
        title: "Scheduling Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  const handleEmergencyRequest = () => {
    setSessionType('emergency');
    setShowTriage(true);
  };

  const handleRoutineRequest = () => {
    setSessionType('routine');
    setShowTriage(true);
  };

  const handleScheduleSession = () => {
    if (!selectedProvider) return;
    
    scheduleSessionMutation.mutate({
      providerId: selectedProvider.id,
      type: sessionType
    });
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Clock className="h-4 w-4" />;
      case 'medium': return <Calendar className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Talk to a Doctor</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with licensed medical professionals instantly. Our AI analyzes your health data 
            to match you with the right specialist for your needs.
          </p>
        </motion.div>

        {!showTriage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
          >
            {/* Emergency Consultation */}
            <Card className="border-red-200 hover:border-red-300 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Emergency Consultation</CardTitle>
                <CardDescription>
                  For urgent health concerns that need immediate medical attention
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Available within 15 minutes</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Video className="h-4 w-4" />
                    <span>Secure video consultation</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleEmergencyRequest}
                >
                  Request Emergency Care
                </Button>
                <p className="text-xs text-gray-500">
                  For life-threatening emergencies, call 911 immediately
                </p>
              </CardContent>
            </Card>

            {/* Routine Consultation */}
            <Card className="border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">Routine Consultation</CardTitle>
                <CardDescription>
                  General health questions, follow-ups, and preventive care
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule within 2-4 hours</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Includes health summary</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleRoutineRequest}
                >
                  Schedule Consultation
                </Button>
                <p className="text-xs text-gray-500">
                  AI will recommend the best specialist for your needs
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {triageLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3">Analyzing your health data...</span>
                  </CardContent>
                </Card>
              ) : triage && (
                <>
                  {/* Triage Assessment */}
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span>AI Health Assessment</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Priority Level:</span>
                        <Badge className={`${getUrgencyColor(triage.urgencyLevel)} flex items-center space-x-1`}>
                          {getUrgencyIcon(triage.urgencyLevel)}
                          <span className="capitalize">{triage.urgencyLevel}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Recommended Specialist:</span>
                        <span className="text-sm capitalize font-medium text-blue-600">
                          {triage.recommendedSpecialty.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Estimated Wait Time:</span>
                        <span className="text-sm font-medium text-green-600">
                          {triage.estimatedWaitTime}
                        </span>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Reason for Referral:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {triage.reasonForReferral}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Available Providers */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Recommended Doctors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {triage.suggestedProviders.map((provider) => (
                        <motion.div
                          key={provider.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all ${
                              selectedProvider?.id === provider.id 
                                ? 'ring-2 ring-blue-500 bg-blue-50' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedProvider(provider)}
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                      <span className="text-sm font-medium">{provider.rating}</span>
                                      <Separator orientation="vertical" className="h-4" />
                                      <span className="text-sm text-gray-600">{provider.experience}</span>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  ${provider.consultationCost}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex flex-wrap gap-1">
                                {provider.specialty.map((spec, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {provider.bio}
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">Next available: {provider.nextAvailable}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Globe className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">{provider.languages.join(', ')}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {selectedProvider && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border rounded-lg p-6"
                      >
                        <h4 className="font-semibold mb-4">Confirm Appointment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-sm text-gray-600">Doctor</p>
                            <p className="font-medium">{selectedProvider.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Next Available</p>
                            <p className="font-medium">{selectedProvider.nextAvailable}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Consultation Type</p>
                            <p className="font-medium capitalize">{sessionType.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Cost</p>
                            <p className="font-medium">${selectedProvider.consultationCost}</p>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button 
                            onClick={handleScheduleSession}
                            disabled={scheduleSessionMutation.isPending}
                            className="flex-1"
                          >
                            {scheduleSessionMutation.isPending ? 'Scheduling...' : 'Confirm Appointment'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedProvider(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Upcoming Sessions */}
        {userSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
            <div className="space-y-4">
              {userSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Dr. Sarah Smith - Cardiology</p>
                        <p className="text-sm text-gray-600">
                          {new Date(session.scheduledAt).toLocaleString()} • {session.duration} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                      {session.meetingUrl && (
                        <Button size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Join Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Licensed Physicians</span>
            </div>
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>End-to-End Encrypted</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            All consultations are conducted through secure, encrypted video calls. Your health information 
            is protected and never shared without your consent. This service does not replace emergency care - 
            for life-threatening emergencies, call 911 immediately.
          </p>
        </motion.div>
      </div>
    </div>
  );
}