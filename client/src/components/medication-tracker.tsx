import { useState } from 'react';
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
            <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"> {/*Retained p-3 from original */}
              <div>
                <h4 className="font-medium">{med.name}</h4>
                <p className="text-sm text-gray-600">{med.schedule} - Next: {med.nextDose}</p> {/* Retained schedule and nextDose from original */}
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