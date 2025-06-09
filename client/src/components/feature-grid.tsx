import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeatureGrid() {
  const features = [
    {
      title: "Medication Management",
      description: "Set reminders, track doses, and monitor your prescription history in one place.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14C20.6569 14 22 12.6569 22 11C22 9.34315 20.6569 8 19 8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 8H5C3.34315 8 2 9.34315 2 11C2 12.6569 3.34315 14 5 14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 14H19" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 14V19C19 20.6569 17.6569 22 16 22H8C6.34315 22 5 20.6569 5 19V14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 5.17157C11 3.97005 11.9645 3 13.1588 3C14.3531 3 15.3176 3.97005 15.3176 5.17157C15.3176 6.37309 14.3531 7.34314 13.1588 7.34314H5.17574" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Symptom Checker",
      description: "Identify and track symptoms over time to better understand your health patterns.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Health Data Integration",
      description: "Connect with wearables and health apps to consolidate your health data in one dashboard.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Wellness Challenges",
      description: "Participate in community challenges designed to improve your overall wellbeing.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {features.map((feature, index) => (
        <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="mb-4">
              {feature.icon}
            </div>
            <CardTitle className="text-xl">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600">{feature.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}