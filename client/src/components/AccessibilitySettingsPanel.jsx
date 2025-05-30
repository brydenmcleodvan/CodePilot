import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Eye,
  EyeOff,
  Type,
  Palette,
  Volume2,
  VolumeX,
  Mouse,
  Keyboard,
  Globe,
  Accessibility,
  Settings,
  Sun,
  Moon,
  Monitor,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Languages,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Accessibility Settings Panel Component
 * Provides comprehensive accessibility controls and internationalization
 */
export function AccessibilitySettingsPanel({ userId, className = "" }) {
  const { toast } = useToast();

  // Fetch current accessibility settings
  const { data: accessibilitySettings, isLoading } = useQuery({
    queryKey: ['/api/user/settings/accessibility'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/settings/accessibility');
      return res.json();
    },
    enabled: !!userId
  });

  // Update accessibility settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const res = await apiRequest('PUT', '/api/user/settings/accessibility', settings);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your accessibility preferences have been saved"
      });
      queryClient.invalidateQueries(['/api/user/settings/accessibility']);
    }
  });

  const handleSettingChange = (key, value) => {
    const updatedSettings = {
      ...accessibilitySettings,
      [key]: value
    };
    updateSettingsMutation.mutate(updatedSettings);
  };

  const handleNestedSettingChange = (category, key, value) => {
    const updatedSettings = {
      ...accessibilitySettings,
      [category]: {
        ...accessibilitySettings[category],
        [key]: value
      }
    };
    updateSettingsMutation.mutate(updatedSettings);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-6 w-6 text-blue-600 animate-pulse" />
            Loading Accessibility Settings...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const settings = accessibilitySettings || {
    visual: {
      fontSize: 'medium',
      fontFamily: 'default',
      contrast: 'normal',
      colorBlindSupport: false,
      reduceMotion: false,
      focusIndicators: true
    },
    audio: {
      enableSounds: true,
      screenReader: false,
      audioDescriptions: false,
      soundVolume: 50
    },
    motor: {
      stickyKeys: false,
      slowKeys: false,
      bounceKeys: false,
      mouseSpeed: 'normal',
      clickAssist: false
    },
    cognitive: {
      simplifiedInterface: false,
      extendedTimeouts: false,
      autoSave: true,
      readingGuide: false
    },
    language: {
      locale: 'en-US',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'US',
      rightToLeft: false
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Accessibility className="h-6 w-6 text-blue-600" />
            <CardTitle>Accessibility & Globalization</CardTitle>
          </div>
          <Badge variant="outline">Universal Access</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="visual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visual" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="motor" className="flex items-center gap-1">
              <Mouse className="h-4 w-4" />
              Motor
            </TabsTrigger>
            <TabsTrigger value="cognitive" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Cognitive
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Language
            </TabsTrigger>
          </TabsList>

          {/* Visual Accessibility */}
          <TabsContent value="visual" className="space-y-6">
            <VisualAccessibilitySettings 
              settings={settings.visual}
              onChange={(key, value) => handleNestedSettingChange('visual', key, value)}
              isUpdating={updateSettingsMutation.isPending}
            />
          </TabsContent>

          {/* Audio Accessibility */}
          <TabsContent value="audio" className="space-y-6">
            <AudioAccessibilitySettings 
              settings={settings.audio}
              onChange={(key, value) => handleNestedSettingChange('audio', key, value)}
              isUpdating={updateSettingsMutation.isPending}
            />
          </TabsContent>

          {/* Motor Accessibility */}
          <TabsContent value="motor" className="space-y-6">
            <MotorAccessibilitySettings 
              settings={settings.motor}
              onChange={(key, value) => handleNestedSettingChange('motor', key, value)}
              isUpdating={updateSettingsMutation.isPending}
            />
          </TabsContent>

          {/* Cognitive Accessibility */}
          <TabsContent value="cognitive" className="space-y-6">
            <CognitiveAccessibilitySettings 
              settings={settings.cognitive}
              onChange={(key, value) => handleNestedSettingChange('cognitive', key, value)}
              isUpdating={updateSettingsMutation.isPending}
            />
          </TabsContent>

          {/* Language & Localization */}
          <TabsContent value="language" className="space-y-6">
            <LanguageSettings 
              settings={settings.language}
              onChange={(key, value) => handleNestedSettingChange('language', key, value)}
              isUpdating={updateSettingsMutation.isPending}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Reset */}
        <Separator className="my-6" />
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Reset to Defaults</h4>
            <p className="text-sm text-gray-600">Restore all accessibility settings to default values</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => updateSettingsMutation.mutate({})}
            disabled={updateSettingsMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Visual Accessibility Settings Component
 */
function VisualAccessibilitySettings({ settings, onChange, isUpdating }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Visual Accessibility
        </h3>
        
        <div className="space-y-4">
          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Size</label>
            <Select value={settings.fontSize} onValueChange={(value) => onChange('fontSize', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Family</label>
            <Select value={settings.fontFamily} onValueChange={(value) => onChange('fontFamily', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Montserrat)</SelectItem>
                <SelectItem value="dyslexic">OpenDyslexic</SelectItem>
                <SelectItem value="serif">High Readability Serif</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contrast */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Contrast Level</label>
            <Select value={settings.contrast} onValueChange={(value) => onChange('contrast', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High Contrast</SelectItem>
                <SelectItem value="inverted">Inverted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-3">
            <SettingToggle
              label="Color Blind Support"
              description="Enhanced color differentiation for color vision deficiency"
              checked={settings.colorBlindSupport}
              onChange={(checked) => onChange('colorBlindSupport', checked)}
              icon={<Palette className="h-4 w-4" />}
            />

            <SettingToggle
              label="Reduce Motion"
              description="Minimize animations and transitions"
              checked={settings.reduceMotion}
              onChange={(checked) => onChange('reduceMotion', checked)}
              icon={<ZoomOut className="h-4 w-4" />}
            />

            <SettingToggle
              label="Enhanced Focus Indicators"
              description="Stronger visual focus indicators for keyboard navigation"
              checked={settings.focusIndicators}
              onChange={(checked) => onChange('focusIndicators', checked)}
              icon={<Eye className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Audio Accessibility Settings Component
 */
function AudioAccessibilitySettings({ settings, onChange, isUpdating }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-green-600" />
          Audio Accessibility
        </h3>
        
        <div className="space-y-4">
          {/* Sound Volume */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sound Volume: {settings.soundVolume}%</label>
            <Slider
              value={[settings.soundVolume]}
              onValueChange={([value]) => onChange('soundVolume', value)}
              max={100}
              step={10}
              className="w-full"
            />
          </div>

          {/* Toggle Settings */}
          <div className="space-y-3">
            <SettingToggle
              label="Enable System Sounds"
              description="Play sounds for notifications and interactions"
              checked={settings.enableSounds}
              onChange={(checked) => onChange('enableSounds', checked)}
              icon={<Volume2 className="h-4 w-4" />}
            />

            <SettingToggle
              label="Screen Reader Support"
              description="Enhanced compatibility with screen reading software"
              checked={settings.screenReader}
              onChange={(checked) => onChange('screenReader', checked)}
              icon={<Volume2 className="h-4 w-4" />}
            />

            <SettingToggle
              label="Audio Descriptions"
              description="Provide audio descriptions for visual elements"
              checked={settings.audioDescriptions}
              onChange={(checked) => onChange('audioDescriptions', checked)}
              icon={<Volume2 className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Motor Accessibility Settings Component
 */
function MotorAccessibilitySettings({ settings, onChange, isUpdating }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mouse className="h-5 w-5 text-purple-600" />
          Motor Accessibility
        </h3>
        
        <div className="space-y-4">
          {/* Mouse Speed */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mouse Sensitivity</label>
            <Select value={settings.mouseSpeed} onValueChange={(value) => onChange('mouseSpeed', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-3">
            <SettingToggle
              label="Sticky Keys"
              description="Hold modifier keys without keeping them pressed"
              checked={settings.stickyKeys}
              onChange={(checked) => onChange('stickyKeys', checked)}
              icon={<Keyboard className="h-4 w-4" />}
            />

            <SettingToggle
              label="Slow Keys"
              description="Require keys to be held down longer before registering"
              checked={settings.slowKeys}
              onChange={(checked) => onChange('slowKeys', checked)}
              icon={<Keyboard className="h-4 w-4" />}
            />

            <SettingToggle
              label="Bounce Keys"
              description="Ignore rapid repeated keystrokes"
              checked={settings.bounceKeys}
              onChange={(checked) => onChange('bounceKeys', checked)}
              icon={<Keyboard className="h-4 w-4" />}
            />

            <SettingToggle
              label="Click Assistance"
              description="Easier clicking with dwell time and hover assistance"
              checked={settings.clickAssist}
              onChange={(checked) => onChange('clickAssist', checked)}
              icon={<Mouse className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cognitive Accessibility Settings Component
 */
function CognitiveAccessibilitySettings({ settings, onChange, isUpdating }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-orange-600" />
          Cognitive Accessibility
        </h3>
        
        <div className="space-y-3">
          <SettingToggle
            label="Simplified Interface"
            description="Reduce visual complexity and focus on essential elements"
            checked={settings.simplifiedInterface}
            onChange={(checked) => onChange('simplifiedInterface', checked)}
            icon={<Settings className="h-4 w-4" />}
          />

          <SettingToggle
            label="Extended Timeouts"
            description="Increase time limits for forms and interactions"
            checked={settings.extendedTimeouts}
            onChange={(checked) => onChange('extendedTimeouts', checked)}
            icon={<Settings className="h-4 w-4" />}
          />

          <SettingToggle
            label="Auto-Save"
            description="Automatically save form data and progress"
            checked={settings.autoSave}
            onChange={(checked) => onChange('autoSave', checked)}
            icon={<Settings className="h-4 w-4" />}
          />

          <SettingToggle
            label="Reading Guide"
            description="Visual guide to help track reading position"
            checked={settings.readingGuide}
            onChange={(checked) => onChange('readingGuide', checked)}
            icon={<Type className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Language and Localization Settings Component
 */
function LanguageSettings({ settings, onChange, isUpdating }) {
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Language & Localization
        </h3>
        
        <div className="space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={settings.locale} onValueChange={(value) => onChange('locale', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <Select value={settings.timezone} onValueChange={(value) => onChange('timezone', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                <SelectItem value="Asia/Shanghai">China Standard Time (CST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Format</label>
            <Select value={settings.dateFormat} onValueChange={(value) => onChange('dateFormat', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (European)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (German)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Right-to-Left */}
          <SettingToggle
            label="Right-to-Left Text Direction"
            description="Enable RTL layout for Arabic, Hebrew, and other RTL languages"
            checked={settings.rightToLeft}
            onChange={(checked) => onChange('rightToLeft', checked)}
            icon={<Languages className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Setting Toggle Component
 */
function SettingToggle({ label, description, checked, onChange, icon }) {
  return (
    <div className="flex items-start justify-between space-x-4 p-3 border rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="mt-1">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium">{label}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default AccessibilitySettingsPanel;