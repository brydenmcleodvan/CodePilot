import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { 
  User, 
  Target, 
  Activity, 
  Heart, 
  Brain, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Crown,
  Smartphone,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { suggestPlan } from "@/lib/TierSmartSuggestor";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', icon: User },
  { id: 'profile', title: 'Your Profile', icon: User },
  { id: 'goals', title: 'Health Goals', icon: Target },
  { id: 'devices', title: 'Connect Devices', icon: Smartphone },
  { id: 'plan', title: 'Choose Your Plan', icon: Crown },
  { id: 'complete', title: 'All Set!', icon: CheckCircle }
];

export default function OnboardingFlow({ onComplete }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    profile: {
      name: '',
      email: '',
      age: '',
      gender: '',
      activityLevel: ''
    },
    goals: [],
    devices: [],
    preferences: {
      notifications: true,
      weeklyReports: true
    },
    selectedPlan: 'basic'
  });

  // Health goals with tier implications
  const healthGoals = [
    { id: 'weight_loss', label: 'Weight Management', category: 'basic', icon: Activity },
    { id: 'fitness_tracking', label: 'Fitness & Exercise', category: 'basic', icon: Activity },
    { id: 'ai_coaching', label: 'AI Health Coaching', category: 'premium', icon: Brain },
    { id: 'chronic_disease', label: 'Chronic Disease Management', category: 'pro', icon: Heart },
    { id: 'telehealth', label: 'Doctor Consultations', category: 'premium', icon: Heart },
    { id: 'family_health', label: 'Family Health Management', category: 'pro', icon: Users },
    { id: 'data_export', label: 'Health Data Export', category: 'pro', icon: TrendingUp },
    { id: 'advanced_analytics', label: 'Advanced Health Analytics', category: 'premium', icon: TrendingUp },
    { id: 'mental_health', label: 'Mental Health & Mood', category: 'premium', icon: Brain },
    { id: 'nutrition_tracking', label: 'Nutrition & Diet Tracking', category: 'basic', icon: Activity }
  ];

  // Available health devices
  const healthDevices = [
    { id: 'apple_watch', name: 'Apple Watch', type: 'wearable', popular: true },
    { id: 'fitbit', name: 'Fitbit', type: 'wearable', popular: true },
    { id: 'oura_ring', name: 'Oura Ring', type: 'wearable' },
    { id: 'whoop', name: 'WHOOP', type: 'wearable' },
    { id: 'garmin', name: 'Garmin', type: 'wearable' },
    { id: 'smart_scale', name: 'Smart Scale', type: 'scale' },
    { id: 'blood_pressure', name: 'Blood Pressure Monitor', type: 'monitor' },
    { id: 'glucose_monitor', name: 'Continuous Glucose Monitor', type: 'monitor' }
  ];

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest('POST', '/api/onboarding/complete', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Healthmap!",
        description: "Your health journey starts now. Let's make it amazing!",
      });
      if (onComplete) onComplete(onboardingData);
    },
    onError: () => {
      toast({
        title: "Setup Error",
        description: "We couldn't complete your setup. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateData = (section, updates) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goalId) => {
    const updatedGoals = onboardingData.goals.includes(goalId)
      ? onboardingData.goals.filter(id => id !== goalId)
      : [...onboardingData.goals, goalId];
    
    updateData('goals', updatedGoals);
  };

  const handleDeviceToggle = (deviceId) => {
    const updatedDevices = onboardingData.devices.includes(deviceId)
      ? onboardingData.devices.filter(id => id !== deviceId)
      : [...onboardingData.devices, deviceId];
    
    updateData('devices', updatedDevices);
  };

  const generatePlanRecommendation = () => {
    const goalLabels = onboardingData.goals.map(id => 
      healthGoals.find(goal => goal.id === id)?.label || id
    );
    
    return suggestPlan(goalLabels, {}, { 
      age: parseInt(onboardingData.profile.age) || 25,
      activityLevel: onboardingData.profile.activityLevel 
    });
  };

  const handleCompleteOnboarding = () => {
    const finalData = {
      ...onboardingData,
      completedAt: new Date().toISOString()
    };
    completeOnboardingMutation.mutate(finalData);
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / ONBOARDING_STEPS.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit">
                  <StepIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Welcome Step */}
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900">
                      Welcome to Healthmap! 🌟
                    </h2>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                      Your intelligent health companion that adapts to your unique needs and goals. 
                      Let's create your personalized health profile!
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="text-center">
                        <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm">AI Insights</p>
                      </div>
                      <div className="text-center">
                        <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm">Health Tracking</p>
                      </div>
                      <div className="text-center">
                        <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm">Privacy First</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Step */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Tell us about yourself</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={onboardingData.profile.name}
                          onChange={(e) => updateData('profile', { name: e.target.value })}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={onboardingData.profile.email}
                          onChange={(e) => updateData('profile', { email: e.target.value })}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={onboardingData.profile.age}
                          onChange={(e) => updateData('profile', { age: e.target.value })}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={onboardingData.profile.gender}
                          onValueChange={(value) => updateData('profile', { gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="activity">Activity Level</Label>
                      <Select
                        value={onboardingData.profile.activityLevel}
                        onValueChange={(value) => updateData('profile', { activityLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                          <SelectItem value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="very_active">Very Active (Hard exercise 6-7 days/week)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Goals Step */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">What are your health goals?</h3>
                    <p className="text-gray-600 mb-6">Select all that apply. We'll personalize your experience based on your goals.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {healthGoals.map((goal) => {
                        const isSelected = onboardingData.goals.includes(goal.id);
                        const GoalIcon = goal.icon;
                        
                        return (
                          <motion.div
                            key={goal.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card 
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                                  : 'hover:shadow-md hover:bg-gray-50'
                              }`}
                              onClick={() => handleGoalToggle(goal.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <GoalIcon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                  <span className="font-medium">{goal.label}</span>
                                  {goal.category !== 'basic' && (
                                    <Badge variant="outline" className="text-xs">
                                      {goal.category}
                                    </Badge>
                                  )}
                                  {isSelected && (
                                    <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Devices Step */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Connect your health devices</h3>
                    <p className="text-gray-600 mb-6">Which devices do you use or plan to use? We'll help you sync your data.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {healthDevices.map((device) => {
                        const isSelected = onboardingData.devices.includes(device.id);
                        
                        return (
                          <Card 
                            key={device.id}
                            className={`cursor-pointer transition-all ${
                              isSelected 
                                ? 'ring-2 ring-blue-500 bg-blue-50' 
                                : 'hover:shadow-md hover:bg-gray-50'
                            }`}
                            onClick={() => handleDeviceToggle(device.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Smartphone className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                  <span className="font-medium">{device.name}</span>
                                  {device.popular && (
                                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                                  )}
                                </div>
                                {isSelected && (
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Plan Selection Step */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {(() => {
                      const recommendation = generatePlanRecommendation();
                      
                      return (
                        <>
                          <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Choose your plan</h3>
                            {recommendation.recommendedTier !== 'basic' && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  <Crown className="h-5 w-5 text-blue-600" />
                                  <span className="font-semibold text-blue-900">
                                    {recommendation.recommendedTier === 'pro' ? 'Pro Plan' : 'Premium'} Recommended
                                  </span>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {recommendation.confidence}% match
                                  </Badge>
                                </div>
                                <p className="text-blue-700 text-sm">
                                  Based on your goals: {recommendation.reasoning[0]}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['basic', 'premium', 'pro'].map((plan) => (
                              <Card 
                                key={plan}
                                className={`cursor-pointer transition-all ${
                                  plan === recommendation.recommendedTier ? 'ring-2 ring-blue-500' : ''
                                } ${onboardingData.selectedPlan === plan ? 'bg-blue-50' : ''}`}
                                onClick={() => updateData('selectedPlan', plan)}
                              >
                                <CardContent className="p-4 text-center">
                                  <h4 className="font-semibold text-lg capitalize">{plan}</h4>
                                  <p className="text-2xl font-bold text-blue-600 my-2">
                                    {plan === 'basic' ? 'Free' : plan === 'premium' ? '$14.99' : '$29.99'}
                                    {plan !== 'basic' && <span className="text-sm text-gray-500">/month</span>}
                                  </p>
                                  <Button 
                                    variant={onboardingData.selectedPlan === plan ? "default" : "outline"}
                                    size="sm"
                                    className="w-full"
                                  >
                                    {onboardingData.selectedPlan === plan ? 'Selected' : 'Choose'}
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Complete Step */}
                {currentStep === 5 && (
                  <div className="text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">You're all set! 🎉</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Welcome to your personalized health journey. We've configured everything based on your preferences.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
                      <h4 className="font-semibold mb-2">Your Setup:</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ {onboardingData.goals.length} health goals selected</li>
                        <li>✓ {onboardingData.devices.length} devices to connect</li>
                        <li>✓ {onboardingData.selectedPlan.charAt(0).toUpperCase() + onboardingData.selectedPlan.slice(1)} plan chosen</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  
                  {currentStep === ONBOARDING_STEPS.length - 1 ? (
                    <Button 
                      onClick={handleCompleteOnboarding}
                      disabled={completeOnboardingMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {completeOnboardingMutation.isPending ? 'Setting up...' : 'Start Your Journey'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={nextStep}>
                      {currentStep === 4 && onboardingData.selectedPlan !== 'basic' ? 'Continue to Payment' : 'Continue'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Subscription Paywall */}
        <SubscriptionPaywall 
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          currentPlan="basic"
        />
      </div>
    </div>
  );
}