import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HealthStatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string; // optional icon class e.g. 'ri-walk-line'
  className?: string;
}

const HealthStatCard = ({ title, value, unit, icon, className }: HealthStatCardProps) => {
  return (
    <Card className={cn('flex items-center', className)}>
      <CardContent className="p-4 flex items-center gap-4">
        {icon && <i className={`${icon} text-2xl text-primary`} aria-hidden="true" />}
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">{value}</span>
            {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthStatCard;
