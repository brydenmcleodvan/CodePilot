
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Medication {
  id: number;
  name: string;
  schedule: string;
  nextDose: string;
  taken: boolean;
}

export default function MedicationTracker() {
  const [medications] = useState<Medication[]>([
    {
      id: 1,
      name: "Vitamin D",
      schedule: "Daily",
      nextDose: "8:00 AM",
      taken: false
    },
    {
      id: 2,
      name: "Zinc Supplement",
      schedule: "Twice daily",
      nextDose: "2:00 PM",
      taken: false
    }
  ]);

  const markAsTaken = (id: number) => {
    // Implementation would update the medication status
    console.log(`Marked medication ${id} as taken`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="ri-medicine-bottle-line"></i>
          Medication Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.map(med => (
            <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{med.name}</h4>
                <p className="text-sm text-gray-600">{med.schedule} - Next: {med.nextDose}</p>
              </div>
              <Button
                onClick={() => markAsTaken(med.id)}
                variant={med.taken ? "outline" : "default"}
              >
                {med.taken ? 'Taken ✓' : 'Take Now'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export const MedicationTracker = () => {
  const { data: medications } = useQuery({
    queryKey: ['/api/medications'],
  });

  const handleMedicationTaken = async (id: number) => {
    await fetch(`/api/medications/${id}/take`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications?.map((med: any) => (
            <div key={med.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{med.name}</h4>
                <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
              </div>
              <Button 
                onClick={() => handleMedicationTaken(med.id)}
                variant="outline"
                size="sm"
              >
                Mark as Taken
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
