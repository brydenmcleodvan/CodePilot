import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export function PythonIntegration() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Neural Profile</h1>
          <p className="text-sm text-muted-foreground">
            Powered by Python & Streamlit
          </p>
        </div>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Interactive Neural Profile Dashboard</CardTitle>
            <CardDescription>
              Access detailed neural profile data and visualizations for patients
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[800px] w-full">
              <iframe 
                src="http://0.0.0.0:8501" 
                title="Streamlit Neural Profile" 
                className="w-full h-full border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PythonIntegration;