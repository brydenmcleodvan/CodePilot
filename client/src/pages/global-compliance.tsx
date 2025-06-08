import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Globe, 
  Shield, 
  Languages, 
  Scale, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsentManagement from "@/components/consent-management";
import { getRegionalConfig, getEmergencyNumber, getRegulationsForLanguage } from "@/lib/i18n";

export default function GlobalCompliancePage() {
  const { t, i18n } = useTranslation('common');
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸', region: 'US' },
    { code: 'es', name: 'Español', flag: '🇪🇸', region: 'ES' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', region: 'FR' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', region: 'DE' },
    { code: 'zh', name: '中文', flag: '🇨🇳', region: 'CN' }
  ];

  const complianceFeatures = [
    {
      icon: Shield,
      title: "GDPR Compliance",
      description: "Full European data protection regulation compliance",
      regions: ['EU', 'UK', 'FR', 'DE'],
      status: 'active'
    },
    {
      icon: Scale,
      title: "HIPAA Protection", 
      description: "Healthcare data protection for US users",
      regions: ['US'],
      status: 'active'
    },
    {
      icon: Globe,
      title: "PIPEDA Compliance",
      description: "Canadian personal information protection",
      regions: ['CA'],
      status: 'active'
    },
    {
      icon: Settings,
      title: "HDS Certification",
      description: "French health data hosting compliance",
      regions: ['FR'],
      status: 'active'
    }
  ];

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);
  };

  const currentRegionalConfig = getRegionalConfig(selectedLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Global Compliance & Localization</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Healthmap is designed for global deployment with comprehensive regulatory compliance 
            and cultural adaptation for international healthcare standards.
          </p>
        </motion.div>

        <Tabs defaultValue="compliance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compliance">Regulatory Compliance</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="consent">Consent Management</TabsTrigger>
          </TabsList>

          {/* Regulatory Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {complianceFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <feature.icon className="h-8 w-8 text-blue-600" />
                        <Badge 
                          variant={feature.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {feature.status === 'active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {feature.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {feature.regions.map((region) => (
                          <Badge key={region} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Current Region Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Current Region Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Active Regulations</h4>
                    <div className="space-y-1">
                      {getRegulationsForLanguage(selectedLanguage).map((regulation) => (
                        <Badge key={regulation} variant="secondary" className="text-xs">
                          {regulation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Data Protection</h4>
                    <div className="space-y-1">
                      <div className="text-sm">Classification: {currentRegionalConfig.healthDataClassification}</div>
                      <div className="text-sm">Retention: {Math.floor(2555 / 365)} years</div>
                      <div className="text-sm">Cross-border: {currentRegionalConfig.crossBorderTransferAllowed ? 'Allowed' : 'Restricted'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Features</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        {currentRegionalConfig.telehealthEnabled ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span>Telehealth</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        {currentRegionalConfig.aiAnalysisEnabled ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span>AI Analysis</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="localization" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Languages className="h-5 w-5" />
                    <span>Language & Regional Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Healthmap supports multiple languages with culturally adapted health guidance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {supportedLanguages.map((language) => (
                      <motion.div
                        key={language.code}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            selectedLanguage === language.code 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleLanguageChange(language.code)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl mb-2">{language.flag}</div>
                            <div className="font-medium text-sm">{language.name}</div>
                            <div className="text-xs text-gray-600">{language.region}</div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Cultural Health Guidance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Culturally Adapted Health Guidance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Exercise</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">{t('health_guidance.exercise.recommendation')}</p>
                          <p className="text-xs text-gray-600 italic">{t('health_guidance.exercise.cultural_note')}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Nutrition</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">{t('health_guidance.nutrition.recommendation')}</p>
                          <p className="text-xs text-gray-600 italic">{t('health_guidance.nutrition.cultural_note')}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Sleep</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">{t('health_guidance.sleep.recommendation')}</p>
                          <p className="text-xs text-gray-600 italic">{t('health_guidance.sleep.cultural_note')}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Regional Information */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">Regional Configuration for {currentRegionalConfig.region}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Currency:</span>
                        <span className="ml-2 font-medium">{currentRegionalConfig.currency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date Format:</span>
                        <span className="ml-2 font-medium">{currentRegionalConfig.dateFormat}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Emergency:</span>
                        <span className="ml-2 font-medium">{getEmergencyNumber(selectedLanguage)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Units:</span>
                        <span className="ml-2 font-medium capitalize">{currentRegionalConfig.healthSystem}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Consent Management Tab */}
          <TabsContent value="consent">
            <ConsentManagement />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-gray-600"
        >
          <p>
            Healthmap is designed to meet international healthcare data protection standards 
            and provides culturally appropriate health guidance for global users.
          </p>
        </motion.div>
      </div>
    </div>
  );
}