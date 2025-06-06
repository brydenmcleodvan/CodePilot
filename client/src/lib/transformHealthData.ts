export interface HealthDataPoint {
  date: string;
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  weight?: number;
  calories?: number;
  stressLevel?: number;
}

const getLastNDays = (n: number) => {
  const result = [] as string[];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(date.toISOString().split('T')[0]);
  }
  return result;
};

export const transformHealthData = (healthStats: any[] = []): HealthDataPoint[] => {
  if (!Array.isArray(healthStats) || !healthStats.length) return [];

  const dates = getLastNDays(7);
  const statsByDate = new Map<string, HealthDataPoint>();

  dates.forEach(date => {
    statsByDate.set(date, { date });
  });

  healthStats.forEach(stat => {
    if (!stat || !stat.timestamp) return;
    const dateObj = new Date(stat.timestamp);
    if (isNaN(dateObj.getTime())) return;
    const date = dateObj.toISOString().split('T')[0];
    const existingData = statsByDate.get(date) || { date };

    if (stat.statType === 'heart_rate') {
      const val = parseFloat(stat.value);
      if (!isNaN(val)) existingData.heartRate = val;
    } else if (stat.statType === 'steps') {
      const val = parseFloat(stat.value);
      if (!isNaN(val)) existingData.steps = val;
    } else if (stat.statType === 'sleep') {
      const val = parseFloat(stat.value);
      if (!isNaN(val)) existingData.sleepHours = val;
    } else if (stat.statType === 'blood_pressure') {
      if (typeof stat.value === 'string') {
        const [systolic, diastolic] = stat.value
          .split('/')
          .map((v: string) => parseFloat(v.trim()));
        if (!isNaN(systolic)) existingData.bloodPressureSystolic = systolic;
        if (!isNaN(diastolic)) existingData.bloodPressureDiastolic = diastolic;
      }
    } else if (stat.statType === 'weight') {
      const val = parseFloat(stat.value);
      if (!isNaN(val)) existingData.weight = val;
    } else if (stat.statType === 'calories') {
      const val = parseFloat(stat.value);
      if (!isNaN(val)) existingData.calories = val;
    } else if (stat.statType === 'stress') {
      const val = parseFloat(stat.value);
      if (!isNaN(val)) existingData.stressLevel = val;
    }

    statsByDate.set(date, existingData);
  });

  return Array.from(statsByDate.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};
