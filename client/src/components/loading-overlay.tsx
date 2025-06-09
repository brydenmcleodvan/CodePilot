import { Spinner } from "@/components/ui/spinner";

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * A loading overlay component that can be used to indicate loading state
 * @param message Optional message to display below the spinner
 * @param fullScreen Whether the overlay should cover the full screen or just its container
 */
export function LoadingOverlay({ message, fullScreen = false }: LoadingOverlayProps) {
  return (
    <div 
      className={`flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50 ${
        fullScreen 
          ? "fixed inset-0" 
          : "absolute inset-0"
      }`}
    >
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
}