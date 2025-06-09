import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target,
  Star,
  Medal,
  Clock,
  TrendingUp,
  UserPlus,
  LogOut,
  Flame,
  Award,
  Crown,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  category: 'steps' | 'sleep' | 'exercise' | 'hydration' | 'mixed';
  target: {
    value: number;
    unit: string;
    metric: string;
  };
  duration: {
    startDate: string;
    endDate: string;
    durationDays: number;
  };
  participants: any[];
  teams?: any[];
  rewards: any[];
  status: 'upcoming' | 'active' | 'completed';
  difficulty: 'easy' | 'medium' | 'hard';
  isPublic: boolean;
  createdBy: number;
  createdAt: string;
}

interface ChallengeBoardProps {
  variant?: 'full' | 'compact';
  showCreateButton?: boolean;
}

export default function ChallengeBoard({ 
  variant = 'full',
  showCreateButton = true 
}: ChallengeBoardProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  // Fetch active challenges
  const { data: challenges = [], isLoading } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, teamId }: { challengeId: string; teamId?: string }) => {
      await apiRequest('POST', `/api/challenges/${challengeId}/join`, { teamId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    }
  });

  // Leave challenge mutation
  const leaveChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      await apiRequest('POST', `/api/challenges/${challengeId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'steps': return Target;
      case 'sleep': return Clock;
      case 'exercise': return TrendingUp;
      case 'hydration': return Zap;
      case 'mixed': return Star;
      default: return Trophy;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'steps': return 'from-blue-500 to-cyan-600';
      case 'sleep': return 'from-purple-500 to-indigo-600';
      case 'exercise': return 'from-green-500 to-emerald-600';
      case 'hydration': return 'from-blue-400 to-blue-600';
      case 'mixed': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Ending soon';
  };

  const handleJoinChallenge = (challengeId: string, teamId?: string) => {
    joinChallengeMutation.mutate({ challengeId, teamId });
  };

  const handleLeaveChallenge = (challengeId: string) => {
    leaveChallengeMutation.mutate(challengeId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Active Challenges</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {challenges.slice(0, 3).map((challenge) => {
            const CategoryIcon = getCategoryIcon(challenge.category);
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedChallenge(challenge.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(challenge.category)}`}>
                    <CategoryIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {challenge.participants.length} participants
                    </p>
                  </div>
                  <Badge className={getStatusColor(challenge.status)}>
                    {challenge.status}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
            <span>Community Challenges</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Join challenges with friends and the community to stay motivated!
          </p>
        </div>
        
        {showCreateButton && (
          <Button className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Create Challenge</span>
          </Button>
        )}
      </div>

      {/* Challenge Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {challenges.filter(c => c.status === 'active').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.filter(c => c.status === 'active').map((challenge) => {
                const CategoryIcon = getCategoryIcon(challenge.category);
                const progress = Math.floor(Math.random() * 80) + 10; // Sample progress
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <Card className="overflow-hidden border-2 border-transparent hover:border-orange-200 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${getCategoryColor(challenge.category)} shadow-lg`}>
                              <CategoryIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                {challenge.title}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getDifficultyColor(challenge.difficulty)}>
                                  {challenge.difficulty}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {challenge.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(challenge.status)}>
                            <Flame className="h-3 w-3 mr-1" />
                            {challenge.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Challenge Description */}
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {challenge.description}
                        </p>

                        {/* Target & Progress */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Target: {challenge.target.value.toLocaleString()} {challenge.target.unit}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {progress}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {challenge.participants.length}
                            </div>
                            <div className="text-xs text-gray-500">Participants</div>
                          </div>
                          
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <Clock className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {formatTimeRemaining(challenge.duration.endDate).split(' ')[0]}
                            </div>
                            <div className="text-xs text-gray-500">Days Left</div>
                          </div>
                        </div>

                        {/* Rewards Preview */}
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {challenge.rewards.length} rewards available
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleJoinChallenge(challenge.id)}
                            disabled={joinChallengeMutation.isPending}
                            className="flex-1"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Join Challenge
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => setSelectedChallenge(challenge.id)}
                            className="flex-1"
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Active Challenges
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Be the first to create a challenge for your community!
                </p>
                {showCreateButton && (
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create First Challenge
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Upcoming Challenges
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for new challenges to join!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Medal className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Completed Challenges
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete your first challenge to see your achievements here!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}