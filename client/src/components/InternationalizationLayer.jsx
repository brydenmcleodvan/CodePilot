import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Globe,
  MapPin,
  Clock,
  Heart,
  Utensils,
  Sun,
  Moon,
  Languages,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

/**
 * Internationalization Layer Component
 * Multi-language support with region-specific health recommendations
 */
export function InternationalizationLayer() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Fetch region-specific health data
  const { data: regionData, isLoading } = useQuery({
    queryKey: ['/api/i18n/region-data', selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return null;
      const res = await apiRequest('GET', `/api/i18n/region-data?region=${selectedRegion}`);
      return res.json();
    },
    enabled: !!selectedRegion
  });

  // Update language and region mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences) => {
      const res = await apiRequest('PUT', '/api/i18n/preferences', preferences);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('i18n.preferences_updated'),
        description: t('i18n.preferences_updated_desc')
      });
    }
  });

  const supportedLanguages = [
    { code: 'en', name: 'English', region: 'US' },
    { code: 'es', name: 'Español', region: 'ES' },
    { code: 'fr', name: 'Français', region: 'FR' },
    { code: 'de', name: 'Deutsch', region: 'DE' },
    { code: 'it', name: 'Italiano', region: 'IT' },
    { code: 'pt', name: 'Português', region: 'BR' },
    { code: 'zh', name: '中文', region: 'CN' },
    { code: 'ja', name: '日本語', region: 'JP' },
    { code: 'ko', name: '한국어', region: 'KR' },
    { code: 'ar', name: 'العربية', region: 'SA' },
    { code: 'hi', name: 'हिन्दी', region: 'IN' },
    { code: 'ru', name: 'Русский', region: 'RU' }
  ];

  const healthRegions = [
    { id: 'north_america', name: t('regions.north_america'), timezone: 'America/New_York' },
    { id: 'europe', name: t('regions.europe'), timezone: 'Europe/London' },
    { id: 'asia_pacific', name: t('regions.asia_pacific'), timezone: 'Asia/Tokyo' },
    { id: 'latin_america', name: t('regions.latin_america'), timezone: 'America/Mexico_City' },
    { id: 'middle_east', name: t('regions.middle_east'), timezone: 'Asia/Dubai' },
    { id: 'africa', name: t('regions.africa'), timezone: 'Africa/Cairo' }
  ];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    updatePreferencesMutation.mutate({
      language: languageCode,
      region: selectedRegion,
      timezone: timeZone
    });
  };

  useEffect(() => {
    // Detect user's timezone
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(detectedTimezone);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Globe className="h-8 w-8 text-blue-600" />
          <span>{t('i18n.title')}</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {t('i18n.description')}
        </p>
      </div>

      {/* Language and Region Selection */}
      <LanguageRegionSelector 
        supportedLanguages={supportedLanguages}
        healthRegions={healthRegions}
        currentLanguage={i18n.language}
        selectedRegion={selectedRegion}
        onLanguageChange={changeLanguage}
        onRegionChange={setSelectedRegion}
      />

      {/* Internationalization Tabs */}
      <Tabs defaultValue="language" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="language">{t('i18n.language_settings')}</TabsTrigger>
          <TabsTrigger value="regional">{t('i18n.regional_health')}</TabsTrigger>
          <TabsTrigger value="cultural">{t('i18n.cultural_adaptations')}</TabsTrigger>
          <TabsTrigger value="accessibility">{t('i18n.accessibility_i18n')}</TabsTrigger>
        </TabsList>

        {/* Language Settings */}
        <TabsContent value="language">
          <LanguageSettingsPanel 
            supportedLanguages={supportedLanguages}
            currentLanguage={i18n.language}
            onLanguageChange={changeLanguage}
          />
        </TabsContent>

        {/* Regional Health */}
        <TabsContent value="regional">
          <RegionalHealthPanel 
            regionData={regionData}
            selectedRegion={selectedRegion}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Cultural Adaptations */}
        <TabsContent value="cultural">
          <CulturalAdaptationsPanel 
            currentLanguage={i18n.language}
            selectedRegion={selectedRegion}
          />
        </TabsContent>

        {/* Accessibility & i18n */}
        <TabsContent value="accessibility">
          <AccessibilityI18nPanel 
            currentLanguage={i18n.language}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Language and Region Selector Component
 */
function LanguageRegionSelector({ 
  supportedLanguages, 
  healthRegions, 
  currentLanguage, 
  selectedRegion,
  onLanguageChange, 
  onRegionChange 
}) {
  const { t } = useTranslation();

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-green-900/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              <Languages className="h-4 w-4 inline mr-2" />
              {t('i18n.select_language')}
            </label>
            <Select value={currentLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center space-x-2">
                      <span>{lang.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {lang.region}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              <MapPin className="h-4 w-4 inline mr-2" />
              {t('i18n.select_region')}
            </label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('i18n.choose_region')} />
              </SelectTrigger>
              <SelectContent>
                {healthRegions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Language Settings Panel Component
 */
function LanguageSettingsPanel({ supportedLanguages, currentLanguage, onLanguageChange }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('i18n.available_languages')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {supportedLanguages.map(lang => (
              <Button
                key={lang.code}
                variant={currentLanguage === lang.code ? "default" : "outline"}
                onClick={() => onLanguageChange(lang.code)}
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                <span className="font-medium">{lang.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {lang.region}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('i18n.language_features')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">{t('i18n.localized_content')}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('i18n.health_recommendations')}</li>
                <li>• {t('i18n.cultural_dietary_advice')}</li>
                <li>• {t('i18n.regional_exercise_tips')}</li>
                <li>• {t('i18n.local_health_resources')}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">{t('i18n.accessibility_features')}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('i18n.voice_commands_localized')}</li>
                <li>• {t('i18n.right_to_left_support')}</li>
                <li>• {t('i18n.cultural_number_formats')}</li>
                <li>• {t('i18n.date_time_localization')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Regional Health Panel Component
 */
function RegionalHealthPanel({ regionData, selectedRegion, isLoading }) {
  const { t } = useTranslation();

  if (!selectedRegion) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('i18n.select_region_first')}</h3>
          <p className="text-gray-600">{t('i18n.select_region_desc')}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const mockRegionalData = {
    climate_recommendations: {
      seasonal_tips: [
        t('regional.winter_vitamin_d'),
        t('regional.summer_hydration'),
        t('regional.spring_allergies'),
        t('regional.autumn_immunity')
      ],
      optimal_exercise_times: t('regional.exercise_times')
    },
    cultural_health_practices: [
      t('regional.mediterranean_diet'),
      t('regional.yoga_meditation'),
      t('regional.forest_bathing'),
      t('regional.siesta_benefits')
    ],
    local_health_resources: [
      t('regional.healthcare_providers'),
      t('regional.emergency_numbers'),
      t('regional.health_insurance'),
      t('regional.wellness_centers')
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sun className="h-6 w-6 text-orange-600" />
            <span>{t('i18n.climate_health')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t('i18n.seasonal_recommendations')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockRegionalData.climate_recommendations.seasonal_tips.map((tip, index) => (
                  <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                {t('i18n.optimal_exercise_times')}
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {mockRegionalData.climate_recommendations.optimal_exercise_times}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-600" />
            <span>{t('i18n.cultural_practices')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRegionalData.cultural_health_practices.map((practice, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">{practice}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-green-600" />
            <span>{t('i18n.local_resources')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRegionalData.local_health_resources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{resource}</span>
                <Button variant="outline" size="sm">
                  {t('i18n.learn_more')}
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
 * Cultural Adaptations Panel Component
 */
function CulturalAdaptationsPanel({ currentLanguage, selectedRegion }) {
  const { t } = useTranslation();

  const culturalAdaptations = [
    {
      category: t('cultural.dietary'),
      icon: <Utensils className="h-5 w-5 text-green-600" />,
      adaptations: [
        t('cultural.halal_kosher'),
        t('cultural.vegetarian_vegan'),
        t('cultural.regional_cuisines'),
        t('cultural.fasting_practices')
      ]
    },
    {
      category: t('cultural.exercise'),
      icon: <Heart className="h-5 w-5 text-red-600" />,
      adaptations: [
        t('cultural.gender_considerations'),
        t('cultural.religious_holidays'),
        t('cultural.traditional_activities'),
        t('cultural.climate_appropriate')
      ]
    },
    {
      category: t('cultural.time_health'),
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      adaptations: [
        t('cultural.prayer_times'),
        t('cultural.work_schedules'),
        t('cultural.family_meals'),
        t('cultural.rest_periods')
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {culturalAdaptations.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {category.icon}
              <span>{category.category}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.adaptations.map((adaptation, adaptIndex) => (
                <div key={adaptIndex} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-sm">{adaptation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Accessibility Internationalization Panel Component
 */
function AccessibilityI18nPanel({ currentLanguage }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('i18n.accessibility_i18n_features')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                {t('i18n.voice_localization')}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('i18n.voice_localization_desc')}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">
                {t('i18n.rtl_support')}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('i18n.rtl_support_desc')}
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2">
                {t('i18n.cultural_colors')}
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {t('i18n.cultural_colors_desc')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InternationalizationLayer;