import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, SendIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';

interface FeedbackWidgetProps {
  /** The source component/feature the feedback is related to */
  source: string;
  /** Compact mode displays just the icons without text */
  compact?: boolean;
  /** Feedback question to display */
  question?: string;
  /** Callback when feedback is submitted */
  onFeedbackSubmitted?: (helpful: boolean, comment?: string) => void;
  /** Additional contextual information to log with the feedback */
  context?: Record<string, any>;
}

/**
 * A reusable feedback widget with thumbs up/down and optional comment
 */
export default function FeedbackWidget({
  source,
  compact = false,
  question = 'Was this helpful?',
  onFeedbackSubmitted,
  context = {}
}: FeedbackWidgetProps) {
  const [showForm, setShowForm] = useState(false);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { trackFeedback } = useAnalytics();

  /** Handle initial feedback selection */
  const handleFeedback = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    setShowForm(true);
    
    // If no comment field is needed, submit right away
    if (compact) {
      submitFeedback(isHelpful);
    }
  };

  /** Submit the feedback to the API */
  const submitFeedback = async (isHelpful: boolean, userComment?: string) => {
    try {
      setSubmitting(true);
      
      // Call the API endpoint to save feedback
      await apiRequest('POST', '/api/feedback', {
        helpful: isHelpful,
        comment: userComment || comment,
        source,
        context,
        timestamp: new Date().toISOString()
      });
      
      // Track the feedback event
      trackFeedback(
        isHelpful ? 'helpful' : 'not_helpful', 
        source, 
        userComment || comment
      );
      
      // Show success message
      toast({
        title: 'Thanks for your feedback!',
        description: 'Your input helps us improve the experience.',
      });
      
      // Mark as submitted
      setSubmitted(true);
      
      // Call the callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(isHelpful, userComment || comment);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Could not submit feedback',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = () => {
    if (helpful !== null) {
      submitFeedback(helpful);
    }
  };

  const handleClose = () => {
    setShowForm(false);
  };

  // Show thank you message after submission
  if (submitted) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 py-2">
        <p>Thanks for your feedback!</p>
      </div>
    );
  }

  // Show comment form if user provided initial feedback
  if (showForm && !compact) {
    return (
      <Card className="max-w-md">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium">
              {helpful ? 'What was helpful?' : 'How can we improve?'}
            </p>
            <Button
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0" 
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            placeholder="Share your thoughts (optional)"
            className="resize-none mb-3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={handleSubmitComment}
              disabled={submitting}
              className="flex gap-2 items-center"
            >
              {submitting ? 'Sending...' : 'Send'}
              <SendIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show initial feedback buttons
  return (
    <div className="flex items-center gap-3">
      {!compact && <p className="text-sm text-gray-600 dark:text-gray-400">{question}</p>}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={`flex items-center gap-1.5 ${compact ? 'px-2' : ''}`}
          onClick={() => handleFeedback(true)}
          disabled={submitting}
        >
          <ThumbsUp className={compact ? "h-4 w-4" : "h-5 w-5"} />
          {!compact && <span>Yes</span>}
        </Button>
        
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={`flex items-center gap-1.5 ${compact ? 'px-2' : ''}`}
          onClick={() => handleFeedback(false)}
          disabled={submitting}
        >
          <ThumbsDown className={compact ? "h-4 w-4" : "h-5 w-5"} />
          {!compact && <span>No</span>}
        </Button>
      </div>
    </div>
  );
}