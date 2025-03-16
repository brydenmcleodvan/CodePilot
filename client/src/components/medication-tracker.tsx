import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface Medication {
  id: number;
  name: string;
  schedule: string;
  nextDose: string;
}

const MedicationTracker = () => {
  const { data: medications = [] } = useQuery<Medication[]>({
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
          {medications.length > 0 ? (
            medications.map((med: Medication) => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{med.name}</h4>
                  <p className="text-sm text-gray-600">{med.schedule} - Next: {med.nextDose}</p>
                </div>
                <Button 
                  onClick={() => handleMedicationTaken(med.id)}
                  variant="outline"
                  size="sm"
                >
                  Mark as Taken
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No medications scheduled.</p>
              <Button variant="outline" size="sm" className="mt-2">
                <i className="ri-add-line mr-1"></i> Add Medication
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationTracker;