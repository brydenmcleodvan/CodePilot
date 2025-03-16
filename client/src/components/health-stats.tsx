import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTracker } from "@/components/progress-tracker";

interface HealthStatsProps {
  userId: number;
  detailed?: boolean;
}

const HealthStats = ({ userId, detailed = false }: HealthStatsProps) => {
  const { data: healthStats, isLoading } = useQuery({
    queryKey: ['/api/health/stats'],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!healthStats || healthStats.length === 0) {
    return (
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Health Data Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Connect your health data to see your stats here.</p>
          <button className="mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary transition-colors duration-200">
            Connect Health Data
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-semibold">Your Health Overview</h2>
        <button className="text-primary hover:text-secondary flex items-center space-x-1">
          <span>View All</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {healthStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 transition-transform hover:scale-105 duration-200"
          >
            <div className={`bg-${stat.colorScheme}/10 rounded-full p-4`}>
              <i className={`${stat.icon} text-${stat.colorScheme} text-2xl`}></i>
            </div>
            <div>
              <h3 className="text-lg font-medium">
                {stat.statType
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </h3>
              <p className={`text-2xl font-bold text-${stat.colorScheme}`}>
                {stat.value}
                {stat.unit && <span className="text-sm text-gray-500"> {stat.unit}</span>}
              </p>
              {detailed && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(stat.timestamp).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {detailed && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthStats.map((stat, index) => (
            <ProgressTracker
              key={index}
              title={stat.statType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              data={stat.history || []}
              currentValue={parseFloat(stat.value)}
              targetValue={stat.target || 100}
              unit={stat.unit || ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthStats;
