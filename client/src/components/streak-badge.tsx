import { motion } from 'framer-motion';
import { 
  Flame, 
  Trophy, 
  Target, 
  Calendar,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface StreakBadgeProps {
  streak: number;
  goalType: string;
  variant?: 'compact' | 'detailed' | 'hero';
  showLabel?: boolean;
}

export default function StreakBadge({ 
  streak, 
  goalType, 
  variant = 'compact',
  showLabel = true 
}: StreakBadgeProps) {
  
  const getStreakColor = (streakCount: number) => {
    if (streakCount >= 30) return 'from-purple-500 to-pink-500'; // Legendary
    if (streakCount >= 21) return 'from-orange-500 to-red-500'; // Fire
    if (streakCount >= 14) return 'from-yellow-500 to-orange-500'; // Hot
    if (streakCount >= 7) return 'from-green-500 to-yellow-500'; // Growing
    if (streakCount >= 3) return 'from-blue-500 to-green-500'; // Building
    return 'from-gray-400 to-gray-500'; // Starting
  };

  const getStreakIcon = (streakCount: number) => {
    if (streakCount >= 30) return Trophy;
    if (streakCount >= 21) return Award;
    if (streakCount >= 14) return Flame;
    if (streakCount >= 7) return TrendingUp;
    if (streakCount >= 3) return Target;
    return Calendar;
  };

  const getStreakTitle = (streakCount: number) => {
    if (streakCount >= 30) return 'Legendary';
    if (streakCount >= 21) return 'On Fire';
    if (streakCount >= 14) return 'Hot Streak';
    if (streakCount >= 7) return 'Building';
    if (streakCount >= 3) return 'Getting Started';
    return 'New Goal';
  };

  const getStreakMessage = (streakCount: number, type: string) => {
    if (streakCount >= 30) return `Amazing! ${streakCount} days of consistent ${type} habits!`;
    if (streakCount >= 21) return `Incredible! You're on fire with ${streakCount} days!`;
    if (streakCount >= 14) return `Great momentum! ${streakCount} days and counting!`;
    if (streakCount >= 7) return `Building strong habits! ${streakCount} days in a row!`;
    if (streakCount >= 3) return `Nice start! ${streakCount} days of consistency!`;
    return `Start your streak with consistent ${type} habits!`;
  };

  const StreakIcon = getStreakIcon(streak);
  const colorGradient = getStreakColor(streak);
  const title = getStreakTitle(streak);
  const message = getStreakMessage(streak, goalType);

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        className="inline-flex items-center space-x-2"
      >
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorGradient} shadow-lg`}>
          <StreakIcon className="h-4 w-4 text-white" />
        </div>
        {showLabel && (
          <div className="flex items-center space-x-1">
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {streak}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              day{streak !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${colorGradient} shadow-lg`}>
                  <StreakIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">
                    {streak} Day Streak
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {goalType} consistency
                  </p>
                </div>
              </div>
              <Badge className={`bg-gradient-to-r ${colorGradient} text-white border-0`}>
                {title}
              </Badge>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {message}
              </p>
            </div>

            {/* Progress visualization */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Streak Progress</span>
                <span>Next milestone: {Math.ceil(streak / 7) * 7} days</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((streak % 7) / 7 * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full bg-gradient-to-r ${colorGradient}`}
                />
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <Card className="overflow-hidden border-2 border-transparent bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {/* Animated Icon */}
              <motion.div
                animate={{ 
                  rotate: streak >= 7 ? [0, 5, -5, 0] : 0,
                  scale: streak >= 14 ? [1, 1.1, 1] : 1 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: streak >= 7 ? Infinity : 0,
                  repeatType: "reverse" 
                }}
                className={`mx-auto p-6 rounded-2xl bg-gradient-to-r ${colorGradient} shadow-2xl`}
              >
                <StreakIcon className="h-12 w-12 text-white" />
              </motion.div>

              {/* Streak Count */}
              <div>
                <motion.div
                  key={streak}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-5xl font-black text-gray-900 dark:text-gray-100"
                >
                  {streak}
                </motion.div>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  day{streak !== 1 ? 's' : ''} in a row
                </p>
              </div>

              {/* Title and Message */}
              <div className="space-y-2">
                <Badge 
                  className={`text-lg px-4 py-1 bg-gradient-to-r ${colorGradient} text-white border-0`}
                >
                  {title}
                </Badge>
                <p className="text-gray-700 dark:text-gray-300 max-w-sm mx-auto">
                  {message}
                </p>
              </div>

              {/* Milestone indicator */}
              {streak > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <Zap className="h-3 w-3" />
                    <span>
                      {streak < 7 ? `${7 - streak} days to first milestone` :
                       streak < 14 ? `${14 - streak} days to 2-week milestone` :
                       streak < 21 ? `${21 - streak} days to 3-week milestone` :
                       streak < 30 ? `${30 - streak} days to 1-month milestone` :
                       'Legendary streak achieved!'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
}