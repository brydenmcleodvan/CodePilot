import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingUp, Heart, Activity, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface LongevityScoreCardProps {
  biologicalAge: number;
  chronologicalAge: number;
  score: number;
  trend: number;
  isLoading?: boolean;
}

export function LongevityScoreCard({
  biologicalAge,
  chronologicalAge,
  score,
  trend,
  isLoading = false
}: LongevityScoreCardProps) {
  // Calculate the difference between biological and chronological age
  const ageDifference = chronologicalAge - biologicalAge;
  const isYounger = ageDifference > 0;
  
  // Calculate score color based on value
  const getScoreColor = () => {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            <span>Longevity Score</span>
          </CardTitle>
          <CardDescription className="text-body-text dark:text-gray-300">
            Your biological vs. chronological age
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse w-3/4" />
            <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          <span>Longevity Score</span>
        </CardTitle>
        <CardDescription className="text-body-text dark:text-gray-300">
          Your biological vs. chronological age
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4"
        >
          {/* Score Display */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-body-text dark:text-gray-300">Your Score</span>
              <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}</span>
            </div>
            <div className="flex items-center">
              <div className={`px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'} flex items-center text-xs font-medium`}>
                {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <Activity className="h-3 w-3 mr-1" />}
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </div>
            </div>
          </div>

          {/* Age Comparison */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-body-text dark:text-gray-300">Biological Age</span>
              <span className="text-sm font-medium text-dark-text dark:text-white">{biologicalAge} years</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-body-text dark:text-gray-300">Chronological Age</span>
              <span className="text-sm font-medium text-dark-text dark:text-white">{chronologicalAge} years</span>
            </div>
            <div className="mt-2">
              <Progress value={(biologicalAge / chronologicalAge) * 100} className="h-2" />
            </div>
            <div className={`mt-2 text-sm ${isYounger ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-medium text-right`}>
              {isYounger 
                ? `${ageDifference.toFixed(1)} years younger biologically` 
                : `${Math.abs(ageDifference).toFixed(1)} years older biologically`}
            </div>
          </div>

          {/* Key Factors */}
          <div>
            <h4 className="text-sm font-medium text-dark-text dark:text-white mb-2">Top Factors</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-body-text dark:text-gray-300">
                <div className="flex items-center">
                  <Heart className="h-3.5 w-3.5 text-primary mr-2" />
                  <span>Heart Health</span>
                </div>
                <span className="font-medium">Excellent</span>
              </div>
              <div className="flex justify-between items-center text-body-text dark:text-gray-300">
                <div className="flex items-center">
                  <Activity className="h-3.5 w-3.5 text-primary mr-2" />
                  <span>Metabolic Health</span>
                </div>
                <span className="font-medium">Good</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Link href="/longevity">
            <Button variant="outline" className="w-full mt-2 text-primary border-primary/30 hover:bg-primary/5">
              View Full Longevity Report
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </CardContent>
    </Card>
  );
}