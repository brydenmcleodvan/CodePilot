import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Dna,
  FileUp,
  Globe,
  Shield,
  Heart,
  Brain,
  Utensils,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
  Upload,
  User,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Genetic Health Insight Engine Component
 * Transforms DNA data into actionable health recommendations
 */
export function GeneticHealthEngine() {
  const [uploadingData, setUploadingData] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch genetic insights
  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['/api/genetic/insights'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/genetic/insights');
      return res.json();
    }
  });

  // Upload genetic data mutation
  const uploadGeneticDataMutation = useMutation({
    mutationFn: async (geneticData) => {
      const res = await apiRequest('POST', '/api/genetic/upload', geneticData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Genetic Analysis Complete!",
        description: `Processed ${data.processed_variants} genetic variants with ${Math.round(data.ancestry_confidence * 100)}% ancestry confidence.`
      });
      queryClient.invalidateQueries(['/api/genetic/insights']);
      setShowUploadDialog(false);
    }
  });

  const insights = insightsData?.insights;
  const hasGeneticData = Boolean(insights);
  const isDark = effectiveTheme === 'dark';

  const insightCategories = [
    {
      id: 'traits',
      name: 'Genetic Traits',
      icon: Dna,
      description: 'Metabolism and physical characteristics',
      data: insights?.trait_predictions || []
    },
    {
      id: 'ancestry',
      name: 'Ancestry Insights',
      icon: Globe,
      description: 'Heritage-based health predispositions',
      data: insights?.ancestry_insights || {}
    },
    {
      id: 'nutrition',
      name: 'Nutritional Needs',
      icon: Utensils,
      description: 'Personalized dietary recommendations',
      data: insights?.nutritional_recommendations || []
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle Optimization',
      icon: Activity,
      description: 'Exercise and lifestyle adjustments',
      data: insights?.lifestyle_optimizations || []
    }
  ];

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
          <Dna className="h-8 w-8 text-purple-600" />
          <span>Genetic Health Insights</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Transform your DNA data into personalized health recommendations. 
          Get trait-based insights, ancestry correlations, and carrier screening results.
        </p>
      </div>

      {/* DNA Upload Section */}
      {!hasGeneticData ? (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20">
          <CardContent className="p-8 text-center">
            <Dna className="h-16 w-16 text-purple-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Upload Your Genetic Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Upload raw DNA data from 23andMe, AncestryDNA, or other genetic testing services 
              to unlock personalized health insights.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="space-y-2">
                <Utensils className="h-8 w-8 text-green-600 mx-auto" />
                <h4 className="font-semibold">Nutritional Insights</h4>
                <p className="text-sm text-gray-600">Metabolism and dietary needs</p>
              </div>
              <div className="space-y-2">
                <Globe className="h-8 w-8 text-blue-600 mx-auto" />
                <h4 className="font-semibold">Ancestry Health</h4>
                <p className="text-sm text-gray-600">Heritage-based predispositions</p>
              </div>
              <div className="space-y-2">
                <Shield className="h-8 w-8 text-orange-600 mx-auto" />
                <h4 className="font-semibold">Carrier Screening</h4>
                <p className="text-sm text-gray-600">Genetic risk assessment</p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => setShowUploadDialog(true)}
              disabled={uploadGeneticDataMutation.isPending}
            >
              {uploadGeneticDataMutation.isPending ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Processing DNA Data...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload Genetic Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Genetic Profile Summary */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-800 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <Dna className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Genetic Profile Active</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your DNA data has been analyzed for personalized health insights
                    </p>
                    {insights.ancestry_insights && (
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Primary: {insights.ancestry_insights.primary_ancestry?.replace('_', ' ')} 
                          ({Math.round(insights.ancestry_insights.primary_percentage * 100)}%)
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insights.trait_predictions?.length || 0} Traits Analyzed
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button variant="outline">
                  <FileUp className="h-4 w-4 mr-2" />
                  Update Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Insight Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insightCategories.map((category) => (
              <InsightCategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="traits" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="traits">Genetic Traits</TabsTrigger>
              <TabsTrigger value="ancestry">Ancestry</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="risks">Health Risks</TabsTrigger>
              <TabsTrigger value="carrier">Carrier Status</TabsTrigger>
            </TabsList>

            {/* Traits Tab */}
            <TabsContent value="traits">
              <TraitsPanel traits={insights?.trait_predictions || []} />
            </TabsContent>

            {/* Ancestry Tab */}
            <TabsContent value="ancestry">
              <AncestryPanel ancestry={insights?.ancestry_insights} predispositions={insights?.health_predispositions} />
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition">
              <NutritionPanel recommendations={insights?.nutritional_recommendations || []} />
            </TabsContent>

            {/* Health Risks Tab */}
            <TabsContent value="risks">
              <RisksPanel assessments={insights?.risk_assessments || []} />
            </TabsContent>

            {/* Carrier Screening Tab */}
            <TabsContent value="carrier">
              <CarrierPanel screening={insights?.carrier_screening || []} />
            </TabsContent>
          </Tabs>

          {/* Genetic Disclaimer */}
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This genetic analysis is for informational purposes only and should not replace professional medical advice. 
              Genetic predictions are probabilistic and influenced by environmental factors. 
              Consult healthcare providers and genetic counselors for medical decisions.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}

/**
 * Insight Category Card Component
 */
function InsightCategoryCard({ category }) {
  const getDataCount = (data) => {
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object' && data !== null) return Object.keys(data).length;
    return 0;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <category.icon className="h-6 w-6 text-purple-600" />
          <Badge variant="outline">{getDataCount(category.data)} insights</Badge>
        </div>
        
        <h3 className="font-semibold mb-1">{category.name}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {category.description}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Traits Panel Component
 */
function TraitsPanel({ traits }) {
  return (
    <div className="space-y-4">
      {traits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Dna className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Genetic Traits Analyzed</h3>
            <p className="text-gray-600">Upload genetic data to see trait predictions.</p>
          </CardContent>
        </Card>
      ) : (
        traits.map((trait, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className="bg-purple-100 text-purple-800">{trait.gene}</Badge>
                    <h4 className="font-semibold">{trait.description}</h4>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {trait.implications}
                  </p>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Recommendations:</h5>
                    {trait.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-600 mb-1">Confidence</div>
                  <div className="font-semibold">{Math.round(trait.confidence * 100)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

/**
 * Ancestry Panel Component
 */
function AncestryPanel({ ancestry, predispositions = [] }) {
  if (!ancestry) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Ancestry Data</h3>
          <p className="text-gray-600">Upload genetic data to see ancestry insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ancestry Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(ancestry.composition).map(([population, percentage]) => (
              <div key={population} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{population.replace('_', ' ')}</span>
                  <span className="font-medium">{Math.round(percentage * 100)}%</span>
                </div>
                <Progress value={percentage * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Predispositions by Ancestry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predispositions.map((pred, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold capitalize">{pred.condition}</h4>
                <p className="text-sm text-gray-600 mb-2">{pred.description}</p>
                <div className="flex items-center space-x-4 text-xs">
                  <Badge variant="outline">
                    {pred.ancestry_contribution} ancestry
                  </Badge>
                  <span>Frequency: {(pred.frequency * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Nutrition Panel Component
 */
function NutritionPanel({ recommendations }) {
  return (
    <div className="space-y-4">
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Nutritional Insights</h3>
            <p className="text-gray-600">Upload genetic data to see personalized nutrition recommendations.</p>
          </CardContent>
        </Card>
      ) : (
        recommendations.map((rec, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Utensils className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="capitalize">{rec.type.replace('_', ' ')}</Badge>
                    <span className="text-sm text-gray-600">
                      Confidence: {Math.round(rec.confidence * 100)}%
                    </span>
                  </div>
                  
                  <p className="text-gray-800 dark:text-gray-200 mb-2">{rec.recommendation}</p>
                  
                  <p className="text-sm text-gray-600">
                    Based on: {rec.genetic_basis}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

/**
 * Risks Panel Component
 */
function RisksPanel({ assessments }) {
  return (
    <div className="space-y-4">
      {assessments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Risk Assessments</h3>
            <p className="text-gray-600">Upload genetic data to see health risk analysis.</p>
          </CardContent>
        </Card>
      ) : (
        assessments.map((assessment, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold capitalize">{assessment.risk_category.replace('_', ' ')}</h4>
                  <Badge className={
                    assessment.baseline_risk === 'elevated' ? 'bg-orange-100 text-orange-800' :
                    assessment.baseline_risk === 'higher' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {assessment.baseline_risk} risk
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Genetic Factors:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {assessment.genetic_factors.map((factor, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Dna className="h-3 w-3 mt-1 flex-shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Modifiable Factors:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {assessment.modifiable_factors.map((factor, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Zap className="h-3 w-3 mt-1 flex-shrink-0" />
                          <span className="capitalize">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <h5 className="font-medium text-sm mb-1">Recommendation:</h5>
                  <p className="text-sm text-blue-800 dark:text-blue-400">{assessment.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

/**
 * Carrier Panel Component
 */
function CarrierPanel({ screening }) {
  return (
    <div className="space-y-4">
      {screening.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Carrier Screening</h3>
            <p className="text-gray-600">Upload genetic data to see carrier status analysis.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Carrier screening identifies genetic variants that could be passed to offspring. 
              This information is important for family planning decisions.
            </AlertDescription>
          </Alert>
          
          {screening.map((screen, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold capitalize">{screen.condition}</h4>
                    <div className="flex items-center space-x-2">
                      {screen.screening_recommended && (
                        <Badge className="bg-yellow-100 text-yellow-800">Screening Recommended</Badge>
                      )}
                      {screen.genetic_counseling && (
                        <Badge className="bg-purple-100 text-purple-800">Genetic Counseling</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400">{screen.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Carrier Risk:</span>
                      <div>{(screen.carrier_risk * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="font-medium">Population Frequency:</span>
                      <div>{(screen.population_frequency * 100).toFixed(2)}%</div>
                    </div>
                    <div>
                      <span className="font-medium">Ancestry Group:</span>
                      <div className="capitalize">{screen.ancestry_group.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

export default GeneticHealthEngine;