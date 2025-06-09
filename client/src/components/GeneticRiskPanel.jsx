import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from "@tanstack/react-query";
import { 
  Dna,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  FileUp,
  Lock,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Genetic Risk Panel Component
 * Displays personalized DNA health insights and risk analysis
 */
export function GeneticRiskPanel({ userId, className = "" }) {
  const [activeRiskTab, setActiveRiskTab] = useState("traits");
  const { toast } = useToast();

  // Fetch genetic insights
  const { data: geneticData, isLoading, error } = useQuery({
    queryKey: ['/api/dna/insights'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dna/insights');
      return res.json();
    },
    enabled: !!userId,
    retry: 1
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-6 w-6 text-purple-600 animate-pulse" />
            Loading DNA Analysis...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !geneticData?.success) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-6 w-6 text-purple-600" />
            DNA Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Genetic Data Available</h3>
            <p className="text-gray-600 mb-4">
              Upload your DNA data to unlock personalized health insights and risk analysis.
            </p>
            <Link href="/dna-insights">
              <Button>Upload DNA Data</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = geneticData.genetic_insights;
  const hasTraits = insights?.traits_analyzed && Object.keys(insights.traits_analyzed).length > 0;
  const hasRisks = insights?.disease_risks && Object.keys(insights.disease_risks).length > 0;
  const hasRecommendations = insights?.actionable_recommendations && insights.actionable_recommendations.length > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="h-6 w-6 text-purple-600" />
            <CardTitle>DNA Health Insights</CardTitle>
            <Badge variant="outline" className="ml-2">
              {insights?.consent_level || 'Basic'} Analysis
            </Badge>
          </div>
          <Link href="/dna-insights">
            <Button variant="outline" size="sm">
              View Full Report
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeRiskTab} onValueChange={setActiveRiskTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="traits" disabled={!hasTraits}>
              Genetic Traits
            </TabsTrigger>
            <TabsTrigger value="risks" disabled={!hasRisks}>
              Disease Risks
            </TabsTrigger>
            <TabsTrigger value="recommendations" disabled={!hasRecommendations}>
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Genetic Traits Tab */}
          <TabsContent value="traits">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Your Genetic Traits
              </h4>
              
              {hasTraits ? (
                <div className="grid gap-3">
                  {Object.entries(insights.traits_analyzed).slice(0, 4).map(([traitKey, traitData]) => (
                    <TraitCard key={traitKey} traitData={traitData} />
                  ))}
                  {Object.keys(insights.traits_analyzed).length > 4 && (
                    <div className="text-center pt-2">
                      <Link href="/dna-insights?tab=traits">
                        <Button variant="outline" size="sm">
                          View All {Object.keys(insights.traits_analyzed).length} Traits
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Dna className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No trait analysis available</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Disease Risks Tab */}
          <TabsContent value="risks">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                Disease Risk Analysis
              </h4>
              
              {hasRisks ? (
                <div className="grid gap-3">
                  {Object.entries(insights.disease_risks).slice(0, 3).map(([riskKey, riskData]) => (
                    <RiskCard key={riskKey} riskData={riskData} />
                  ))}
                  {Object.keys(insights.disease_risks).length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/dna-insights?tab=risks">
                        <Button variant="outline" size="sm">
                          View All Risk Analysis
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Upgrade to comprehensive analysis for disease risk assessment</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Personalized Recommendations
              </h4>
              
              {hasRecommendations ? (
                <div className="space-y-3">
                  {insights.actionable_recommendations.slice(0, 3).map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} />
                  ))}
                  {insights.actionable_recommendations.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/dna-insights?tab=recommendations">
                        <Button variant="outline" size="sm">
                          View All {insights.actionable_recommendations.length} Recommendations
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No personalized recommendations available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Privacy Notice */}
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Lock className="h-4 w-4" />
            <span>Your genetic data is encrypted and private. Last updated: {insights?.last_updated ? new Date(insights.last_updated).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Individual Trait Card Component
 */
function TraitCard({ traitData }) {
  const getTraitIcon = (category) => {
    switch (category) {
      case 'nutrient_metabolism':
        return '🧬';
      case 'drug_metabolism':
        return '💊';
      case 'food_sensitivity':
        return '🥛';
      case 'neurotransmitter':
        return '🧠';
      default:
        return '🔬';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-lg">{getTraitIcon(traitData.category)}</span>
          <div className="flex-1">
            <h5 className="font-medium">{traitData.gene_name}</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Genotype: <span className="font-mono">{traitData.genotype}</span>
            </p>
            {traitData.traits?.recommendation && (
              <p className="text-xs text-gray-500 mt-1">
                {traitData.traits.recommendation}
              </p>
            )}
          </div>
        </div>
        <Badge className={getConfidenceColor(traitData.confidence)} variant="outline">
          {traitData.confidence}
        </Badge>
      </div>
    </motion.div>
  );
}

/**
 * Disease Risk Card Component
 */
function RiskCard({ riskData }) {
  const getRiskIcon = (category) => {
    if (category === 'high') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (category === 'elevated') return <TrendingUp className="h-4 w-4 text-orange-500" />;
    if (category === 'below_average') return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Shield className="h-4 w-4 text-gray-500" />;
  };

  const getRiskColor = (category) => {
    switch (category) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'elevated':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'below_average':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const riskPercentage = Math.round(riskData.absolute_risk * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getRiskIcon(riskData.risk_category)}
          <h5 className="font-medium">{riskData.disease_name}</h5>
        </div>
        <Badge className={getRiskColor(riskData.risk_category)}>
          {riskData.risk_category.replace('_', ' ')}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Lifetime Risk</span>
          <span className="font-medium">{riskPercentage}%</span>
        </div>
        <Progress value={riskPercentage} className="h-2" />
        <p className="text-xs text-gray-500">
          Risk Score: {riskData.polygenic_risk_score?.toFixed(2)}x vs. population average
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Recommendation Card Component
 */
function RecommendationCard({ recommendation }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'supplement':
        return '💊';
      case 'lifestyle':
        return '🏃';
      case 'diet':
        return '🥗';
      default:
        return '📋';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-lg">{getTypeIcon(recommendation.type)}</span>
          <div className="flex-1">
            <h5 className="font-medium">
              {recommendation.supplement || recommendation.recommendation}
            </h5>
            {recommendation.dosage && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <strong>Dosage:</strong> {recommendation.dosage}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Based on: {recommendation.gene || recommendation.evidence_level}
            </p>
          </div>
        </div>
        <Badge className={getPriorityColor(recommendation.priority)} variant="outline">
          {recommendation.priority} priority
        </Badge>
      </div>
    </motion.div>
  );
}

export default GeneticRiskPanel;