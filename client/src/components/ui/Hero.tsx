import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl overflow-hidden shadow-lg">
      <div className="md:flex">
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Transform Your Health Journey
          </h1>
          <p className="text-white text-lg mb-6">
            Healthmap unifies your genetics, genealogy, and health data into
            one powerful platform.
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link href="/profile">
                <Button variant="outline" className="bg-white text-blue-600 border-white hover:bg-gray-100">
                  My Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button variant="outline" className="bg-white text-blue-600 border-white hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="/forum">
              <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Community
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 relative min-h-[300px]">
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