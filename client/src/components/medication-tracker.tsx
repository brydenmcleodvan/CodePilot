
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface Medication {
  id: number;
  name: string;
  schedule: string;
  nextDose: string;
  taken: boolean;
}

// Single implementation that merges both versions
export default function MedicationTracker() {
  // Using useState with mock data for now
  // Later we can replace with real API data from useQuery
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

  // In the future, can use this API-based approach
  // const { data: medications } = useQuery({
  //   queryKey: ['/api/medications'],
  // });

  const markAsTaken = (id: number) => {
    // For now, log to console
    console.log(`Marked medication ${id} as taken`);
    
    // In the future, can use this API call
    // fetch(`/api/medications/${id}/take`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    // });
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
                size="sm"
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
