import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { PrivacyPreferences } from "@/components/privacy/privacy-settings";
import { apiRequest } from "@/lib/queryClient";

/**
 * React hook to manage user privacy settings
 * 
 * Provides functionality to fetch and update user privacy preferences
 */
export function usePrivacy() {
  const { toast } = useToast();
  
  // Query to get user privacy preferences
  const { 
    data: privacyPreferences, 
    isLoading, 
    error 
  } = useQuery<PrivacyPreferences | undefined>({
    queryKey: ["/api/user/privacy-settings"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/user/preferences");
        const data = await response.json();
        
        // Extract privacy settings from user preferences if they exist
        if (data.preferences) {
          try {
            const preferences = JSON.parse(data.preferences);
            if (preferences.privacy) {
              return preferences.privacy as PrivacyPreferences;
            }
          } catch (e) {
            console.warn("Could not parse privacy preferences", e);
          }
        }
        
        // Return default if no preferences are found
        return undefined;
      } catch (e) {
        console.error("Error fetching privacy preferences:", e);
        return undefined;
      }
    }
  });
  
  // Mutation to update privacy preferences
  const updatePrivacyMutation = useMutation({
    mutationFn: async (preferences: PrivacyPreferences) => {
      const response = await apiRequest("POST", "/api/user/privacy-settings", {
        preferences: preferences
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the privacy settings query to refetch with new data
      queryClient.invalidateQueries({
        queryKey: ["/api/user/privacy-settings"],
      });
      
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating privacy settings:", error);
      
      toast({
        title: "Failed to update privacy settings",
        description: "There was a problem saving your privacy preferences. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return {
    privacyPreferences,
    isLoading,
    error,
    updatePrivacy: updatePrivacyMutation.mutate,
    isUpdating: updatePrivacyMutation.isPending,
  };
}