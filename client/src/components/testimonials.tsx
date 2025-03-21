import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-dark-text heading-font">
          What our users say
        </h2>
        <p className="text-lg text-center text-body-text mb-10 max-w-2xl mx-auto body-font">
          Join thousands of satisfied users who have transformed their health journey
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="mb-6 text-body-text">
                "Synced my Fitbit and Apple Health, and saw everything in seconds. This app brings all my health data together in a way that actually makes sense."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
                  MS
                </div>
                <p className="font-medium text-dark-text">Maria S.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="mb-6 text-body-text">
                "The medication tracking feature has been a game-changer for me. I never miss a dose now, and the health insights are incredibly helpful."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
                  JT
                </div>
                <p className="font-medium text-dark-text">James T.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="mb-6 text-body-text">
                "The wellness challenges keep me motivated, and I love seeing how my health metrics improve over time. Best health app I've ever used."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
                  AK
                </div>
                <p className="font-medium text-dark-text">Alex K.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;