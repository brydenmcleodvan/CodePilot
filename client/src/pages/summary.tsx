import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import SummaryTab from "@/components/summary-tab";

export default function SummaryPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Health Summary
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your comprehensive health intelligence dashboard with real-time analysis and medical-grade insights
          </p>
        </div>
        
        <SummaryTab />
      </div>
    </div>
  );
}