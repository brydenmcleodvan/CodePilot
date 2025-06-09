import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Watch, 
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  Star,
  TrendingUp,
  ExternalLink,
  Zap,
  Clock,
  RefreshCw,
  Plus,
  Shield,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface HealthIntegration {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'health_app' | 'medical_device';
  provider: 'garmin' | 'whoop' | 'samsung' | 'apple' | 'fitbit' | 'oura' | 'dexcom';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: string;
  dataTypes: string[];
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  permissions: string[];
}

interface MarketplaceProduct {
  id: string;
  name: string;
  category: 'supplements' | 'sleep_aids' | 'fitness_equipment' | 'health_monitoring' | 'nutrition';
  description: string;
  price: number;
  affiliateLink: string;
  affiliateCommission: number;
  rating: number;
  reviewCount: number;
  brand: string;
  imageUrl: string;
  healthBenefits: string[];
  targetConditions: string[];
  featured: boolean;
}

interface PersonalizedRecommendation {
  productId: string;
  product: MarketplaceProduct;
  relevanceScore: number;
  reasoning: string;
  healthDataTrigger: {
    metricType: string;
    currentValue: number;
    targetValue: number;
    trend: string;
  };
  urgency: 'high' | 'medium' | 'low';
  estimatedBenefit: string;
}

