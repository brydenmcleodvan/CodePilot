import React from 'react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Healthfolio has completely transformed how I manage my medications. I used to forget doses all the time, but now I never miss one thanks to the reminder system.",
      name: "Sarah Johnson",
      role: "User since 2024",
      avatar: "https://randomuser.me/api/portraits/women/18.jpg",
    },
    {
      quote: "As someone with multiple chronic conditions, having all my health data in one place has been life-changing. I can easily share reports with all my doctors.",
      name: "Michael Chen",
      role: "User since 2023",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
      quote: "The wellness challenges have motivated me to be more active and mindful about my health choices. I've lost 15 pounds since joining!",
      name: "Lisa Rodriguez",
      role: "User since 2024",
      avatar: "https://randomuser.me/api/portraits/women/39.jpg",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="bg-white p-8 rounded-xl shadow-md relative">
          <div className="absolute -top-5 left-8 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M4.42 12.106a1 1 0 01-.737 1.213c-.83.25-1.395.962-1.395 1.781 0 .992.776 1.9 1.693 1.9.897 0 1.624-.706 1.624-1.579 0-.854.694-1.589 1.587-1.589h3.158c.893 0 1.587.735 1.587 1.589 0 .873.727 1.579 1.624 1.579.917 0 1.693-.908 1.693-1.9 0-.819-.565-1.53-1.395-1.781a1 1 0 01-.737-1.213l.675-2.253c.194-.646.795-1.085 1.47-1.073.914.015 1.65.774 1.65 1.723 0 .95-.736 1.723-1.65 1.723a1 1 0 110 2c2.015 0 3.65-1.671 3.65-3.723s-1.635-3.723-3.65-3.723c-1.312-.022-2.485.812-2.88 2.064L11.42 12.04a1.46 1.46 0 00-.16.066 1.46 1.46 0 00-.16-.066L8.4 8.851c-.395-1.252-1.568-2.086-2.88-2.064-2.015 0-3.65 1.671-3.65 3.723s1.635 3.723 3.65 3.723a1 1 0 110-2c-.914 0-1.65-.774-1.65-1.723 0-.95.736-1.723 1.65-1.723.675-.012 1.276.427 1.47 1.073l.674 2.253z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="pt-6">
            <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
            
            <div className="flex items-center">
              <img 
                src={testimonial.avatar} 
                alt={testimonial.name} 
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-bold">{testimonial.name}</h4>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}