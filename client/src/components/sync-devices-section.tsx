import React from 'react';
import { Button } from '@/components/ui/button';

export function SyncDevicesSection() {
  const devices = [
    {
      name: "Apple Health",
      icon: (
        <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
          <path d="M12.1201 4C13.4201 4 14.4201 4.4 15.3201 5.3C16.0201 6 16.6201 7.1 16.6201 8.3C16.6201 8.5 16.6201 8.7 16.5201 8.9C15.2201 8.7 14.1201 8 13.4201 7.3C12.7201 6.6 12.1201 5.5 12.1201 4.3C12.0201 4.2 12.1201 4.1 12.1201 4Z" fill="#FF2D55"/>
          <path d="M16.6203 9.3C16.4203 13.1 19.7203 14.5 19.8203 14.6C19.8203 14.6 19.4203 15.8 18.6203 17C17.9203 18 17.1203 19 15.9203 19C14.7203 19 14.3203 18.3 13.0203 18.3C11.7203 18.3 11.2203 19 10.1203 19C8.9203 19 8.1203 17.9 7.3203 16.9C6.1203 15.2 5.1203 12.5 5.1203 10C5.1203 6.3 7.6203 4.4 10.0203 4.4C11.2203 4.4 12.3203 5.2 13.1203 5.2C13.9203 5.2 15.1203 4.3 16.5203 4.3C16.9203 4.3 16.8203 9.2 16.6203 9.3Z" fill="#FF2D55"/>
        </svg>
      ),
    },
    {
      name: "Google Fit",
      icon: (
        <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18.5c-4.7 0-8.5-3.8-8.5-8.5S7.3 3.5 12 3.5s8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5z" fill="#1B91FC"/>
          <path d="M12 5c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 12.5c-3 0-5.5-2.5-5.5-5.5S9 6.5 12 6.5s5.5 2.5 5.5 5.5-2.5 5.5-5.5 5.5z" fill="#EA4235"/>
          <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" fill="#FBBD00"/>
        </svg>
      ),
    },
    {
      name: "Fitbit",
      icon: (
        <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M17.7 12c0-1.5-1.2-2.7-2.7-2.7S12.3 10.5 12.3 12s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7zm-6.8 4.1c0-1.2-1-2.3-2.3-2.3s-2.3 1-2.3 2.3 1 2.3 2.3 2.3 2.3-1 2.3-2.3zm0-8.2c0-1.2-1-2.3-2.3-2.3s-2.3 1-2.3 2.3 1 2.3 2.3 2.3 2.3-1 2.3-2.3zM15 6.4c0-1-0.8-1.8-1.8-1.8S11.4 5.4 11.4 6.4s0.8 1.8 1.8 1.8S15 7.4 15 6.4zm0 11.1c0-1-0.8-1.8-1.8-1.8s-1.8 0.8-1.8 1.8 0.8 1.8 1.8 1.8 1.8-0.8 1.8-1.8zm4.5-4.1c0-0.7-0.6-1.4-1.4-1.4s-1.4 0.6-1.4 1.4 0.6 1.4 1.4 1.4 1.4-0.6 1.4-1.4zM9.5 12c0-0.7-0.6-1.4-1.4-1.4s-1.4 0.6-1.4 1.4 0.6 1.4 1.4 1.4 1.4-0.6 1.4-1.4zm3.2 0c0-0.4-0.3-0.7-0.7-0.7s-0.7 0.3-0.7 0.7 0.3 0.7 0.7 0.7 0.7-0.3 0.7-0.7z" fill="#00B0B9"/>
        </svg>
      ),
    },
    {
      name: "Samsung Health",
      icon: (
        <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="#1CAFE4"/>
          <path d="M16 11h-3V8c0-0.6-0.4-1-1-1s-1 0.4-1 1v3H8c-0.6 0-1 0.4-1 1s0.4 1 1 1h3v3c0 0.6 0.4 1 1 1s1-0.4 1-1v-3h3c0.6 0 1-0.4 1-1s-0.4-1-1-1z" fill="#FFFFFF"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sync All Your Health Data
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your favorite health apps and wearables to Healthfolio for a complete picture of your health. Access all your health metrics in one place and gain deeper insights into your wellbeing.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {devices.map((device, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  {device.icon}
                  <span className="ml-3 font-medium">{device.name}</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
              Connect Your Devices
            </Button>
          </div>
          
          <div className="w-full md:w-1/2">
            <div className="bg-gray-50 rounded-3xl p-8 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 bg-opacity-10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">Today's Stats</h3>
                  <span className="text-sm text-gray-500">March 21, 2025</span>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold">Steps</h4>
                          <p className="text-gray-500 text-sm">Daily Goal: 10,000</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">8,423</span>
                        <p className="text-green-500 text-sm">+12% from yesterday</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold">Heart Rate</h4>
                          <p className="text-gray-500 text-sm">Resting Rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">72 bpm</span>
                        <p className="text-gray-500 text-sm">Normal range</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold">Sleep</h4>
                          <p className="text-gray-500 text-sm">Last Night</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">7h 12m</span>
                        <p className="text-yellow-500 text-sm">20 min less than target</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}