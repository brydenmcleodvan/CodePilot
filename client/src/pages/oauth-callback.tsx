import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { handleOAuthCallback, HealthService } from "@/lib/health-api-integration";
import { useToast } from "@/hooks/use-toast";

// Parse the service name from the URL path
function getServiceFromPath(path: string): HealthService | null {
  const match = path.match(/\/integrations\/callback\/([a-zA-Z]+)/);
  if (!match || !match[1]) return null;
  
  const serviceName = match[1].toLowerCase();
  
  // Check if the service name is a valid HealthService enum value
  if (Object.values(HealthService).includes(serviceName as HealthService)) {
    return serviceName as HealthService;
  }
  
  return null;
}

// Parse query parameters from the URL
function getQueryParams(): { [key: string]: string } {
  const params: { [key: string]: string } = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  
  return params;
}

export default function OAuthCallbackPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    async function processOAuthCallback() {
      try {
        // Get the service name from the URL path
        const service = getServiceFromPath(window.location.pathname);
        if (!service) {
          throw new Error("Invalid service specified in callback URL");
        }
        
        // Get query parameters
        const params = getQueryParams();
        const { code, state, error, error_description } = params;
        
        // Handle error from OAuth provider
        if (error) {
          throw new Error(error_description || `Authentication error: ${error}`);
        }
        
        // Validate required parameters
        if (!code || !state) {
          throw new Error("Missing required OAuth parameters");
        }
        
        // Process the authentication
        const result = await handleOAuthCallback(service, code, state);
        
        if (result) {
          setStatus("success");
          toast({
            title: "Connection Successful",
            description: `Successfully connected to ${service.charAt(0).toUpperCase() + service.slice(1)}`,
          });
          
          // Redirect back to integrations page after a short delay
          setTimeout(() => {
            setLocation("/integrations");
          }, 3000);
        } else {
          throw new Error("Failed to complete authentication");
        }
      } catch (err) {
        setStatus("error");
        const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
        setErrorMessage(errorMsg);
        
        toast({
          title: "Connection Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    }
    
    processOAuthCallback();
  }, [setLocation, toast]);
  
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === "loading" && (
            <div className="text-center py-8">
              <div className="inline-flex mb-4 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <h2 className="text-xl font-semibold mb-2">Connecting Your Account</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we complete the connection...
              </p>
            </div>
          )}
          
          {status === "success" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <i className="ri-check-line text-3xl" aria-hidden="true"></i>
              </div>
              <h2 className="text-xl font-semibold mb-2">Connection Successful!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your account has been successfully connected. We'll now sync your health data.
              </p>
              <Button 
                onClick={() => setLocation("/integrations")}
                className="mt-2"
              >
                Return to Integrations
              </Button>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                <i className="ri-error-warning-line text-3xl" aria-hidden="true"></i>
              </div>
              <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage || "There was a problem connecting your account. Please try again."}
              </p>
              <Button 
                onClick={() => setLocation("/integrations")}
                className="mt-2"
              >
                Return to Integrations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}