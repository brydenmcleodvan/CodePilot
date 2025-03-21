import React from 'react';
import { Shield, Lock, UserCheck } from "lucide-react";

export function PrivacySection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-dark-text heading-font">
          Your privacy comes first
        </h2>
        <p className="text-lg text-center text-body-text mb-10 max-w-2xl mx-auto body-font">
          We're committed to protecting your health data with the highest standards of security and privacy
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-dark-text heading-font">
              Privacy-first design
            </h3>
            <p className="text-body-text body-font">
              All product and architecture decisions are driven by our mission to maximize user privacy and data security.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-dark-text heading-font">
              Best-in-class protection
            </h3>
            <p className="text-body-text body-font">
              The latest generation of encryption, storage, and security technologies protect all your sensitive health data.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-dark-text heading-font">
              Your data belongs to you
            </h3>
            <p className="text-body-text body-font">
              We never sell your personal health data. You maintain complete control over what's shared and with whom.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrivacySection;