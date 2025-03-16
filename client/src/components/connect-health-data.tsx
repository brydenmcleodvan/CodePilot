import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

export default function ConnectHealthDataButton() {
  const [showDialog, setShowDialog] = useState(false);
  
  const connectHealthData = () => {
    // First open the dialog to show connection options
    setShowDialog(true);
  };
  
  const handleConnect = (provider: string) => {
    // This would connect to the selected health data provider
    console.log(`Connecting to ${provider}...`);
    // In a real implementation, this would initiate OAuth or similar
    
    // Mock successful connection
    setTimeout(() => {
      setShowDialog(false);
      // Show success message
      alert(`Connected to ${provider} successfully! Your health data will be synced for personalized recommendations.`);
    }, 1500);
  };
  
  return (
    <>
      <Button 
        onClick={connectHealthData}
        className="bg-primary hover:bg-secondary text-white"
      >
        Connect Health Data
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Your Health Data</DialogTitle>
            <DialogDescription>
              Choose a provider to connect your health data for personalized recommendations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-3 border rounded-md hover:border-primary cursor-pointer" 
                 onClick={() => handleConnect("Apple Health")}>
              <div className="flex items-center gap-2">
                <i className="ri-apple-fill text-2xl"></i>
                <span>Apple Health</span>
              </div>
              <i className="ri-arrow-right-line"></i>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-md hover:border-primary cursor-pointer"
                 onClick={() => handleConnect("Google Fit")}>
              <div className="flex items-center gap-2">
                <i className="ri-google-fill text-2xl"></i>
                <span>Google Fit</span>
              </div>
              <i className="ri-arrow-right-line"></i>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-md hover:border-primary cursor-pointer"
                 onClick={() => handleConnect("Fitbit")}>
              <div className="flex items-center gap-2">
                <i className="ri-heart-pulse-line text-2xl"></i>
                <span>Fitbit</span>
              </div>
              <i className="ri-arrow-right-line"></i>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}