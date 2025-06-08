import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSkipToContentProps, handleKeyboardActivation } from "@/lib/accessibility";

// Define onboarding steps
const onboardingSteps = [
  {
    title: "Welcome to Healthmap",
    description: "Your comprehensive health platform designed to help you track, manage, and improve your overall wellness journey.",
    icon: "ri-heart-pulse-line",
    color: "primary"
  },
  {
    title: "Connect Your Health Data",
    description: "Easily import your health metrics from devices and apps to create a complete picture of your wellbeing.",
    icon: "ri-device-line",
    color: "green-500"
  },
  {
    title: "Track Your Progress",
    description: "Monitor improvements, identify patterns, and receive personalized insights to help you achieve your health goals.",
    icon: "ri-line-chart-line",
    color: "blue-500"
  }
];

interface GuidedIntroProps {
  onComplete: () => void;
  isFirstVisit?: boolean;
}

export default function GuidedIntro({ onComplete, isFirstVisit = true }: GuidedIntroProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [seen, setSeen] = useState(!isFirstVisit);
  
  // Skip if user has already seen the onboarding
  useEffect(() => {
    if (seen) {
      onComplete();
    }
  }, [seen, onComplete]);
  
  // Progress to next step or complete
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark as seen in local storage
      localStorage.setItem('onboardingComplete', 'true');
      onComplete();
    }
  };
  
  // Skip the entire onboarding
  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };
  
  // If already seen, don't render
  if (seen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Accessibility skip to content link */}
      <a {...getSkipToContentProps("main-content")} />
      
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-xl">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div 
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${onboardingSteps[currentStep].color}/10 text-${onboardingSteps[currentStep].color} mb-4`}
                  >
                    <i className={`${onboardingSteps[currentStep].icon} text-3xl`} aria-hidden="true"></i>
                  </div>
                  <h2 
                    id="onboarding-title"
                    className="text-2xl font-heading font-bold mb-2"
                  >
                    {onboardingSteps[currentStep].title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {onboardingSteps[currentStep].description}
                  </p>
                </div>
                
                {/* Progress indicator */}
                <div className="flex justify-center space-x-2 mb-6">
                  {onboardingSteps.map((_, index) => (
                    <div 
                      key={index}
                      className={`h-1.5 rounded-full ${
                        index === currentStep 
                          ? "w-8 bg-primary" 
                          : "w-4 bg-gray-200 dark:bg-gray-700"
                      }`}
                      role="presentation"
                    ></div>
                  ))}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={handleNext}
                    onKeyDown={handleKeyboardActivation(handleNext)}
                    className="w-full"
                  >
                    {currentStep < onboardingSteps.length - 1 ? "Next" : "Get Started"}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleSkip}
                    onKeyDown={handleKeyboardActivation(handleSkip)}
                    aria-label="Skip onboarding"
                  >
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}