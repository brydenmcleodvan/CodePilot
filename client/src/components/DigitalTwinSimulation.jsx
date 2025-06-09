import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
const Line = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Line })));
import { Loader2 } from 'lucide-react';

function ChartFallback() {
  return (
    <div className="flex justify-center items-center h-48">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );
}
import { 
  Brain,
  Play,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Digital Twin Simulation Component
 * Enables predictive modeling and scenario simulation for health outcomes
 */
export function DigitalTwinSimulation() {
  const [showSimulationDialog, setShowSimulationDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch digital twin status
  const { data: twinData, isLoading } = useQuery({
    queryKey: ['/api/digital-twin/status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/digital-twin/status');
      return res.json();
    }
  });

  // Fetch simulation history
  const { data: historyData } = useQuery({
    queryKey: ['/api/digital-twin/simulations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/digital-twin/simulations');
      return res.json();
    }
  });

  // Create digital twin mutation
  const createTwinMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/digital-twin/create');
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Digital Twin Created!",
        description: `Your health model is ready with ${data.dataPoints} data points and ${Math.round(data.modelAccuracy * 100)}% accuracy.`
      });
      queryClient.invalidateQueries(['/api/digital-twin/status']);
    }
  });

  // Run simulation mutation
  const runSimulationMutation = useMutation({
    mutationFn: async (simulationRequest) => {
      const res = await apiRequest('POST', '/api/digital-twin/simulate', simulationRequest);
      return res.json();
    },
    onSuccess: (data) => {
      setSimulationResults(data);
      toast({
        title: "Simulation Complete!",
        description: `Explored ${data.results.timeline.length} days of predicted health outcomes.`
      });
      setShowSimulationDialog(false);
      queryClient.invalidateQueries(['/api/digital-twin/simulations']);
    }
  });

  const hasTwin = twinData?.hasTwin || false;
  const simulations = historyData?.simulations || [];
  const isDark = effectiveTheme === 'dark';

  const scenarios = [
    {
      id: 'sleep_improvement',
      name: 'Sleep Optimization',
      icon: Clock,
      description: 'Explore how improving sleep duration affects your overall health',
      example: 'What if I sleep 1 hour more each night for a month?'
    },
    {
      id: 'supplement_modification',
      name: 'Supplement Changes',
      icon: Target,
      description: 'Model the impact of starting, stopping, or changing supplements',
      example: 'What happens if I stop taking magnesium?'
    },
    {
      id: 'exercise_change',
      name: 'Exercise Modification',
      icon: Zap,
      description: 'Predict outcomes of changing your exercise routine',
      example: 'How would 30 minutes of daily cardio affect me?'
    },
    {
      id: 'dietary_modification',
      name: 'Dietary Changes',
      icon: Brain,
      description: 'Simulate nutritional changes and their health impacts',
      example: 'What if I switched to a Mediterranean diet?'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <span>Digital Twin Simulation</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Explore "what-if" scenarios with your health data. See the predicted impact of lifestyle changes 
          before making them, powered by your personalized health model.
        </p>
      </div>

      {/* Digital Twin Status */}
      {!hasTwin ? (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20">
          <CardContent className="p-8 text-center">
            <Brain className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Create Your Digital Twin</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Your digital twin is a personalized health model that learns from your data to predict 
              how lifestyle changes will affect your wellbeing.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="space-y-2">
                <BarChart3 className="h-8 w-8 text-green-600 mx-auto" />
                <h4 className="font-semibold">Predictive Modeling</h4>
                <p className="text-sm text-gray-600">See future health outcomes</p>
              </div>
              <div className="space-y-2">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto" />
                <h4 className="font-semibold">Scenario Testing</h4>
                <p className="text-sm text-gray-600">Test changes safely first</p>
              </div>
              <div className="space-y-2">
                <Lightbulb className="h-8 w-8 text-yellow-600 mx-auto" />
                <h4 className="font-semibold">Smart Insights</h4>
                <p className="text-sm text-gray-600">Data-driven recommendations</p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => createTwinMutation.mutate()}
              disabled={createTwinMutation.isPending}
            >
              {createTwinMutation.isPending ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Creating Digital Twin...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Create Digital Twin
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-800 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Digital Twin Active</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your personalized health model is ready for simulations
                  </p>
                  {twinData?.accuracy && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm text-gray-600">Model Accuracy:</span>
                      <Progress value={twinData.accuracy * 100} className="w-20" />
                      <span className="text-sm font-medium">{Math.round(twinData.accuracy * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button onClick={() => setShowSimulationDialog(true)}>
                <Play className="h-4 w-4 mr-2" />
                Run Simulation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Results */}
      {simulationResults && (
        <SimulationResults 
          results={simulationResults} 
          onClose={() => setSimulationResults(null)}
        />
      )}

      {/* Main Content */}
      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scenarios">Simulation Scenarios</TabsTrigger>
          <TabsTrigger value="history">Simulation History</TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                disabled={!hasTwin}
                onSelect={(scenario) => {
                  setSelectedScenario(scenario);
                  setShowSimulationDialog(true);
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="space-y-4">
            {simulations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Simulations Yet</h3>
                  <p className="text-gray-600">
                    Run your first simulation to start exploring health scenarios.
                  </p>
                </CardContent>
              </Card>
            ) : (
              simulations.map((simulation) => (
                <SimulationHistoryCard key={simulation.id} simulation={simulation} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Simulation Dialog */}
      <Dialog open={showSimulationDialog} onOpenChange={setShowSimulationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configure Simulation</DialogTitle>
          </DialogHeader>
          
          {selectedScenario && (
            <SimulationForm 
              scenario={selectedScenario}
              onSubmit={(data) => runSimulationMutation.mutate(data)}
              isLoading={runSimulationMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Scenario Card Component
 */
function ScenarioCard({ scenario, disabled, onSelect }) {
  return (
    <Card className={`transition-all hover:shadow-lg cursor-pointer ${disabled ? 'opacity-50' : ''}`}
          onClick={disabled ? undefined : () => onSelect(scenario)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <scenario.icon className="h-8 w-8 text-purple-600" />
            <h3 className="text-lg font-semibold">{scenario.name}</h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {scenario.description}
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-400 italic">
              "{scenario.example}"
            </p>
          </div>
          
          {!disabled && (
            <Button variant="outline" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Simulation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simulation Form Component
 */
function SimulationForm({ scenario, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    scenario_type: scenario.id,
    duration_days: 30,
    changes: {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Duration */}
      <div>
        <label className="block text-sm font-medium mb-2">Simulation Duration</label>
        <div className="space-y-2">
          <Slider
            value={[formData.duration_days]}
            onValueChange={([value]) => setFormData(prev => ({ ...prev, duration_days: value }))}
            max={90}
            min={7}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>1 week</span>
            <span className="font-medium">{formData.duration_days} days</span>
            <span>3 months</span>
          </div>
        </div>
      </div>

      {/* Scenario-specific parameters */}
      {scenario.id === 'sleep_improvement' && (
        <SleepParametersForm formData={formData} setFormData={setFormData} />
      )}
      
      {scenario.id === 'supplement_modification' && (
        <SupplementParametersForm formData={formData} setFormData={setFormData} />
      )}
      
      {scenario.id === 'exercise_change' && (
        <ExerciseParametersForm formData={formData} setFormData={setFormData} />
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Settings className="h-4 w-4 mr-2 animate-spin" />
            Running Simulation...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run Simulation
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * Sleep Parameters Form
 */
function SleepParametersForm({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Sleep Changes</h4>
      
      <div>
        <label className="block text-sm font-medium mb-2">Sleep Duration Change (hours)</label>
        <div className="space-y-2">
          <Slider
            value={[formData.changes.sleep_duration_change || 0]}
            onValueChange={([value]) => setFormData(prev => ({
              ...prev,
              changes: { ...prev.changes, sleep_duration_change: value }
            }))}
            max={3}
            min={-2}
            step={0.25}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>-2 hours</span>
            <span className="font-medium">
              {formData.changes.sleep_duration_change > 0 ? '+' : ''}
              {formData.changes.sleep_duration_change || 0} hours
            </span>
            <span>+3 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Supplement Parameters Form
 */
function SupplementParametersForm({ formData, setFormData }) {
  const [selectedSupplement, setSelectedSupplement] = useState('');
  const [action, setAction] = useState('');

  const supplements = ['magnesium', 'vitamin_d', 'omega_3', 'zinc', 'b_complex'];

  const updateSupplements = () => {
    if (selectedSupplement && action) {
      setFormData(prev => ({
        ...prev,
        changes: {
          ...prev.changes,
          supplements: {
            ...prev.changes.supplements,
            [selectedSupplement]: { action, dosage_change: action === 'increase' ? 1 : 0 }
          }
        }
      }));
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Supplement Changes</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Supplement</label>
          <Select value={selectedSupplement} onValueChange={setSelectedSupplement}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplement" />
            </SelectTrigger>
            <SelectContent>
              {supplements.map(supplement => (
                <SelectItem key={supplement} value={supplement}>
                  {supplement.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Action</label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Start Taking</SelectItem>
              <SelectItem value="stop">Stop Taking</SelectItem>
              <SelectItem value="increase">Increase Dose</SelectItem>
              <SelectItem value="decrease">Decrease Dose</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button variant="outline" onClick={updateSupplements} disabled={!selectedSupplement || !action}>
        Add Change
      </Button>
      
      {formData.changes.supplements && Object.keys(formData.changes.supplements).length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium">Configured Changes:</h5>
          {Object.entries(formData.changes.supplements).map(([supplement, change]) => (
            <Badge key={supplement} variant="outline">
              {change.action} {supplement.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Exercise Parameters Form
 */
function ExerciseParametersForm({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Exercise Changes</h4>
      
      <div>
        <label className="block text-sm font-medium mb-2">Additional Exercise Minutes per Day</label>
        <div className="space-y-2">
          <Slider
            value={[formData.changes.exercise_minutes_change || 0]}
            onValueChange={([value]) => setFormData(prev => ({
              ...prev,
              changes: { ...prev.changes, exercise_minutes_change: value }
            }))}
            max={120}
            min={-60}
            step={15}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>-60 min</span>
            <span className="font-medium">
              {formData.changes.exercise_minutes_change > 0 ? '+' : ''}
              {formData.changes.exercise_minutes_change || 0} minutes
            </span>
            <span>+120 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simulation Results Component
 */
function SimulationResults({ results, onClose }) {
  const { effectiveTheme } = useThemeSync();
  const isDark = effectiveTheme === 'dark';

  const chartData = {
    labels: results.results.timeline.map(t => `Day ${t.day}`),
    datasets: [
      {
        label: 'Energy Levels',
        data: results.results.timeline.map(t => t.metrics.energy_levels),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6' + '20',
        tension: 0.4
      },
      {
        label: 'Mood Score',
        data: results.results.timeline.map(t => t.metrics.mood_score),
        borderColor: '#10B981',
        backgroundColor: '#10B981' + '20',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: isDark ? '#F3F4F6' : '#374151' }
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? '#374151' : '#E5E7EB' },
        ticks: { color: isDark ? '#F3F4F6' : '#374151' }
      },
      y: {
        grid: { color: isDark ? '#374151' : '#E5E7EB' },
        ticks: { color: isDark ? '#F3F4F6' : '#374151' }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Simulation Results</CardTitle>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chart */}
          <div className="h-64">
            <Suspense fallback={<ChartFallback />}>
              <Line data={chartData} options={chartOptions} />
            </Suspense>
          </div>
          
          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Primary Benefits</span>
              </h4>
              {results.insights.primary_benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-sm">{benefit.description}</span>
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>Potential Concerns</span>
              </h4>
              {results.insights.potential_concerns.map((concern, index) => (
                <div key={index} className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="h-3 w-3 text-orange-600" />
                  <span className="text-sm">{concern.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recommendation */}
          <div className={`p-4 rounded-lg ${
            results.recommendation.recommendation === 'highly_recommended' ? 'bg-green-50 dark:bg-green-900/20' :
            results.recommendation.recommendation === 'recommended' ? 'bg-blue-50 dark:bg-blue-900/20' :
            results.recommendation.recommendation === 'neutral' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
            'bg-red-50 dark:bg-red-900/20'
          }`}>
            <h4 className="font-semibold mb-2">Recommendation</h4>
            <p className="text-sm mb-2">{results.recommendation.summary}</p>
            <p className="text-sm font-medium">{results.recommendation.action}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Simulation History Card
 */
function SimulationHistoryCard({ simulation }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold capitalize">{simulation.scenario_type.replace('_', ' ')}</h4>
            <p className="text-sm text-gray-600">
              {simulation.duration_days} days • {new Date(simulation.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <Badge className={
            simulation.recommendation === 'highly_recommended' ? 'bg-green-100 text-green-800' :
            simulation.recommendation === 'recommended' ? 'bg-blue-100 text-blue-800' :
            simulation.recommendation === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }>
            {simulation.recommendation?.replace('_', ' ') || 'Completed'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default DigitalTwinSimulation;