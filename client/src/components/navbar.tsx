import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <i className="ri-heart-pulse-line text-primary text-2xl"></i>
            <Link href="/" className="text-xl font-heading font-bold text-gray-800">
              Healthfolio
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                location === "/" ? "text-primary" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/profile"
              className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                location === "/profile" ? "text-primary" : ""
              }`}
            >
              Profile
            </Link>
            <Link
              href="/forum"
              className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                location.startsWith("/forum") ? "text-primary" : ""
              }`}
            >
              Forum
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <img
                  src={user.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                  alt="User profile"
                  className="w-8 h-8 rounded-full border-2 border-primary"
                />
                <span className="hidden md:inline font-medium">
                  {user.name ? user.name.split(" ")[0] : user.username}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-gray-700 hover:text-primary transition-colors duration-200">
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile#settings" className="cursor-pointer">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-md bg-white text-primary border border-primary hover:bg-gray-50 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors duration-200 ml-2"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                  location === "/" ? "text-primary" : ""
                }`}
              >
                Home
              </Link>
              <Link
                href="/profile"
                className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                  location === "/profile" ? "text-primary" : ""
                }`}
              >
                Profile
              </Link>
              <Link
                href="/forum"
                className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                  location.startsWith("/forum") ? "text-primary" : ""
                }`}
              >
                Forum
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
