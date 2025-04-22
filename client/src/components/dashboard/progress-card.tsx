import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { handleKeyboardActivation } from '@/lib/accessibility';

interface ProgressCardProps {
  title: string;
  description?: string;
  value: number;
  maxValue: number;
  icon?: string;
  color?: string;
  className?: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  progressType?: 'bar' | 'circle' | 'steps';
  formatValue?: (value: number, maxValue: number) => string;
  trendValue?: number; // Percentage change for trend indication
  label?: string;
}

export function ProgressCard({
  title,
  description,
  value,
  maxValue,
  icon,
  color = 'primary',
  className,
  onClick,
  footer,
  progressType = 'bar',
  formatValue,
  trendValue,
  label
}: ProgressCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Format the display value
  const displayValue = formatValue ? formatValue(value, maxValue) : `${value}/${maxValue}`;
  
  // Interactive props if onClick is provided
  const interactiveProps = onClick ? {
    onClick,
    onKeyDown: handleKeyboardActivation(onClick),
    tabIndex: 0,
    role: 'button',
    'aria-label': `${title}: ${displayValue}`,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {};
  
  return (
    <Card
      className={cn(
        'overflow-hidden border',
        onClick && 'cursor-pointer transition-transform hover:shadow-md hover:-translate-y-1',
        className
      )}
      {...interactiveProps}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium mb-1">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {icon && (
            <div className={`rounded-full p-2 bg-${color}/10 text-${color}`}>
              <i className={`${icon} text-lg`} aria-hidden="true"></i>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-end space-x-1 mb-1">
          <div className="text-2xl font-bold">{displayValue}</div>
          {label && <div className="text-sm text-gray-500 mb-0.5">{label}</div>}
          {trendValue !== undefined && (
            <div 
              className={cn(
                "flex items-center text-sm ml-auto",
                trendValue >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              <i className={`${trendValue >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-0.5`}></i>
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        
        {progressType === 'bar' && (
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-${color}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        )}
        
        {progressType === 'circle' && (
          <div className="flex justify-center py-2">
            <svg width="64" height="64" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={`var(--${color})`}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 3.39}, 339.292`} // 2πr where r=54
                transform="rotate(-90 60 60)"
                initial={{ strokeDasharray: "0, 339.292" }}
                animate={{ strokeDasharray: `${percentage * 3.39}, 339.292` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
          </div>
        )}
        
        {progressType === 'steps' && (
          <div className="flex justify-between space-x-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const stepPercentage = (i + 1) * 20;
              const isActive = percentage >= stepPercentage;
              
              return (
                <motion.div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    isActive ? `bg-${color}` : "bg-gray-200 dark:bg-gray-700"
                  )}
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.5,
                    scale: isActive ? 1 : 0.9
                  }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
      
      {footer && <CardFooter>{footer}</CardFooter>}
      
      {/* Interactive hover effect */}
      {onClick && (
        <motion.div
          className={`absolute inset-0 bg-${color}/5 pointer-events-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Card>
  );
}