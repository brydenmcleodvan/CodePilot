import React from 'react';

export function StatisticsSection() {
  return (
    <section className="py-8 md:py-12 bg-light-blue-bg border-y border-light-blue-border">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark-text heading-font">
          Healthfolio by the Numbers
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-primary-blue">40+</h3>
            <p className="text-body-text">health trackers & apps supported</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-primary-blue">90+</h3>
            <p className="text-body-text">health metrics monitored</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-primary-blue">500+</h3>
            <p className="text-body-text">unique data points analyzed daily</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatisticsSection;