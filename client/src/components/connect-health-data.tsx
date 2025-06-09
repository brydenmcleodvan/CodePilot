import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ConnectHealthDataButton() {
export default function ConnectHealthDataButton() {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<HealthProvider | null>(null);

  function handleConnect(provider: HealthProvider) {
    setSelectedProvider(provider);
    connectHealthData(provider.id);
  }

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
    setTimeout(() => setOpen(false), 1500);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        <i className="ri-heart-pulse-line mr-2" aria-hidden="true" />
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
                    <i className={`${provider.logo} text-2xl text-primary`} aria-hidden="true" />
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
              <i className="ri-question-line" />
              Learn more about data privacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

