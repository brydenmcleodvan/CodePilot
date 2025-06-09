import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

interface FeedbackItem {
  id: string;
  satisfaction: number;
  feedback: string;
  featureUsed?: string;
  timestamp: string;
  triggerType: string;
  userId?: number;
}

export async function processFeedback(req: Request, res: Response) {
  try {
    const { satisfaction, feedback, featureUsed, timestamp, triggerType } = req.body;
    
    // Validate required fields
    if (satisfaction === undefined) {
      return res.status(400).json({ message: 'Satisfaction rating is required' });
    }
    
    // Create feedback directory if it doesn't exist
    const feedbackDir = path.join(process.cwd(), 'data', 'feedback');
    await fs.mkdir(feedbackDir, { recursive: true });
    
    // Read existing feedback
    const feedbackFile = path.join(feedbackDir, 'user_feedback.json');
    let feedbackItems: FeedbackItem[] = [];
    
    try {
      const fileContent = await fs.readFile(feedbackFile, 'utf-8');
      feedbackItems = JSON.parse(fileContent);
    } catch (error) {
      // File might not exist yet, starting fresh
      feedbackItems = [];
    }
    
    // Add the new feedback
    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      satisfaction,
      feedback: feedback || '',
      featureUsed,
      timestamp: timestamp || new Date().toISOString(),
      triggerType,
      userId: req.user?.id
    };
    
    feedbackItems.push(newFeedback);
    
    // Save feedback
    await fs.writeFile(feedbackFile, JSON.stringify(feedbackItems, null, 2));
    
    // Send success response
    res.status(200).json({ 
      message: 'Feedback received. Thank you!',
      id: newFeedback.id
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ message: 'Failed to process feedback' });
  }
}

/**
 * Get feedback statistics
 * Used for admin dashboards
 */
export async function getFeedbackStats(req: Request, res: Response) {
  try {
    // Check authentication (only admin should access this)
    if (!req.isAuthenticated || !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const feedbackFile = path.join(process.cwd(), 'data', 'feedback', 'user_feedback.json');
    
    try {
      const fileContent = await fs.readFile(feedbackFile, 'utf-8');
      const feedbackItems: FeedbackItem[] = JSON.parse(fileContent);
      
      // Calculate stats
      const totalCount = feedbackItems.length;
      
      // Average satisfaction
      const totalSatisfaction = feedbackItems.reduce(
        (sum, item) => sum + item.satisfaction, 
        0
      );
      const averageSatisfaction = totalCount > 0 
        ? (totalSatisfaction / totalCount).toFixed(1) 
        : '0';
      
      // Group by satisfaction rating
      const satisfactionDistribution = feedbackItems.reduce((acc, item) => {
        const rating = item.satisfaction.toString();
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate recent trend (last 7 days vs previous 7 days)
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      const recentFeedback = feedbackItems.filter(item => 
        new Date(item.timestamp) >= oneWeekAgo
      );
      
      const previousWeekFeedback = feedbackItems.filter(item => 
        new Date(item.timestamp) >= twoWeeksAgo && 
        new Date(item.timestamp) < oneWeekAgo
      );
      
      const recentAvg = recentFeedback.length > 0
        ? recentFeedback.reduce((sum, item) => sum + item.satisfaction, 0) / recentFeedback.length
        : 0;
        
      const previousAvg = previousWeekFeedback.length > 0
        ? previousWeekFeedback.reduce((sum, item) => sum + item.satisfaction, 0) / previousWeekFeedback.length
        : 0;
      
      const trend = previousAvg > 0
        ? ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1)
        : '0';
      
      res.status(200).json({
        totalFeedback: totalCount,
        averageSatisfaction,
        satisfactionDistribution,
        recentCount: recentFeedback.length,
        trend: `${trend}%`,
        trendDirection: recentAvg >= previousAvg ? 'up' : 'down'
      });
      
    } catch (error) {
      // No feedback data yet
      res.status(200).json({
        totalFeedback: 0,
        averageSatisfaction: '0',
        satisfactionDistribution: {},
        recentCount: 0,
        trend: '0%',
        trendDirection: 'neutral'
      });
    }
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({ message: 'Failed to get feedback statistics' });
  }
}