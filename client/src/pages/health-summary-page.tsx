import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Sparkles,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HealthSummaryCard from '@/components/health-summary-card';

export default function HealthSummaryPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger refresh of summary data
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <span>Health Summary</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your personalized health insights and progress overview
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Weekly Summary Preview */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">This Week</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">7-day overview</p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Get comprehensive insights about your weekly health patterns, goal achievements, and areas for improvement.
              </p>
            </CardContent>
          </Card>

          {/* Daily Summary Preview */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Today</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Daily snapshot</p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Quick daily check-in with your health metrics, goal progress, and immediate action items for today.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Summary Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="weekly" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Weekly Summary</span>
              </TabsTrigger>
              <TabsTrigger value="daily" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Daily Summary</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-6">
              <HealthSummaryCard 
                period="weekly" 
                variant="detailed"
                showDeliveryOptions={true}
              />
            </TabsContent>

            <TabsContent value="daily" className="space-y-6">
              <HealthSummaryCard 
                period="daily" 
                variant="detailed"
                showDeliveryOptions={true}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Intelligent Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered insights analyze your health patterns and identify trends automatically
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Goal Tracking
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your progress across all health goals with detailed achievement analysis
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Personalized Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get customized recommendations based on your unique health journey
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}