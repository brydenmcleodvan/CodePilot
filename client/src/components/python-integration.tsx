import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PythonHealthService {
  name: string;
  url: string;
  description: string;
  isWorking: boolean;
}

export function PythonIntegration() {
  const { toast } = useToast();
  const [services, setServices] = useState<PythonHealthService[]>([
    {
      name: "Patient Data",
      url: "http://localhost:5001/api/patient",
      description: "Fetches patient profile and medical data",
      isWorking: false
    },
    {
      name: "Health Metrics",
      url: "http://localhost:5001/api/health-metrics",
      description: "Retrieves health measurements and indicators",
      isWorking: false
    },
    {
      name: "Medications",
      url: "http://localhost:5001/api/medications",
      description: "Manages medication schedules and dosages",
      isWorking: false
    },
    {
      name: "Health Summary",
      url: "http://localhost:5001/api/health-summary",
      description: "Generates comprehensive health overview",
      isWorking: false
    },
    {
      name: "Available Features",
      url: "http://localhost:5001/api/features",
      description: "Lists available health platform features",
      isWorking: false
    }
  ]);
  
  const [loading, setLoading] = useState(true);

  // Check if Python services are available
  useEffect(() => {
    const checkServices = async () => {
      setLoading(true);
      
      const updatedServices = [...services];
      
      for (let i = 0; i < updatedServices.length; i++) {
        try {
          const response = await fetch(updatedServices[i].url);
          updatedServices[i].isWorking = response.ok;
        } catch (error) {
          console.error(`Error checking service ${updatedServices[i].name}:`, error);
          updatedServices[i].isWorking = false;
        }
      }
      
      setServices(updatedServices);
      setLoading(false);
    };
    
    checkServices();
  }, []);

  const handleServiceClick = async (service: PythonHealthService) => {
    try {
      const response = await fetch(service.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${service.name}`);
      }
      
      const data = await response.json();
      
      toast({
        title: `${service.name} Data Received`,
        description: "Successfully connected to Python backend service",
        variant: "default",
      });
      
      console.log(`Data from ${service.name}:`, data);
    } catch (error) {
      console.error(`Error fetching from ${service.name}:`, error);
      
      toast({
        title: `Connection Error: ${service.name}`,
        description: "Could not connect to the Python backend service. Make sure the Flask API is running.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Python Healthfolio Integration</h2>
        <p className="text-gray-600">
          Connect to the Python-based health data services
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <Card key={index} className={service.isWorking ? "" : "opacity-70"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {service.name}
                  {service.isWorking ? (
                    <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                  ) : (
                    <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                  )}
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Status: {service.isWorking ? "Available" : "Unavailable"}
                </p>
                <p className="text-xs text-gray-500 mt-1">{service.url}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => handleServiceClick(service)}
                  disabled={!service.isWorking}
                  className="w-full"
                >
                  Connect
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">About This Integration</h3>
        <p className="text-sm text-gray-700">
          This component demonstrates the connection between the React frontend and Python Flask backend.
          The Python services provide health data processing, AI-powered health insights, and other
          advanced functionality through a REST API.
        </p>
      </div>
    </div>
  );
}

export default PythonIntegration;