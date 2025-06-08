import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BiomarkerInput {
  id: string;
  name: string;
  type: 'number' | 'select';
  unit?: string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  description?: string;
  value: string;
}

const initialBiomarkers: BiomarkerInput[] = [
  {
    id: 'blood_pressure_systolic',
    name: 'Systolic Blood Pressure',
    type: 'number',
    unit: 'mmHg',
    min: 80,
    max: 200,
    description: 'The "top" number in your blood pressure reading that measures the pressure when your heart beats.',
    value: '',
  },
  {
    id: 'blood_pressure_diastolic',
    name: 'Diastolic Blood Pressure',
    type: 'number',
    unit: 'mmHg',
    min: 50,
    max: 120,
    description: 'The "bottom" number in your blood pressure reading that measures the pressure when your heart rests.',
    value: '',
  },
  {
    id: 'resting_heart_rate',
    name: 'Resting Heart Rate',
    type: 'number',
    unit: 'bpm',
    min: 40,
    max: 120,
    description: 'Your heart rate when you are at complete rest. Lower values typically indicate better cardiovascular fitness.',
    value: '',
  },
  {
    id: 'glucose',
    name: 'Fasting Blood Glucose',
    type: 'number',
    unit: 'mg/dL',
    min: 50,
    max: 200,
    description: 'Blood sugar level after not eating for at least 8 hours. Important indicator of metabolic health.',
    value: '',
  },
  {
    id: 'sleep_quality',
    name: 'Sleep Quality',
    type: 'select',
    options: [
      { value: 'poor', label: 'Poor' },
      { value: 'fair', label: 'Fair' },
      { value: 'good', label: 'Good' },
      { value: 'excellent', label: 'Excellent' },
    ],
    description: 'How would you rate your overall sleep quality in the past month?',
    value: '',
  },
  {
    id: 'exercise_frequency',
    name: 'Exercise Frequency',
    type: 'select',
    options: [
      { value: 'sedentary', label: 'Sedentary (Almost none)' },
      { value: 'light', label: '1-2 times per week' },
      { value: 'moderate', label: '3-4 times per week' },
      { value: 'active', label: '5+ times per week' },
    ],
    description: 'How often do you engage in moderate to vigorous physical activity?',
    value: '',
  },
];

