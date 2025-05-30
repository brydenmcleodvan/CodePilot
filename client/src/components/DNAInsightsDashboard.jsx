import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Dna,
  Shield,
  FileUp,
  Brain,
  Heart,
  Pill,
  AlertTriangle,
  Coffee,
  Sun,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * DNA Insights Dashboard Component
 * Comprehensive genetic analysis for personalized health recommendations
 */
export function DNAInsightsDashboard() {
  const [uploadingDNA, setUploadingDNA] = useState(false);
  const [consentLevel, setConsentLevel] = useState('basic');
  const { toast } = useToast();

  // Fetch genetic insights
  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/dna/insights'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dna/insights');
      return res.json();
    }
  });

  // Upload genetic data mutation
  const uploadDNAMutation = useMutation({
    mutationFn: async (geneticData) => {
      const res = await apiRequest('POST', '/api/dna/process', {
        raw_genetic_data: geneticData,
        consent_level: consentLevel
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "DNA Analysis Complete",
        description: `Generated ${data.recommendations_count} personalized recommendations`
      });
      queryClient.invalidateQueries(['/api/dna/insights']);
      setUploadingDNA(false);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
      setUploadingDNA(false);
    }
  });

  const handleDNAUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingDNA(true);
    
    // For demo purposes, simulate genetic data processing
    setTimeout(() => {
      uploadDNAMutation.mutate({
        file_name: file.name,
        file_size: file.size,
        upload_timestamp: new Date().toISOString()
      });
    }, 2000);
  };

  const hasGeneticData = insightsData?.success && insightsData?.genetic_insights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DNAInsightsHeader 
        hasData={hasGeneticData}
        onUpload={handleDNAUpload}
        uploading={uploadingDNA}
        consentLevel={consentLevel}
        onConsentChange={setConsentLevel}
      />

      {hasGeneticData ? (
        /* Main Dashboard with Genetic Insights */
        <Tabs defaultValue="traits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="traits">Trait Reports</TabsTrigger>
            <TabsTrigger value="risks">Disease Risks</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="traits">
            <TraitReportsPanel insights={insightsData.genetic_insights} />
          </TabsContent>

          <TabsContent value="risks">
            <DiseaseRiskPanel insights={insightsData.genetic_insights} />
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendationsPanel insights={insightsData.genetic_insights} />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacyControlsPanel />
          </TabsContent>
        </Tabs>
      ) : (
        /* Getting Started Guide */
        <GettingStartedPanel 
          onUpload={handleDNAUpload}
          uploading={uploadingDNA}
          consentLevel={consentLevel}
          onConsentChange={setConsentLevel}
        />
      )}
    </div>
  );
}

/**
 * DNA Insights Header Component
 */
