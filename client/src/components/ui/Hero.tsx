import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
      <div className="flex flex-col md:flex-row">
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 md:w-1/2 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-3 sm:mb-4 md:mb-6">
            Transform Your Health Journey
          </h1>
          <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 leading-relaxed">
            Healthmap unifies your genetics, genealogy, and health data into
            one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            {user ? (
              <Link href="/profile">
                <Button variant="outline" className="w-full sm:w-auto bg-white text-blue-600 border-white hover:bg-gray-100 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                  My Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button variant="outline" className="w-full sm:w-auto bg-white text-blue-600 border-white hover:bg-gray-100 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="/forum">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                Community
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 relative min-h-[250px] sm:min-h-[300px] md:min-h-[400px]">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80"
            alt="Health Technology"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;