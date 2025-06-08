import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  ThermometerSun, 
  ScrollText, 
  ListChecks,
  Droplets,
  HeartPulse,
  Laptop,
  Brain,
  Frown,
  Laugh,
  Meh,
  Coffee
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

interface Symptom {
  id: string;
  name: string;
  icon: JSX.Element;
  category: string;
}

const availableSymptoms: Symptom[] = [
  { id: "cramps", name: "Cramps", icon: <HeartPulse className="h-4 w-4" />, category: "Pain" },
  { id: "headache", name: "Headache", icon: <Brain className="h-4 w-4" />, category: "Pain" },
  { id: "backache", name: "Backache", icon: <HeartPulse className="h-4 w-4" />, category: "Pain" },
  { id: "breast_tenderness", name: "Breast Tenderness", icon: <HeartPulse className="h-4 w-4" />, category: "Pain" },
  { id: "nausea", name: "Nausea", icon: <Meh className="h-4 w-4" />, category: "Digestive" },
  { id: "bloating", name: "Bloating", icon: <Meh className="h-4 w-4" />, category: "Digestive" },
  { id: "diarrhea", name: "Diarrhea", icon: <Meh className="h-4 w-4" />, category: "Digestive" },
  { id: "constipation", name: "Constipation", icon: <Meh className="h-4 w-4" />, category: "Digestive" },
  { id: "fatigue", name: "Fatigue", icon: <Coffee className="h-4 w-4" />, category: "Energy" },
  { id: "insomnia", name: "Insomnia", icon: <Coffee className="h-4 w-4" />, category: "Energy" },
  { id: "mood_swings", name: "Mood Swings", icon: <Laugh className="h-4 w-4" />, category: "Emotional" },
  { id: "anxiety", name: "Anxiety", icon: <Frown className="h-4 w-4" />, category: "Emotional" },
  { id: "irritability", name: "Irritability", icon: <Frown className="h-4 w-4" />, category: "Emotional" },
  { id: "depression", name: "Depression", icon: <Frown className="h-4 w-4" />, category: "Emotional" },
  { id: "acne", name: "Acne", icon: <Meh className="h-4 w-4" />, category: "Skin" },
  { id: "spotting", name: "Spotting", icon: <Droplets className="h-4 w-4" />, category: "Bleeding" },
];

export function SymptomLogger() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [flowIntensity, setFlowIntensity] = useState<string>("medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [moodRating, setMoodRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [basalTemp, setBasalTemp] = useState<string>("36.7");
  
  const categories = Array.from(new Set(availableSymptoms.map(s => s.category)));

  // A function to render the mood emoji based on rating
  const getMoodEmoji = (rating: number) => {
    if (rating <= 3) return <Frown className="h-5 w-5 text-red-500" />;
    if (rating <= 7) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Laugh className="h-5 w-5 text-green-500" />;
  };
  
  const getSelectedSymptomsCount = (category: string) => {
    return availableSymptoms
      .filter(s => s.category === category)
      .filter(s => selectedSymptoms.includes(s.id))
      .length;
  };
  
  const handleSymptomToggle = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
  };
  
  const handleSave = () => {
    // In a real app, this would send data to the server
    console.log("Saving cycle data", {
      date: selectedDate,
      flow: flowIntensity,
      symptoms: selectedSymptoms,
      mood: moodRating,
      notes,
      basalTemp: parseFloat(basalTemp)
    });
    
    // Reset form
    setSelectedSymptoms([]);
    setMoodRating(5);
    setNotes("");
    setBasalTemp("36.7");
    setFlowIntensity("medium");
  };
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-dark-text dark:text-white flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <span>Symptom Logger</span>
        </CardTitle>
        <CardDescription className="text-body-text dark:text-gray-300">
          Track symptoms during your cycle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <Label htmlFor="date">Date</Label>
              <Select
                value={format(selectedDate, "yyyy-MM-dd")}
                onValueChange={(value) => setSelectedDate(new Date(value))}
              >
                <SelectTrigger id="date">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return (
                      <SelectItem key={i} value={format(date, "yyyy-MM-dd")}>
                        {i === 0 ? "Today" : i === 1 ? "Yesterday" : format(date, "EEEE, MMMM d")}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="flow">Flow Intensity</Label>
              <Select
                value={flowIntensity}
                onValueChange={(value) => setFlowIntensity(value)}
              >
                <SelectTrigger id="flow">
                  <SelectValue placeholder="Select flow intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="spotting">Spotting</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Mood Rating</Label>
                <div className="flex items-center gap-2">
                  {getMoodEmoji(moodRating)}
                  <span className="text-sm font-medium">{moodRating}/10</span>
                </div>
              </div>
              <Slider
                value={[moodRating]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => setMoodRating(values[0])}
                className="py-4"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="temp">Basal Body Temperature (°C)</Label>
              <div className="flex gap-2">
                <ThermometerSun className="h-10 w-5 text-primary" />
                <input
                  id="temp"
                  type="number"
                  step="0.1"
                  value={basalTemp}
                  onChange={(e) => setBasalTemp(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about your day..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Symptoms</Label>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-dark-text dark:text-white flex justify-between">
                    <span>{category}</span>
                    {getSelectedSymptomsCount(category) > 0 && (
                      <span className="text-primary">{getSelectedSymptomsCount(category)} selected</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSymptoms
                      .filter(symptom => symptom.category === category)
                      .map(symptom => (
                        <div key={symptom.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={symptom.id}
                            checked={selectedSymptoms.includes(symptom.id)}
                            onCheckedChange={() => handleSymptomToggle(symptom.id)}
                          />
                          <Label
                            htmlFor={symptom.id}
                            className="flex items-center gap-1 cursor-pointer text-sm"
                          >
                            {symptom.icon}
                            {symptom.name}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t border-light-blue-border dark:border-gray-700 pt-4">
        <Button onClick={handleSave}>
          <ScrollText className="mr-1 h-4 w-4" />
          Save Entry
        </Button>
      </CardFooter>
    </Card>
  );
}