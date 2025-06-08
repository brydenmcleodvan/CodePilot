import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingCart, Star, TrendingUp, ExternalLink, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export function MarketplaceRecommendations({ userId = 1, healthMetrics = {} }) {
  const [trackedClicks, setTrackedClicks] = useState(new Set());

  // Fetch personalized recommendations from your affiliate engine
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/affiliate/recommendations', userId],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/affiliate/recommendations');
      return res.json();
    }
  });

  const handleProductClick = async (product) => {
    try {
      // Track the affiliate click
      await apiRequest('POST', '/api/affiliate/track-click', {
        productId: product.id,
        userId: userId
      });
      
      setTrackedClicks(prev => new Set([...prev, product.id]));
      
      // Open affiliate link
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking click:', error);
      // Still open the link even if tracking fails
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Personalized Recommendations</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold mb-4">Personalized Recommendations</h2>
        <p className="text-gray-600">Add more health metrics to get personalized product recommendations!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recommended for You</h2>
        <Badge variant="outline" className="text-sm">
          Based on your health data
        </Badge>
      </div>
      
      <div className="space-y-4">
        {products.slice(0, 4).map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Product Header */}
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {product.brand}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {product.userMatch || product.matchScore}% match
                      </Badge>
                    </div>

                    {/* Recommendation Reason */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                        Why we recommend this:
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {product.personalizedMessage || product.matchReasons?.[0] || 
                         "Based on your health profile, this product could help optimize your wellness goals."}
                      </p>
                    </div>

                    {/* Health Benefits */}
                    <div className="flex flex-wrap gap-2">
                      {(product.healthBenefits || []).slice(0, 3).map((benefit, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>

                    {/* Community Results */}
                    {product.effectivenessData && (
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span>{product.effectivenessData.averageImprovement}% improvement</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{product.rating || product.userReviews?.averageRating} rating</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price and Action */}
                  <div className="text-right space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${product.price}
                      </div>
                      {product.evidenceLevel && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Award className="h-3 w-3" />
                          <span className="capitalize">{product.evidenceLevel} evidence</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleProductClick(product)}
                      className="w-full"
                      disabled={trackedClicks.has(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {trackedClicks.has(product.id) ? 'Redirecting...' : 'Shop Now'}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>

                    {/* Partner Badge */}
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {product.partner === 'amazon' ? 'Amazon' :
                         product.partner === 'iherb' ? 'iHerb' :
                         product.partner === 'thorne' ? 'Thorne' : 'Partner'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View All Link */}
      {products.length > 4 && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <a href="/marketplace">
              View All Recommendations ({products.length} total)
            </a>
          </Button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t">
        Recommendations are based on your health data. Healthmap may earn a commission from purchases. 
        Always consult with your healthcare provider before starting new supplements.
      </div>
    </div>
  );
}