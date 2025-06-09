import { Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { GeneticRiskPanel } from "@/components/GeneticRiskPanel";
import { Loader2 } from "lucide-react";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

export default function DNAInsightsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <GeneticRiskPanel 
            userId={user?.id}
            className="w-full"
          />
        </Suspense>
      </div>
    </div>
  );
}