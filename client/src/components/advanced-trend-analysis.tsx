import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import type { HealthDataPoint } from '@/lib/transformHealthData';

interface Props {
  data: HealthDataPoint[];
}

export default function AdvancedTrendAnalysis({ data }: Props) {
  if (!data.length) return null;

  const movingAverage = data.map((d, idx) => {
    const slice = data.slice(Math.max(0, idx - 2), idx + 1);
    const hrAvg = slice.reduce((sum, v) => sum + (v.heartRate || 0), 0) / slice.length;
    return { date: d.date, hrAvg: parseFloat(hrAvg.toFixed(1)) };
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Advanced Trend Analysis</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={movingAverage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hrAvg" stroke="#10b981" name="Avg Heart Rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
