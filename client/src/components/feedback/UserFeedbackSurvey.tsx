import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HeartIcon, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface FeedbackSurveyProps {
  sessionDuration?: number;
  featureUsed?: string;
  triggerType?: 'timer' | 'feature' | 'manual';
}

export function UserFeedbackSurvey({ 
  sessionDuration = 300, // 5 minutes default
  featureUsed, 
  triggerType = 'timer' 
}: FeedbackSurveyProps) {
  const [showSurvey, setShowSurvey] = useState(false);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  // Check if user has recently completed a survey to avoid survey fatigue
  const checkSurveyHistory = () => {
    const lastSurvey = localStorage.getItem('healthmap_last_survey');
    if (lastSurvey) {
      const lastSurveyTime = parseInt(lastSurvey, 10);
      const hoursSinceLastSurvey = (Date.now() - lastSurveyTime) / (1000 * 60 * 60);
      
      // Don't show survey if one was completed in the last 24 hours
      if (hoursSinceLastSurvey < 24) {
        return false;
      }
    }
    return true;
  };
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Only set up the timer if trigger type is 'timer'
    if (triggerType === 'timer' && !dismissed) {
      timer = setTimeout(() => {
        if (checkSurveyHistory()) {
          setShowSurvey(true);
        }
      }, sessionDuration * 1000);
    }
    
    // If trigger type is 'feature', show immediately if the feature was used
    if (triggerType === 'feature' && featureUsed && !dismissed) {
      if (checkSurveyHistory()) {
        setShowSurvey(true);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [sessionDuration, triggerType, featureUsed, dismissed]);
  
  const handleSubmit = async () => {
    if (satisfaction === null) return;
    
    try {
      await apiRequest('POST', '/api/feedback', {
        satisfaction,
        feedback,
        featureUsed,
        timestamp: new Date().toISOString(),
        triggerType
      });
      
      // Update last survey time
      localStorage.setItem('healthmap_last_survey', Date.now().toString());
      
      setSubmitted(true);
      
      // Close dialog after showing thank you message
      setTimeout(() => {
        setShowSurvey(false);
        setDismissed(true);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  
  const handleDismiss = () => {
    setShowSurvey(false);
    setDismissed(true);
    
    // Set a shorter cooldown if user dismisses (4 hours)
    const dismissTime = Date.now() - (20 * 60 * 60 * 1000); // Current time minus 20 hours
    localStorage.setItem('healthmap_last_survey', dismissTime.toString());
  };
  
  return (
    <Dialog open={showSurvey} onOpenChange={setShowSurvey}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {!submitted ? (
              <>Quick Feedback <HeartIcon className="ml-2 h-5 w-5 text-red-500" /></>
            ) : (
              <>Thank You! <ThumbsUp className="ml-2 h-5 w-5 text-green-500" /></>
            )}
          </DialogTitle>
          <DialogDescription>
            {!submitted 
              ? "Help us improve Healthmap with your thoughts. It takes less than a minute."
              : "Your feedback helps us make Healthmap better for everyone."}
          </DialogDescription>
        </DialogHeader>
        
        {!submitted ? (
          <>
            <div className="py-4">
              <h3 className="font-medium mb-3">How would you rate your experience?</h3>
              <RadioGroup value={satisfaction?.toString()} onValueChange={(val) => setSatisfaction(parseInt(val, 10))}>
                <div className="flex justify-between px-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer">
                      <ThumbsDown className="h-5 w-5 text-red-500" />
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="2" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer">2</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="3" id="r3" />
                    <Label htmlFor="r3" className="cursor-pointer">3</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="4" id="r4" />
                    <Label htmlFor="r4" className="cursor-pointer">4</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="5" id="r5" />
                    <Label htmlFor="r5" className="cursor-pointer">
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="mt-4">
                <Label htmlFor="feedback" className="font-medium mb-2 block">
                  What could we improve?
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts (optional)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row sm:justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDismiss}
                className="mb-2 sm:mb-0"
              >
                Not now
              </Button>
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={satisfaction === null}
              >
                Submit Feedback
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center">
            <ThumbsUp className="mx-auto h-10 w-10 text-green-500 mb-2" />
            <p className="text-lg font-medium">Thanks for your feedback!</p>
          </div>
        )}
        
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}