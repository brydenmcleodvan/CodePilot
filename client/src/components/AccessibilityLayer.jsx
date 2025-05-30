import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Accessibility,
  Mic,
  Volume2,
  Eye,
  Type,
  Palette,
  Globe,
  Settings,
  MicIcon,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

/**
 * Accessibility Layer Component
 * Comprehensive accessibility features including voice logging, high contrast, and assistive technologies
 */
export function AccessibilityLayer() {
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    high_contrast: false,
    large_text: false,
    voice_commands: true,
    screen_reader: false,
    reduced_motion: false,
    audio_descriptions: false
  });
  
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const recognitionRef = useRef(null);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = i18n.language || 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setVoiceCommand(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [i18n.language]);

  // Save accessibility settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const res = await apiRequest('PUT', '/api/accessibility/settings', settings);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('accessibility.settings_saved'),
        description: t('accessibility.settings_saved_desc')
      });
    }
  });

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = async (command) => {
    try {
      const response = await apiRequest('POST', '/api/accessibility/voice-command', {
        command: command.toLowerCase(),
        language: i18n.language
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: t('accessibility.command_processed'),
          description: result.message
        });
        
        // Speak confirmation if audio is enabled
        if (accessibilitySettings.audio_descriptions) {
          speakText(result.message);
        }
      }
    } catch (error) {
      console.error('Voice command error:', error);
      toast({
        title: t('accessibility.command_error'),
        description: t('accessibility.command_error_desc'),
        variant: "destructive"
      });
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language || 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const updateAccessibilitySetting = (key, value) => {
    const newSettings = { ...accessibilitySettings, [key]: value };
    setAccessibilitySettings(newSettings);
    saveSettingsMutation.mutate(newSettings);
    
    // Apply settings immediately
    applyAccessibilitySettings(newSettings);
  };

  const applyAccessibilitySettings = (settings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.high_contrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }
    
    // Large text
    if (settings.large_text) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }
    
    // Reduced motion
    if (settings.reduced_motion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Accessibility className="h-8 w-8 text-blue-600" />
          <span>{t('accessibility.title')}</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {t('accessibility.description')}
        </p>
      </div>

      {/* Voice Command Interface */}
      <VoiceCommandInterface 
        isListening={isListening}
        voiceCommand={voiceCommand}
        onStartListening={startVoiceRecognition}
        onStopListening={stopVoiceRecognition}
      />

      {/* Accessibility Settings Tabs */}
      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visual">{t('accessibility.visual')}</TabsTrigger>
          <TabsTrigger value="audio">{t('accessibility.audio')}</TabsTrigger>
          <TabsTrigger value="motor">{t('accessibility.motor')}</TabsTrigger>
          <TabsTrigger value="cognitive">{t('accessibility.cognitive')}</TabsTrigger>
        </TabsList>

        {/* Visual Accessibility */}
        <TabsContent value="visual">
          <VisualAccessibilityPanel 
            settings={accessibilitySettings}
            onUpdateSetting={updateAccessibilitySetting}
          />
        </TabsContent>

        {/* Audio Accessibility */}
        <TabsContent value="audio">
          <AudioAccessibilityPanel 
            settings={accessibilitySettings}
            onUpdateSetting={updateAccessibilitySetting}
            onSpeak={speakText}
          />
        </TabsContent>

        {/* Motor Accessibility */}
        <TabsContent value="motor">
          <MotorAccessibilityPanel 
            settings={accessibilitySettings}
            onUpdateSetting={updateAccessibilitySetting}
          />
        </TabsContent>

        {/* Cognitive Accessibility */}
        <TabsContent value="cognitive">
          <CognitiveAccessibilityPanel 
            settings={accessibilitySettings}
            onUpdateSetting={updateAccessibilitySetting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Voice Command Interface Component
 */
function VoiceCommandInterface({ isListening, voiceCommand, onStartListening, onStopListening }) {
  const { t } = useTranslation();

  const voiceCommands = [
    { pattern: t('voice.log_pain'), example: t('voice.log_pain_example') },
    { pattern: t('voice.log_mood'), example: t('voice.log_mood_example') },
    { pattern: t('voice.log_medication'), example: t('voice.log_medication_example') },
    { pattern: t('voice.log_weight'), example: t('voice.log_weight_example') },
    { pattern: t('voice.log_sleep'), example: t('voice.log_sleep_example') }
  ];

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="h-6 w-6 text-purple-600" />
          <span>{t('accessibility.voice_commands')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={isListening ? onStopListening : onStartListening}
            className={`${isListening ? 'animate-pulse' : ''}`}
          >
            {isListening ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                {t('accessibility.stop_listening')}
              </>
            ) : (
              <>
                <MicIcon className="h-5 w-5 mr-2" />
                {t('accessibility.start_listening')}
              </>
            )}
          </Button>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border"
          >
            <h4 className="font-medium mb-2">{t('accessibility.listening')}</h4>
            <p className="text-gray-600 dark:text-gray-400 min-h-[2rem]">
              {voiceCommand || t('accessibility.speak_now')}
            </p>
          </motion.div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-3">{t('accessibility.voice_examples')}</h4>
          <div className="space-y-2">
            {voiceCommands.map((cmd, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-blue-800 dark:text-blue-400">
                  {cmd.example}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Visual Accessibility Panel Component
 */
function VisualAccessibilityPanel({ settings, onUpdateSetting }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-6 w-6 text-blue-600" />
            <span>{t('accessibility.visual_settings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.high_contrast')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.high_contrast_desc')}</p>
            </div>
            <Switch
              checked={settings.high_contrast}
              onCheckedChange={(checked) => onUpdateSetting('high_contrast', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.large_text')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.large_text_desc')}</p>
            </div>
            <Switch
              checked={settings.large_text}
              onCheckedChange={(checked) => onUpdateSetting('large_text', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.reduced_motion')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.reduced_motion_desc')}</p>
            </div>
            <Switch
              checked={settings.reduced_motion}
              onCheckedChange={(checked) => onUpdateSetting('reduced_motion', checked)}
            />
          </div>

          <div>
            <h4 className="font-medium mb-3">{t('accessibility.color_themes')}</h4>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-1"></div>
                  <span className="text-xs">{t('accessibility.default')}</span>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <div className="w-8 h-8 bg-yellow-600 rounded mx-auto mb-1"></div>
                  <span className="text-xs">{t('accessibility.deuteranopia')}</span>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-600 rounded mx-auto mb-1"></div>
                  <span className="text-xs">{t('accessibility.monochrome')}</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Audio Accessibility Panel Component
 */
function AudioAccessibilityPanel({ settings, onUpdateSetting, onSpeak }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-6 w-6 text-green-600" />
            <span>{t('accessibility.audio_settings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.audio_descriptions')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.audio_descriptions_desc')}</p>
            </div>
            <Switch
              checked={settings.audio_descriptions}
              onCheckedChange={(checked) => onUpdateSetting('audio_descriptions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.voice_commands')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.voice_commands_desc')}</p>
            </div>
            <Switch
              checked={settings.voice_commands}
              onCheckedChange={(checked) => onUpdateSetting('voice_commands', checked)}
            />
          </div>

          <div>
            <h4 className="font-medium mb-3">{t('accessibility.test_audio')}</h4>
            <Button
              onClick={() => onSpeak(t('accessibility.test_message'))}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {t('accessibility.test_speech')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Motor Accessibility Panel Component
 */
function MotorAccessibilityPanel({ settings, onUpdateSetting }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('accessibility.motor_settings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.sticky_keys')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.sticky_keys_desc')}</p>
            </div>
            <Switch
              checked={settings.sticky_keys}
              onCheckedChange={(checked) => onUpdateSetting('sticky_keys', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.large_buttons')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.large_buttons_desc')}</p>
            </div>
            <Switch
              checked={settings.large_buttons}
              onCheckedChange={(checked) => onUpdateSetting('large_buttons', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Cognitive Accessibility Panel Component
 */
function CognitiveAccessibilityPanel({ settings, onUpdateSetting }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('accessibility.cognitive_settings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.simplified_ui')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.simplified_ui_desc')}</p>
            </div>
            <Switch
              checked={settings.simplified_ui}
              onCheckedChange={(checked) => onUpdateSetting('simplified_ui', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('accessibility.reading_guide')}</h4>
              <p className="text-sm text-gray-600">{t('accessibility.reading_guide_desc')}</p>
            </div>
            <Switch
              checked={settings.reading_guide}
              onCheckedChange={(checked) => onUpdateSetting('reading_guide', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccessibilityLayer;