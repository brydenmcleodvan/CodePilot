import React from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/hero-section";
import FeatureGrid from "@/components/feature-grid";
import StatisticsSection from "@/components/statistics-section";
import SyncDevicesSection from "@/components/sync-devices-section";
import TestimonialsSection from "@/components/testimonials";
import PrivacySection from "@/components/privacy-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="border-b border-light-blue-border bg-white">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/generated-icon.png" 
                alt="Healthfolio" 
                className="h-10 w-10 mr-2" 
              />
              <h1 className="text-xl font-bold text-primary heading-font">Healthfolio</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/features" className="text-body-text hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="/about" className="text-body-text hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-body-text hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/support" className="text-body-text hover:text-primary transition-colors">
                Support
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth" className="text-primary font-medium">
                Log in
              </Link>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Statistics Section */}
        <StatisticsSection />
        
        {/* Features Grid */}
        <FeatureGrid />
        
        {/* Sync Devices Section */}
        <SyncDevicesSection />
        
        {/* Testimonials */}
        <TestimonialsSection />
        
        {/* Privacy Section */}
        <PrivacySection />
        
        {/* CTA Section */}
        <section className="py-16 bg-light-blue-bg border-y border-light-blue-border">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-dark-text heading-font">
              Ready to transform your health journey?
            </h2>
            <p className="text-xl text-body-text mb-8 max-w-2xl mx-auto body-font">
              Join thousands of users who are taking control of their health with Healthfolio.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 h-auto text-lg">
              Get Started Today
            </Button>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-light-blue-border py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/generated-icon.png" 
                  alt="Healthfolio" 
                  className="h-8 w-8 mr-2" 
                />
                <h3 className="text-lg font-bold text-primary heading-font">Healthfolio</h3>
              </div>
              <p className="text-body-text mb-4 body-font">
                Your complete health portfolio in one place.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-dark-text mb-4 heading-font">Product</h4>
              <ul className="space-y-2 body-font">
                <li><Link href="/features" className="text-body-text hover:text-primary">Features</Link></li>
                <li><Link href="/pricing" className="text-body-text hover:text-primary">Pricing</Link></li>
                <li><Link href="/integrations" className="text-body-text hover:text-primary">Integrations</Link></li>
                <li><Link href="/changelog" className="text-body-text hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-dark-text mb-4 heading-font">Resources</h4>
              <ul className="space-y-2 body-font">
                <li><Link href="/blog" className="text-body-text hover:text-primary">Blog</Link></li>
                <li><Link href="/help" className="text-body-text hover:text-primary">Help Center</Link></li>
                <li><Link href="/guides" className="text-body-text hover:text-primary">Guides</Link></li>
                <li><Link href="/community" className="text-body-text hover:text-primary">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-dark-text mb-4 heading-font">Company</h4>
              <ul className="space-y-2 body-font">
                <li><Link href="/about" className="text-body-text hover:text-primary">About Us</Link></li>
                <li><Link href="/careers" className="text-body-text hover:text-primary">Careers</Link></li>
                <li><Link href="/privacy" className="text-body-text hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-body-text hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-light-blue-border mt-8 pt-8 text-center">
            <p className="text-body-text text-sm body-font">
              © {new Date().getFullYear()} Healthfolio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}