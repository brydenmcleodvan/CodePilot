import { useEffect, useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * Dark Mode Sync Hook
 * Synchronizes system theme with user preferences and Firestore storage
 */
export function useThemeSync() {
  const [systemTheme, setSystemTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  
  // Get user's saved theme preference
  const { data: userPreferences } = useQuery({
    queryKey: ['/api/user/preferences'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/preferences');
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Update theme preference
  const updateThemeMutation = useMutation({
    mutationFn: async (themeData) => {
      const res = await apiRequest('POST', '/api/user/preferences', themeData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/user/preferences']);
    }
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
      
      // Auto-sync if user has system preference enabled
      if (userPreferences?.theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [userPreferences?.theme]);

  // Apply theme to document
  const applyTheme = (theme) => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Store in localStorage for immediate persistence
    localStorage.setItem('healthmap_theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#1a1a1a' : '#ffffff');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = userPreferences?.theme || localStorage.getItem('healthmap_theme') || 'system';
    applyTheme(savedTheme);
  }, [userPreferences?.theme, systemTheme]);

  const setTheme = async (newTheme) => {
    // Apply immediately for responsiveness
    applyTheme(newTheme);
    
    // Save to user preferences
    await updateThemeMutation.mutateAsync({
      theme: newTheme,
      updatedAt: new Date().toISOString()
    });
  };

  const toggleTheme = () => {
    const currentTheme = userPreferences?.theme || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const currentTheme = userPreferences?.theme || 'system';
  const effectiveTheme = currentTheme === 'system' ? systemTheme : currentTheme;

  return {
    currentTheme,
    effectiveTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    isLoading: updateThemeMutation.isPending
  };
}