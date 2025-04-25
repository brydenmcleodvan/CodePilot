import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

// Redirect to Health Coach page with Intelligence tab selected
export default function AIIntelligencePage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Use a session storage flag to indicate we want the intelligence tab
    sessionStorage.setItem('healthCoachTab', 'intelligence');
    
    // Redirect to health coach page after a short delay to ensure the UI updates
    const redirectTimer = setTimeout(() => {
      setLocation("/health-coach");
    }, 300);
    
    return () => clearTimeout(redirectTimer);
  }, [setLocation]);
  
  // Show loading indicator while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-body-text dark:text-gray-300">
        AI Intelligence has merged with Health Coach
      </p>
      <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
        Redirecting you now...
      </p>
    </div>
  );
}