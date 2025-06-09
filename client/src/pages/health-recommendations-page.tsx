import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, TrendingUp, MessageCircle, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HealthRecommendations from '@/components/health-recommendations';
import HealthCoachAI from '@/components/health-coach-ai';

export default function HealthRecommendationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Health Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Personalized coaching based on your health patterns and goals
              </p>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border"
            >
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Smart Recommendations
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered insights based on your data
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border"
            >
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Pattern Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify trends and improvement areas
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border"
            >
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Actionable Tips
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clear steps to improve your health
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Health Insights</span>
              </TabsTrigger>
              <TabsTrigger value="ai-coach" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Ask AI Coach</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-6">
              <HealthRecommendations />
            </TabsContent>

            <TabsContent value="ai-coach" className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border h-[600px]">
                <HealthCoachAI />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}