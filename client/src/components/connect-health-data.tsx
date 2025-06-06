import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

type HealthProvider = {
  id: string;
  name: string;
  logo: string;
  description: string;
};

const providers: HealthProvider[] = [
  {
    id: 'apple',
    name: 'Apple Health',
    logo: 'ri-apple-fill',
    description: 'Connect with Apple Health to sync your health and fitness data'
  },
  {
    id: 'google',
    name: 'Google Fit',
    logo: 'ri-google-fill',
    description: 'Sync your activity, heart data, and sleep information from Google Fit'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    logo: 'ri-fitness-fill',
    description: 'Import your steps, exercise, sleep, and heart rate data from Fitbit'
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    logo: 'ri-run-line',
    description: 'Sync your running, cycling, and other fitness data from Garmin devices'
  }
];

export default function ConnectHealthDataButton() {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<HealthProvider | null>(null);

  const handleConnect = (provider: HealthProvider) => {
    setSelectedProvider(provider);
    // This function would be implemented to handle the actual connection with the provider
    connectHealthData(provider.id);
  };

  function connectHealthData(providerId: string) {
    const oauthMap: Record<string, string> = {
      apple: 'apple-health',
      google: 'google-fit',
      fitbit: 'fitbit',
    };

    const route = oauthMap[providerId];
    if (route) {
      window.location.href = `/api/oauth/${route}`;
      return;
    }

    // Fallback for providers without OAuth yet
    alert(`Connecting your health data for personal management from ${providerId}...`);
    setTimeout(() => {
      setOpen(false);
    }, 1500);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        <i className="ri-heart-pulse-line mr-2" aria-hidden="true"></i>
        Connect Health Data
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Connect Your Health Data</DialogTitle>
            <DialogDescription>
              Link your health devices and apps to get personalized insights. Your data is secure and private.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {providers.map((provider) => (
              <Card 
                key={provider.id} 
                className="cursor-pointer hover:border-primary transition-colors duration-200"
                onClick={() => handleConnect(provider)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <i
                      className={`${provider.logo} text-2xl text-primary`}
                      aria-hidden="true"
                    ></i>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{provider.description}</CardDescription>
                </CardContent>
                <CardFooter className="pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(provider);
                    }}
                  >
                    Connect
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="ghost" className="flex items-center gap-1">
              <i className="ri-question-line"></i>
              Learn more about data privacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}