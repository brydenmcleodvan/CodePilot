import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Your Complete Health Journey in One Platform
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg">
              Track medications, monitor symptoms, schedule appointments, and connect with health providers—all in one secure place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative">
            <div className="bg-blue-500 bg-opacity-10 rounded-3xl p-6 relative overflow-hidden">
              <svg
                className="absolute top-0 right-0 w-32 h-32 text-blue-500 opacity-20"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M45.3,-76.2C59.9,-69.2,73.5,-59.5,81.5,-46.2C89.6,-32.9,92.1,-16.5,89.6,-1.4C87.2,13.6,79.8,27.1,71.7,40.5C63.6,53.9,54.8,67.2,42.3,76.1C29.8,85.1,14.9,89.7,0.4,89C-14,88.4,-28.1,82.4,-40.4,73.8C-52.7,65.2,-63.3,54,-69.3,41.1C-75.3,28.3,-76.7,14.1,-77.4,-0.4C-78.1,-14.9,-78.1,-29.8,-72.2,-42.7C-66.4,-55.6,-54.5,-66.5,-41,-74.1C-27.5,-81.8,-13.7,-86.2,0.8,-87.5C15.3,-88.9,30.6,-83.3,45.3,-76.2Z"
                  transform="translate(100 100)"
                />
              </svg>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2">Track Medications</h3>
                  <p className="text-gray-600 text-sm">Never miss a dose with timely reminders</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2">Check Symptoms</h3>
                  <p className="text-gray-600 text-sm">Identify potential health issues early</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2">Schedule Appointments</h3>
                  <p className="text-gray-600 text-sm">Manage your healthcare calendar</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2">Wellness Challenges</h3>
                  <p className="text-gray-600 text-sm">Gamified approach to better health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}