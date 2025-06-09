import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from '@/lib/queryClient';

/**
 * Accessibility Context for global accessibility state management
 */
const AccessibilityContext = createContext();

/**
 * Accessibility Provider Component
 */
export function AccessibilityProvider({ children }) {
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    visual: {
      fontSize: 'medium',
      fontFamily: 'default',
      contrast: 'normal',
      colorBlindSupport: false,
      reduceMotion: false,
      focusIndicators: true
    },
    audio: {
      enableSounds: true,
      screenReader: false,
      audioDescriptions: false,
      soundVolume: 50
    },
    motor: {
      stickyKeys: false,
      slowKeys: false,
      bounceKeys: false,
      mouseSpeed: 'normal',
      clickAssist: false
    },
    cognitive: {
      simplifiedInterface: false,
      extendedTimeouts: false,
      autoSave: true,
      readingGuide: false
    },
    language: {
      locale: 'en-US',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'US',
      rightToLeft: false
    }
  });

  // Apply accessibility settings to DOM
  useEffect(() => {
    applyAccessibilitySettings(accessibilitySettings);
  }, [accessibilitySettings]);

  const updateSettings = (newSettings) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return (
    <AccessibilityContext.Provider value={{
      settings: accessibilitySettings,
      updateSettings,
      applySettings: applyAccessibilitySettings
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Custom hook for accessibility functionality
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }

  const { settings, updateSettings } = context;

  // Fetch user accessibility settings from API
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['/api/user/settings/accessibility'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/settings/accessibility');
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        updateSettings(data);
      }
    }
  });

  // Update user accessibility settings
  const updateUserSettings = useMutation({
    mutationFn: async (newSettings) => {
      const res = await apiRequest('PUT', '/api/user/settings/accessibility', newSettings);
      return res.json();
    },
    onSuccess: (data) => {
      updateSettings(data);
      queryClient.invalidateQueries(['/api/user/settings/accessibility']);
    }
  });

  // Utility functions
  const getFontSizeClass = () => {
    switch (settings.visual.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getContrastClass = () => {
    switch (settings.visual.contrast) {
      case 'high': return 'high-contrast';
      case 'inverted': return 'inverted-contrast';
      default: return '';
    }
  };

  const shouldReduceMotion = () => settings.visual.reduceMotion;

  const getAnimationClass = () => shouldReduceMotion() ? 'reduce-motion' : '';

  const isRTL = () => settings.language.rightToLeft;

  const getLocale = () => settings.language.locale;

  const formatDate = (date) => {
    const locale = getLocale();
    const format = settings.language.dateFormat;
    
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(date));
    } catch (error) {
      return new Date(date).toLocaleDateString();
    }
  };

  const formatNumber = (number) => {
    const locale = getLocale();
    
    try {
      return new Intl.NumberFormat(locale).format(number);
    } catch (error) {
      return number.toString();
    }
  };

  const announceToScreenReader = (message) => {
    if (settings.audio.screenReader) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  const playNotificationSound = (type = 'default') => {
    if (settings.audio.enableSounds && settings.audio.soundVolume > 0) {
      // Play system notification sound
      const audio = new Audio(`/sounds/notification-${type}.mp3`);
      audio.volume = settings.audio.soundVolume / 100;
      audio.play().catch(() => {
        // Fallback to system beep if audio file not available
        console.beep?.();
      });
    }
  };

  return {
    settings,
    updateSettings: updateUserSettings.mutate,
    isLoading: isLoading || updateUserSettings.isPending,
    
    // Utility functions
    getFontSizeClass,
    getContrastClass,
    getAnimationClass,
    shouldReduceMotion,
    isRTL,
    getLocale,
    formatDate,
    formatNumber,
    announceToScreenReader,
    playNotificationSound,
    
    // Helper methods
    isSimplifiedInterface: () => settings.cognitive.simplifiedInterface,
    hasExtendedTimeouts: () => settings.cognitive.extendedTimeouts,
    hasAutoSave: () => settings.cognitive.autoSave,
    hasReadingGuide: () => settings.cognitive.readingGuide,
    hasColorBlindSupport: () => settings.visual.colorBlindSupport,
    hasFocusIndicators: () => settings.visual.focusIndicators
  };
}

/**
 * Apply accessibility settings to the DOM
 */
function applyAccessibilitySettings(settings) {
  const root = document.documentElement;
  
  // Font size
  root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
  switch (settings.visual.fontSize) {
    case 'small':
      root.classList.add('text-sm');
      break;
    case 'large':
      root.classList.add('text-lg');
      break;
    case 'extra-large':
      root.classList.add('text-xl');
      break;
    default:
      root.classList.add('text-base');
  }

  // Font family
  root.classList.remove('font-dyslexic', 'font-serif', 'font-mono');
  switch (settings.visual.fontFamily) {
    case 'dyslexic':
      root.classList.add('font-dyslexic');
      break;
    case 'serif':
      root.classList.add('font-serif');
      break;
    case 'monospace':
      root.classList.add('font-mono');
      break;
  }

  // Contrast
  root.classList.remove('high-contrast', 'inverted-contrast');
  if (settings.visual.contrast === 'high') {
    root.classList.add('high-contrast');
  } else if (settings.visual.contrast === 'inverted') {
    root.classList.add('inverted-contrast');
  }

  // Reduce motion
  if (settings.visual.reduceMotion) {
    root.style.setProperty('--animation-duration', '0.01ms');
    root.classList.add('reduce-motion');
  } else {
    root.style.removeProperty('--animation-duration');
    root.classList.remove('reduce-motion');
  }

  // RTL direction
  if (settings.language.rightToLeft) {
    root.setAttribute('dir', 'rtl');
    root.classList.add('rtl');
  } else {
    root.setAttribute('dir', 'ltr');
    root.classList.remove('rtl');
  }

  // Color blind support
  if (settings.visual.colorBlindSupport) {
    root.classList.add('colorblind-support');
  } else {
    root.classList.remove('colorblind-support');
  }

  // Focus indicators
  if (settings.visual.focusIndicators) {
    root.classList.add('enhanced-focus');
  } else {
    root.classList.remove('enhanced-focus');
  }

  // Simplified interface
  if (settings.cognitive.simplifiedInterface) {
    root.classList.add('simplified-interface');
  } else {
    root.classList.remove('simplified-interface');
  }

  // Set CSS custom properties
  root.style.setProperty('--sound-volume', settings.audio.soundVolume / 100);
  root.style.setProperty('--mouse-speed', 
    settings.motor.mouseSpeed === 'slow' ? '0.5' : 
    settings.motor.mouseSpeed === 'fast' ? '2' : '1'
  );
}

export default useAccessibility;