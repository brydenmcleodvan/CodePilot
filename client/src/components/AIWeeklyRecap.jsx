import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Target,
  Star,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Share2,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * AI Weekly Recap Component
 * Displays personalized, natural language health summaries
 */
export function AIWeeklyRecap() {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = last week, etc.
  const { toast } = useToast();

  // Fetch weekly recap data
  const { data: recapData, isLoading, refetch } = useQuery({
    queryKey: ['/api/weekly-recap', selectedWeek],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/weekly-recap?week=${selectedWeek}`);
      return res.json();
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });

  const handlePreviousWeek = () => {
    setSelectedWeek(prev => Math.min(prev + 1, 8)); // Max 8 weeks back
  };

  const handleNextWeek = () => {
    setSelectedWeek(prev => Math.max(prev - 1, 0)); // Can't go future
  };

  const getWeekDateRange = (weekOffset) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() - (7 * weekOffset));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const handleShareRecap = () => {
    const recap = recapData?.recap;
    if (recap) {
      const shareText = `My health recap: ${recap.summary}`;
      if (navigator.share) {
        navigator.share({
          title: recap.title,
          text: shareText
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "Your recap summary has been copied to clipboard."
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    );
  }

  const { success, recap, weekData } = recapData || {};
  const weekRange = getWeekDateRange(selectedWeek);

  if (!success || !recap) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Building Your Weekly Recap</h3>
          <p className="text-gray-600 mb-4">
            We need at least 3 days of health data to create your personalized weekly summary.
          </p>
          <p className="text-sm text-gray-500">
            Keep tracking your health metrics, and we'll automatically generate insights for you!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span>AI Weekly Recap</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your personalized health story, powered by AI
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareRecap}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              disabled={selectedWeek >= 8}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Week
            </Button>
            
            <div className="text-center">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">
                  {selectedWeek === 0 ? 'This Week' : 
                   selectedWeek === 1 ? 'Last Week' : 
                   `${selectedWeek} Weeks Ago`}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {weekRange.start} - {weekRange.end}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              disabled={selectedWeek === 0}
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Recap Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedWeek}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <span>{recap.title}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    {recap.type === 'ai_generated' ? 'AI Generated' : 'Template'}
                  </Badge>
                  {recap.model && (
                    <Badge variant="outline">
                      {recap.model}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {recap.summary}
              </div>

              {/* Highlights */}
              {recap.highlights && recap.highlights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>This Week's Highlights</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recap.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-green-800 dark:text-green-400">
                          {highlight}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recap.recommendations && recap.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <span>Recommendations</span>
                  </h3>
                  <div className="space-y-3">
                    {recap.recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800 dark:text-blue-400">
                          {recommendation}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Week Focus */}
              {recap.nextWeekFocus && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Next Week's Focus</span>
                  </h3>
                  <p className="text-purple-800 dark:text-purple-400 font-medium">
                    {recap.nextWeekFocus}
                  </p>
                </div>
              )}

              {/* Generation Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Generated {new Date(recap.generatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {weekData && (
                  <div className="flex items-center space-x-4">
                    <span>Based on {weekData.overall?.totalMetrics || 0} health metrics</span>
                    {weekData.overall?.improvingMetrics > 0 && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          {weekData.overall.improvingMetrics} improving
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Quick Stats Grid */}
      {weekData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {weekData.sleep?.average?.toFixed(1) || 0}h
              </div>
              <div className="text-sm text-gray-600">Avg Sleep</div>
              <div className="text-xs text-gray-500 mt-1">
                {weekData.sleep?.trend === 'improving' ? '↗️ Improving' : 
                 weekData.sleep?.trend === 'declining' ? '↘️ Declining' : '→ Stable'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {weekData.exercise?.activeDays || 0}
              </div>
              <div className="text-sm text-gray-600">Active Days</div>
              <div className="text-xs text-gray-500 mt-1">
                {weekData.exercise?.totalMinutes || 0} min total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {weekData.recovery?.avgHRV?.toFixed(0) || 0}
              </div>
              <div className="text-sm text-gray-600">Avg HRV</div>
              <div className="text-xs text-gray-500 mt-1">
                {weekData.recovery?.hrvTrend === 'improving' ? '↗️ Improving' : 
                 weekData.recovery?.hrvTrend === 'declining' ? '↘️ Declining' : '→ Stable'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {weekData.mood?.averageScore?.toFixed(1) || 0}
              </div>
              <div className="text-sm text-gray-600">Mood Score</div>
              <div className="text-xs text-gray-500 mt-1">
                {weekData.mood?.trend === 'improving' ? '↗️ Improving' : 
                 weekData.mood?.trend === 'declining' ? '↘️ Declining' : '→ Stable'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AIWeeklyRecap;