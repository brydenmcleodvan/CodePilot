import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Mic,
  MicOff,
  Volume2,
  Hand,
  MessageCircle,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  Accessibility,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Voice & Gesture Interface Component
 * Enables natural language and gesture-based health data interaction
 */
export function VoiceGestureInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const { toast } = useToast();

  // Fetch voice preferences
  const { data: preferencesData } = useQuery({
    queryKey: ['/api/voice-gesture/preferences'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/voice-gesture/preferences');
      return res.json();
    }
  });

  // Process voice input mutation
  const processVoiceMutation = useMutation({
    mutationFn: async (inputData) => {
      const res = await apiRequest('POST', '/api/voice-gesture/process-voice', inputData);
      return res.json();
    },
    onSuccess: (data) => {
      setResponse(data.response || 'I processed your request!');
      setIsProcessing(false);
      
      if (data.data_updated) {
        queryClient.invalidateQueries({ queryKey: ['health-data'] });
        toast({
          title: "Health Data Updated",
          description: "Your health information has been logged successfully."
        });
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      setResponse("Sorry, I had trouble understanding that. Could you try again?");
    }
  });

  // Process gesture input mutation
  const processGestureMutation = useMutation({
    mutationFn: async (gestureData) => {
      const res = await apiRequest('POST', '/api/voice-gesture/process-gesture', gestureData);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Gesture Recognized",
          description: `${data.action_executed} activated successfully.`
        });
      }
    }
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResponse('');
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          setIsListening(false);
          setIsProcessing(true);
          
          // Process the voice input
          processVoiceMutation.mutate({
            text_input: finalTranscript,
            input_type: 'text'
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        setIsProcessing(false);
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice commands.",
            variant: "destructive"
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Gesture detection (simplified for demo)
  useEffect(() => {
    if (!gesturesEnabled) return;

    const handleDeviceMotion = (event) => {
      const { acceleration } = event;
      if (acceleration) {
        const magnitude = Math.sqrt(
          Math.pow(acceleration.x || 0, 2) +
          Math.pow(acceleration.y || 0, 2) +
          Math.pow(acceleration.z || 0, 2)
        );

        // Detect vigorous shake (simplified)
        if (magnitude > 20) {
          processGestureMutation.mutate({
            gesture_type: 'shake_vigorous',
            intensity: magnitude,
            duration: 100,
            device_info: { type: 'mobile', timestamp: Date.now() }
          });
        }
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, [gesturesEnabled]);

  const startListening = () => {
    if (recognitionRef.current && voiceEnabled) {
      recognitionRef.current.start();
    } else {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Your browser doesn't support speech recognition or it's disabled.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const quickVoiceCommands = [
    "How did I sleep last night?",
    "Log my mood as happy",
    "What are my vitals?",
    "I have a headache",
    "Show my activity today",
    "Record that I took my medication"
  ];

  const gestureActions = [
    { name: "Triple Tap", action: "Quick mood logging", icon: Hand },
    { name: "Long Press", action: "Activate voice input", icon: Mic },
    { name: "Vigorous Shake", action: "Emergency alert", icon: Zap },
    { name: "Three-Finger Swipe", action: "Quick vitals", icon: Smartphone }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold flex items-center justify-center space-x-2">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <span>Voice & Gesture Interface</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Interact with your health data naturally using voice commands and gestures. 
          Perfect for hands-free logging and quick health inquiries.
        </p>
      </div>

      {/* Main Voice Interface */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Voice Animation */}
            <motion.div
              animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
              className="mx-auto"
            >
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                isListening ? 'bg-red-100 border-4 border-red-300' :
                isProcessing ? 'bg-yellow-100 border-4 border-yellow-300' :
                'bg-blue-100 border-4 border-blue-300'
              }`}>
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <Mic className="h-12 w-12 text-red-600" />
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <RotateCcw className="h-12 w-12 text-yellow-600" />
                  </motion.div>
                ) : (
                  <Mic className="h-12 w-12 text-blue-600" />
                )}
              </div>
            </motion.div>

            {/* Status */}
            <div className="space-y-2">
              <Badge className={`text-lg px-4 py-2 ${
                isListening ? 'bg-red-100 text-red-800' :
                isProcessing ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {isListening ? 'Listening...' :
                 isProcessing ? 'Processing...' :
                 'Ready to Listen'}
              </Badge>
              
              {transcript && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg text-gray-700 dark:text-gray-300 font-medium"
                >
                  You said: "{transcript}"
                </motion.p>
              )}
              
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg max-w-md mx-auto"
                >
                  <p className="text-green-800 dark:text-green-400">{response}</p>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                size="lg"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || !voiceEnabled}
                className={isListening ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isListening ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                {isListening ? 'Stop' : 'Start'} Listening
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setTranscript('');
                  setResponse('');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="commands" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commands">Voice Commands</TabsTrigger>
          <TabsTrigger value="gestures">Gesture Controls</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Voice Commands Tab */}
        <TabsContent value="commands">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Try These Voice Commands</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickVoiceCommands.map((command, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setTranscript(command);
                        setIsProcessing(true);
                        processVoiceMutation.mutate({
                          text_input: command,
                          input_type: 'text'
                        });
                      }}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">"{command}"</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Voice Command Tips</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Speak clearly and at normal pace</li>
                <li>• Use natural language - no need for specific keywords</li>
                <li>• You can ask questions or give commands</li>
                <li>• Try variations like "How was my sleep?" or "Record happy mood"</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Gestures Tab */}
        <TabsContent value="gestures">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gesture Controls</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Enable Gestures</span>
                <Switch
                  checked={gesturesEnabled}
                  onCheckedChange={setGesturesEnabled}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gestureActions.map((gesture, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <gesture.icon className="h-8 w-8 text-purple-600" />
                      <div>
                        <h4 className="font-medium">{gesture.name}</h4>
                        <p className="text-sm text-gray-600">{gesture.action}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Gesture Tips</h4>
              <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1">
                <li>• Gestures work best on mobile devices</li>
                <li>• Make sure motion detection is enabled in your browser</li>
                <li>• Some gestures may require device permissions</li>
                <li>• Practice gestures in a safe environment first</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Interface Settings</h3>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Voice Commands</h4>
                      <p className="text-sm text-gray-600">Enable voice recognition and natural language processing</p>
                    </div>
                    <Switch
                      checked={voiceEnabled}
                      onCheckedChange={setVoiceEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Gesture Controls</h4>
                      <p className="text-sm text-gray-600">Enable gesture recognition for mobile devices</p>
                    </div>
                    <Switch
                      checked={gesturesEnabled}
                      onCheckedChange={setGesturesEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Accessibility Mode</h4>
                      <p className="text-sm text-gray-600">Enhanced accessibility features for users with disabilities</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Accessibility className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-400">Accessibility Features</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                    <li>• Large button mode for easier tapping</li>
                    <li>• High contrast color schemes</li>
                    <li>• Voice feedback for all actions</li>
                    <li>• Screen reader compatibility</li>
                    <li>• Simplified gesture recognition</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Browser Compatibility Notice */}
      {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Settings className="h-6 w-6 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">Browser Compatibility</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Voice recognition is not supported in your current browser. For the best experience, 
                  try using Chrome, Safari, or Edge with microphone permissions enabled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VoiceGestureInterface;