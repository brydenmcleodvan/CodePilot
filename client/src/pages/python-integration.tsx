import { useState } from "react";
import StreamlitEmbed from "@/components/streamlit-embed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Activity, FileSpreadsheet, LineChart } from "lucide-react";

export function PythonIntegration() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Python-Powered Health Analytics</h1>
          <p className="text-gray-600 max-w-2xl">
            Healthfolio integrates Python's data science capabilities to provide advanced health analytics,
            visualizations, and insights that help you understand your health journey better.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              Neural Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Advanced neural profile analysis with seizure frequency prediction and EEG pattern recognition.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Comprehensive health metrics with trend analysis and anomaly detection for early intervention.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2 text-purple-600" />
              Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Secure medical record storage with historical data comparison and progress tracking.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <LineChart className="h-5 w-5 mr-2 text-orange-600" />
              Predictive Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              AI-powered health predictions based on your personal data and medical history patterns.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="dashboard">Neural Profile Dashboard</TabsTrigger>
          <TabsTrigger value="data-explorer">Health Data Explorer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0">
          <StreamlitEmbed />
        </TabsContent>
        
        <TabsContent value="data-explorer" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Health Data Explorer</CardTitle>
              <CardDescription>
                Interactive tool for exploring and analyzing your health data using Python's
                data science capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">Health Data Explorer Coming Soon</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We're building an advanced health data exploration tool. Sign up to be notified
                  when it's ready.
                </p>
                <Button>Join Waitlist</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PythonIntegration;