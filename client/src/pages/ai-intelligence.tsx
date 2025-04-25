import IntelligenceDashboard from "../components/ai-intelligence/intelligence-dashboard";

export default function AIIntelligencePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-800 dark:text-white mb-2">AI & Intelligence</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Get personalized insights, coaching, and pattern detection powered by health AI
          </p>
        </div>
        
        <IntelligenceDashboard />
      </div>
    </div>
  );
}