export default function IntegrationsMarketplace() {
  const [selectedTab, setSelectedTab] = useState('integrations');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch user integrations
  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<HealthIntegration[]>({
    queryKey: ['/api/integrations'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch marketplace products
  const { data: products = [] } = useQuery<MarketplaceProduct[]>({
    queryKey: ['/api/marketplace/products', selectedCategory],
  });

  // Fetch personalized recommendations
  const { data: recommendations = [] } = useQuery<PersonalizedRecommendation[]>({
    queryKey: ['/api/marketplace/recommendations'],
  });

  // Connect integration mutation
  const connectIntegrationMutation = useMutation({
    mutationFn: async ({ provider, authCode }: { provider: string; authCode: string }) => {
      const response = await apiRequest('POST', '/api/integrations/connect', { provider, authCode });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    }
  });

  // Sync integration mutation
  const syncIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      await apiRequest('POST', `/api/integrations/${integrationId}/sync`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'disconnected': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'garmin': return '🏃‍♂️';
      case 'whoop': return '💪';
      case 'samsung': return '📱';
      case 'apple': return '🍎';
      case 'fitbit': return '⌚';
      case 'oura': return '💍';
      default: return '📊';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatLastSync = (lastSync: string) => {
    const date = new Date(lastSync);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleConnectIntegration = (provider: string) => {
    // In a real implementation, this would initiate OAuth flow
    const mockAuthCode = `auth_${provider}_${Date.now()}`;
    connectIntegrationMutation.mutate({ provider, authCode: mockAuthCode });
  };

  const handleSyncIntegration = (integrationId: string) => {
    syncIntegrationMutation.mutate(integrationId);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Smartphone className="h-8 w-8 text-indigo-600" />
            </div>
            <span>Integrations & Marketplace</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connect your devices and discover products tailored to your health data
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Device Integrations</TabsTrigger>
          <TabsTrigger value="recommendations">Personalized Products</TabsTrigger>
          <TabsTrigger value="marketplace">Health Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Integration Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {integrations.filter(i => i.status === 'connected').length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {integrations.filter(i => i.syncFrequency === 'realtime').length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Real-time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {integrations.reduce((sum, i) => sum + i.dataTypes.length, 0)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Data Types</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {integrations.filter(i => i.status === 'error').length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Integrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['garmin', 'whoop', 'samsung', 'apple', 'fitbit', 'oura'].map((provider) => {
              const integration = integrations.find(i => i.provider === provider);
              
              return (
                <motion.div
                  key={provider}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getProviderIcon(provider)}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                              {provider === 'samsung' ? 'Samsung Health' : provider}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {provider === 'garmin' ? 'Fitness Tracker' :
                               provider === 'whoop' ? 'Recovery Monitor' :
                               provider === 'samsung' ? 'Health App' :
                               'Wearable Device'}
                            </p>
                          </div>
                        </div>
                        
                        {integration && (
                          <Badge className={getStatusColor(integration.status)}>
                            {getStatusIcon(integration.status)}
                            <span className="ml-1 capitalize">{integration.status}</span>
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {integration ? (
                        <>
                          {/* Integration Details */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
                              <span className="font-medium">{formatLastSync(integration.lastSync)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Data Types:</span>
                              <span className="font-medium">{integration.dataTypes.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Sync:</span>
                              <span className="font-medium capitalize">{integration.syncFrequency}</span>
                            </div>
                          </div>

                          {/* Data Types */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tracking:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {integration.dataTypes.slice(0, 3).map((type, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {type.replace('_', ' ')}
                                </Badge>
                              ))}
                              {integration.dataTypes.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{integration.dataTypes.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            {integration.status === 'connected' ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSyncIntegration(integration.id)}
                                  disabled={syncIntegrationMutation.isPending}
                                  className="flex-1"
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Sync Now
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  Disconnect
                                </Button>
                              </>
                            ) : (
                              <Button 
                                onClick={() => handleConnectIntegration(provider)}
                                disabled={connectIntegrationMutation.isPending}
                                className="w-full"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Reconnect
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Available Integration */}
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              Connect your {provider} device to automatically sync health data
                            </p>
                            <Button 
                              onClick={() => handleConnectIntegration(provider)}
                              disabled={connectIntegrationMutation.isPending}
                              className="w-full"
                            >
                              <Wifi className="h-4 w-4 mr-2" />
                              Connect {provider.charAt(0).toUpperCase() + provider.slice(1)}
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.length > 0 ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Products Recommended for You
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Based on your health data and goals, these products may help optimize your wellness
                </p>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 border-l-4 rounded-lg ${getUrgencyColor(rec.urgency)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Heart className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">
                              {rec.product.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {rec.product.brand} • {rec.product.category.replace('_', ' ')}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${
                                      i < Math.floor(rec.product.rating) 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                ({rec.product.reviewCount})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Why recommended:</strong> {rec.reasoning}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Health Data:</span>
                              <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                                {rec.healthDataTrigger.metricType}: {rec.healthDataTrigger.currentValue.toFixed(1)}
                                <TrendingUp className={`inline h-3 w-3 ml-1 ${
                                  rec.healthDataTrigger.trend === 'improving' ? 'text-green-600' :
                                  rec.healthDataTrigger.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                                }`} />
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Expected Benefit:</span>
                              <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                                {rec.estimatedBenefit}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge className={getUrgencyColor(rec.urgency).includes('red') ? 'bg-red-100 text-red-800' :
                                            getUrgencyColor(rec.urgency).includes('yellow') ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'}>
                              {rec.urgency} priority
                            </Badge>
                            <Badge variant="outline">
                              {rec.relevanceScore}% match
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          ${rec.product.price}
                        </div>
                        <Button className="mb-2">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </Button>
                        <div className="text-xs text-gray-500">
                          Affiliate commission: {(rec.product.affiliateCommission * 100)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Building Your Recommendations
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your devices and track health data to receive personalized product recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'supplements', 'sleep_aids', 'fitness_equipment', 'health_monitoring', 'nutrition'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all">
                  {product.featured && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-1 text-xs font-medium">
                      Featured Product
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                      <Heart className="h-16 w-16 text-gray-400" />
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.brand}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({product.reviewCount})
                          </span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {product.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {product.description}
                    </p>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Health Benefits:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.healthBenefits.slice(0, 2).map((benefit, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                        {product.healthBenefits.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{product.healthBenefits.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${product.price}
                      </div>
                      <Button size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Product
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      Affiliate commission: {(product.affiliateCommission * 100)}%
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}