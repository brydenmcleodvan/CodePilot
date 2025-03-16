
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Goal {
  title: string;
  current: number;
  target: number;
  unit: string;
}

export const GoalTracker = () => {
  const [goals] = useState<Goal[]>([
    { title: "Daily Steps", current: 8000, target: 10000, unit: "steps" },
    { title: "Sleep", current: 7, target: 8, unit: "hours" },
    { title: "Water Intake", current: 6, target: 8, unit: "glasses" }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{goal.title}</span>
                <span>{goal.current}/{goal.target} {goal.unit}</span>
              </div>
              <Progress value={(goal.current / goal.target) * 100} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