function DNAInsightsHeader({ hasData, onUpload, uploading, consentLevel, onConsentChange }) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Dna className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold">DNA Insights</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        Transform your genetic data into personalized health insights and actionable recommendations.
        Your DNA data remains private and encrypted at all times.
      </p>

      {hasData && (
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Analysis Complete
          </Badge>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".txt,.csv,.tsv"
              onChange={onUpload}
              className="hidden"
              id="dna-upload-update"
              disabled={uploading}
            />
            <label htmlFor="dna-upload-update">
              <Button variant="outline" size="sm" disabled={uploading}>
                <FileUp className="h-4 w-4 mr-1" />
                Update Data
              </Button>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Getting Started Panel Component
 */
function GettingStartedPanel({ onUpload, uploading, consentLevel, onConsentChange }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Dna className="h-6 w-6 text-purple-600" />
            <span>Get Started with DNA Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Upload your raw DNA data from 23andMe, AncestryDNA, or other genetic testing services 
              to receive personalized health insights and recommendations.
            </p>

            {/* Consent Level Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Choose Your Analysis Level</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => onConsentChange('basic')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    consentLevel === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <h4 className="font-medium">Basic Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Trait reports for nutrition, fitness, and wellness
                  </p>
                </button>
                
                <button
                  onClick={() => onConsentChange('comprehensive')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    consentLevel === 'comprehensive' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <h4 className="font-medium">Comprehensive Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Includes disease risk analysis and polygenic scores
                  </p>
                </button>
              </div>
            </div>

            {/* Upload Button */}
            <div>
              <input
                type="file"
                accept=".txt,.csv,.tsv"
                onChange={onUpload}
                className="hidden"
                id="dna-upload"
                disabled={uploading}
              />
              <label htmlFor="dna-upload">
                <Button size="lg" disabled={uploading} className="w-48">
                  {uploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload DNA Data
                    </>
                  )}
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Your Privacy is Protected</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Encrypted Storage</h4>
              <p className="text-sm text-gray-600">Your genetic data is encrypted and secure</p>
            </div>
            <div className="text-center">
              <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium">Full Control</h4>
              <p className="text-sm text-gray-600">You decide what data to analyze and share</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">No Sharing</h4>
              <p className="text-sm text-gray-600">Your data is never sold or shared without consent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Trait Reports Panel Component
 */
function TraitReportsPanel({ insights }) {
  const mockTraits = [
    {
      gene: 'MTHFR',
      variant: 'C677T',
      genotype: 'CT',
      trait: 'Folate Metabolism',
      result: 'Reduced efficiency',
      icon: Pill,
      color: 'text-orange-600',
      recommendation: 'Methylated folate and B12 supplements'
    },
    {
      gene: 'CYP1A2',
      variant: 'rs762551',
      genotype: 'AC',
      trait: 'Caffeine Metabolism',
      result: 'Moderate metabolizer',
      icon: Coffee,
      color: 'text-brown-600',
      recommendation: 'Limit to 200mg caffeine, avoid after 2pm'
    },
    {
      gene: 'VDR',
      variant: 'BsmI',
      genotype: 'Bb',
      trait: 'Vitamin D Sensitivity',
      result: 'Moderate efficiency',
      icon: Sun,
      color: 'text-yellow-600',
      recommendation: '2000 IU daily vitamin D3'
    },
    {
      gene: 'LCT',
      variant: 'rs4988235',
      genotype: 'AG',
      trait: 'Lactose Tolerance',
      result: 'Reduced tolerance',
      icon: AlertTriangle,
      color: 'text-red-600',
      recommendation: 'Limit dairy, choose lactose-free options'
    }
  ];

  return (
    <div className="space-y-4">
      {mockTraits.map((trait, index) => {
        const Icon = trait.icon;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Icon className={`h-6 w-6 ${trait.color} flex-shrink-0 mt-1`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{trait.trait}</h3>
                      <Badge variant="outline">{trait.gene}</Badge>
                      <Badge variant="secondary">{trait.genotype}</Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                      <strong>Result:</strong> {trait.result}
                    </p>
                    
                    <p className="text-gray-700">
                      <strong>Recommendation:</strong> {trait.recommendation}
                    </p>
                  </div>
                </div>
                
                <Badge className="bg-blue-100 text-blue-800">
                  High Confidence
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Disease Risk Panel Component
 */
function DiseaseRiskPanel({ insights }) {
  const mockRisks = [
    {
      disease: 'Type 2 Diabetes',
      risk_score: 1.2,
      risk_category: 'average',
      absolute_risk: 0.13,
      icon: Heart,
      color: 'text-green-600',
      prevention: ['Maintain healthy weight', 'Regular exercise', 'Low glycemic diet']
    },
    {
      disease: 'Cardiovascular Disease',
      risk_score: 1.6,
      risk_category: 'elevated',
      absolute_risk: 0.32,
      icon: Heart,
      color: 'text-orange-600',
      prevention: ['Mediterranean diet', 'Aerobic exercise', 'Monitor cholesterol']
    },
    {
      disease: "Alzheimer's Disease",
      risk_score: 0.8,
      risk_category: 'below_average',
      absolute_risk: 0.10,
      icon: Brain,
      color: 'text-blue-600',
      prevention: ['Cognitive training', 'Social engagement', 'Quality sleep']
    }
  ];

  const getRiskColor = (category) => {
    switch (category) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'elevated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'average': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'below_average': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {mockRisks.map((risk, index) => {
        const Icon = risk.icon;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-6 w-6 ${risk.color}`} />
                  <h3 className="font-semibold text-lg">{risk.disease}</h3>
                </div>
                
                <Badge className={getRiskColor(risk.risk_category)}>
                  {risk.risk_category.replace('_', ' ')} risk
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Risk Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Polygenic Risk Score:</span>
                      <span className="font-medium">{risk.risk_score}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lifetime Risk:</span>
                      <span className="font-medium">{(risk.absolute_risk * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Prevention Strategies</h4>
                  <ul className="space-y-1">
                    {risk.prevention.map((strategy, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Recommendations Panel Component
 */
function RecommendationsPanel({ insights }) {
  const mockRecommendations = [
    {
      type: 'supplement',
      category: 'nutrient_optimization',
      title: 'Methylated B Complex',
      description: 'Due to MTHFR C677T variant, use methylated forms of folate and B12',
      dosage: '800 mcg methylfolate + 1000 mcg methylcobalamin daily',
      priority: 'high',
      evidence: 'Genetic variant',
      icon: Pill
    },
    {
      type: 'lifestyle',
      category: 'caffeine_management',
      title: 'Optimize Caffeine Intake',
      description: 'Moderate caffeine metabolism suggests limiting intake timing',
      dosage: 'Maximum 200mg daily, avoid after 2 PM',
      priority: 'medium',
      evidence: 'CYP1A2 variant',
      icon: Coffee
    },
    {
      type: 'supplement',
      category: 'nutrient_optimization',
      title: 'Vitamin D3',
      description: 'VDR variant indicates higher vitamin D requirements',
      dosage: '2000 IU daily with monitoring',
      priority: 'medium',
      evidence: 'Genetic variant',
      icon: Sun
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {mockRecommendations.map((rec, index) => {
        const Icon = rec.icon;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Icon className="h-6 w-6 text-purple-600" />
                  <h3 className="font-semibold">{rec.title}</h3>
                </div>
                
                <Badge className={getPriorityColor(rec.priority)}>
                  {rec.priority} priority
                </Badge>
              </div>
              
              <p className="text-gray-700 mb-3">{rec.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Recommended Dosage:</p>
                  <p className="text-gray-600 text-sm">{rec.dosage}</p>
                </div>
                
                <Badge variant="outline">
                  {rec.evidence}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Privacy Controls Panel Component
 */
function PrivacyControlsPanel() {
  const [privacySettings, setPrivacySettings] = useState({
    data_sharing: false,
    research_participation: false,
    family_sharing: false,
    third_party_sharing: false
  });

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Privacy & Data Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your genetic data is encrypted and stored securely. You have complete control over how your data is used.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Sharing</h4>
                <p className="text-sm text-gray-600">Allow aggregated data to improve recommendations</p>
              </div>
              <Switch
                checked={privacySettings.data_sharing}
                onCheckedChange={(checked) => handlePrivacyChange('data_sharing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Research Participation</h4>
                <p className="text-sm text-gray-600">Contribute to genetic research studies</p>
              </div>
              <Switch
                checked={privacySettings.research_participation}
                onCheckedChange={(checked) => handlePrivacyChange('research_participation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Family Sharing</h4>
                <p className="text-sm text-gray-600">Share relevant insights with family members</p>
              </div>
              <Switch
                checked={privacySettings.family_sharing}
                onCheckedChange={(checked) => handlePrivacyChange('family_sharing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Third-party Integration</h4>
                <p className="text-sm text-gray-600">Allow integration with healthcare providers</p>
              </div>
              <Switch
                checked={privacySettings.third_party_sharing}
                onCheckedChange={(checked) => handlePrivacyChange('third_party_sharing', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Download My Data
          </Button>
          <Button variant="outline" className="w-full">
            Update Consent Preferences
          </Button>
          <Button variant="destructive" className="w-full">
            Delete Genetic Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default DNAInsightsDashboard;