import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

// Sample food database
const foodDatabase = [
  { id: 1, name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
  { id: 2, name: "Brown Rice", calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9, serving: "100g" },
  { id: 3, name: "Broccoli", calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, serving: "100g" },
  { id: 4, name: "Salmon", calories: 208, protein: 20, carbs: 0, fat: 13, serving: "100g" },
  { id: 5, name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving: "100g" },
  { id: 6, name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fat: 14.7, serving: "100g" },
  { id: 7, name: "Egg", calories: 72, protein: 6.3, carbs: 0.4, fat: 5, serving: "1 large" },
  { id: 8, name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: "100g" },
  { id: 9, name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: "100g" },
  { id: 10, name: "Almonds", calories: 579, protein: 21, carbs: 21.6, fat: 49.9, serving: "100g" },
];

interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  quantity?: number;
}

interface FoodEntry {
  food: Food;
  quantity: number;
  mealType: string;
  date: string;
}

interface MacroTrackerProps {
  className?: string;
}

const MacroTracker: React.FC<MacroTrackerProps> = ({ className }) => {
  const [goals, setGoals] = useState<MacroGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  });
  
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Calculate daily totals
  const totals = entries
    .filter(entry => entry.date === activeDate)
    .reduce(
      (acc, entry) => {
        return {
          calories: acc.calories + (entry.food.calories * entry.quantity),
          protein: acc.protein + (entry.food.protein * entry.quantity),
          carbs: acc.carbs + (entry.food.carbs * entry.quantity),
          fat: acc.fat + (entry.food.fat * entry.quantity),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  
  // Get entries for the active date, grouped by meal type
  const getEntriesByMeal = (mealType: string) => {
    return entries
      .filter(entry => entry.date === activeDate && entry.mealType === mealType)
      .sort((a, b) => a.food.name.localeCompare(b.food.name));
  };
  
  // Handle food search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    const results = foodDatabase.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm]);
  
  // Add food entry
  const addFoodEntry = () => {
    if (!selectedFood) return;
    
    const newEntry: FoodEntry = {
      food: selectedFood,
      quantity,
      mealType,
      date: activeDate,
    };
    
    setEntries([...entries, newEntry]);
    resetAddFoodForm();
  };
  
  // Reset add food form
  const resetAddFoodForm = () => {
    setSelectedFood(null);
    setQuantity(1);
    setSearchTerm("");
    setSearchResults([]);
    setAddFoodDialogOpen(false);
  };
  
  // Remove food entry
  const removeFoodEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };
  
  // Increment/decrement date
  const changeDate = (days: number) => {
    const date = new Date(activeDate);
    date.setDate(date.getDate() + days);
    setActiveDate(date.toISOString().split('T')[0]);
  };
  
  // Calculate progress percentages
  const calculateProgress = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };
  
  return (
    <div className={`${className}`}>
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold dark:text-white">Macro Tracker</CardTitle>
              <p className="text-gray-500 dark:text-gray-400">Track your daily nutrition intake</p>
            </div>
            <Dialog open={addFoodDialogOpen} onOpenChange={setAddFoodDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <i className="ri-add-line mr-2"></i>
                  Add Food
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Add Food</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="food-search" className="dark:text-gray-300">Search for a food</Label>
                    <Input 
                      id="food-search" 
                      placeholder="Enter food name" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border dark:border-gray-700 rounded-md bg-white dark:bg-gray-700">
                      {searchResults.map((food) => (
                        <div 
                          key={food.id} 
                          onClick={() => {
                            setSelectedFood(food);
                            setSearchTerm(food.name);
                            setSearchResults([]);
                          }}
                          className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            selectedFood?.id === food.id ? 'bg-primary/10 dark:bg-primary/20' : ''
                          }`}
                        >
                          <div className="font-medium dark:text-white">{food.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {food.calories} cal | {food.protein}g protein | {food.carbs}g carbs | {food.fat}g fat
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedFood && (
                    <div className="space-y-3 mt-2">
                      <div>
                        <Label htmlFor="quantity" className="dark:text-gray-300">Quantity ({selectedFood.serving})</Label>
                        <div className="flex items-center mt-1">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                            className="dark:border-gray-600"
                          >-</Button>
                          <Input 
                            id="quantity" 
                            type="number" 
                            min="0.5" 
                            step="0.5" 
                            value={quantity}
                            onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                            className="mx-2 w-20 text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setQuantity(quantity + 0.5)}
                            className="dark:border-gray-600"
                          >+</Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="meal-type" className="dark:text-gray-300">Meal</Label>
                        <Select 
                          value={mealType} 
                          onValueChange={setMealType}
                        >
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select meal" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snacks">Snacks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Nutrition (per {selectedFood.serving})</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Calories:</span>{" "}
                            <span className="font-medium dark:text-white">{selectedFood.calories}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Protein:</span>{" "}
                            <span className="font-medium dark:text-white">{selectedFood.protein}g</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Carbs:</span>{" "}
                            <span className="font-medium dark:text-white">{selectedFood.carbs}g</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Fat:</span>{" "}
                            <span className="font-medium dark:text-white">{selectedFood.fat}g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button variant="outline" onClick={resetAddFoodForm} className="dark:border-gray-600 dark:text-gray-200">
                      Cancel
                    </Button>
                    <Button 
                      onClick={addFoodEntry}
                      disabled={!selectedFood}
                    >
                      Add to Diary
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => changeDate(-1)} className="dark:border-gray-700 dark:text-gray-200">
              <i className="ri-arrow-left-s-line mr-1"></i>
              Previous Day
            </Button>
            <h3 className="text-xl font-semibold dark:text-white">{formatDate(activeDate)}</h3>
            <Button variant="outline" onClick={() => changeDate(1)} className="dark:border-gray-700 dark:text-gray-200">
              Next Day
              <i className="ri-arrow-right-s-line ml-1"></i>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
                <span className="text-sm font-medium dark:text-gray-300">
                  {Math.round(totals.calories)} / {goals.calories}
                </span>
              </div>
              <Progress value={calculateProgress(totals.calories, goals.calories)} className="h-2" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
                <span className="text-sm font-medium dark:text-gray-300">
                  {Math.round(totals.protein)}g / {goals.protein}g
                </span>
              </div>
              <Progress value={calculateProgress(totals.protein, goals.protein)} className="h-2 bg-gray-200 dark:bg-gray-700">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${calculateProgress(totals.protein, goals.protein)}%` }}></div>
              </Progress>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-1"
            >
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Carbs</span>
                <span className="text-sm font-medium dark:text-gray-300">
                  {Math.round(totals.carbs)}g / {goals.carbs}g
                </span>
              </div>
              <Progress value={calculateProgress(totals.carbs, goals.carbs)} className="h-2 bg-gray-200 dark:bg-gray-700">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${calculateProgress(totals.carbs, goals.carbs)}%` }}></div>
              </Progress>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-1"
            >
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fat</span>
                <span className="text-sm font-medium dark:text-gray-300">
                  {Math.round(totals.fat)}g / {goals.fat}g
                </span>
              </div>
              <Progress value={calculateProgress(totals.fat, goals.fat)} className="h-2 bg-gray-200 dark:bg-gray-700">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${calculateProgress(totals.fat, goals.fat)}%` }}></div>
              </Progress>
            </motion.div>
          </div>
          
          <Tabs defaultValue="breakfast">
            <TabsList className="mb-4 dark:bg-gray-700">
              <TabsTrigger value="breakfast" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200">Lunch</TabsTrigger>
              <TabsTrigger value="dinner" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200">Dinner</TabsTrigger>
              <TabsTrigger value="snacks" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200">Snacks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakfast">
              <MealSection 
                entries={getEntriesByMeal('breakfast')} 
                removeFoodEntry={removeFoodEntry}
                onAddFood={() => {
                  setMealType('breakfast');
                  setAddFoodDialogOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="lunch">
              <MealSection 
                entries={getEntriesByMeal('lunch')} 
                removeFoodEntry={removeFoodEntry}
                onAddFood={() => {
                  setMealType('lunch');
                  setAddFoodDialogOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="dinner">
              <MealSection 
                entries={getEntriesByMeal('dinner')} 
                removeFoodEntry={removeFoodEntry}
                onAddFood={() => {
                  setMealType('dinner');
                  setAddFoodDialogOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="snacks">
              <MealSection 
                entries={getEntriesByMeal('snacks')} 
                removeFoodEntry={removeFoodEntry}
                onAddFood={() => {
                  setMealType('snacks');
                  setAddFoodDialogOpen(true);
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-800/70 border-t dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Remaining: <span className="font-medium text-gray-800 dark:text-gray-200">{goals.calories - totals.calories} calories</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                <i className="ri-settings-line mr-1"></i>
                Set Goals
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Nutrition Goals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="calories-goal" className="dark:text-gray-300">Daily Calories</Label>
                  <Input 
                    id="calories-goal" 
                    type="number" 
                    min="1000" 
                    value={goals.calories}
                    onChange={(e) => setGoals({...goals, calories: parseInt(e.target.value) || 2000})}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="protein-goal" className="dark:text-gray-300">Protein (g)</Label>
                  <Input 
                    id="protein-goal" 
                    type="number" 
                    min="0" 
                    value={goals.protein}
                    onChange={(e) => setGoals({...goals, protein: parseInt(e.target.value) || 0})}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="carbs-goal" className="dark:text-gray-300">Carbs (g)</Label>
                  <Input 
                    id="carbs-goal" 
                    type="number" 
                    min="0" 
                    value={goals.carbs}
                    onChange={(e) => setGoals({...goals, carbs: parseInt(e.target.value) || 0})}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fat-goal" className="dark:text-gray-300">Fat (g)</Label>
                  <Input 
                    id="fat-goal" 
                    type="number" 
                    min="0" 
                    value={goals.fat}
                    onChange={(e) => setGoals({...goals, fat: parseInt(e.target.value) || 0})}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button type="button">
                    Save Goals
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};

interface MealSectionProps {
  entries: FoodEntry[];
  removeFoodEntry: (index: number) => void;
  onAddFood: () => void;
}

const MealSection: React.FC<MealSectionProps> = ({ entries, removeFoodEntry, onAddFood }) => {
  // Calculate meal totals
  const mealTotals = entries.reduce(
    (acc, entry) => {
      return {
        calories: acc.calories + (entry.food.calories * entry.quantity),
        protein: acc.protein + (entry.food.protein * entry.quantity),
        carbs: acc.carbs + (entry.food.carbs * entry.quantity),
        fat: acc.fat + (entry.food.fat * entry.quantity),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  
  return (
    <div>
      {entries.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Food</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Qty</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Calories</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Protein</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Carbs</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Fat</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="py-2 px-3 text-sm font-medium dark:text-white">{entry.food.name}</td>
                    <td className="py-2 px-3 text-center text-sm text-gray-600 dark:text-gray-400">{entry.quantity}</td>
                    <td className="py-2 px-3 text-center text-sm text-gray-600 dark:text-gray-400">{Math.round(entry.food.calories * entry.quantity)}</td>
                    <td className="py-2 px-3 text-center text-sm text-gray-600 dark:text-gray-400">{Math.round(entry.food.protein * entry.quantity)}g</td>
                    <td className="py-2 px-3 text-center text-sm text-gray-600 dark:text-gray-400">{Math.round(entry.food.carbs * entry.quantity)}g</td>
                    <td className="py-2 px-3 text-center text-sm text-gray-600 dark:text-gray-400">{Math.round(entry.food.fat * entry.quantity)}g</td>
                    <td className="py-2 px-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFoodEntry(index)}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="py-2 px-3 text-sm font-medium dark:text-white">Total</td>
                  <td></td>
                  <td className="py-2 px-3 text-center text-sm font-medium dark:text-white">{Math.round(mealTotals.calories)}</td>
                  <td className="py-2 px-3 text-center text-sm font-medium dark:text-white">{Math.round(mealTotals.protein)}g</td>
                  <td className="py-2 px-3 text-center text-sm font-medium dark:text-white">{Math.round(mealTotals.carbs)}g</td>
                  <td className="py-2 px-3 text-center text-sm font-medium dark:text-white">{Math.round(mealTotals.fat)}g</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={onAddFood} className="dark:border-gray-700 dark:text-gray-300">
              <i className="ri-add-line mr-1"></i>
              Add More
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800/50">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">
            <i className="ri-restaurant-line"></i>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No foods added yet</p>
          <Button variant="outline" onClick={onAddFood} className="dark:border-gray-700 dark:text-gray-300">
            <i className="ri-add-line mr-1"></i>
            Add Food
          </Button>
        </div>
      )}
    </div>
  );
};

export default MacroTracker;