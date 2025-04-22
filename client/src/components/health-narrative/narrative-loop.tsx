import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { handleKeyboardActivation } from '@/lib/accessibility';

// Types for health data points
interface HealthDataPoint {
  name: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  description: string;
}

interface HealthNarrativeProps {
  healthData: {
    steps: number;
    sleep: number;  // hours
    mood: number;   // 1-10
    score: number;  // 0-100
  };
  className?: string;
}

export function HealthNarrativeLoop({ healthData, className }: HealthNarrativeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Format the health data into a consistent structure
  const dataPoints: HealthDataPoint[] = [
    {
      name: 'Daily Steps',
      value: healthData.steps,
      unit: 'steps',
      icon: 'ri-footprint-line',
      color: 'green-500',
      description: `${healthData.steps >= 10000 ? 'Great job! ' : ''}Walking helps cardiac health and weight management.`
    },
    {
      name: 'Sleep Duration',
      value: healthData.sleep,
      unit: 'hours',
      icon: 'ri-zzz-line',
      color: 'blue-500',
      description: `${healthData.sleep >= 7 ? 'Good sleep habits! ' : ''}Quality sleep improves mood and cognitive function.`
    },
    {
      name: 'Mood Score',
      value: healthData.mood,
      unit: '/10',
      icon: 'ri-emotion-line',
      color: 'amber-500',
      description: `${healthData.mood >= 7 ? 'Positive mood! ' : ''}Your emotional state affects overall wellbeing.`
    },
    {
      name: 'Health Score',
      value: healthData.score,
      unit: '/100',
      icon: 'ri-heart-pulse-line',
      color: 'primary',
      description: 'Your overall health score based on activity, sleep, and emotional wellbeing.'
    },
  ];

  // Auto-rotate through the steps
  useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % dataPoints.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [autoPlay, dataPoints.length]);

  // Pause auto-rotation on hover
  const handleMouseEnter = () => setAutoPlay(false);
  const handleMouseLeave = () => setAutoPlay(true);

  return (
    <Card 
      className={cn("overflow-hidden", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-5">
        <h3 className="text-lg font-medium mb-4">Your Health Narrative</h3>
        
        {/* Main visualization area */}
        <div className="relative h-48 mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <div 
                className={`mb-3 w-16 h-16 rounded-full flex items-center justify-center bg-${dataPoints[activeIndex].color}/10 text-${dataPoints[activeIndex].color}`}
              >
                <i className={`${dataPoints[activeIndex].icon} text-3xl`} aria-hidden="true"></i>
              </div>
              <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                {dataPoints[activeIndex].name}
              </div>
              <div className="text-3xl font-bold mb-2">
                {dataPoints[activeIndex].value}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                  {dataPoints[activeIndex].unit}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">
                {dataPoints[activeIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Connection visualization */}
        <div className="flex justify-center items-center mb-4">
          <div className="w-full max-w-md relative h-1 bg-gray-200 dark:bg-gray-700">
            <motion.div 
              className="absolute h-1 bg-primary"
              animate={{
                width: `${(activeIndex / (dataPoints.length - 1)) * 100}%`
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Navigation dots */}
        <div className="flex justify-center space-x-2">
          {dataPoints.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              onKeyDown={handleKeyboardActivation(() => setActiveIndex(index))}
              aria-label={`View ${dataPoints[index].name} details`}
              aria-current={activeIndex === index ? 'true' : 'false'}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeIndex === index 
                  ? "bg-primary w-4" 
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
        
        {/* Narrative button */}
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={() => setActiveIndex((activeIndex + 1) % dataPoints.length)}
          >
            See how they connect
            <i className="ri-arrow-right-line ml-1"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}