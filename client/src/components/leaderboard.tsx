import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Trophy, 
  Medal,
  Star,
  Users,
  TrendingUp,
  Flame,
  Target,
  Calendar,
  Award,
  Zap,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeaderboardEntry {
  userId: number;
  username: string;
  teamId?: string;
  teamName?: string;
  progress: number;
  progressPercentage: number;
  rank: number;
  dailyAverage: number;
  streak: number;
  badges: string[];
  lastActive: string;
}

interface TeamEntry {
  id: string;
  name: string;
  members: any[];
  totalProgress: number;
  averageProgress: number;
  rank: number;
  badge?: string;
}

interface LeaderboardProps {
  challengeId?: string;
  variant?: 'full' | 'compact' | 'mini';
  showTeams?: boolean;
  limit?: number;
}

export default function Leaderboard({ 
  challengeId,
  variant = 'full',
  showTeams = true,
  limit = 10 
}: LeaderboardProps) {
  const [selectedTab, setSelectedTab] = useState(showTeams ? 'individual' : 'individual');

  // Fetch individual leaderboard
  const { data: individualLeaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', challengeId, 'individual'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch team leaderboard
  const { data: teamLeaderboard = [] } = useQuery<TeamEntry[]>({
    queryKey: ['/api/leaderboard', challengeId, 'teams'],
    enabled: showTeams,
    refetchInterval: 30000,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-amber-400 to-amber-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'streak_master': return <Flame className="h-3 w-3" />;
      case 'top_performer': return <Trophy className="h-3 w-3" />;
      case 'consistent_walker': return <Target className="h-3 w-3" />;
      case 'newcomer': return <Star className="h-3 w-3" />;
      case 'team_champions': return <Crown className="h-3 w-3" />;
      default: return <Award className="h-3 w-3" />;
    }
  };

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Active now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (variant === 'mini') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {individualLeaderboard.slice(0, 3).map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {entry.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {entry.username}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.progressPercentage}% complete
                </p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {individualLeaderboard.slice(0, limit).map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${
                entry.rank <= 3 
                  ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' 
                  : 'border-gray-200 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getRankColor(entry.rank)} shadow-sm`}>
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.username}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {entry.badges.slice(0, 2).map((badge, badgeIndex) => (
                        <Badge key={badgeIndex} variant="secondary" className="text-xs">
                          {getBadgeIcon(badge)}
                          <span className="ml-1 capitalize">{badge.replace('_', ' ')}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {entry.progressPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {entry.progress.toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Trophy className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <span className="text-xl text-gray-900 dark:text-gray-100">Challenge Leaderboard</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real-time rankings and achievements
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {showTeams ? (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 mx-6 mt-6">
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-0">
              <div className="p-6 space-y-4">
                {/* Top 3 Podium */}
                {individualLeaderboard.length >= 3 && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* 2nd Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center"
                    >
                      <div className="bg-gradient-to-b from-gray-200 to-gray-400 rounded-lg p-4 mb-3 h-20 flex items-end justify-center">
                        <Avatar className="h-12 w-12 border-2 border-white">
                          <AvatarFallback>
                            {individualLeaderboard[1]?.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {individualLeaderboard[1]?.username}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {individualLeaderboard[1]?.progressPercentage}%
                      </p>
                      <Medal className="h-6 w-6 text-gray-400 mx-auto mt-2" />
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-lg p-4 mb-3 h-24 flex items-end justify-center">
                        <Avatar className="h-14 w-14 border-2 border-white">
                          <AvatarFallback>
                            {individualLeaderboard[0]?.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        {individualLeaderboard[0]?.username}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {individualLeaderboard[0]?.progressPercentage}%
                      </p>
                      <Crown className="h-8 w-8 text-yellow-500 mx-auto mt-2" />
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center"
                    >
                      <div className="bg-gradient-to-b from-amber-300 to-amber-500 rounded-lg p-4 mb-3 h-16 flex items-end justify-center">
                        <Avatar className="h-10 w-10 border-2 border-white">
                          <AvatarFallback>
                            {individualLeaderboard[2]?.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {individualLeaderboard[2]?.username}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {individualLeaderboard[2]?.progressPercentage}%
                      </p>
                      <Medal className="h-6 w-6 text-amber-600 mx-auto mt-2" />
                    </motion.div>
                  </div>
                )}

                {/* Full Rankings */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Full Rankings</span>
                  </h3>
                  
                  {individualLeaderboard.slice(0, limit).map((entry, index) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        entry.rank <= 3 
                          ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' 
                          : 'border-gray-200 bg-white dark:bg-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getRankColor(entry.rank)} shadow-sm flex items-center justify-center min-w-[40px]`}>
                            {getRankIcon(entry.rank)}
                          </div>
                          
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {entry.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {entry.username}
                            </h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                                <Flame className="h-3 w-3" />
                                <span>{entry.streak} day streak</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatLastActive(entry.lastActive)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              {entry.badges.map((badge, badgeIndex) => (
                                <Badge key={badgeIndex} variant="secondary" className="text-xs">
                                  {getBadgeIcon(badge)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {entry.progressPercentage}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.progress.toLocaleString()} / {Math.floor(entry.progress / (entry.progressPercentage / 100)).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {entry.dailyAverage.toLocaleString()}/day avg
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="mt-0">
              <div className="p-6 space-y-4">
                {teamLeaderboard.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Team Rankings</span>
                    </h3>
                    
                    {teamLeaderboard.map((team, index) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          team.rank <= 3 
                            ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' 
                            : 'border-gray-200 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${getRankColor(team.rank)} shadow-sm`}>
                              {getRankIcon(team.rank)}
                            </div>
                            
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                {team.name}
                              </h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                                  <Users className="h-3 w-3" />
                                  <span>{team.members?.length || 4} members</span>
                                </div>
                                {team.badge && (
                                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                    {getBadgeIcon(team.badge)}
                                    <span className="ml-1 capitalize">{team.badge.replace('_', ' ')}</span>
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {team.totalProgress.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Total Progress
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {team.averageProgress.toLocaleString()} avg per member
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No Team Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Teams will appear here once the challenge begins!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-6">
            {/* Individual leaderboard without tabs */}
            <div className="space-y-4">
              {individualLeaderboard.slice(0, limit).map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {entry.username}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {entry.badges.map((badge, badgeIndex) => (
                            <Badge key={badgeIndex} variant="secondary" className="text-xs">
                              {getBadgeIcon(badge)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {entry.progressPercentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.progress.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}