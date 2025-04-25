import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

// Storage keys for privacy preferences
const STORAGE_KEY_ANALYTICS = "healthmap_privacy_analytics";
const STORAGE_KEY_FEEDBACK = "healthmap_privacy_feedback";
const STORAGE_KEY_LOCATION = "healthmap_privacy_location";
const STORAGE_KEY_LOCAL_STORAGE = "healthmap_privacy_local_storage";

export interface PrivacyPreferences {
  allowAnalytics: boolean;
  allowFeedback: boolean;
  allowLocation: boolean;
  preferLocalStorage: boolean;
}

/**
 * Privacy Settings component that allows users to control their data privacy settings
 */
export default function PrivacySettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    allowAnalytics: false,
    allowFeedback: false,
    allowLocation: false,
    preferLocalStorage: true,
  });
  const [loading, setLoading] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedAnalytics = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    const savedFeedback = localStorage.getItem(STORAGE_KEY_FEEDBACK);
    const savedLocation = localStorage.getItem(STORAGE_KEY_LOCATION);
    const savedLocalStorage = localStorage.getItem(STORAGE_KEY_LOCAL_STORAGE);

    setPreferences({
      allowAnalytics: savedAnalytics ? savedAnalytics === "true" : false,
      allowFeedback: savedFeedback ? savedFeedback === "true" : false,
      allowLocation: savedLocation ? savedLocation === "true" : false,
      preferLocalStorage: savedLocalStorage ? savedLocalStorage === "true" : true,
    });

    // If user is logged in, try to load from server
    if (user?.id) {
      loadServerPreferences();
    }
  }, [user?.id]);

  // Load preferences from the server if logged in
  const loadServerPreferences = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/user/privacy-preferences");
      const data = await response.json();
      
      if (response.ok && data) {
        const serverPrefs = {
          allowAnalytics: data.allowAnalytics ?? false,
          allowFeedback: data.allowFeedback ?? false,
          allowLocation: data.allowLocation ?? false,
          preferLocalStorage: data.preferLocalStorage ?? true,
        };
        
        // Update local state with server preferences
        setPreferences(serverPrefs);
        
        // Sync to localStorage
        saveToLocalStorage(serverPrefs);
      }
    } catch (error) {
      console.error("Failed to load privacy preferences from server", error);
    } finally {
      setLoading(false);
    }
  };

  // Save preferences both locally and to server if logged in
  const savePreferences = async () => {
    try {
      setLoading(true);
      
      // Always save to localStorage
      saveToLocalStorage(preferences);
      
      // If logged in, save to server
      if (user?.id) {
        const response = await apiRequest("POST", "/api/user/privacy-preferences", preferences);
        
        if (!response.ok) {
          throw new Error("Failed to save preferences to server");
        }
      }
      
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error) {
      console.error("Failed to save privacy preferences", error);
      toast({
        title: "Error saving settings",
        description: "Your privacy settings could not be saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage
  const saveToLocalStorage = (prefs: PrivacyPreferences) => {
    localStorage.setItem(STORAGE_KEY_ANALYTICS, prefs.allowAnalytics.toString());
    localStorage.setItem(STORAGE_KEY_FEEDBACK, prefs.allowFeedback.toString());
    localStorage.setItem(STORAGE_KEY_LOCATION, prefs.allowLocation.toString());
    localStorage.setItem(STORAGE_KEY_LOCAL_STORAGE, prefs.preferLocalStorage.toString());
  };

  // Handle toggle changes
  const handleToggle = (key: keyof PrivacyPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control how your data is used and stored in Healthmap
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics" className="text-base font-medium">
                Analytics
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow anonymous usage data to help us improve Healthmap
              </p>
            </div>
            <Switch
              id="analytics"
              checked={preferences.allowAnalytics}
              onCheckedChange={() => handleToggle("allowAnalytics")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="feedback" className="text-base font-medium">
                Feedback Collection
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow us to collect your feedback on features and recommendations
              </p>
            </div>
            <Switch
              id="feedback"
              checked={preferences.allowFeedback}
              onCheckedChange={() => handleToggle("allowFeedback")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="location" className="text-base font-medium">
                Location Data
              </Label>
              <p className="text-sm text-muted-foreground">
                Share your location for personalized health recommendations
              </p>
            </div>
            <Switch
              id="location"
              checked={preferences.allowLocation}
              onCheckedChange={() => handleToggle("allowLocation")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="localStorage" className="text-base font-medium">
                Local-First Storage
              </Label>
              <p className="text-sm text-muted-foreground">
                Keep sensitive health data on your device
              </p>
            </div>
            <Switch
              id="localStorage"
              checked={preferences.preferLocalStorage}
              onCheckedChange={() => handleToggle("preferLocalStorage")}
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
            🔒 Data Protection Promise
          </h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
            Your health data is encrypted and will never be sold or shared with third parties. 
            You control what data is stored, how it's used, and can delete it at any time.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={savePreferences} disabled={loading}>
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Utility to get current privacy preferences
export const getPrivacyPreferences = (): PrivacyPreferences => {
  if (typeof window === "undefined") {
    return {
      allowAnalytics: false,
      allowFeedback: false,
      allowLocation: false,
      preferLocalStorage: true,
    };
  }
  
  return {
    allowAnalytics: localStorage.getItem(STORAGE_KEY_ANALYTICS) === "true",
    allowFeedback: localStorage.getItem(STORAGE_KEY_FEEDBACK) === "true",
    allowLocation: localStorage.getItem(STORAGE_KEY_LOCATION) === "true",
    preferLocalStorage: localStorage.getItem(STORAGE_KEY_LOCAL_STORAGE) !== "false", // Default to true
  };
};