import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Check, 
  X, 
  FileText, 
  Download, 
  Trash2, 
  AlertTriangle,
  Globe,
  Clock,
  User,
  Lock,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getRegionalConfig, getRegulationsForLanguage } from "@/lib/i18n";

interface ConsentItem {
  type: string;
  title: string;
  description: string;
  legalBasis: string;
  purpose: string;
  retention: string;
  rights: string[];
  required: boolean;
  granted: boolean;
}

interface ConsentRequest {
  userId: number;
  region: string;
  consentVersion: string;
  requiresExplicitConsent: boolean;
  consents: ConsentItem[];
  dataRetentionDays: number;
  userRights: string[];
  contactInfo: {
    dataOfficer?: string;
    privacy: string;
  };
}

interface UserLocation {
  country: string;
  region: string;
  detectedLanguage: string;
}

export default function ConsentManagement() {
  const { t, i18n } = useTranslation('common');
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [consentChanges, setConsentChanges] = useState<Record<string, boolean>>({});

  // Detect user location and language
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Get user's location from browser or IP
        const language = i18n.language || 'en';
        const regionalConfig = getRegionalConfig(language);
        
        setUserLocation({
          country: regionalConfig.region,
          region: regionalConfig.region,
          detectedLanguage: language
        });
      } catch (error) {
        console.error('Location detection failed:', error);
        setUserLocation({
          country: 'US',
          region: 'US', 
          detectedLanguage: 'en'
        });
      }
    };

    detectLocation();
  }, [i18n.language]);

  // Get consent requirements based on user's region
  const { data: consentRequest, isLoading } = useQuery<ConsentRequest>({
    queryKey: ['/api/compliance/consent-request', userLocation?.region],
    queryFn: async () => {
      if (!userLocation) return null;
      
      // Mock consent request based on region - would connect to compliance engine
      const regionalConfig = getRegionalConfig(userLocation.detectedLanguage);
      const regulations = getRegulationsForLanguage(userLocation.detectedLanguage);
      
      return {
        userId: 1, // Would be actual user ID
        region: userLocation.region,
        consentVersion: '2024.1',
        requiresExplicitConsent: ['EU', 'UK', 'CA', 'FR'].includes(userLocation.region),
        consents: [
          {
            type: 'data_processing',
            title: t('compliance.data_processing'),
            description: 'We process your health data to provide personalized health insights and recommendations.',
            legalBasis: userLocation.region === 'EU' ? 'GDPR Article 6(1)(a) - Consent' : 'HIPAA 45 CFR 164.508',
            purpose: 'Health analytics and personalized recommendations',
            retention: userLocation.region === 'EU' ? '5 years' : '7 years',
            rights: userLocation.region === 'EU' ? 
              ['Access', 'Rectification', 'Erasure', 'Portability', 'Objection'] :
              ['Access', 'Amendment', 'Accounting of disclosures'],
            required: true,
            granted: false
          },
          {
            type: 'analytics',
            title: t('compliance.analytics_consent'),
            description: 'Allow AI-powered analysis of your health data for advanced insights.',
            legalBasis: userLocation.region === 'EU' ? 
              'GDPR Article 6(1)(a) - Consent, Article 9(2)(a) - Explicit consent for health data' :
              'HIPAA voluntary authorization',
            purpose: 'AI-driven health analysis and predictive modeling',
            retention: '5 years',
            rights: userLocation.region === 'EU' ? 
              ['Access', 'Rectification', 'Erasure', 'Portability', 'Objection'] :
              ['Access', 'Amendment'],
            required: false,
            granted: false
          },
          {
            type: 'telehealth',
            title: 'Telehealth Services',
            description: 'Enable video consultations and remote medical care services.',
            legalBasis: userLocation.region === 'EU' ? 'GDPR Article 6(1)(f) - Legitimate interest' : 'HIPAA treatment authorization',
            purpose: 'Remote healthcare delivery and medical consultations',
            retention: '7 years for medical records',
            rights: ['Access', 'Amendment'],
            required: false,
            granted: false
          },
          {
            type: 'marketing',
            title: t('compliance.marketing_consent'),
            description: 'Receive health tips, newsletters, and product updates.',
            legalBasis: 'Marketing consent',
            purpose: 'Health education and product communications',
            retention: '2 years or until unsubscribe',
            rights: ['Unsubscribe', 'Access'],
            required: false,
            granted: false
          }
        ],
        dataRetentionDays: regionalConfig.region === 'EU' ? 1825 : 2555,
        userRights: userLocation.region === 'EU' ? [
          'Right to access your data',
          'Right to rectify inaccurate data',
          'Right to erasure (right to be forgotten)',
          'Right to restrict processing',
          'Right to data portability',
          'Right to object to processing'
        ] : [
          'Right to access your health information',
          'Right to request amendments',
          'Right to an accounting of disclosures',
          'Right to request restrictions'
        ],
        contactInfo: {
          dataOfficer: ['EU', 'UK', 'FR'].includes(userLocation.region) ? 'dpo@healthmap.ai' : undefined,
          privacy: 'privacy@healthmap.ai'
        }
      };
    },
    enabled: !!userLocation
  });

  // Update consent mutation
  const updateConsentMutation = useMutation({
    mutationFn: async (consentData: { type: string; granted: boolean; ipAddress: string; userAgent: string }) => {
      const res = await apiRequest('POST', '/api/compliance/consent', {
        ...consentData,
        region: userLocation?.region,
        legalBasis: consentRequest?.consents.find(c => c.type === consentData.type)?.legalBasis
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.granted ? t('compliance.consent_granted') : t('compliance.consent_withdrawn'),
        description: `Consent for ${variables.type} has been ${variables.granted ? 'granted' : 'withdrawn'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/consent-request'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update consent. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Data subject request mutations
  const dataRequestMutation = useMutation({
    mutationFn: async (requestType: 'access' | 'portability' | 'erasure') => {
      const res = await apiRequest('POST', `/api/compliance/data-subject-request/${requestType}`, {
        region: userLocation?.region
      });
      return res.json();
    },
    onSuccess: (data, requestType) => {
      toast({
        title: "Request Submitted",
        description: `Your ${requestType} request has been submitted and will be processed within the required timeframe.`,
      });
    },
  });

  const handleConsentToggle = (consentType: string, granted: boolean) => {
    setConsentChanges(prev => ({ ...prev, [consentType]: granted }));
  };

  const handleSaveConsents = async () => {
    for (const [type, granted] of Object.entries(consentChanges)) {
      await updateConsentMutation.mutateAsync({
        type,
        granted,
        ipAddress: '0.0.0.0', // Would get real IP
        userAgent: navigator.userAgent
      });
    }
    setConsentChanges({});
  };

  const getRegionIcon = (region: string) => {
    const icons: Record<string, string> = {
      'EU': '🇪🇺',
      'US': '🇺🇸', 
      'CA': '🇨🇦',
      'UK': '🇬🇧',
      'FR': '🇫🇷',
      'DE': '🇩🇪',
      'CN': '🇨🇳'
    };
    return icons[region] || '🌍';
  };

  if (isLoading || !consentRequest) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold">{t('compliance.title')}</h1>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Globe className="h-4 w-4" />
          <span>
            {getRegionIcon(consentRequest.region)} {consentRequest.region} Region
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span>Version {consentRequest.consentVersion}</span>
        </div>
      </motion.div>

      {/* Regional Compliance Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your data is protected under{' '}
            <strong>{getRegulationsForLanguage(userLocation?.detectedLanguage || 'en').join(', ')}</strong>.
            {consentRequest.requiresExplicitConsent && 
              ' Explicit consent is required for processing your health data.'
            }
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Consent Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>{t('compliance.consent_management')}</span>
            </CardTitle>
            <CardDescription>
              Manage your data processing preferences and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {consentRequest.consents.map((consent, index) => (
              <motion.div
                key={consent.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{consent.title}</h3>
                      {consent.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{consent.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Legal Basis:</span> {consent.legalBasis}
                      </div>
                      <div>
                        <span className="font-medium">Purpose:</span> {consent.purpose}
                      </div>
                      <div>
                        <span className="font-medium">Retention:</span> {consent.retention}
                      </div>
                      <div>
                        <span className="font-medium">Your Rights:</span> {consent.rights.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={consentChanges[consent.type] ?? consent.granted}
                      onCheckedChange={(checked) => handleConsentToggle(consent.type, checked)}
                      disabled={consent.required && consent.granted}
                    />
                    {(consentChanges[consent.type] ?? consent.granted) ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {Object.keys(consentChanges).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end space-x-3 pt-4 border-t"
              >
                <Button 
                  variant="outline" 
                  onClick={() => setConsentChanges({})}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={handleSaveConsents}
                  disabled={updateConsentMutation.isPending}
                >
                  {updateConsentMutation.isPending ? 'Saving...' : t('common.save')}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Rights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>{t('compliance.your_rights')}</span>
            </CardTitle>
            <CardDescription>
              Exercise your data protection rights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => dataRequestMutation.mutate('access')}
                disabled={dataRequestMutation.isPending}
              >
                <Download className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">{t('compliance.download_data')}</div>
                  <div className="text-xs text-gray-500">Get a copy of your data</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => dataRequestMutation.mutate('portability')}
                disabled={dataRequestMutation.isPending}
              >
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Export Data</div>
                  <div className="text-xs text-gray-500">Portable format for transfer</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 text-red-600 hover:text-red-700"
                onClick={() => dataRequestMutation.mutate('erasure')}
                disabled={dataRequestMutation.isPending}
              >
                <Trash2 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">{t('compliance.delete_account')}</div>
                  <div className="text-xs text-gray-500">Permanently delete data</div>
                </div>
              </Button>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Your Privacy Rights Include:</h4>
              <ul className="space-y-1 text-gray-600">
                {consentRequest.userRights.map((right, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Privacy Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {consentRequest.contactInfo.dataOfficer && (
              <div>
                <h4 className="font-medium text-sm">{t('compliance.contact_dpo')}</h4>
                <p className="text-sm text-gray-600">{consentRequest.contactInfo.dataOfficer}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium text-sm">Privacy Team</h4>
              <p className="text-sm text-gray-600">{consentRequest.contactInfo.privacy}</p>
            </div>
            <div className="text-xs text-gray-500">
              <Clock className="h-3 w-3 inline mr-1" />
              Data retention period: {Math.floor(consentRequest.dataRetentionDays / 365)} years
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}