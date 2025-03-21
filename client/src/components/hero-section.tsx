import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-dark-text heading-font">
              Your complete <span className="text-primary">health portfolio</span> in one place
            </h1>
            <p className="text-xl text-body-text mb-8 body-font">
              Transform your health journey with personalized insights powered by your wearables, 
              health apps, and comprehensive wellness tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 h-auto text-lg">
                Get Started
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 py-6 h-auto text-lg">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full"></div>
            
            <div className="relative bg-white shadow-xl rounded-xl overflow-hidden border border-light-blue-border">
              <div className="absolute top-0 left-0 right-0 h-12 bg-primary flex items-center px-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  <div className="w-3 h-3 rounded-full bg-white/30"></div>
                </div>
              </div>
              <div className="pt-12">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
                  alt="Healthfolio Dashboard" 
                  className="object-cover w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;