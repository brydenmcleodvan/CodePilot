import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Calendar, BarChart3, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  timestamp: string;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65
};

export default function NutritionPage() {
  const { toast } = useToast();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    {
      id: '1',
      name: 'Greek Yogurt with Berries',
      calories: 220,
      protein: 18,
      carbs: 26,
      fat: 5,
      mealType: 'breakfast',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      calories: 350,
      protein: 40,
      carbs: 15,
      fat: 12,
      mealType: 'lunch',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Salmon with Roasted Vegetables',
      calories: 480,
      protein: 35,
      carbs: 30,
      fat: 22,
      mealType: 'dinner',
      timestamp: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Protein Bar',
      calories: 200,
      protein: 20,
      carbs: 22,
      fat: 6,
      mealType: 'snacks',
      timestamp: new Date().toISOString()
    }
  ]);

  const [goals, setGoals] = useState<NutritionGoals>(defaultGoals);
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'breakfast'
  });
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
  const [editedGoals, setEditedGoals] = useState(goals);

  // Calculate daily totals
  const dailyTotals = foodItems.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculate remaining amounts
  const remaining = {
    calories: Math.max(goals.calories - dailyTotals.calories, 0),
    protein: Math.max(goals.protein - dailyTotals.protein, 0),
    carbs: Math.max(goals.carbs - dailyTotals.carbs, 0),
    fat: Math.max(goals.fat - dailyTotals.fat, 0)
  };

  // Calculate progress percentages (capped at 100%)
  const progress = {
    calories: Math.min((dailyTotals.calories / goals.calories) * 100, 100),
    protein: Math.min((dailyTotals.protein / goals.protein) * 100, 100),
    carbs: Math.min((dailyTotals.carbs / goals.carbs) * 100, 100),
    fat: Math.min((dailyTotals.fat / goals.fat) * 100, 100)
  };

  const handleAddFood = () => {
    // Validate input
    if (!newFood.name || !newFood.calories || !newFood.protein || !newFood.carbs || !newFood.fat) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: newFood.name,
      calories: parseInt(newFood.calories),
      protein: parseInt(newFood.protein),
      carbs: parseInt(newFood.carbs),
      fat: parseInt(newFood.fat),
      mealType: newFood.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
      timestamp: new Date().toISOString()
    };

    setFoodItems([...foodItems, foodItem]);
    setNewFood({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      mealType: 'breakfast'
    });
    setIsAddFoodOpen(false);

    toast({
      title: "Food Added",
      description: `${foodItem.name} has been added to your ${foodItem.mealType}`,
    });
  };

  const handleSaveGoals = () => {
    setGoals(editedGoals);
    setIsEditGoalsOpen(false);
    toast({
      title: "Goals Updated",
      description: "Your nutrition goals have been updated",
    });
  };

  const handleDeleteFood = (id: string) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
    toast({
      title: "Food Removed",
      description: "The food item has been removed",
    });
  };

  // Filter food items by meal type
  const getItemsByMealType = (mealType: string) => {
    return foodItems.filter(item => item.mealType === mealType);
  };

  // Get calorie total for a meal type
  const getMealCalories = (mealType: string) => {
    return getItemsByMealType(mealType).reduce((sum, item) => sum + item.calories, 0);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-dark-text dark:text-white mb-2">
              Nutrition Tracker
            </h1>
            <p className="text-body-text dark:text-gray-300 mb-6">
              Track your daily nutrition and monitor your macro goals
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Dialog open={isEditGoalsOpen} onOpenChange={setIsEditGoalsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Edit Goals</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-dark-text dark:text-white">Set Nutrition Goals</DialogTitle>
                  <DialogDescription className="text-body-text dark:text-gray-300">
                    Customize your daily nutrition targets
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="calories">Daily Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={editedGoals.calories}
                      onChange={(e) => setEditedGoals({...editedGoals, calories: parseInt(e.target.value) || 0})}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={editedGoals.protein}
                      onChange={(e) => setEditedGoals({...editedGoals, protein: parseInt(e.target.value) || 0})}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={editedGoals.carbs}
                      onChange={(e) => setEditedGoals({...editedGoals, carbs: parseInt(e.target.value) || 0})}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      value={editedGoals.fat}
                      onChange={(e) => setEditedGoals({...editedGoals, fat: parseInt(e.target.value) || 0})}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditGoalsOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveGoals}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Food</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-dark-text dark:text-white">Add Food Item</DialogTitle>
                  <DialogDescription className="text-body-text dark:text-gray-300">
                    Enter the details of the food you've consumed
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="food-name">Food Name</Label>
                    <Input
                      id="food-name"
                      value={newFood.name}
                      onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={newFood.calories}
                        onChange={(e) => setNewFood({...newFood, calories: e.target.value})}
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={newFood.protein}
                        onChange={(e) => setNewFood({...newFood, protein: e.target.value})}
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={newFood.carbs}
                        onChange={(e) => setNewFood({...newFood, carbs: e.target.value})}
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={newFood.fat}
                        onChange={(e) => setNewFood({...newFood, fat: e.target.value})}
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <select
                      id="meal-type"
                      className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newFood.mealType}
                      onChange={(e) => setNewFood({...newFood, mealType: e.target.value})}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snacks">Snacks</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddFoodOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddFood}>Add Food</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Daily Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-6 bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-dark-text dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Daily Summary</span>
              </CardTitle>
              <CardDescription className="text-body-text dark:text-gray-300">
                Today's nutrition progress and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Calories */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-text dark:text-gray-300 font-medium">Calories</span>
                    <span className="text-dark-text dark:text-white font-semibold">
                      {dailyTotals.calories} / {goals.calories}
                    </span>
                  </div>
                  <Progress value={progress.calories} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-body-text dark:text-gray-400">
                    <span>{remaining.calories} remaining</span>
                    <span>{Math.round(progress.calories)}%</span>
                  </div>
                </div>
                
                {/* Protein */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-text dark:text-gray-300 font-medium">Protein</span>
                    <span className="text-dark-text dark:text-white font-semibold">
                      {dailyTotals.protein}g / {goals.protein}g
                    </span>
                  </div>
                  <Progress value={progress.protein} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-body-text dark:text-gray-400">
                    <span>{remaining.protein}g remaining</span>
                    <span>{Math.round(progress.protein)}%</span>
                  </div>
                </div>
                
                {/* Carbs */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-text dark:text-gray-300 font-medium">Carbs</span>
                    <span className="text-dark-text dark:text-white font-semibold">
                      {dailyTotals.carbs}g / {goals.carbs}g
                    </span>
                  </div>
                  <Progress value={progress.carbs} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-body-text dark:text-gray-400">
                    <span>{remaining.carbs}g remaining</span>
                    <span>{Math.round(progress.carbs)}%</span>
                  </div>
                </div>
                
                {/* Fat */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-text dark:text-gray-300 font-medium">Fat</span>
                    <span className="text-dark-text dark:text-white font-semibold">
                      {dailyTotals.fat}g / {goals.fat}g
                    </span>
                  </div>
                  <Progress value={progress.fat} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-body-text dark:text-gray-400">
                    <span>{remaining.fat}g remaining</span>
                    <span>{Math.round(progress.fat)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Macro Distribution Chart */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-dark-text dark:text-white mb-3">Macro Distribution</h3>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full" 
                    style={{width: `${(dailyTotals.protein * 4 / (dailyTotals.calories || 1)) * 100}%`}}
                    title={`Protein: ${Math.round((dailyTotals.protein * 4 / (dailyTotals.calories || 1)) * 100)}%`}
                  />
                  <div 
                    className="bg-green-500 h-full" 
                    style={{width: `${(dailyTotals.carbs * 4 / (dailyTotals.calories || 1)) * 100}%`}}
                    title={`Carbs: ${Math.round((dailyTotals.carbs * 4 / (dailyTotals.calories || 1)) * 100)}%`}
                  />
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{width: `${(dailyTotals.fat * 9 / (dailyTotals.calories || 1)) * 100}%`}}
                    title={`Fat: ${Math.round((dailyTotals.fat * 9 / (dailyTotals.calories || 1)) * 100)}%`}
                  />
                </div>
                <div className="flex mt-2 text-xs">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                    <span className="text-body-text dark:text-gray-300">Protein</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-body-text dark:text-gray-300">Carbs</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                    <span className="text-body-text dark:text-gray-300">Fat</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Food Diary Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-light-blue-border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-dark-text dark:text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                <span>Food Diary</span>
              </CardTitle>
              <CardDescription className="text-body-text dark:text-gray-300">
                Track what you've eaten today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="breakfast" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="breakfast" className="data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20">
                    Breakfast
                  </TabsTrigger>
                  <TabsTrigger value="lunch" className="data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20">
                    Lunch
                  </TabsTrigger>
                  <TabsTrigger value="dinner" className="data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20">
                    Dinner
                  </TabsTrigger>
                  <TabsTrigger value="snacks" className="data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20">
                    Snacks
                  </TabsTrigger>
                </TabsList>
                
                {/* Breakfast Tab */}
                <TabsContent value="breakfast">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-dark-text dark:text-white">Breakfast</h3>
                      <span className="text-sm text-body-text dark:text-gray-300">
                        {getMealCalories('breakfast')} cal
                      </span>
                    </div>
                  </div>
                  
                  {getItemsByMealType('breakfast').length > 0 ? (
                    <div className="space-y-3">
                      {getItemsByMealType('breakfast').map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                          <div>
                            <h4 className="font-medium text-dark-text dark:text-white">{item.name}</h4>
                            <div className="flex space-x-4 text-xs text-body-text dark:text-gray-300 mt-1">
                              <span>{item.calories} cal</span>
                              <span>{item.protein}g protein</span>
                              <span>{item.carbs}g carbs</span>
                              <span>{item.fat}g fat</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteFood(item.id)}
                            className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                            aria-label="Delete food item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        className="w-full mt-3 text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => {
                          setNewFood({...newFood, mealType: 'breakfast'});
                          setIsAddFoodOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Breakfast Item
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                        <Utensils className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-dark-text dark:text-white mb-2">No breakfast logged yet</h3>
                      <p className="text-body-text dark:text-gray-300 mb-4">
                        Track your breakfast to monitor your morning nutrition
                      </p>
                      <Button
                        onClick={() => {
                          setNewFood({...newFood, mealType: 'breakfast'});
                          setIsAddFoodOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Breakfast
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                {/* Lunch Tab */}
                <TabsContent value="lunch">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-dark-text dark:text-white">Lunch</h3>
                      <span className="text-sm text-body-text dark:text-gray-300">
                        {getMealCalories('lunch')} cal
                      </span>
                    </div>
                  </div>
                  
                  {getItemsByMealType('lunch').length > 0 ? (
                    <div className="space-y-3">
                      {getItemsByMealType('lunch').map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                          <div>
                            <h4 className="font-medium text-dark-text dark:text-white">{item.name}</h4>
                            <div className="flex space-x-4 text-xs text-body-text dark:text-gray-300 mt-1">
                              <span>{item.calories} cal</span>
                              <span>{item.protein}g protein</span>
                              <span>{item.carbs}g carbs</span>
                              <span>{item.fat}g fat</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteFood(item.id)}
                            className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                            aria-label="Delete food item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        className="w-full mt-3 text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => {
                          setNewFood({...newFood, mealType: 'lunch'});
                          setIsAddFoodOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Lunch Item
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                        <Utensils className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-dark-text dark:text-white mb-2">No lunch logged yet</h3>
                      <p className="text-body-text dark:text-gray-300 mb-4">
                        Track your lunch to monitor your midday nutrition
                      </p>
                      <Button
                        onClick={() => {
                          setNewFood({...newFood, mealType: 'lunch'});
                          setIsAddFoodOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Lunch
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                {/* Dinner Tab */}
                <TabsContent value="dinner">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-dark-text dark:text-white">Dinner</h3>
                      <span className="text-sm text-body-text dark:text-gray-300">
                        {getMealCalories('dinner')} cal
                      </span>
                    </div>
                  </div>
                  
                  {getItemsByMealType('dinner').length > 0 ? (
                    <div className="space-y-3">
                      {getItemsByMealType('dinner').map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                          <div>
                            <h4 className="font-medium text-dark-text dark:text-white">{item.name}</h4>
                            <div className="flex space-x-4 text-xs text-body-text dark:text-gray-300 mt-1">
                              <span>{item.calories} cal</span>
                              <span>{item.protein}g protein</span>
                              <span>{item.carbs}g carbs</span>
                              <span>{item.fat}g fat</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteFood(item.id)}
                            className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                            aria-label="Delete food item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        className="w-full mt-3 text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => {
                          setNewFood({...newFood, mealType: 'dinner'});
                          setIsAddFoodOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Dinner Item
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                        <Utensils className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-dark-text dark:text-white mb-2">No dinner logged yet</h3>
                      <p className="text-body-text dark:text-gray-300 mb-4">
                        Track your dinner to complete your daily nutrition
                      </p>
                      <Button
                        onClick={() => {
                          setNewFood({...newFood, mealType: 'dinner'});
                          setIsAddFoodOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Dinner
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                {/* Snacks Tab */}
                <TabsContent value="snacks">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-dark-text dark:text-white">Snacks</h3>
                      <span className="text-sm text-body-text dark:text-gray-300">
                        {getMealCalories('snacks')} cal
                      </span>
                    </div>
                  </div>
                  
                  {getItemsByMealType('snacks').length > 0 ? (
                    <div className="space-y-3">
                      {getItemsByMealType('snacks').map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                          <div>
                            <h4 className="font-medium text-dark-text dark:text-white">{item.name}</h4>
                            <div className="flex space-x-4 text-xs text-body-text dark:text-gray-300 mt-1">
                              <span>{item.calories} cal</span>
                              <span>{item.protein}g protein</span>
                              <span>{item.carbs}g carbs</span>
                              <span>{item.fat}g fat</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteFood(item.id)}
                            className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                            aria-label="Delete food item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        className="w-full mt-3 text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => {
                          setNewFood({...newFood, mealType: 'snacks'});
                          setIsAddFoodOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Snack
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                        <Utensils className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-dark-text dark:text-white mb-2">No snacks logged yet</h3>
                      <p className="text-body-text dark:text-gray-300 mb-4">
                        Track your snacks to get a complete picture of your daily eating habits
                      </p>
                      <Button
                        onClick={() => {
                          setNewFood({...newFood, mealType: 'snacks'});
                          setIsAddFoodOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Snack
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}