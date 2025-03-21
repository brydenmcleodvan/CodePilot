import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Moon, HeartPulse, BarChart3 } from "lucide-react";

export function FeatureGrid() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-dark-text heading-font">
          Comprehensive Health Management
        </h2>
        <p className="text-lg text-center text-body-text mb-10 max-w-2xl mx-auto body-font">
          Take control of your health with scientifically backed guidance for living your best life.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-primary shadow-lg border-primary/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-0 flex flex-col items-center text-center">
              <div className="rounded-full bg-white p-3 mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white heading-font">Train smarter, not harder</h3>
              <p className="text-white/90 body-font">
                Custom workout analytics & heart rate zones based on how your body is performing today
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 bg-primary shadow-lg border-primary/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-0 flex flex-col items-center text-center">
              <div className="rounded-full bg-white p-3 mb-4">
                <Moon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white heading-font">Optimize your sleep</h3>
              <p className="text-white/90 body-font">
                Enjoy deeper and more restorative sleep by tapping into your body's natural rhythm
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 bg-primary shadow-lg border-primary/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-0 flex flex-col items-center text-center">
              <div className="rounded-full bg-white p-3 mb-4">
                <HeartPulse className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white heading-font">Real-time monitoring</h3>
              <p className="text-white/90 body-font">
                Cut through the noise and uncover potential health issues before they arise
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 bg-primary shadow-lg border-primary/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-0 flex flex-col items-center text-center">
              <div className="rounded-full bg-white p-3 mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white heading-font">Personalized insights</h3>
              <p className="text-white/90 body-font">
                See how you compare to similar users with personalized comparisons across 50+ metrics
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;