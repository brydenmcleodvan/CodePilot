import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePrivacy } from "@/hooks/use-privacy";

// Define the interface for privacy preferences
export interface PrivacyPreferences {
  allowAnalytics: boolean;
  allowFeedbackCollection: boolean;
  allowLocationData: boolean;
  preferLocalStorage: boolean;
  shareHealthMetrics: boolean;
  shareMedicationData: boolean;
  shareSymptomData: boolean;
}

// Default preferences - privacy focused by default
const defaultPreferences: PrivacyPreferences = {
  allowAnalytics: false,
  allowFeedbackCollection: false,
  allowLocationData: false,
  preferLocalStorage: true,
  shareHealthMetrics: false,
  shareMedicationData: false,
  shareSymptomData: false,
};

// Get current privacy preferences from localStorage or API
export const getPrivacyPreferences = (): PrivacyPreferences => {
  try {
    const storedPrefs = localStorage.getItem('healthmap_privacy_prefs');
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
  } catch (error) {
    console.error("Failed to load privacy preferences:", error);
  }
  
  // Return default privacy-focused settings if nothing stored
  return defaultPreferences;
};

export function PrivacySettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PrivacyPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences when component mounts
  useEffect(() => {
    const loadedPrefs = getPrivacyPreferences();
    setPreferences(loadedPrefs);
  }, []);

  // Handle changes to privacy settings
  const handleToggleChange = (setting: keyof PrivacyPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Save preferences
  const savePreferences = async () => {
    setIsSaving(true);
    
    try {
      // Always save locally first
      localStorage.setItem('healthmap_privacy_prefs', JSON.stringify(preferences));
      
      // Save to server if user is logged in
      if (user) {
        const response = await apiRequest("POST", "/api/user/privacy-settings", { 
          preferences 
        });
        
        if (response.ok) {
          toast({
            title: "Settings Saved",
            description: "Your privacy preferences have been updated.",
          });
        } else {
          throw new Error("Failed to save settings to server");
        }
      } else {
        toast({
          title: "Settings Saved Locally",
          description: "Your privacy preferences have been saved to this device.",
        });
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your privacy preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default privacy-focused settings
  const resetToDefault = () => {
    setPreferences(defaultPreferences);
    toast({
      title: "Reset to Defaults",
      description: "Privacy settings have been reset to the default privacy-focused configuration.",
    });
  };

  // Delete all local data
  const deleteAllData = () => {
    if (window.confirm("Are you sure you want to delete all your locally stored health data? This cannot be undone.")) {
      try {
        // Clear specific healthmap prefixed items
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('healthmap_')) {
            localStorage.removeItem(key);
          }
        }
        
        toast({
          title: "Data Deleted",
          description: "All your locally stored health data has been deleted.",
        });
        
        // Reset preferences to default after deletion
        setPreferences(defaultPreferences);
      } catch (error) {
        console.error("Error deleting local data:", error);
        toast({
          title: "Error Deleting Data",
          description: "There was a problem deleting your data.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Collection</CardTitle>
          <CardDescription>
            Control what data we collect and how it's used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="analytics" className="flex flex-col space-y-1">
              <span>Usage Analytics</span>
              <span className="font-normal text-sm text-muted-foreground">
                Anonymous data about how you use the app to help us improve
              </span>
            </Label>
            <Switch
              id="analytics"
              checked={preferences.allowAnalytics}
              onCheckedChange={() => handleToggleChange("allowAnalytics")}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="feedback" className="flex flex-col space-y-1">
              <span>Feedback Collection</span>
              <span className="font-normal text-sm text-muted-foreground">
                Allow us to collect your responses to "Was this helpful?" prompts
              </span>
            </Label>
            <Switch
              id="feedback"
              checked={preferences.allowFeedbackCollection}
              onCheckedChange={() => handleToggleChange("allowFeedbackCollection")}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="location" className="flex flex-col space-y-1">
              <span>Location Data</span>
              <span className="font-normal text-sm text-muted-foreground">
                Use your location for personalized recommendations
              </span>
            </Label>
            <Switch
              id="location"
              checked={preferences.allowLocationData}
              onCheckedChange={() => handleToggleChange("allowLocationData")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Storage</CardTitle>
          <CardDescription>
            Choose where your health data is stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="local-storage" className="flex flex-col space-y-1">
              <span>Local-Only Storage</span>
              <span className="font-normal text-sm text-muted-foreground">
                Keep sensitive health data on your device only (recommended for privacy)
              </span>
            </Label>
            <Switch
              id="local-storage"
              checked={preferences.preferLocalStorage}
              onCheckedChange={() => handleToggleChange("preferLocalStorage")}
            />
          </div>

          <div className="pt-2 pb-1">
            <h4 className="text-sm font-medium mb-2">Sync With Cloud</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Select what health data can be synchronized with our servers
            </p>
            
            <div className="space-y-3 ml-2">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="share-metrics" className="flex flex-col space-y-1">
                  <span>Health Metrics</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Steps, sleep, heart rate, etc.
                  </span>
                </Label>
                <Switch
                  id="share-metrics"
                  checked={preferences.shareHealthMetrics}
                  onCheckedChange={() => handleToggleChange("shareHealthMetrics")}
                  disabled={preferences.preferLocalStorage}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="share-medications" className="flex flex-col space-y-1">
                  <span>Medication Data</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Your medications and schedule
                  </span>
                </Label>
                <Switch
                  id="share-medications"
                  checked={preferences.shareMedicationData}
                  onCheckedChange={() => handleToggleChange("shareMedicationData")}
                  disabled={preferences.preferLocalStorage}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="share-symptoms" className="flex flex-col space-y-1">
                  <span>Symptom Data</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Symptoms and health issues you've reported
                  </span>
                </Label>
                <Switch
                  id="share-symptoms"
                  checked={preferences.shareSymptomData}
                  onCheckedChange={() => handleToggleChange("shareSymptomData")}
                  disabled={preferences.preferLocalStorage}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage or delete your health data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            You can delete all locally stored data or reset your privacy settings to default values.
          </p>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline" 
              onClick={resetToDefault}
            >
              Reset to Default
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteAllData}
            >
              Delete All Local Data
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={savePreferences} 
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}