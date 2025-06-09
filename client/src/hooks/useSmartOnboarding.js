import { useEffect, useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * Smart Onboarding Hook
 * Automatically resumes onboarding based on user progress and provides seamless experience
 */
export function useSmartOnboarding(userId) {
  const [currentStep, setCurrentStep] = useState(null);
  const [shouldResume, setShouldResume] = useState(false);

  // Get user's onboarding progress
  const { data: onboardingProgress, isLoading } = useQuery({
    queryKey: ['/api/onboarding/progress', userId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/onboarding/progress/${userId}`);
      return res.json();
    },
    enabled: !!userId
  });

  // Update onboarding progress
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData) => {
      const res = await apiRequest('POST', '/api/onboarding/update-progress', {
        userId,
        ...progressData
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/onboarding/progress', userId]);
    }
  });

  // Determine next onboarding step based on progress
  useEffect(() => {
    if (!onboardingProgress || isLoading) return;

    const nextStep = getNextOnboardingStep(onboardingProgress);
    setCurrentStep(nextStep);
    
    // Only suggest resume if user hasn't completed onboarding
    setShouldResume(nextStep !== 'complete' && nextStep !== null);
  }, [onboardingProgress, isLoading]);

  const markStepComplete = (stepName, stepData = {}) => {
    updateProgressMutation.mutate({
      step: stepName,
      completed: true,
      data: stepData,
      timestamp: new Date().toISOString()
    });
  };

  const skipOnboarding = () => {
    updateProgressMutation.mutate({
      step: 'skipped',
      completed: true,
      timestamp: new Date().toISOString()
    });
    setShouldResume(false);
  };

  return {
    currentStep,
    shouldResume,
    onboardingProgress,
    markStepComplete,
    skipOnboarding,
    isLoading,
    updateProgress: updateProgressMutation.mutate
  };
}

/**
 * Determine the next onboarding step based on user progress
 */
export function getNextOnboardingStep(progress) {
  if (!progress) return 'welcome';

  const steps = ['welcome', 'profile', 'goals', 'devices', 'plan', 'complete'];
  const completedSteps = progress.completedSteps || [];
  
  // If user skipped onboarding, don't resume
  if (completedSteps.includes('skipped')) return 'complete';
  
  // Find first incomplete step
  for (const step of steps) {
    if (!completedSteps.includes(step)) {
      return step;
    }
  }
  
  return 'complete';
}

/**
 * Onboarding Resume Banner Component
 */
export function OnboardingResumeBanner({ userId, onResume, onDismiss }) {
  const { currentStep, shouldResume, onboardingProgress } = useSmartOnboarding(userId);

  if (!shouldResume || !currentStep || currentStep === 'complete') return null;

  const getStepInfo = (step) => {
    const stepInfo = {
      welcome: { title: 'Welcome to Healthmap', description: 'Get started with your health journey' },
      profile: { title: 'Complete your profile', description: 'Tell us about yourself' },
      goals: { title: 'Set your health goals', description: 'What do you want to achieve?' },
      devices: { title: 'Connect your devices', description: 'Sync your health data' },
      plan: { title: 'Choose your plan', description: 'Select the perfect subscription tier' }
    };
    return stepInfo[step] || { title: 'Continue setup', description: 'Complete your onboarding' };
  };

  const stepInfo = getStepInfo(currentStep);
  const completedSteps = onboardingProgress?.completedSteps?.length || 0;
  const totalSteps = 5;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">{completedSteps}/{totalSteps}</span>
            </div>
            <div>
              <h3 className="font-semibold">{stepInfo.title}</h3>
              <p className="text-blue-100 text-sm">{stepInfo.description}</p>
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2 mb-3">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={onResume}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Continue Setup
          </button>
          <button
            onClick={onDismiss}
            className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Onboarding Progress Tracker Component
 */
export function OnboardingProgressTracker({ userId, currentStepOverride = null }) {
  const { currentStep, onboardingProgress } = useSmartOnboarding(userId);
  
  const activeStep = currentStepOverride || currentStep;
  const completedSteps = onboardingProgress?.completedSteps || [];
  
  const steps = [
    { id: 'welcome', name: 'Welcome', icon: '👋' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'goals', name: 'Goals', icon: '🎯' },
    { id: 'devices', name: 'Devices', icon: '📱' },
    { id: 'plan', name: 'Plan', icon: '💎' }
  ];

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = activeStep === step.id;
        const isUpcoming = !isCompleted && !isActive;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
              ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
              ${isActive ? 'bg-blue-600 border-blue-600 text-white' : ''}
              ${isUpcoming ? 'bg-gray-100 border-gray-300 text-gray-500' : ''}
            `}>
              {isCompleted ? '✓' : step.icon}
            </div>
            
            <div className="ml-2 hidden sm:block">
              <p className={`text-sm font-medium ${
                isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.name}
              </p>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-4 ${
                completedSteps.includes(steps[index + 1].id) ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}