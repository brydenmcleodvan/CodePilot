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
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-border-light">
      <div className="clean-container">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 h-full">
            <div className="flex items-center justify-center h-full">
              <i className="ri-heart-pulse-line text-primary text-2xl"></i>
            </div>
            <div className="flex items-center justify-center h-full">
              <Link href="/" className="text-xl font-heading font-bold text-dark-text">
                Healthmap
              </Link>
            </div>
          </div>

          {/* Main navigation - better spacing and reduced visual noise */}
          <nav className="hidden md:flex items-center space-x-8 h-full">
            <div className="flex items-center justify-center h-full">
              <Link
                href="/"
                className={`text-body-text hover:text-primary transition-colors duration-200 text-sm font-medium ${
                  location === "/" ? "text-primary font-semibold" : ""
                }`}
              >
                Home
              </Link>
            </div>
            <div className="flex items-center justify-center h-full">
              <Link
                href="/profile"
                className={`text-body-text hover:text-primary transition-colors duration-200 text-sm font-medium ${
                  location === "/profile" ? "text-primary font-semibold" : ""
                }`}
              >
                Profile
              </Link>
            </div>
            <div className="flex items-center justify-center h-full">
              <Link
                href="/dashboard"
                className={`text-body-text hover:text-primary transition-colors duration-200 text-sm font-medium ${
                  location === "/dashboard" ? "text-primary font-semibold" : ""
                }`}
              >
                Dashboard
              </Link>
            </div>
            <div className="flex items-center justify-center h-full">
              <Link
                href="/family"
                className={`text-body-text hover:text-primary transition-colors duration-200 text-sm font-medium ${
                  location === "/family" ? "text-primary font-semibold" : ""
                }`}
              >
                Family Health
              </Link>
            </div>
            
            {/* Dropdown for additional pages to reduce visual clutter */}
            <div className="flex items-center justify-center h-full">
              <DropdownMenu>
                <DropdownMenuTrigger className="text-body-text hover:text-primary transition-colors duration-200 flex items-center gap-1 text-sm font-medium">
                  More <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/health-coach" className={`cursor-pointer w-full ${location === "/health-coach" ? "text-primary" : ""}`}>
                      Health Coach
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/connections" className={`cursor-pointer w-full ${location === "/connections" ? "text-primary" : ""}`}>
                      Connections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/forum" className={`cursor-pointer w-full ${location.startsWith("/forum") ? "text-primary" : ""}`}>
                      Forum
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messenger" className={`cursor-pointer w-full ${location === "/messenger" ? "text-primary" : ""}`}>
                      Messenger
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/marketplace" className={`cursor-pointer w-full ${location === "/marketplace" ? "text-primary" : ""}`}>
                      Marketplace
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* User section with improved spacing */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center p-1 rounded-full hover:bg-light-blue-bg transition-colors duration-200 focus:outline-none">
                  <div className="flex items-center h-8">
                    <div className="flex items-center justify-center h-full">
                      <img
                        src={user.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                        alt="User profile"
                        className="w-8 h-8 rounded-full border border-light-blue-border shadow-sm"
                      />
                    </div>
                    <div className="hidden md:flex items-center justify-center h-full ml-2">
                      <span className="text-sm font-medium text-dark-text">
                        {user.name ? user.name.split(" ")[0] : user.username}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500 ml-1" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/health-coach" className="cursor-pointer">Health Coach</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/connections" className="cursor-pointer">Connections</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/family" className="cursor-pointer">Family Health</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messenger" className="cursor-pointer">Messenger</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile#neural-profile" className="cursor-pointer">Neural Profile</Link>
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
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg bg-white text-primary border border-light-blue-border text-sm font-medium hover:bg-light-blue-bg transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-blue-hover transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-primary focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu - cleaner organization */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-light-blue-border">
            <nav className="flex flex-col">
              <Link
                href="/"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location === "/" ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Home
              </Link>
              <Link
                href="/profile"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location === "/profile" ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Profile
              </Link>
              <Link
                href="/dashboard"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location === "/dashboard" ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/health-coach"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location === "/health-coach" ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Health Coach
              </Link>
              <Link
                href="/connections"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location === "/connections" ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Connections
              </Link>
              <Link
                href="/family"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location === "/family" ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Family Health
              </Link>
              <Link
                href="/forum"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location.startsWith("/forum") ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Forum
              </Link>
              <Link
                href="/messenger"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location === "/messenger" ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Messenger
              </Link>
              <Link
                href="/marketplace"
                className={`py-3 px-2 text-body-text hover:bg-light-blue-bg hover:text-primary transition-colors duration-200 font-medium rounded-md ${
                  location === "/marketplace" ? "text-primary bg-light-blue-bg font-semibold" : ""
                }`}
              >
                Marketplace
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
