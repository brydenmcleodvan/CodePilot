import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function SyncDevicesSection() {
  return (
    <section className="py-12 md:py-16 bg-light-blue-bg border-y border-light-blue-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-dark-text heading-font">
              Everything in perfect sync
            </h2>
            <p className="text-lg text-body-text mb-6 body-font">
              Effortlessly unify all of your wearables, health apps, and fitness trackers in one place 
              to get the complete picture of your health journey.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
              Connect Your Devices <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" 
                  alt="Apple Health" 
                  className="w-8 h-8" 
                />
              </div>
              <div className="absolute top-12 -right-4 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/8/8d/Google_Fit_icon.svg" 
                  alt="Google Fit" 
                  className="w-8 h-8" 
                />
              </div>
              <div className="absolute bottom-12 -left-4 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/1/17/Fitbit_logo.svg" 
                  alt="Fitbit" 
                  className="w-10 h-10" 
                />
              </div>
              <div className="absolute -bottom-4 right-12 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Samsung_Health_Logo.png" 
                  alt="Samsung Health" 
                  className="w-10 h-10" 
                />
              </div>
              <div className="bg-white p-10 rounded-lg shadow-xl flex items-center justify-center aspect-square">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                  <img 
                    src="/generated-icon.png" 
                    alt="Healthfolio" 
                    className="w-24 h-24" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SyncDevicesSection;