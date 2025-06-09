import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * A simple loading spinner component with size variants
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-primary border-t-transparent", 
        sizeClasses[size], 
        className
      )}
      aria-label="Loading"
    />
  );
}