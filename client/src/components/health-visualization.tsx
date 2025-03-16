
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const mockData = [
  { date: '2024-01-01', heartRate: 72, sleepHours: 7.5, stressLevel: 3 },
  { date: '2024-01-02', heartRate: 75, sleepHours: 6.8, stressLevel: 4 },
  { date: '2024-01-03', heartRate: 71, sleepHours: 8.2, stressLevel: 2 },
  { date: '2024-01-04', heartRate: 73, sleepHours: 7.1, stressLevel: 3 },
  { date: '2024-01-05', heartRate: 70, sleepHours: 7.8, stressLevel: 2 },
];

export default function HealthVisualization() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Health Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="heartRate" stroke="#8884d8" name="Heart Rate" />
              <Line type="monotone" dataKey="sleepHours" stroke="#82ca9d" name="Sleep Hours" />
              <Line type="monotone" dataKey="stressLevel" stroke="#ffc658" name="Stress Level" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
