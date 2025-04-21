import { useState, useEffect, useCallback } from "react";
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
import { ThemeToggle } from "@/components/theme-toggle";

// NavLink component for consistent link styling
interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ href, active, children }: NavLinkProps) => {
  return (
    <div className="relative h-full flex items-center">
      <Link
        href={href}
        className={`text-body-text dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200 text-sm font-medium py-2 ${
          active ? "text-primary font-semibold" : ""
        }`}
      >
        {children}
      </Link>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </div>
  );
};

// Mobile navigation link component
const MobileNavLink = ({ href, active, children }: NavLinkProps) => {
  return (
    <Link
      href={href}
      className={`py-2.5 px-4 rounded-md text-body-text dark:text-gray-300 hover:bg-light-blue-bg dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary transition-colors duration-200 text-sm font-medium ${
        active ? "text-primary bg-light-blue-bg/60 dark:bg-gray-800 font-semibold" : ""
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Close menus when scrolling
  const handleScroll = useCallback(() => {
    if (isMoreDropdownOpen) setIsMoreDropdownOpen(false);
    if (isUserDropdownOpen) setIsUserDropdownOpen(false);
  }, [isMoreDropdownOpen, isUserDropdownOpen]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [location]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-border-light dark:border-gray-700">
      <div className="clean-container">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 h-full">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center p-1.5 bg-primary/10 dark:bg-primary/20 rounded-full">
                <i className="ri-heart-pulse-line text-primary text-xl"></i>
              </div>
              <span className="text-xl font-heading font-bold text-dark-text dark:text-white transition-colors duration-200">
                Healthmap
              </span>
            </Link>
          </div>

          {/* Main navigation - better spacing and reduced visual noise */}
          <nav className="hidden md:flex items-center space-x-6 h-full">
            <NavLink href="/" active={location === "/"}>
              Home
            </NavLink>
            <NavLink href="/profile" active={location === "/profile"}>
              Profile
            </NavLink>
            <NavLink href="/dashboard" active={location === "/dashboard"}>
              Dashboard
            </NavLink>
            <NavLink href="/family" active={location === "/family"}>
              Family Health
            </NavLink>
            
            {/* Dropdown for additional pages to reduce visual clutter */}
            <div className="flex items-center justify-center h-full">
              <DropdownMenu 
                open={isMoreDropdownOpen} 
                onOpenChange={setIsMoreDropdownOpen}
              >
                <DropdownMenuTrigger className="text-body-text dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1 text-sm font-medium">
                  More <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/health-coach" className={`cursor-pointer w-full ${location === "/health-coach" ? "text-primary" : ""}`}>
                      Health Coach
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/connections" className={`cursor-pointer w-full ${location === "/connections" ? "text-primary" : ""}`}>
                      Connections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/forum" className={`cursor-pointer w-full ${location.startsWith("/forum") ? "text-primary" : ""}`}>
                      Forum
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/messenger" className={`cursor-pointer w-full ${location === "/messenger" ? "text-primary" : ""}`}>
                      Messenger
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* User section with improved spacing */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu
                open={isUserDropdownOpen} 
                onOpenChange={setIsUserDropdownOpen}
              >
                <DropdownMenuTrigger className="flex items-center p-1 rounded-full hover:bg-light-blue-bg dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none">
                  <div className="flex items-center h-8">
                    <div className="flex items-center justify-center h-full">
                      <img
                        src={user.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                        alt="User profile"
                        className="w-8 h-8 rounded-full border border-light-blue-border dark:border-gray-700 shadow-sm"
                      />
                    </div>
                    <div className="hidden md:flex items-center justify-center h-full ml-2">
                      <span className="text-sm font-medium text-dark-text dark:text-gray-200">
                        {user.name ? user.name.split(" ")[0] : user.username}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 ml-1" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border dark:border-gray-700">
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/profile" className="cursor-pointer text-body-text dark:text-gray-200">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/health-coach" className="cursor-pointer text-body-text dark:text-gray-200">Health Coach</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/connections" className="cursor-pointer text-body-text dark:text-gray-200">Connections</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/family" className="cursor-pointer text-body-text dark:text-gray-200">Family Health</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/messenger" className="cursor-pointer text-body-text dark:text-gray-200">Messenger</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/profile#neural-profile" className="cursor-pointer text-body-text dark:text-gray-200">Neural Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    <Link href="/profile#settings" className="cursor-pointer text-body-text dark:text-gray-200">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700"/>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:text-red-600 dark:hover:text-red-400 focus:bg-light-blue-bg dark:focus:bg-gray-700">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-primary border border-light-blue-border dark:border-gray-700 text-sm font-medium hover:bg-light-blue-bg dark:hover:bg-gray-700 transition-colors duration-200"
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
              className="md:hidden text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu - cleaner organization */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-light-blue-border dark:border-gray-700">
            <nav className="flex flex-col space-y-0.5">
              <MobileNavLink href="/" active={location === "/"}>
                Home
              </MobileNavLink>
              <MobileNavLink href="/profile" active={location === "/profile"}>
                Profile
              </MobileNavLink>
              <MobileNavLink href="/dashboard" active={location === "/dashboard"}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/health-coach" active={location === "/health-coach"}>
                Health Coach
              </MobileNavLink>
              <MobileNavLink href="/connections" active={location === "/connections"}>
                Connections
              </MobileNavLink>
              <MobileNavLink href="/family" active={location === "/family"}>
                Family Health
              </MobileNavLink>
              <MobileNavLink href="/forum" active={location.startsWith("/forum")}>
                Forum
              </MobileNavLink>
              <MobileNavLink href="/messenger" active={location === "/messenger"}>
                Messenger
              </MobileNavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
