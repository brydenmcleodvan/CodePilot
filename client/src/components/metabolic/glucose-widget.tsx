import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";

interface GlucoseWidgetProps {
  currentValue?: number;
  previousValue?: number;
  lastUpdated?: string;
  trend?: number;
  isLoading?: boolean;
}

export function GlucoseWidget({
  currentValue = 104,
  previousValue = 110,
  lastUpdated = "1 hour ago",
  trend = -5.5,
  isLoading = false
}: GlucoseWidgetProps) {
  const getGlucoseLevel = (value: number): "low" | "normal" | "elevated" | "high" => {
    if (value < 70) return "low";
    if (value <= 110) return "normal";
    if (value <= 140) return "elevated";
    return "high";
  };

  const getGlucoseColor = (level: string): string => {
    switch (level) {
      case "low":
        return "text-blue-600 dark:text-blue-400";
      case "normal":
        return "text-green-600 dark:text-green-400";
      case "elevated":
        return "text-yellow-600 dark:text-yellow-400";
      case "high":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };
  
  const getGlucoseStatus = (level: string): string => {
    switch (level) {
      case "low":
        return "Low";
      case "normal":
        return "Normal";
      case "elevated":
        return "Elevated";
      case "high":
        return "High";
      default:
        return "Unknown";
    }
  };

  const glucoseLevel = getGlucoseLevel(currentValue);
  const glucoseColor = getGlucoseColor(glucoseLevel);
  const glucoseStatus = getGlucoseStatus(glucoseLevel);
  const isTrendPositive = trend > 0;

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            <span>Glucose Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse w-3/4 mt-3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-dark-text dark:text-white flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          <span>Glucose Level</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-body-text dark:text-gray-300">Current</div>
              <div className={`text-3xl font-bold ${glucoseColor}`}>{currentValue} <span className="text-xl">mg/dL</span></div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className={`px-2 py-1 rounded-full ${glucoseColor} bg-opacity-15 dark:bg-opacity-15 text-xs font-medium`}>
                {glucoseStatus}
              </div>
              <div className="text-xs text-body-text dark:text-gray-400 mt-1.5">
                Updated {lastUpdated}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-1 rounded-full ${isTrendPositive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} mr-2`}>
                {isTrendPositive ? (
                  <TrendingUp className={`h-4 w-4 ${isTrendPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                ) : (
                  <TrendingDown className={`h-4 w-4 ${isTrendPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                )}
              </div>
              <span className={`text-sm font-medium ${isTrendPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {isTrendPositive ? "↑" : "↓"} {Math.abs(trend)}% from previous
              </span>
            </div>
            <Link href="/metabolic">
              <Button variant="link" size="sm" className="text-primary p-0">
                View History
              </Button>
            </Link>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}