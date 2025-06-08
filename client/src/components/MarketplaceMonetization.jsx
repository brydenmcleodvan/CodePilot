import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ShoppingCart,
  Star,
  TrendingUp,
  Award,
  Package,
  DollarSign,
  Users,
  BarChart3,
  Gift,
  Crown,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Marketplace Monetization Component
 * AI-powered health product store with outcome-driven reviews
 */
export function MarketplaceMonetization() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('efficacy');
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch personalized recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/marketplace/recommendations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/marketplace/recommendations');
      return res.json();
    }
  });

  // Fetch user engagement tier
  const { data: tierData, isLoading: tierLoading } = useQuery({
    queryKey: ['/api/marketplace/tier'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/marketplace/tier');
      return res.json();
    }
  });

  // Submit product review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const res = await apiRequest('POST', '/api/marketplace/review', reviewData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Review Submitted",
        description: `Your outcome-based review has been published. Improvement: ${Math.round(data.objective_improvements?.overall * 100 || 0)}%`
      });
      queryClient.invalidateQueries(['/api/marketplace/recommendations']);
    }
  });

  const isDark = effectiveTheme === 'dark';
  const isLoading = recommendationsLoading || tierLoading;

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
          <ShoppingCart className="h-8 w-8 text-blue-600" />
          <span>Health Marketplace</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          AI-powered health product recommendations with real user outcomes. 
          Every product backed by measurable health improvements from our community.
        </p>
      </div>

      {/* User Tier Status */}
      {tierData && (
        <UserTierCard 
          tierData={tierData}
          onUpgrade={() => toast({ title: "Tier benefits unlocked through health improvements" })}
        />
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="supplements">Supplements</SelectItem>
                    <SelectItem value="fitness">Fitness Equipment</SelectItem>
                    <SelectItem value="sleep">Sleep & Recovery</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="mental_wellness">Mental Wellness</SelectItem>
                    <SelectItem value="devices">Health Devices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efficacy">Efficacy Rating</SelectItem>
                    <SelectItem value="personalization">Personal Match</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {tierData?.current_tier?.benefits?.discount_percentage || 0}% OFF
              </div>
              <div className="text-sm text-gray-600">Member Discount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="reviews">Outcome Reviews</TabsTrigger>
          <TabsTrigger value="rewards">Rewards & Tiers</TabsTrigger>
          <TabsTrigger value="efficacy">Efficacy Reports</TabsTrigger>
        </TabsList>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations">
          <RecommendationsPanel 
            recommendations={recommendationsData?.recommendations?.personalized_products || []}
            userTier={tierData?.current_tier}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
          />
        </TabsContent>

        {/* Outcome Reviews Tab */}
        <TabsContent value="reviews">
          <ReviewsPanel 
            onSubmitReview={(reviewData) => submitReviewMutation.mutate(reviewData)}
            isSubmitting={submitReviewMutation.isPending}
          />
        </TabsContent>

        {/* Rewards & Tiers Tab */}
        <TabsContent value="rewards">
          <RewardsPanel 
            tierData={tierData}
          />
        </TabsContent>

        {/* Efficacy Reports Tab */}
        <TabsContent value="efficacy">
          <EfficacyPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * User Tier Card Component
 */
function UserTierCard({ tierData, onUpgrade }) {
  const currentTier = tierData?.current_tier;
  const nextTier = tierData?.next_tier;

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'silver': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'platinum': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'platinum': return Crown;
      case 'gold': return Award;
      default: return Gift;
    }
  };

  const TierIcon = getTierIcon(currentTier?.level);

  return (
    <Card className={`border-2 ${getTierColor(currentTier?.level)}`}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <TierIcon className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
            <h3 className="text-xl font-bold">{currentTier?.name}</h3>
            <div className="text-lg font-semibold text-green-600">
              {currentTier?.benefits?.discount_percentage}% Discount
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Current Benefits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{currentTier?.benefits?.discount_percentage}% off all products</span>
              </div>
              {currentTier?.benefits?.early_access && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Early access to new products</span>
                </div>
              )}
              {currentTier?.benefits?.cashback_percentage && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{currentTier.benefits.cashback_percentage}% cashback rewards</span>
                </div>
              )}
              {currentTier?.benefits?.free_shipping && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Free shipping on all orders</span>
                </div>
              )}
            </div>
          </div>
          
          {nextTier && (
            <div>
              <h4 className="font-medium mb-3">Next: {nextTier.name}</h4>
              <div className="space-y-3">
                {Object.entries(nextTier.requirements_progress || {}).map(([req, progress]) => (
                  <div key={req}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{req.replace('_', ' ')}</span>
                      <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <Progress value={progress * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Recommendations Panel Component
 */
function RecommendationsPanel({ recommendations, userTier, selectedCategory, sortBy }) {
  const filteredRecommendations = recommendations.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'efficacy':
        return b.expected_improvement - a.expected_improvement;
      case 'personalization':
        return b.personalization_score - a.personalization_score;
      case 'price':
        return a.price - b.price;
      case 'reviews':
        return b.review_count - a.review_count;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {sortedRecommendations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
            <p className="text-gray-600">
              Continue tracking your health data to receive personalized product recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRecommendations.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              userTier={userTier}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Product Card Component
 */
function ProductCard({ product, userTier }) {
  const discountPercentage = userTier?.benefits?.discount_percentage || 0;
  const discountedPrice = product.price * (1 - discountPercentage / 100);

  return (
    <Card className="border-2 hover:border-blue-200 transition-colors">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{product.product_name}</h4>
            <p className="text-sm text-gray-600 capitalize">{product.category}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-green-600">
              ${discountedPrice.toFixed(2)}
            </div>
            {discountPercentage > 0 && (
              <div className="text-sm text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </div>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Personal Match</span>
              <span className="font-medium">{Math.round(product.personalization_score * 100)}%</span>
            </div>
            <Progress value={product.personalization_score * 100} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span>Expected Improvement</span>
              <span className="font-medium text-green-600">
                +{Math.round(product.expected_improvement * 100)}%
              </span>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {product.reasoning}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{product.review_count} reviews</span>
            <span>{product.user_success_rate}% success rate</span>
          </div>
          
          <Button className="w-full" asChild>
            <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
              View Product
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Reviews Panel Component
 */
function ReviewsPanel({ onSubmitReview, isSubmitting }) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reviewData, setReviewData] = useState({
    rating: 5,
    would_recommend: true,
    review_text: '',
    baseline_metrics: {},
    outcome_metrics: {}
  });

  const handleSubmitReview = () => {
    if (!selectedProduct) return;
    
    onSubmitReview({
      product_id: selectedProduct,
      ...reviewData
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Outcome-Based Review</CardTitle>
          <p className="text-sm text-gray-600">
            Share your real health improvements to help others make informed decisions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select product you've used" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prod_001">Premium Magnesium Complex</SelectItem>
                <SelectItem value="prod_002">Sleep Optimization Mattress</SelectItem>
                <SelectItem value="prod_003">Omega-3 Fish Oil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Overall Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                >
                  <Star 
                    className={`h-5 w-5 ${star <= reviewData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                </Button>
              ))}
              <span className="ml-2 text-sm font-medium">{reviewData.rating}/5</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Review</label>
            <textarea
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
              placeholder="Describe your experience and any health improvements you noticed..."
              value={reviewData.review_text}
              onChange={(e) => setReviewData(prev => ({ ...prev, review_text: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reviewData.would_recommend}
                onChange={(e) => setReviewData(prev => ({ ...prev, would_recommend: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">I would recommend this product</span>
            </label>
          </div>
          
          <Button 
            onClick={handleSubmitReview}
            disabled={!selectedProduct || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Community Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                product: 'Premium Magnesium Complex',
                improvement: 'Sleep quality improved by 23%',
                rating: 5,
                timeframe: '30 days'
              },
              {
                product: 'Omega-3 Fish Oil',
                improvement: 'Cognitive function improved by 18%',
                rating: 4,
                timeframe: '45 days'
              }
            ].map((review, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{review.product}</h5>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-green-600 font-medium">{review.improvement}</p>
                <p className="text-xs text-gray-500 mt-1">Measured over {review.timeframe}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Rewards Panel Component
 */
function RewardsPanel({ tierData }) {
  const milestoneRewards = tierData?.milestone_rewards || [];
  const availableDiscounts = tierData?.available_discounts || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDiscounts.map((discount, index) => (
              <div key={index} className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{discount.name}</h5>
                    <p className="text-sm text-gray-600">{discount.description}</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {discount.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestone Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestoneRewards.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                Complete health goals to unlock milestone rewards
              </p>
            ) : (
              milestoneRewards.map((reward, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{reward.title}</h5>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                    <Button size="sm">Claim</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Efficacy Panel Component
 */
function EfficacyPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Efficacy Reports</CardTitle>
          <p className="text-sm text-gray-600">
            Real-world effectiveness based on user health outcomes
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                product: 'Premium Magnesium Complex',
                category: 'Sleep & Recovery',
                users_reviewed: 847,
                average_improvement: 18,
                success_rate: 73,
                top_benefit: 'Sleep Quality'
              },
              {
                product: 'Omega-3 Fish Oil',
                category: 'Cognitive Health',
                users_reviewed: 1203,
                average_improvement: 15,
                success_rate: 68,
                top_benefit: 'Focus & Memory'
              }
            ].map((report, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-medium">{report.product}</h5>
                    <p className="text-sm text-gray-600">{report.category}</p>
                  </div>
                  <Badge variant="outline">{report.users_reviewed} reviews</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {report.average_improvement}%
                    </div>
                    <div className="text-xs text-gray-600">Avg Improvement</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {report.success_rate}%
                    </div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {report.top_benefit}
                    </div>
                    <div className="text-xs text-gray-600">Top Benefit</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketplaceMonetization;