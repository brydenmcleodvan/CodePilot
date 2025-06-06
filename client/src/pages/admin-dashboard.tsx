import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Metrics {
  activeUsers: number;
  syncCount: number;
  topActions: Record<string, number>;
}

export default function AdminDashboard() {
  const { data } = useQuery<Metrics>({ queryKey: ['/api/admin/metrics'] });

  if (!data) return <div className="p-4">Loading...</div>;

  const actionsData = Object.entries(data.topActions).map(([action, count]) => ({ action, count }));

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Platform Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Active Sessions: {data.activeUsers}</p>
          <p>Total Health Syncs: {data.syncCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Popular Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={actionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="action" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
