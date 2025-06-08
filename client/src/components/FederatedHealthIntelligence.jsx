import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Globe,
  Brain,
  Shield,
  Lightbulb,
  Users,
  TrendingUp,
  Eye,
  Award,
  BookOpen,
  Microscope,
  Heart,
  Zap,
  Lock,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Federated Health Intelligence Component
 * Enables participation in global health research with privacy preservation
 */
export function FederatedHealthIntelligence() {
  const [showParticipationDialog, setShowParticipationDialog] = useState(false);
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);
  const { toast } = useToast();

  // Fetch participation status
  const { data: participationData, isLoading } = useQuery({
    queryKey: ['/api/federated-health/participation'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/federated-health/participation');
      return res.json();
    }
  });

  // Fetch global discoveries
  const { data: discoveriesData } = useQuery({
    queryKey: ['/api/federated-health/discoveries'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/federated-health/discoveries');
      return res.json();
    }
  });

  // Enable participation mutation
  const enableParticipationMutation = useMutation({
    mutationFn: async (participationOptions) => {
      const res = await apiRequest('POST', '/api/federated-health/enable', participationOptions);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Research Participation Enabled!",
        description: "You're now contributing to global health discoveries while maintaining complete privacy."
      });
      setShowParticipationDialog(false);
      queryClient.invalidateQueries(['/api/federated-health/participation']);
    }
  });

  const isParticipating = participationData?.participating || false;
  const discoveries = discoveriesData?.discoveries || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Globe className="h-8 w-8 text-blue-600" />
          <span>Federated Health Intelligence</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Join a global network of health research participants. Your anonymized data contributes to breakthrough 
          medical discoveries while maintaining complete privacy through advanced federated learning.
        </p>
      </div>

      {/* Participation Status */}
      <Card className={`border-2 ${isParticipating ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isParticipating ? 'bg-green-100 dark:bg-green-800' : 'bg-blue-100 dark:bg-blue-800'}`}>
                {isParticipating ? 
                  <Heart className="h-8 w-8 text-green-600" /> :
                  <Globe className="h-8 w-8 text-blue-600" />
                }
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {isParticipating ? 'Contributing to Global Health Research' : 'Ready to Make a Difference?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isParticipating ? 
                    'Your anonymized data is helping researchers discover new health insights worldwide.' :
                    'Join thousands of users contributing to breakthrough medical discoveries.'
                  }
                </p>
                {isParticipating && participationData?.stats && (
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>Contributions: {participationData.stats.contributions}</span>
                    <span>•</span>
                    <span>Impact Score: {participationData.stats.impactScore}/100</span>
                    <span>•</span>
                    <span>Privacy Level: {participationData.privacyLevel}</span>
                  </div>
                )}
              </div>
            </div>
            
            {!isParticipating && (
              <Button size="lg" onClick={() => setShowParticipationDialog(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Join Research Network
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="discoveries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discoveries">Global Discoveries</TabsTrigger>
          <TabsTrigger value="insights">Research Insights</TabsTrigger>
          <TabsTrigger value="participation">My Participation</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
        </TabsList>

        {/* Discoveries Tab */}
        <TabsContent value="discoveries">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest Breakthrough Discoveries</h2>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                {discoveries.length} Recent Findings
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {discoveries.length === 0 ? (
                <div className="col-span-2">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Discoveries Loading</h3>
                      <p className="text-gray-600">
                        Our federated learning models are analyzing global health data to generate new insights.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                discoveries.map((discovery) => (
                  <DiscoveryCard
                    key={discovery.id}
                    discovery={discovery}
                    onViewDetails={(discovery) => setSelectedDiscovery(discovery)}
                  />
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <div className="space-y-6">
            <ResearchInsightsSection />
          </div>
        </TabsContent>

        {/* Participation Tab */}
        <TabsContent value="participation">
          <div className="space-y-6">
            {isParticipating ? (
              <ParticipationDashboard participationData={participationData} />
            ) : (
              <ParticipationInvitation onJoin={() => setShowParticipationDialog(true)} />
            )}
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            <PrivacySecuritySection />
          </div>
        </TabsContent>
      </Tabs>

      {/* Participation Dialog */}
      <Dialog open={showParticipationDialog} onOpenChange={setShowParticipationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Join the Global Health Research Network</DialogTitle>
          </DialogHeader>
          
          <ParticipationForm 
            onSubmit={(data) => enableParticipationMutation.mutate(data)}
            isLoading={enableParticipationMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Discovery Details Dialog */}
      <Dialog open={selectedDiscovery !== null} onOpenChange={() => setSelectedDiscovery(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Research Discovery Details</DialogTitle>
          </DialogHeader>
          
          {selectedDiscovery && (
            <DiscoveryDetails discovery={selectedDiscovery} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Discovery Card Component
 */
function DiscoveryCard({ discovery, onViewDetails }) {
  const getImpactColor = (potential) => {
    if (potential >= 0.95) return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    if (potential >= 0.85) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    if (potential >= 0.75) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-green-600 bg-green-100 dark:bg-green-900/20';
  };

  return (
    <Card className="transition-all hover:shadow-lg cursor-pointer" onClick={() => onViewDetails(discovery)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{discovery.title}</CardTitle>
          <Badge className={getImpactColor(discovery.breakthrough_potential)}>
            {Math.round(discovery.breakthrough_potential * 100)}% Impact
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {discovery.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium">Sample Size:</span>
            <p>{discovery.sample_size?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium">Confidence:</span>
            <p>{Math.round((discovery.statistical_significance || 0) * 100)}%</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Microscope className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Clinical Research</span>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Research Insights Section
 */
function ResearchInsightsSection() {
  const insights = [
    {
      category: 'Environmental Health',
      title: 'Air Quality & Recovery Patterns',
      insight: 'Users in areas with PM2.5 levels above 35 μg/m³ show 23% slower recovery from physical exercise.',
      impact: 'Policy recommendations for urban planning and personal health alerts.',
      participants: 15420
    },
    {
      category: 'Digital Biomarkers',
      title: 'Sleep Fragmentation Predictors',
      insight: 'Specific sleep interruption patterns can predict metabolic dysfunction 6 months before traditional markers.',
      impact: 'Early intervention opportunities for diabetes prevention.',
      participants: 8750
    },
    {
      category: 'Population Health',
      title: 'Social Support & Recovery',
      insight: 'Individuals with strong social connections recover from illness 31% faster across all age groups.',
      impact: 'Evidence for social prescribing in healthcare systems.',
      participants: 22100
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Research Insights from Our Network</h2>
      
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{insight.category}</Badge>
                <span className="text-sm text-gray-600">{insight.participants.toLocaleString()} participants</span>
              </div>
              
              <h3 className="font-semibold">{insight.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{insight.insight}</p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  <strong>Impact:</strong> {insight.impact}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Participation Dashboard
 */
function ParticipationDashboard({ participationData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Research Contribution</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Data Contributions</p>
                <p className="text-2xl font-bold">{participationData?.stats?.contributions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Impact Score</p>
                <p className="text-2xl font-bold">{participationData?.stats?.impactScore || 0}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Privacy Level</p>
                <p className="text-lg font-semibold capitalize">{participationData?.privacyLevel || 'High'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Contribution Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(participationData?.categories || []).map((category, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <Checkbox checked disabled />
                <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Participation Invitation
 */
function ParticipationInvitation({ onJoin }) {
  return (
    <Card className="text-center">
      <CardContent className="p-12">
        <Globe className="h-16 w-16 text-blue-600 mx-auto mb-6" />
        <h3 className="text-2xl font-bold mb-4">Join the Global Health Research Network</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Your anonymized health data can help researchers discover breakthrough treatments and 
          preventive measures that benefit millions of people worldwide.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="space-y-2">
            <Shield className="h-8 w-8 text-green-600 mx-auto" />
            <h4 className="font-semibold">Complete Privacy</h4>
            <p className="text-sm text-gray-600">Advanced anonymization ensures your data cannot be traced back to you</p>
          </div>
          <div className="space-y-2">
            <Lightbulb className="h-8 w-8 text-yellow-600 mx-auto" />
            <h4 className="font-semibold">Breakthrough Discoveries</h4>
            <p className="text-sm text-gray-600">Contribute to medical research that could save lives</p>
          </div>
          <div className="space-y-2">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto" />
            <h4 className="font-semibold">Personal Insights</h4>
            <p className="text-sm text-gray-600">Get enhanced insights about your own health patterns</p>
          </div>
        </div>
        
        <Button size="lg" onClick={onJoin}>
          <Heart className="h-4 w-4 mr-2" />
          Start Contributing to Research
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Privacy & Security Section
 */
function PrivacySecuritySection() {
  const privacyFeatures = [
    {
      title: 'Differential Privacy',
      description: 'Mathematical guarantee that your individual data cannot be identified',
      icon: Shield,
      status: 'Active'
    },
    {
      title: 'Federated Learning',
      description: 'Models are trained without your raw data ever leaving your device',
      icon: Brain,
      status: 'Active'
    },
    {
      title: 'K-Anonymity',
      description: 'Your data is grouped with at least 5 other similar profiles',
      icon: Users,
      status: 'Active'
    },
    {
      title: 'Secure Aggregation',
      description: 'Individual contributions are cryptographically protected',
      icon: Lock,
      status: 'Active'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Privacy & Security Guarantees</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {privacyFeatures.map((feature, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <feature.icon className="h-6 w-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Rights & Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Withdrawal Rights</h4>
              <p className="text-sm text-gray-600">You can withdraw from research participation at any time with immediate effect.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Data Retention</h4>
              <p className="text-sm text-gray-600">Your data contributions are automatically deleted after 2 years maximum.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Transparency Reports</h4>
              <p className="text-sm text-gray-600">Regular reports on how your data contributes to research discoveries.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Benefit Sharing</h4>
              <p className="text-sm text-gray-600">First access to health insights derived from the research network.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Participation Form Component
 */
function ParticipationForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    privacyLevel: 'high',
    categories: [],
    dataRetention: '2_years',
    benefitSharing: true
  });

  const categories = [
    { id: 'vitals', name: 'Vital Signs', description: 'Heart rate, blood pressure, temperature' },
    { id: 'activity', name: 'Physical Activity', description: 'Exercise patterns and movement data' },
    { id: 'sleep', name: 'Sleep Patterns', description: 'Sleep duration, quality, and cycles' },
    { id: 'nutrition', name: 'Nutrition Data', description: 'Dietary patterns and meal timing' },
    { id: 'mental_health', name: 'Mental Health', description: 'Mood tracking and stress indicators' },
    { id: 'environmental', name: 'Environmental Data', description: 'Location-based environmental factors' }
  ];

  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Privacy Level */}
      <div>
        <label className="block text-sm font-medium mb-2">Privacy Level</label>
        <Select value={formData.privacyLevel} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, privacyLevel: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="maximum">Maximum Privacy (Lowest research value)</SelectItem>
            <SelectItem value="high">High Privacy (Recommended)</SelectItem>
            <SelectItem value="balanced">Balanced Privacy & Research Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Categories */}
      <div>
        <label className="block text-sm font-medium mb-2">Data Categories to Contribute</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                checked={formData.categories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{category.name}</h4>
                <p className="text-xs text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div>
          <h4 className="font-medium">Enhanced Personal Insights</h4>
          <p className="text-sm text-gray-600">
            Receive advanced health insights generated from the global research network
          </p>
        </div>
        <Switch
          checked={formData.benefitSharing}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, benefitSharing: checked }))
          }
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || formData.categories.length === 0}
      >
        {isLoading ? (
          <>
            <Brain className="h-4 w-4 mr-2 animate-pulse" />
            Enabling Participation...
          </>
        ) : (
          <>
            <Heart className="h-4 w-4 mr-2" />
            Join Global Health Research
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * Discovery Details Component
 */
function DiscoveryDetails({ discovery }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{discovery.title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{discovery.description}</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-sm font-medium">Sample Size</span>
          <p className="text-lg font-bold">{discovery.sample_size?.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-sm font-medium">Confidence</span>
          <p className="text-lg font-bold">{Math.round((discovery.statistical_significance || 0) * 100)}%</p>
        </div>
        <div>
          <span className="text-sm font-medium">Clinical Relevance</span>
          <p className="text-lg font-bold">{Math.round((discovery.clinical_relevance || 0) * 100)}%</p>
        </div>
        <div>
          <span className="text-sm font-medium">Breakthrough Potential</span>
          <p className="text-lg font-bold">{Math.round((discovery.breakthrough_potential || 0) * 100)}%</p>
        </div>
      </div>
      
      {discovery.potential_applications && (
        <div>
          <h4 className="font-semibold mb-2">Potential Applications</h4>
          <ul className="space-y-1">
            {discovery.potential_applications.map((application, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Zap className="h-3 w-3 text-blue-600" />
                <span className="text-sm">{application}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FederatedHealthIntelligence;