export function BiologicalAgeCalculator() {
  const { toast } = useToast();
  const [biomarkers, setBiomarkers] = useState<BiomarkerInput[]>(initialBiomarkers);
  const [chronologicalAge, setChronologicalAge] = useState('');
  const [biologicalAge, setBiologicalAge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (id: string, value: string) => {
    setBiomarkers(
      biomarkers.map((biomarker) =>
        biomarker.id === id ? { ...biomarker, value } : biomarker
      )
    );
  };

  const calculateBiologicalAge = () => {
    if (!chronologicalAge) {
      toast({
        title: "Missing Information",
        description: "Please enter your chronological age.",
        variant: "destructive",
      });
      return;
    }

    const missingFields = biomarkers.filter(b => !b.value);
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all biomarker fields. Missing: ${missingFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call for calculation
    setTimeout(() => {
      // Simple calculation example (would be more complex in real implementation)
      const chrono = parseFloat(chronologicalAge);
      
      // Get systolic and diastolic values
      const systolic = parseFloat(biomarkers.find(b => b.id === 'blood_pressure_systolic')?.value || '120');
      const diastolic = parseFloat(biomarkers.find(b => b.id === 'blood_pressure_diastolic')?.value || '80');
      const heartRate = parseFloat(biomarkers.find(b => b.id === 'resting_heart_rate')?.value || '70');
      const glucose = parseFloat(biomarkers.find(b => b.id === 'glucose')?.value || '85');
      
      // Get sleep quality modifier
      const sleepQuality = biomarkers.find(b => b.id === 'sleep_quality')?.value || 'good';
      const sleepModifier = 
        sleepQuality === 'poor' ? 1.1 : 
        sleepQuality === 'fair' ? 1.05 : 
        sleepQuality === 'good' ? 0.95 : 
        0.9; // excellent
      
      // Get exercise frequency modifier
      const exercise = biomarkers.find(b => b.id === 'exercise_frequency')?.value || 'moderate';
      const exerciseModifier = 
        exercise === 'sedentary' ? 1.15 : 
        exercise === 'light' ? 1.05 : 
        exercise === 'moderate' ? 0.95 : 
        0.85; // active
      
      // Calculate base age from biomarkers
      let baseAge = chrono;
      
      // Adjust based on blood pressure (ideal is ~120/80)
      if (systolic > 140 || diastolic > 90) {
        baseAge += 3;
      } else if (systolic < 110 && diastolic < 70) {
        baseAge -= 1;
      }
      
      // Adjust based on heart rate (lower is generally better)
      if (heartRate < 60) {
        baseAge -= 2;
      } else if (heartRate > 80) {
        baseAge += 2;
      }
      
      // Adjust based on glucose (higher values add age)
      if (glucose > 100) {
        baseAge += 2;
      } else if (glucose < 85) {
        baseAge -= 1;
      }
      
      // Apply lifestyle modifiers
      const calculatedAge = baseAge * sleepModifier * exerciseModifier;
      
      // Round to 1 decimal place
      setBiologicalAge(parseFloat(calculatedAge.toFixed(1)));
      setShowResults(true);
      setIsLoading(false);
    }, 1500);
  };

  const resetCalculator = () => {
    setBiomarkers(initialBiomarkers);
    setChronologicalAge('');
    setBiologicalAge(null);
    setShowResults(false);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-dark-text dark:text-white flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span>Biological Age Calculator</span>
        </CardTitle>
        <CardDescription className="text-body-text dark:text-gray-300">
          Enter your biomarkers to calculate your biological age
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <div className="space-y-4">
            {/* Chronological Age Input */}
            <div className="space-y-2">
              <Label htmlFor="chronological-age">Chronological Age (Years)</Label>
              <Input
                id="chronological-age"
                type="number"
                value={chronologicalAge}
                onChange={(e) => setChronologicalAge(e.target.value)}
                min="18"
                max="100"
                placeholder="Enter your current age"
                className="bg-white dark:bg-gray-700"
              />
            </div>

            <div className="pt-4 border-t border-border-light dark:border-gray-700">
              <h3 className="text-sm font-medium text-dark-text dark:text-white mb-3">
                Biomarkers
              </h3>
              
              <Accordion type="multiple" className="space-y-3">
                {biomarkers.map((biomarker) => (
                  <AccordionItem key={biomarker.id} value={biomarker.id} className="border-light-blue-border dark:border-gray-700">
                    <AccordionTrigger className="text-dark-text dark:text-white hover:no-underline py-3">
                      <div className="flex justify-between w-full mr-4">
                        <span>{biomarker.name}</span>
                        {biomarker.value && (
                          <span className="text-sm text-primary font-medium">
                            {biomarker.value} {biomarker.unit}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-3">
                      {biomarker.description && (
                        <div className="mb-3 text-sm text-body-text dark:text-gray-400 flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p>{biomarker.description}</p>
                        </div>
                      )}
                      
                      {biomarker.type === 'number' ? (
                        <div className="flex items-center gap-3">
                          <Input
                            id={biomarker.id}
                            type="number"
                            value={biomarker.value}
                            onChange={(e) => handleInputChange(biomarker.id, e.target.value)}
                            min={biomarker.min}
                            max={biomarker.max}
                            placeholder={`Enter ${biomarker.name.toLowerCase()}`}
                            className="bg-white dark:bg-gray-700"
                          />
                          {biomarker.unit && (
                            <span className="text-sm text-body-text dark:text-gray-400">{biomarker.unit}</span>
                          )}
                        </div>
                      ) : (
                        <Select 
                          value={biomarker.value} 
                          onValueChange={(value) => handleInputChange(biomarker.id, value)}
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-700">
                            <SelectValue placeholder={`Select ${biomarker.name.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {biomarker.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Button 
                onClick={calculateBiologicalAge} 
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Calculating..." : "Calculate Biological Age"}
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center py-6">
              <h3 className="text-2xl font-bold text-dark-text dark:text-white mb-1">Your Results</h3>
              <p className="text-body-text dark:text-gray-300 mb-6">
                Based on your biomarkers and lifestyle factors
              </p>

              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-body-text dark:text-gray-300 text-sm mb-1">Chronological Age</div>
                  <div className="text-3xl font-bold text-dark-text dark:text-white">{chronologicalAge}</div>
                </div>
                <div className="text-center">
                  <div className="text-body-text dark:text-gray-300 text-sm mb-1">Biological Age</div>
                  <div className={`text-3xl font-bold ${
                    biologicalAge && biologicalAge < parseFloat(chronologicalAge) 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>{biologicalAge}</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div className="text-left mb-3">
                  <h4 className="font-medium text-dark-text dark:text-white">What this means:</h4>
                </div>
                
                <div className="text-sm text-body-text dark:text-gray-300 text-left">
                  {biologicalAge && biologicalAge < parseFloat(chronologicalAge) ? (
                    <p>
                      Your biological age is <span className="font-medium text-green-600 dark:text-green-400">
                      {(parseFloat(chronologicalAge) - biologicalAge).toFixed(1)} years younger</span> than 
                      your chronological age. This suggests that your body is aging slower than average,
                      likely due to healthy lifestyle choices and good biomarker values.
                    </p>
                  ) : biologicalAge === parseFloat(chronologicalAge) ? (
                    <p>
                      Your biological age matches your chronological age. This is normal and suggests
                      your body is aging at an average rate. There may still be opportunities to improve
                      specific health markers.
                    </p>
                  ) : (
                    <p>
                      Your biological age is <span className="font-medium text-red-600 dark:text-red-400">
                      {(biologicalAge! - parseFloat(chronologicalAge)).toFixed(1)} years older</span> than 
                      your chronological age. This suggests your body may be aging faster than average.
                      Focus on improving the biomarkers highlighted in your analysis.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetCalculator} className="flex-1">
                Recalculate
              </Button>
              <Button className="flex-1">
                Save to Profile
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}