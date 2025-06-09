import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Heart, Target, Smartphone, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSmartOnboarding } from '@/hooks/useSmartOnboarding';
import { useFeatureAnalytics } from '@/hooks/useFeatureAnalytics';
import { pwaService } from '@/services/pwaService';

/**
 * Optimized Onboarding UX
 * Beautiful animations, auto-save progress, and seamless device sync
 */
export function OptimizedOnboarding({ userId, onComplete }) {
  const { 
    currentStep, 
    markStepComplete, 
    updateProgress,
    onboardingProgress 
  } = useSmartOnboarding(userId);
  
  const { trackOnboardingStep } = useFeatureAnalytics();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
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

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: Heart },
    { id: 'profile', title: 'Profile', icon: Target },
    { id: 'goals', title: 'Goals', icon: Target },
    { id: 'devices', title: 'Devices', icon: Smartphone },
    { id: 'plan', title: 'Plan', icon: Crown }
  ];

  // Auto-save with debounce
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (Object.keys(formData.profile).some(key => formData.profile[key])) {
        autoSaveProgress();
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [formData]);

  const autoSaveProgress = async () => {
    try {
      // Save to cloud (Firebase) and local storage
      await updateProgress({
        step: steps[currentStepIndex].id,
        data: formData,
        completed: false,
        autoSaved: true
      });
      
      // Cache for offline access
      pwaService.cacheHealthData('onboarding_progress', formData);
      
      console.log('Onboarding progress auto-saved');
    } catch (error) {
      console.warn('Failed to auto-save progress:', error);
    }
  };

  const nextStep = () => {
    const currentStepId = steps[currentStepIndex].id;
    
    // Track step completion
    trackOnboardingStep(currentStepId, true, {
      stepIndex: currentStepIndex,
      data: formData
    });

    // Mark step as complete
    markStepComplete(currentStepId, formData);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const completeOnboarding = () => {
    const completedData = {
      ...formData,
      completedAt: new Date().toISOString()
    };

    markStepComplete('complete', completedData);
    trackOnboardingStep('complete', true, { totalSteps: steps.length });
    
    onComplete && onComplete(completedData);
  };

  const updateFormData = (section, updates) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const toggleGoal = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const toggleDevice = (deviceId) => {
    setFormData(prev => ({
      ...prev,
      devices: prev.devices.includes(deviceId)
        ? prev.devices.filter(id => id !== deviceId)
        : [...prev.devices, deviceId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                      ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                      ${isActive ? 'bg-blue-600 border-blue-600 text-white' : ''}
                      ${!isCompleted && !isActive ? 'bg-white border-gray-300 text-gray-400' : ''}
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </motion.div>
                  
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <motion.div
                      className={`w-8 h-0.5 mx-4 transition-colors ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isCompleted ? 1 : 0.3 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                {currentStepIndex === 0 && <WelcomeStep />}
                {currentStepIndex === 1 && (
                  <ProfileStep 
                    data={formData.profile} 
                    onChange={(updates) => updateFormData('profile', updates)} 
                  />
                )}
                {currentStepIndex === 2 && (
                  <GoalsStep 
                    selectedGoals={formData.goals}
                    onToggleGoal={toggleGoal}
                  />
                )}
                {currentStepIndex === 3 && (
                  <DevicesStep 
                    selectedDevices={formData.devices}
                    onToggleDevice={toggleDevice}
                  />
                )}
                {currentStepIndex === 4 && (
                  <PlanStep 
                    selectedPlan={formData.selectedPlan}
                    onSelectPlan={(plan) => updateFormData('selectedPlan', plan)}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>

          <Button
            onClick={nextStep}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <span>{currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Individual step components
function WelcomeStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
        >
          <Heart className="h-10 w-10 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Healthmap</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your journey to better health starts here. We'll help you track, understand, and improve your wellness with personalized insights and AI-powered recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { icon: Target, title: 'Set Goals', desc: 'Define your health objectives' },
          { icon: Smartphone, title: 'Connect Devices', desc: 'Sync your health data' },
          { icon: Crown, title: 'Choose Plan', desc: 'Pick your perfect tier' }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="text-center p-4"
          >
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <item.icon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ProfileStep({ data, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
        <p className="text-gray-600">This helps us personalize your health journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="Your age"
            value={data.age}
            onChange={(e) => onChange({ age: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <div className="flex space-x-3">
            {['male', 'female', 'other'].map((gender) => (
              <button
                key={gender}
                onClick={() => onChange({ gender })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  data.gender === gender
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GoalsStep({ selectedGoals, onToggleGoal }) {
  const goals = [
    { id: 'weight_loss', title: 'Weight Management', desc: 'Lose or maintain healthy weight', icon: '⚖️' },
    { id: 'fitness', title: 'Improve Fitness', desc: 'Build strength and endurance', icon: '💪' },
    { id: 'sleep', title: 'Better Sleep', desc: 'Improve sleep quality and duration', icon: '😴' },
    { id: 'nutrition', title: 'Healthy Eating', desc: 'Track nutrition and meal planning', icon: '🥗' },
    { id: 'stress', title: 'Stress Management', desc: 'Reduce stress and anxiety', icon: '🧘' },
    { id: 'chronic', title: 'Chronic Condition', desc: 'Manage ongoing health conditions', icon: '❤️' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What are your health goals?</h2>
        <p className="text-gray-600">Select all that apply - we'll customize your experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal, index) => (
          <motion.button
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onToggleGoal(goal.id)}
            className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-md ${
              selectedGoals.includes(goal.id)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <span className="text-2xl">{goal.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                <p className="text-sm text-gray-600">{goal.desc}</p>
              </div>
              {selectedGoals.includes(goal.id) && (
                <Check className="h-5 w-5 text-blue-600 ml-auto" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function DevicesStep({ selectedDevices, onToggleDevice }) {
  const devices = [
    { id: 'apple_watch', name: 'Apple Watch', icon: '⌚', desc: 'Heart rate, activity, sleep' },
    { id: 'fitbit', name: 'Fitbit', icon: '📱', desc: 'Steps, sleep, heart rate' },
    { id: 'oura', name: 'Oura Ring', icon: '💍', desc: 'Sleep, recovery, readiness' },
    { id: 'whoop', name: 'WHOOP', icon: '🔋', desc: 'Strain, recovery, sleep' },
    { id: 'garmin', name: 'Garmin', icon: '🏃', desc: 'GPS, fitness, health metrics' },
    { id: 'samsung', name: 'Samsung Health', icon: '📲', desc: 'Comprehensive health tracking' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Connect your devices</h2>
        <p className="text-gray-600">Sync your health data for comprehensive insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device, index) => (
          <motion.button
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onToggleDevice(device.id)}
            className={`p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
              selectedDevices.includes(device.id)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="space-y-3">
              <span className="text-3xl">{device.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{device.name}</h3>
                <p className="text-xs text-gray-600">{device.desc}</p>
              </div>
              {selectedDevices.includes(device.id) && (
                <Check className="h-5 w-5 text-blue-600 mx-auto" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Don't have any devices? No problem! You can add them later or track manually.</p>
      </div>
    </motion.div>
  );
}

function PlanStep({ selectedPlan, onSelectPlan }) {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      features: ['Basic health tracking', 'Symptom checker', 'Medication reminders', 'Community support']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$14.99/mo',
      popular: true,
      features: ['Everything in Basic', 'AI health insights', 'Advanced analytics', 'Telehealth booking', 'Priority support']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29.99/mo',
      features: ['Everything in Premium', 'Family management', 'Data export', 'API access', 'White-label options']
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Choose your plan</h2>
        <p className="text-gray-600">Start with any plan and upgrade anytime</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.button
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectPlan(plan.id)}
            className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg relative ${
              selectedPlan === plan.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${plan.popular ? 'ring-2 ring-purple-200' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-blue-600">{plan.price}</p>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default OptimizedOnboarding;