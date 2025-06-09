import React, { useState } from 'react';
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Users, 
  Shield, 
  Smartphone,
  TrendingUp,
  Award,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function SubscriptionPaywall({ 
  isOpen = true, 
  onClose, 
  currentPlan = 'basic',
  blockedFeature = null 
}) {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch current subscription status
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription/status'],
    queryFn: async () => {
      // Mock subscription data - would connect to your subscription manager
      return {
        planId: currentPlan,
        status: 'active',
        features: currentPlan === 'basic' ? ['Basic tracking'] : ['All features'],
        usage: {
          aiInsights: currentPlan === 'basic' ? 0 : 15,
          telehealthConsults: currentPlan === 'basic' ? 0 : 1
        }
      };
    }
  });

  // Subscription upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: async (planData) => {
      setIsProcessing(true);
      
      // In production, this would handle Stripe payment
      const res = await apiRequest('POST', '/api/subscription/create', {
        planId: planData.planId,
        userId: 1 // Would be actual user ID
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Updated!",
        description: `Welcome to ${selectedPlan === 'premium' ? 'Premium' : 'Pro'}! Your new features are now active.`,
      });
      
      // In production, would redirect to Stripe checkout
      if (data.clientSecret) {
        window.open(`https://checkout.stripe.com/pay/${data.clientSecret}`, '_blank');
      }
      
      if (onClose) onClose();
    },
    onError: (error) => {
      toast({
        title: "Upgrade Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic Health Tracking',
      price: 0,
      period: 'forever',
      description: 'Essential health monitoring',
      features: [
        'Basic health metrics tracking',
        'Manual data entry',
        'Basic insights',
        '30-day data retention'
      ],
      limits: {
        healthMetrics: 5,
        aiInsights: 0,
        telehealthConsults: 0
      },
      color: 'gray',
      icon: Smartphone
    },
    {
      id: 'premium',
      name: 'Premium Health Intelligence',
      price: 14.99,
      period: 'month',
      description: 'AI-powered health optimization',
      features: [
        'Unlimited health metrics',
        'AI insights and recommendations',
        'Device integrations (Apple Watch, Fitbit)',
        'Advanced analytics and trends',
        '2 telehealth consultations/month',
        'Personalized health goals',
        '1 year data retention'
      ],
      limits: {
        healthMetrics: 'unlimited',
        aiInsights: 50,
        telehealthConsults: 2
      },
      color: 'blue',
      icon: TrendingUp,
      popular: true
    },
    {
      id: 'pro',
      name: 'Professional Health Platform',
      price: 29.99,
      period: 'month',
      description: 'Complete health management suite',
      features: [
        'Everything in Premium',
        'Unlimited telehealth consultations',
        'Advanced AI health coaching',
        'Family health management (4 members)',
        'Priority customer support',
        'Health data export',
        'Unlimited data retention',
        'Early access to new features'
      ],
      limits: {
        healthMetrics: 'unlimited',
        aiInsights: 'unlimited',
        telehealthConsults: 'unlimited'
      },
      color: 'purple',
      icon: Crown
    }
  ];

  const handleUpgrade = (planId) => {
    if (planId === currentPlan) return;
    
    upgradeMutation.mutate({ planId });
  };

  const getPlanIcon = (plan) => {
    const IconComponent = plan.icon;
    return <IconComponent className="h-6 w-6" />;
  };

  const getPlanColor = (plan) => {
    const colors = {
      gray: 'border-gray-300 text-gray-600',
      blue: 'border-blue-500 text-blue-600 bg-blue-50',
      purple: 'border-purple-500 text-purple-600 bg-purple-50'
    };
    return colors[plan.color] || colors.gray;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {blockedFeature ? `Unlock ${blockedFeature}` : 'Upgrade Your Health Journey'}
                </DialogTitle>
                <p className="text-blue-100 mt-1">
                  {blockedFeature 
                    ? `This feature requires a Premium or Pro subscription`
                    : 'Choose the plan that fits your health goals'
                  }
                </p>
              </div>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Current Plan Status */}
            {subscription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                        </h3>
                        <p className="text-sm text-blue-700">
                          {currentPlan === 'basic' 
                            ? 'Upgrade to unlock AI insights and telehealth consultations'
                            : `Usage this month: ${subscription.usage.aiInsights} AI insights, ${subscription.usage.telehealthConsults} consultations`
                          }
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
                >
                  <Card className={`h-full transition-all hover:shadow-lg ${
                    selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                  } ${plan.popular ? 'border-2 border-blue-500' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white px-4 py-1">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className={`mx-auto p-3 rounded-full w-fit ${getPlanColor(plan)}`}>
                        {getPlanIcon(plan)}
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                      
                      <div className="py-4">
                        <div className="text-4xl font-bold">
                          {plan.price === 0 ? 'Free' : `$${plan.price}`}
                        </div>
                        {plan.price > 0 && (
                          <p className="text-sm text-gray-600">per {plan.period}</p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Features List */}
                      <div className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Usage Limits */}
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-sm mb-2">Monthly Limits:</h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>AI Insights: {plan.limits.aiInsights}</div>
                          <div>Telehealth: {plan.limits.telehealthConsults}</div>
                          <div>Metrics: {plan.limits.healthMetrics}</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4">
                        {currentPlan === plan.id ? (
                          <Button className="w-full" disabled>
                            <Check className="h-4 w-4 mr-2" />
                            Current Plan
                          </Button>
                        ) : plan.id === 'basic' ? (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            Downgrade
                          </Button>
                        ) : (
                          <Button 
                            className="w-full"
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={isProcessing}
                            onMouseEnter={() => setSelectedPlan(plan.id)}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                {plan.id === 'premium' ? 'Go Premium' : 'Go Pro'}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Feature Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Why Upgrade?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 font-medium">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span>Advanced Analytics</span>
                      </div>
                      <p className="text-gray-600">
                        Get AI-powered insights that identify patterns and predict health trends
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 font-medium">
                        <Users className="h-4 w-4 text-green-600" />
                        <span>Telehealth Access</span>
                      </div>
                      <p className="text-gray-600">
                        Connect with licensed physicians for consultations and medical advice
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 font-medium">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span>Priority Support</span>
                      </div>
                      <p className="text-gray-600">
                        Get dedicated support and early access to new health features
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security & Billing Info */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Secure Billing</span>
                </div>
                <div className="flex items-center space-x-1">
                  <X className="h-4 w-4" />
                  <span>Cancel Anytime</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="h-4 w-4" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
              <p className="mt-2">
                Billing handled securely by Stripe. Your health data is encrypted and never shared.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}