import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MetricDetailModal, { MetricData } from './metric-detail-modal';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Activity,
  Moon,
  Footprints,
  Thermometer,
  Droplets,
} from 'lucide-react';

interface DashboardMetricCardProps {
  metric: MetricData;
  onClick?: () => void;
}

const iconMap = {
  heart: Heart,
  activity: Activity,
  moon: Moon,
  footprints: Footprints,
  thermometer: Thermometer,
  droplets: Droplets,
};

export default function DashboardMetricCard({ metric, onClick }: DashboardMetricCardProps) {
  const [showModal, setShowModal] = useState(false);
  
  const Icon = iconMap[metric.icon];
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

  const handleCardClick = () => {
    setShowModal(true);
    onClick?.();
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
      >
        <Card 
          className="hover:shadow-lg transition-all duration-200 border-l-4 hover:border-opacity-100"
          style={{ borderLeftColor: metric.color }}
          onClick={handleCardClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {metric.name}
            </CardTitle>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
              <Icon className="h-4 w-4" style={{ color: metric.color }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold" style={{ color: metric.color }}>
                  {metric.value} {metric.unit}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <TrendIcon 
                      className={`h-3 w-3 ${
                        metric.trend === 'up' ? 'text-green-500' : 
                        metric.trend === 'down' ? 'text-red-500' : 
                        'text-gray-500'
                      }`} 
                    />
                    <span className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {metric.trendValue}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {metric.source}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <MetricDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        metric={metric}
      />
    </>
  );
}

// Example usage and sample data for demonstration
export const sampleHealthMetrics: MetricData[] = [
  {
    id: 'heart-rate',
    name: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    trend: 'stable',
    trendValue: '↔ 0.2%',
    source: 'Apple Watch',
    icon: 'heart',
    color: '#EF4444',
    data7d: [
      { date: '2024-01-15', value: 68, quality: 'good' },
      { date: '2024-01-16', value: 71, quality: 'good' },
      { date: '2024-01-17', value: 74, quality: 'fair' },
      { date: '2024-01-18', value: 69, quality: 'good' },
      { date: '2024-01-19', value: 72, quality: 'good' },
      { date: '2024-01-20', value: 70, quality: 'good' },
      { date: '2024-01-21', value: 72, quality: 'good' },
    ],
    data30d: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: 68 + Math.random() * 8,
      quality: ['good', 'fair', 'good', 'good'][Math.floor(Math.random() * 4)] as 'good' | 'fair',
    })),
    data90d: Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: 65 + Math.random() * 12,
      quality: ['good', 'fair', 'good'][Math.floor(Math.random() * 3)] as 'good' | 'fair',
    })),
    insights: {
      meaning: 'Your resting heart rate is within the normal range for adults. A resting heart rate between 60-100 bpm is considered healthy, with lower rates often indicating better cardiovascular fitness.',
      recommendations: [
        'Continue regular cardiovascular exercise to maintain heart health',
        'Monitor for any significant changes or irregularities',
        'Consider meditation or stress reduction techniques if rates are consistently high',
      ],
      normalRange: '60-100 bpm (adults)',
      currentStatus: 'good',
    },
  },
  {
    id: 'sleep-duration',
    name: 'Sleep Duration',
    value: '7.5',
    unit: 'hours',
    trend: 'up',
    trendValue: '↑ 8.2%',
    source: 'Oura Ring',
    icon: 'moon',
    color: '#8B5CF6',
    data7d: [
      { date: '2024-01-15', value: 7.2, quality: 'good' },
      { date: '2024-01-16', value: 6.8, quality: 'fair' },
      { date: '2024-01-17', value: 8.1, quality: 'good' },
      { date: '2024-01-18', value: 7.3, quality: 'good' },
      { date: '2024-01-19', value: 7.6, quality: 'good' },
      { date: '2024-01-20', value: 7.9, quality: 'good' },
      { date: '2024-01-21', value: 7.5, quality: 'good' },
    ],
    data30d: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: 6.5 + Math.random() * 2.5,
      quality: ['good', 'fair', 'good'][Math.floor(Math.random() * 3)] as 'good' | 'fair',
    })),
    data90d: Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: 6 + Math.random() * 3,
      quality: ['good', 'fair', 'poor', 'good'][Math.floor(Math.random() * 4)] as 'good' | 'fair' | 'poor',
    })),
    insights: {
      meaning: 'You\'re getting close to the recommended 7-9 hours of sleep per night. Good sleep duration is crucial for physical recovery, mental health, and cognitive performance.',
      recommendations: [
        'Maintain consistent sleep and wake times',
        'Create a relaxing bedtime routine',
        'Avoid screens 1 hour before bed',
        'Keep your bedroom cool and dark',
      ],
      normalRange: '7-9 hours (adults)',
      currentStatus: 'good',
    },
  },
  {
    id: 'daily-steps',
    name: 'Daily Steps',
    value: '8,543',
    unit: 'steps',
    trend: 'up',
    trendValue: '↑ 12.3%',
    source: 'iPhone',
    icon: 'footprints',
    color: '#10B981',
    data7d: [
      { date: '2024-01-15', value: 7890, quality: 'good' },
      { date: '2024-01-16', value: 9200, quality: 'good' },
      { date: '2024-01-17', value: 8100, quality: 'good' },
      { date: '2024-01-18', value: 8750, quality: 'good' },
      { date: '2024-01-19', value: 9500, quality: 'good' },
      { date: '2024-01-20', value: 8200, quality: 'good' },
      { date: '2024-01-21', value: 8543, quality: 'good' },
    ],
    data30d: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: 6000 + Math.random() * 5000,
      quality: 'good' as const,
    })),
    data90d: Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: 5000 + Math.random() * 6000,
      quality: 'good' as const,
    })),
    insights: {
      meaning: 'You\'re approaching the recommended 10,000 steps per day. Regular walking helps improve cardiovascular health, maintain weight, and boost mental well-being.',
      recommendations: [
        'Aim for 10,000 steps daily for optimal health benefits',
        'Take walking breaks during long periods of sitting',
        'Use stairs instead of elevators when possible',
        'Consider walking meetings or calls',
      ],
      normalRange: '8,000-10,000+ steps daily',
      currentStatus: 'good',
    },
  },
];