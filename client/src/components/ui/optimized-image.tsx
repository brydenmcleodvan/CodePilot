import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

/**
 * OptimizedImage component with lazy loading, placeholder, and error handling
 * 
 * - Uses native lazy loading for better performance
 * - Shows a placeholder during loading 
 * - Handles loading errors with fallback image
 * - Supports priority loading for critical above-the-fold images
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = "/assets/placeholder.png",
  priority = false, 
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : "");

  // If not priority, set image src after component mounts for lazy loading
  useEffect(() => {
    if (!priority) {
      // Small delay to ensure we don't immediately load all images at once
      const timer = setTimeout(() => {
        setImageSrc(src);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [src, priority]);

  // Convert to WebP if supported and available
  // This is a simple check - in production you would have a server/CDN that delivers WebP
  const getOptimizedSrc = (originalSrc: string) => {
    // If already WebP or SVG, use as is
    if (originalSrc.endsWith('.webp') || originalSrc.endsWith('.svg')) {
      return originalSrc;
    }
    
    // Check for WebP support - in real implementation, this would be handled by the server
    // This is just to demonstrate the concept
    return originalSrc;
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        !isLoaded && !error && "bg-muted animate-pulse", 
        className
      )}
      style={{ 
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {imageSrc && (
        <img
          src={error ? fallbackSrc : getOptimizedSrc(imageSrc)}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setError(true);
            setIsLoaded(true);
          }}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
          {...props}
        />
      )}
    </div>
  );
}