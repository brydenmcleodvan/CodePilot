import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  Phone, 
  Mic, 
  MicOff, 
  VideoOff, 
  MessageSquare,
  FileText,
  Clock,
  User,
  Star,
  Shield,
  X,
  Camera,
  Settings,
  Volume2,
  Share
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DoctorConsultModal({ 
  isOpen, 
  onClose, 
  consultation, 
  doctor,
  patientHealthData 
}) {
  const { toast } = useToast();
  const [consultationStatus, setConsultationStatus] = useState('waiting');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [connectionQuality, setConnectionQuality] = useState('good');

  // Simulate consultation states: waiting -> connecting -> active -> completed
  useEffect(() => {
    if (!isOpen || !consultation) return;

    const statusProgression = [
      { status: 'waiting', delay: 1000 },
      { status: 'connecting', delay: 3000 },
      { status: 'active', delay: 2000 }
    ];

    let timeoutIds = [];
    
    statusProgression.forEach((step, index) => {
      const timeoutId = setTimeout(() => {
        setConsultationStatus(step.status);
        
        if (step.status === 'active') {
          toast({
            title: "Connected!",
            description: `You're now connected with ${doctor?.name}`,
          });
          
          // Add initial doctor message
          setChatMessages([{
            id: 'welcome',
            sender: 'doctor',
            message: `Hello! I'm Dr. ${doctor?.name.split(' ')[1]}. I've reviewed your health data. How can I help you today?`,
            timestamp: new Date().toISOString()
          }]);
        }
      }, statusProgression.slice(0, index + 1).reduce((sum, s) => sum + s.delay, 0));
      
      timeoutIds.push(timeoutId);
    });

    return () => timeoutIds.forEach(clearTimeout);
  }, [isOpen, consultation, doctor, toast]);

  // End consultation mutation
  const endConsultationMutation = useMutation({
    mutationFn: async (consultationData) => {
      const res = await apiRequest('POST', '/api/telehealth/end-consultation', {
        consultationId: consultation.id,
        duration: consultationData.duration,
        notes: consultationData.notes,
        followUpRequired: consultationData.followUpRequired
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Consultation Completed",
        description: "Your consultation summary has been saved to your health records.",
      });
      setConsultationStatus('completed');
      setTimeout(() => onClose(), 2000);
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      sender: 'patient',
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate doctor response after a delay
    setTimeout(() => {
      const responses = [
        "I understand. Let me review that information.",
        "That's helpful context. Can you tell me more about when this started?",
        "Based on what you're describing, I'd like to discuss some options.",
        "I see. Let me check your recent health metrics.",
        "That's a good question. Here's what I recommend..."
      ];
      
      const doctorResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, doctorResponse]);
    }, 2000 + Math.random() * 3000);
  };

  const handleEndConsultation = () => {
    const duration = 15; // Would calculate actual duration
    endConsultationMutation.mutate({
      duration,
      notes: sessionNotes,
      followUpRequired: sessionNotes.toLowerCase().includes('follow up')
    });
  };

  const getStatusDisplay = () => {
    const statusConfig = {
      waiting: {
        icon: Clock,
        text: 'Waiting for doctor...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      },
      connecting: {
        icon: Video,
        text: 'Connecting...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      active: {
        icon: Video,
        text: 'Consultation in progress',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      completed: {
        icon: FileText,
        text: 'Consultation completed',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      }
    };
    
    return statusConfig[consultationStatus] || statusConfig.waiting;
  };

  if (!consultation || !doctor) return null;

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${statusDisplay.bgColor}`}>
                    <StatusIcon className={`h-5 w-5 ${statusDisplay.color}`} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      Video Consultation with {doctor.name}
                    </DialogTitle>
                    <p className={`text-sm ${statusDisplay.color}`}>
                      {statusDisplay.text}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {consultation.urgencyLevel}
                  </Badge>
                  <Badge className={`text-xs ${
                    connectionQuality === 'good' ? 'bg-green-100 text-green-800' :
                    connectionQuality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {connectionQuality} connection
                  </Badge>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Video Area */}
            <div className="flex-1 flex flex-col bg-gray-900 relative">
              {consultationStatus === 'active' ? (
                <>
                  {/* Doctor Video */}
                  <div className="flex-1 relative bg-gray-800 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <User className="h-16 w-16" />
                        </div>
                        <h3 className="text-xl font-semibold">{doctor.name}</h3>
                        <p className="text-blue-200">{doctor.specialty}</p>
                      </div>
                    </div>
                    
                    {/* Patient Video (Picture-in-picture) */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-white/20 flex items-center justify-center">
                      {videoEnabled ? (
                        <div className="text-white text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">You</p>
                        </div>
                      ) : (
                        <div className="text-white text-center">
                          <VideoOff className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Camera off</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="p-4 bg-gray-800 flex items-center justify-center space-x-4">
                    <Button
                      variant={audioEnabled ? "secondary" : "destructive"}
                      size="lg"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className="rounded-full"
                    >
                      {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant={videoEnabled ? "secondary" : "destructive"}
                      size="lg"
                      onClick={() => setVideoEnabled(!videoEnabled)}
                      className="rounded-full"
                    >
                      {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleEndConsultation}
                      disabled={endConsultationMutation.isPending}
                      className="rounded-full"
                    >
                      {endConsultationMutation.isPending ? 'Ending...' : 'End Call'}
                    </Button>
                    
                    <Button variant="secondary" size="lg" className="rounded-full">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                /* Waiting/Connecting State */
                <div className="flex-1 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <motion.div
                      animate={{ rotate: consultationStatus === 'connecting' ? 360 : 0 }}
                      transition={{ duration: 2, repeat: consultationStatus === 'connecting' ? Infinity : 0 }}
                    >
                      <StatusIcon className="h-16 w-16 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl mb-2">{statusDisplay.text}</h3>
                    {consultationStatus === 'waiting' && (
                      <p className="text-gray-300">
                        Dr. {doctor.name.split(' ')[1]} will join shortly
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-96 border-l bg-white flex flex-col">
              <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 m-4">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="health">Health Data</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                {/* Chat Tab */}
                <TabsContent value="chat" className="flex-1 flex flex-col mx-4 mb-4">
                  <div className="flex-1 border rounded-lg p-4 overflow-y-auto space-y-4">
                    <AnimatePresence>
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'patient' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'patient' ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={consultationStatus !== 'active'}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={consultationStatus !== 'active' || !newMessage.trim()}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Health Data Tab */}
                <TabsContent value="health" className="mx-4 mb-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Recent Vitals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Heart Rate:</span>
                        <span className="font-medium">72 bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blood Pressure:</span>
                        <span className="font-medium">120/80 mmHg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temperature:</span>
                        <span className="font-medium">98.6°F</span>
                      </div>
                      <div className="flex justify-between">
                        <span>O2 Saturation:</span>
                        <span className="font-medium">98%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Current Medications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <div>• Lisinopril 10mg daily</div>
                      <div>• Vitamin D3 2000 IU</div>
                      <div>• Omega-3 Fish Oil</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="mx-4 mb-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Session Notes</label>
                      <Textarea
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        placeholder="Add notes about this consultation..."
                        className="mt-2"
                        rows={8}
                      />
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Doctor Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{doctor.rating} rating</span>
                        </div>
                        <div>{doctor.experience} experience</div>
                        <div>Specializes in: {doctor.subSpecialties?.join(', ')}</div>
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span>Board Certified</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}