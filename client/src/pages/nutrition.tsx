import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import MacroTracker from "@/components/nutrition/macro-tracker";

const NutritionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("macro-tracker");
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark-text dark:text-white">Nutrition Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your meals, macros, and nutrition goals</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300">
            <i className="ri-download-line mr-1"></i>
            Export Data
          </Button>
          <Button>
            <i className="ri-settings-line mr-1"></i>
            Settings
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="dark:bg-gray-800 border dark:border-gray-700 p-1 mb-6">
          <TabsTrigger 
            value="macro-tracker"
            className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            <i className="ri-layout-grid-line mr-1"></i>
            Macro Tracker
          </TabsTrigger>
          <TabsTrigger 
            value="meal-planner"
            className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            <i className="ri-calendar-line mr-1"></i>
            Meal Planner
          </TabsTrigger>
          <TabsTrigger 
            value="nutrition-analysis"
            className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            <i className="ri-pie-chart-line mr-1"></i>
            Nutrition Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="recipes"
            className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            <i className="ri-book-2-line mr-1"></i>
            Recipes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="macro-tracker">
          <MacroTracker />
        </TabsContent>
        
        <TabsContent value="meal-planner">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold dark:text-white">Meal Planner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800/50">
                <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">
                  <i className="ri-calendar-line"></i>
                </div>
                <h3 className="text-xl font-medium mb-2 dark:text-white">Meal Planner Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Plan your meals for the week, generate shopping lists, and get nutritionist-approved meal suggestions.
                </p>
                <Button>Get Early Access</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nutrition-analysis">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold dark:text-white">Nutrition Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800/50">
                <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">
                  <i className="ri-pie-chart-line"></i>
                </div>
                <h3 className="text-xl font-medium mb-2 dark:text-white">Nutrition Analysis Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Get detailed insights into your nutrition habits, macro distribution, and personalized recommendations.
                </p>
                <Button>Get Early Access</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recipes">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold dark:text-white">Recipe Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800/50">
                <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">
                  <i className="ri-book-2-line"></i>
                </div>
                <h3 className="text-xl font-medium mb-2 dark:text-white">Recipe Database Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Browse thousands of recipes with complete nutritional information, save favorites, and quickly add meals to your tracker.
                </p>
                <Button>Get Early Access</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold dark:text-white">Nutrition Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="ri-information-line text-primary dark:text-primary-400 mt-1 mr-2"></i>
                <div>
                  <p className="font-medium dark:text-white">Protein timing matters</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Distribute protein intake throughout the day for optimal muscle synthesis.</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="ri-information-line text-primary dark:text-primary-400 mt-1 mr-2"></i>
                <div>
                  <p className="font-medium dark:text-white">Micronutrients count too</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Don't just focus on macros—vitamins and minerals are crucial for health.</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="ri-information-line text-primary dark:text-primary-400 mt-1 mr-2"></i>
                <div>
                  <p className="font-medium dark:text-white">Hydration affects metabolism</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Drink water consistently throughout the day to support digestion and nutrient transport.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold dark:text-white">Recent Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium dark:text-white">Protein Goal Consistency</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">85%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium dark:text-white">Sugar Reduction</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">65%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium dark:text-white">Calorie Target Adherence</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">93%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: '93%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold dark:text-white">Connect Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect with your favorite fitness and nutrition apps to sync your data.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded-md dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center text-white mr-3">
                    <i className="ri-heart-pulse-line"></i>
                  </div>
                  <span className="font-medium dark:text-white">Apple Health</span>
                </div>
                <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-300">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center text-white mr-3">
                    <i className="ri-footprint-line"></i>
                  </div>
                  <span className="font-medium dark:text-white">Fitbit</span>
                </div>
                <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-300">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-md flex items-center justify-center text-white mr-3">
                    <i className="ri-restaurant-line"></i>
                  </div>
                  <span className="font-medium dark:text-white">MyFitnessPal</span>
                </div>
                <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-300">Connect</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NutritionPage;