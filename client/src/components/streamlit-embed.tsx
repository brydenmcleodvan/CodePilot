import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';

export function StreamlitEmbed() {
  const [isFrameVisible, setIsFrameVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // In Replit, we need to handle the iframe embedding differently
  // The URL format should use the Replit domain structure
  const hostname = window.location.hostname;
  let streamlitUrl;
  
  if (hostname.includes('replit')) {
    // In Replit, we need a special URL format for the embedded app
    const replitAppBase = hostname.replace('.replit.dev', '');
    streamlitUrl = `https://${replitAppBase}-8501.replit.dev`;
  } else {
    // For local development
    streamlitUrl = `${window.location.protocol}//${window.location.hostname}:8501`;
  }
  
  const handleLoadStreamlit = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate checking if Streamlit is running
    fetch(streamlitUrl, { mode: 'no-cors' })
      .then(() => {
        setIsFrameVisible(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error connecting to Streamlit:', err);
        setError('Could not connect to the Streamlit application. Please make sure it\'s running.');
        setIsLoading(false);
      });
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Neural Profile Dashboard</h2>
        <p className="text-gray-600 mb-4">
          This interactive dashboard provides a comprehensive view of the patient's neurological
          profile, including seizure history, EEG results, imaging studies, and cognitive 
          assessments. The dashboard is powered by Streamlit and Python data analytics.
        </p>
        
        {!isFrameVisible && (
          <Button 
            onClick={handleLoadStreamlit}
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? 'Loading...' : 'Launch Neural Profile Dashboard'}
          </Button>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {isFrameVisible && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
              <span className="font-medium">Neural Profile Dashboard</span>
              <a 
                href={streamlitUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                Open in new window <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
            <iframe
              src={streamlitUrl}
              title="Neural Profile Dashboard"
              width="100%"
              height="800px"
              style={{ border: 'none' }}
            />
          </CardContent>
        </Card>
      )}
      
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">About This Dashboard</h3>
        <p className="text-sm text-gray-700">
          The Neural Profile Dashboard provides an interactive way to explore patient data with a focus on 
          neurological health. It visualizes seizure patterns, medication efficacy, and overall 
          neurological health trends. This tool is particularly useful for patients with conditions like 
          epilepsy, allowing them to identify triggers and monitor treatment effectiveness over time.
        </p>
      </div>
    </div>
  );
}

export default StreamlitEmbed;