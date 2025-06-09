import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Shield, 
  LineChart, 
  Activity, 
  Calendar, 
  MessageSquare 
} from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [_, setLocation] = useLocation();
  
  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Call API to add user to waitlist
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      } else {
        // Handle error
        console.error('Waitlist signup failed');
      }
    } catch (error) {
      console.error('Error signing up for waitlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header & Hero Section */}
      <header className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Healthmap" 
                className="h-10 w-auto mr-3" 
              />
              <span className="text-2xl font-bold">Healthmap</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="hover:underline">Features</a>
              <a href="#faq" className="hover:underline">FAQ</a>
              <Button onClick={() => setLocation('/auth')} variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                Try Demo
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Your Complete Health Journey, Intelligently Managed
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Track, analyze, and optimize your health with personalized insights powered by AI.
              Take control of your wellness journey with a comprehensive health platform designed for you.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {!submitted ? (
                <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  />
                  <Button 
                    type="submit" 
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="bg-blue-500 p-4 rounded-md">
                  <p className="text-white">Thanks for joining our waitlist! We'll keep you updated on our launch.</p>
                </div>
              )}
            </motion.div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <img 
                src="/dashboard-preview.png" 
                alt="Healthmap Dashboard" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
              <div className="absolute -bottom-5 -right-5 bg-blue-500 p-3 rounded-full shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff">
            <path d="M0,96L80,85.3C160,75,320,53,480,58.7C640,64,800,96,960,106.7C1120,117,1280,107,1360,101.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </header>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Transformative Health Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity className="h-10 w-10 text-blue-500" />}
              title="Neural Health Profile"
              description="Get personalized insights with our AI-driven health analysis that builds a comprehensive profile tailored specifically to you."
            />
            
            <FeatureCard 
              icon={<LineChart className="h-10 w-10 text-blue-500" />}
              title="Longevity Tracker"
              description="Track your biological age and receive actionable steps to optimize your health metrics for improved longevity."
            />
            
            <FeatureCard 
              icon={<Shield className="h-10 w-10 text-blue-500" />}
              title="Privacy-First Design"
              description="Your health data stays private with end-to-end encryption and local-first storage options for sensitive information."
            />
            
            <FeatureCard 
              icon={<Calendar className="h-10 w-10 text-blue-500" />}
              title="Health Journey Planning"
              description="Set wellness goals and track your progress with smart reminders and adaptive recommendations."
            />
            
            <FeatureCard 
              icon={<MessageSquare className="h-10 w-10 text-blue-500" />}
              title="AI Health Assistant"
              description="Ask questions and receive evidence-based health insights from our intelligent coaching assistant."
            />
            
            <FeatureCard 
              icon={<Activity className="h-10 w-10 text-blue-500" />}
              title="Multi-Platform Integration"
              description="Connect with Apple Health, Fitbit, and other platforms to centralize all your health data in one place."
            />
          </div>
        </div>
      </section>
      
      {/* Screenshot Showcase */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">See Healthmap in Action</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Explore how our intuitive interface makes managing your health journey simple and effective.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ScreenshotCard 
              image="/screenshots/dashboard.png"
              title="Personalized Dashboard"
              description="Get an at-a-glance view of your key health metrics and upcoming activities."
            />
            
            <ScreenshotCard 
              image="/screenshots/metrics.png"
              title="Health Metrics Tracking"
              description="Visualize trends in your vital health data with interactive charts."
            />
            
            <ScreenshotCard 
              image="/screenshots/ai-insights.png"
              title="AI-Powered Insights"
              description="Receive personalized recommendations based on your unique health patterns."
            />
          </div>
          
          <div className="mt-12 text-center">
            <Button onClick={() => setLocation('/auth')} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Try the Interactive Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem 
              question="How does Healthmap protect my privacy?"
              answer="Healthmap is built with privacy at its core. We use end-to-end encryption for all sensitive data, offer local-first storage options, and never share your personal health information with third parties without your explicit consent. You have complete control over your data sharing preferences."
            />
            
            <FAQItem 
              question="Can I import data from my existing health apps?"
              answer="Yes! Healthmap integrates with major health platforms including Apple Health, Fitbit, Garmin, and more. You can easily import your historical data to get a complete picture of your health journey from day one."
            />
            
            <FAQItem 
              question="How accurate are the AI health insights?"
              answer="Our AI insights are based on peer-reviewed medical research and your personal health data. While not a replacement for professional medical advice, our system continuously improves with more data and is designed to identify patterns and correlations to help you make informed health decisions."
            />
            
            <FAQItem 
              question="Is there a mobile app available?"
              answer="We're currently developing native mobile apps for iOS (including Apple Watch) and Android. Join our waitlist to be notified as soon as they're available. In the meantime, our web application is fully responsive and works great on mobile browsers."
            />
            
            <FAQItem 
              question="What makes Healthmap different from other health apps?"
              answer="Healthmap stands out with its comprehensive approach to health data, combining tracking capabilities with AI-powered insights, secure storage, and interoperability with existing health platforms. Our Neural Profile technology creates a uniquely personalized experience that adapts to your specific health needs."
            />
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your health journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already taking control of their health with Healthmap's intelligent platform.
          </p>
          
          {!submitted ? (
            <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <Button 
                type="submit" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="bg-blue-500 p-4 rounded-md max-w-md mx-auto">
              <p className="text-white">Thanks for joining our waitlist! We'll keep you updated on our launch.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo-white.svg" alt="Healthmap" className="h-8 w-auto mr-2" />
                <span className="text-xl font-bold">Healthmap</span>
              </div>
              <p className="text-gray-400">
                Your complete health journey, intelligently managed.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Roadmap</a></li>
                <li><a href="/auth" className="text-gray-400 hover:text-white">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="https://github.com/healthmap" className="text-gray-400 hover:text-white">GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Healthmap. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com/healthmap" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600 flex-grow">{description}</p>
      </CardContent>
    </Card>
  );
}

function ScreenshotCard({ image, title, description }: { image: string; title: string; description: string }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-w-16 aspect-h-9 overflow-hidden">
        <img src={image} alt={title} className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        className="flex justify-between items-center w-full text-left py-2 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <span className="text-blue-500">
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="py-3 text-gray-600">{answer}</p>
      </motion.div>
    </div>
  );
}