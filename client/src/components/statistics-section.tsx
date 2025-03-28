import React from 'react';

export function StatisticsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Thousands of Users
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join a growing community of health-conscious individuals who take control of their wellbeing through our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">25k+</div>
            <p className="text-gray-600">Active Users</p>
          </div>
          
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">1.2M+</div>
            <p className="text-gray-600">Medication Doses Tracked</p>
          </div>
          
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">85k+</div>
            <p className="text-gray-600">Appointments Managed</p>
          </div>
          
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">98%</div>
            <p className="text-gray-600">User Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}