import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, TrendingUp, Users, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { suggestPlan, getUpgradeRecommendation } from "@/lib/TierSmartSuggestor";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";

export function SmartUpgradeBanner({ 
  userGoals = [], 
  currentUsage = {}, 
  userProfile = {},
  onDismiss,
  showAfterDelay = 3000 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    // Analyze user data and show banner after delay if upgrade is recommended
    const timer = setTimeout(() => {
      const analysis = suggestPlan(userGoals, currentUsage, userProfile);
      
      // Only show if recommending premium or pro AND confidence is high
      if (analysis.recommendedTier !== 'basic' && analysis.confidence > 60) {
        setRecommendation(analysis);
        setIsVisible(true);
      }
    }, showAfterDelay);

    return () => clearTimeout(timer);
  }, [userGoals, currentUsage, userProfile, showAfterDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
    
    // Store dismissal to avoid showing again too soon
    localStorage.setItem('healthmap_upgrade_banner_dismissed', new Date().toISOString());
  };

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const getRecommendationIcon = (tier) => {
    const icons = {
      premium: TrendingUp,
      pro: Crown
    };
    return icons[tier] || TrendingUp;
  };

  const getRecommendationColor = (tier) => {
    const colors = {
      premium: 'from-blue-500 to-blue-600',
      pro: 'from-purple-500 to-purple-600'
    };
    return colors[tier] || colors.premium;
  };

  if (!recommendation || !isVisible) return null;

  const RecommendationIcon = getRecommendationIcon(recommendation.recommendedTier);
  const gradientColor = getRecommendationColor(recommendation.recommendedTier);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-6"
        >
          <Card className={`bg-gradient-to-r ${gradientColor} text-white border-0 shadow-lg overflow-hidden`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-white/20 p-3 rounded-full">
                    <RecommendationIcon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold">
                        {recommendation.recommendedTier === 'pro' ? 'Pro Plan' : 'Premium'} Recommended for You
                      </h3>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {recommendation.confidence}% match
                      </Badge>
                    </div>
                    
                    <p className="text-white/90 text-sm leading-relaxed">
                      {getUpgradeRecommendation(userGoals, currentUsage, userProfile)}
                    </p>
                    
                    {/* Key Benefits */}
                    <div className="flex flex-wrap gap-2">
                      {recommendation.features.slice(0, 3).map((feature, index) => (
                        <div 
                          key={index}
                          className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Urgency Indicator */}
                    {recommendation.urgency === 'high' && (
                      <div className="flex items-center space-x-2 text-yellow-200">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-medium">You've tried premium features multiple times!</span>
                      </div>
                    )}

                    {/* Savings Info */}
                    {recommendation.potentialSavings && (
                      <div className="text-sm text-white/80">
                        💰 Save ${recommendation.potentialSavings.savings} with annual billing
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 ml-4">
                  <Button 
                    onClick={handleUpgrade}
                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6"
                  >
                    Upgrade Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleDismiss}
                    className="text-white hover:bg-white/10 p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-16 w-20 h-20 bg-white rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-16 w-16 h-16 bg-white rounded-full blur-lg"></div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Subscription Paywall Modal */}
      <SubscriptionPaywall 
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        currentPlan="basic"
      />
    </>
  );
}

// Onboarding-specific variant
export function OnboardingUpgradeSuggestion({ userGoals, onPlanSelected }) {
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    if (userGoals && userGoals.length > 0) {
      const analysis = suggestPlan(userGoals, {}, {});
      setRecommendation(analysis);
    }
  }, [userGoals]);

  if (!recommendation || recommendation.recommendedTier === 'basic') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6"
    >
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Crown className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-900">
                Perfect! {recommendation.recommendedTier === 'pro' ? 'Pro' : 'Premium'} Plan Recommended
              </h3>
            </div>
            
            <p className="text-blue-700 max-w-md mx-auto">
              Based on your goals, the {recommendation.recommendedTier} plan will give you the best health tracking experience.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Button 
                onClick={() => onPlanSelected('basic')}
                variant="outline"
                className="text-gray-600"
              >
                Start with Basic (Free)
              </Button>
              <Button 
                onClick={() => onPlanSelected(recommendation.recommendedTier)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Get {recommendation.recommendedTier === 'pro' ? 'Pro' : 'Premium'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              You can always upgrade or downgrade later
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}