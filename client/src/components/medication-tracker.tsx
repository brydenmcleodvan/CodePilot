import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";
import { getAuthToken } from "../lib/utils";

interface Medication {
  id: number;
  userId: number;
  name: string;
  dosage: string;
  schedule: string;
  nextDose: string | null;
  lastTaken: string | null;
  instructions: string | null;
  active: boolean;
}

// Form schema for adding new medications
const medicationFormSchema = z.object({
  name: z.string().min(2, { message: "Medication name is required" }),
  dosage: z.string().min(1, { message: "Dosage is required" }),
  schedule: z.string().min(1, { message: "Schedule is required" }),
  instructions: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationFormSchema>;

const MedicationTracker = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: medications = [], isLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      schedule: "",
      instructions: "",
    },
  });

  const handleMedicationTaken = async (id: number) => {
    try {
      const token = getAuthToken();
      await fetch(`/api/medications/${id}/take`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // Invalidate the medications query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
    } catch (error) {
      console.error("Error marking medication as taken:", error);
    }
  };

  const handleAddMedication = async (values: MedicationFormValues) => {
    try {
      const token = getAuthToken();
      await fetch('/api/medications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });
      // Invalidate the medications query and close the dialog
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  // Format the date for display
  const formatDoseDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    
    try {
      const date = parseISO(dateString);
      if (isToday(date)) {
        return `Today at ${format(date, "h:mm a")}`;
      } else if (isTomorrow(date)) {
        return `Tomorrow at ${format(date, "h:mm a")}`;
      } else {
        return format(date, "MMM d 'at' h:mm a");
      }
    } catch (error) {
      return "Invalid date";
    }
  };

  // Check if a medication is due soon (within 1 hour)
  const isDueSoon = (dateString: string | null) => {
    if (!dateString) return false;
    
    try {
      const doseDate = parseISO(dateString);
      const now = new Date();
      const diffMs = doseDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      return diffHours >= 0 && diffHours <= 1;
    } catch (error) {
      return false;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Medication Schedule</CardTitle>
          <CardDescription>Track and manage your medications</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <i className="ri-add-line mr-1"></i> Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddMedication)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter medication name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 50mg, 1 pill" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Every morning, Twice daily" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Take with food" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Add Medication</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse">Loading medications...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.length > 0 ? (
              medications.map((med) => (
                <div 
                  key={med.id} 
                  className={`flex flex-col p-4 rounded-lg border ${
                    isDueSoon(med.nextDose) ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center">
                        <i className="ri-capsule-line mr-2 text-primary"></i> 
                        {med.name}
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                          {med.dosage}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {med.schedule}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleMedicationTaken(med.id)}
                      variant={isDueSoon(med.nextDose) ? "default" : "outline"}
                      size="sm"
                    >
                      <i className="ri-check-line mr-1"></i> 
                      Mark as Taken
                    </Button>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Next Dose:</p>
                      <p className={`font-medium ${isDueSoon(med.nextDose) ? 'text-yellow-700' : ''}`}>
                        {formatDoseDate(med.nextDose)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Taken:</p>
                      <p className="font-medium">
                        {med.lastTaken ? formatDoseDate(med.lastTaken) : "Never"}
                      </p>
                    </div>
                  </div>
                  
                  {med.instructions && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-500">Instructions:</p>
                      <p className="italic text-gray-600">{med.instructions}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <i className="ri-medicine-bottle-line text-4xl text-gray-300 mb-2"></i>
                <p className="text-gray-500">No medications scheduled.</p>
                <p className="text-sm text-gray-400 mt-1">Click the button above to add your medications.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationTracker;