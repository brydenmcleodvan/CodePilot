import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Flame, Target, Award, Calendar } from 'lucide-react';
import { Achievement } from '@/services/progress-tracker';

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

export default function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const getIcon = (iconName: string) => {
    const iconMap = {
      flame: Flame,
      trophy: Trophy,
      star: Star,
      target: Target,
      award: Award,
      calendar: Calendar
    };
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Trophy;
    return <IconComponent className="w-5 h-5" />;
  };

  const getColorClasses = (color: string, completed: boolean) => {
    if (completed) {
      return {
        bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
        border: 'border-yellow-300',
        icon: 'text-yellow-600'
      };
    }
    
    const colorMap = {
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500' },
      red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' }
    };
    
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const colors = getColorClasses(achievement.color, achievement.completed);
  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;

  if (compact) {
    return (
      <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
        <div className="flex items-center gap-3">
          <div className={colors.icon}>
            {getIcon(achievement.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{achievement.title}</h4>
              {achievement.completed && (
                <Badge variant="secondary" className="text-xs">
                  Completed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progressPercent} className="flex-1 h-2" />
              <span className="text-xs text-gray-500">
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${colors.bg} ${colors.border} border relative overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg bg-white/50 ${colors.icon}`}>
            {getIcon(achievement.icon)}
          </div>
          {achievement.completed && (
            <Badge variant="default" className="bg-yellow-500 text-white">
              <Trophy className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">
              {achievement.progress}/{achievement.maxProgress}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          {achievement.completed && achievement.unlockedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {achievement.completed && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-400 to-transparent opacity-20 rounded-bl-full" />
        )}
      </CardContent>
    </Card>
  );
}