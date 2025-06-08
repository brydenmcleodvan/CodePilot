import React from 'react';
import { Button } from '@/components/ui/button';

export function PrivacySection() {
  const privacyFeatures = [
    {
      title: "End-to-End Encryption",
      description: "Your health data is encrypted at all times, both during transmission and storage.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
    },
    {
      title: "HIPAA Compliant",
      description: "Our platform adheres to all healthcare data protection regulations and standards.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04L12 21.394l9.618-13.41A11.955 11.955 0 0112 2.944z" />
        </svg>
      ),
    },
    {
      title: "Granular Control",
      description: "You choose exactly what data to share and with whom. Revoke access at any time.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      title: "No Data Selling",
      description: "We will never sell your personal health information to third parties.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    {
      title: "Transparency",
      description: "Clear logs of all access to your data and who has viewed your information.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: "Regular Audits",
      description: "Our systems undergo regular security audits and vulnerability assessments.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-16 items-center">
      <div className="w-full md:w-2/5">
        <div className="bg-blue-50 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full translate-x-1/4 translate-y-1/4 z-0"></div>
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-100 rounded-full -translate-x-1/4 -translate-y-1/4 z-0"></div>
          
          <div className="relative z-10">
            <svg className="w-24 h-24 text-blue-500 mb-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            
            <h3 className="text-2xl font-bold mb-4">Your Privacy Pledge</h3>
            <p className="text-gray-700 mb-6">
              We believe your health data belongs to you. Our commitment is to provide the highest level of security and transparency in how your information is managed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="border-blue-500 text-blue-500">
                Privacy Policy
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Data Control Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-3/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {privacyFeatures.map((feature, index) => (
            <div key={index} className="flex">
              <div className="mt-1 mr-4">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-bold mb-1">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}