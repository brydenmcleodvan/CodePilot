/**
 * Accessibility utilities to help maintain WCAG compliance throughout the application
 */

/**
 * Evaluates if the contrast ratio between foreground and background colors
 * meets WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
 * 
 * @param foreground - Foreground color in hex format (e.g. "#FFFFFF")
 * @param background - Background color in hex format (e.g. "#000000")
 * @param isLargeText - Whether the text is considered "large" (14pt bold or 18pt)
 * @returns boolean indicating if the contrast meets WCAG AA standards
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Calculates the contrast ratio between two colors
 * 
 * @param foreground - Foreground color in hex format 
 * @param background - Background color in hex format
 * @returns The contrast ratio as a number
 */
function getContrastRatio(foreground: string, background: string): number {
  const luminance1 = getRelativeLuminance(hexToRgb(foreground));
  const luminance2 = getRelativeLuminance(hexToRgb(background));
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return { r, g, b };
}

/**
 * Calculates the relative luminance of an RGB color
 * according to WCAG 2.1 formula
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  // Convert RGB to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  // Apply the formula for each channel
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Keyboard accessibility utility for interactive elements
 * Makes elements work with keyboard navigation by handling Enter and Space
 * 
 * @param callback - Function to execute on activation
 * @returns Keyboard event handler
 */
export function handleKeyboardActivation(callback: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
}

/**
 * Generates a proper ARIA live region announcement
 * For screen readers to announce dynamic content changes
 */
export function announceToScreenReader(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  // This function would insert a visually hidden element with appropriate aria-live attributes
  // In a real implementation, this would manage a queue of announcements
  const element = document.createElement('div');
  element.setAttribute('aria-live', politeness);
  element.setAttribute('aria-atomic', 'true');
  element.classList.add('sr-only'); // Screen reader only
  element.textContent = message;
  
  document.body.appendChild(element);
  
  // Remove after announcement (screen readers will have processed it)
  setTimeout(() => {
    document.body.removeChild(element);
  }, 3000);
}

/**
 * Skip to content link utility
 * Creates an accessible way for keyboard users to skip navigation
 */
export function createSkipToContentLink(contentId: string) {
  return (
    <a 
      href={`#${contentId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
    >
      Skip to main content
    </a>
  );
}