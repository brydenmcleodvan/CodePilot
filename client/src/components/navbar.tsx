import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/lib/notifications";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
<<<<<<< HEAD
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
        className={`text-body-text dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200 text-sm font-medium px-1 py-2 ${
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
=======
import { ChevronDown, Menu, Moon, Sun } from "lucide-react";
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)

const Navbar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
<<<<<<< HEAD
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
=======
  const { isDark, toggle } = useDarkMode();
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)

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
<<<<<<< HEAD
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-border-light dark:border-gray-700">
      <div className="clean-container">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 h-full">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center p-1.5 bg-primary/10 dark:bg-primary/20 rounded-full">
                <i className="ri-heart-pulse-line text-primary text-xl"></i>
=======
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <i className="ri-heart-pulse-line text-primary text-2xl" aria-hidden="true"></i>
            <Link href="/" className="text-xl font-heading font-bold text-gray-800">
              Healthmap
            </Link>
          </div>

          <nav
            role="navigation"
            aria-label="main"
            className="hidden md:flex items-center space-x-6"
          >
            <Link
              href="/"
              className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                location === "/" ? "text-primary" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                location === "/dashboard" ? "text-primary" : ""
              }`}
            >
              Dashboard
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
              href="/messages"
              className={`relative text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                location.startsWith("/messages") ? "text-primary" : ""
              }`}
            >
              Messages
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-3" variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </Link>
            <Link
              href="/admin"
              className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                location === "/admin" ? "text-primary" : ""
              }`}
            >
              Admin
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
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
              </div>
              <span className="text-xl font-heading font-bold text-dark-text dark:text-white transition-colors duration-200">
                Healthmap
              </span>
            </Link>
          </div>

          {/* Main navigation - better spacing and reduced visual noise */}
          <nav className="hidden md:flex items-center space-x-8 h-full">
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
                <DropdownMenuContent className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-1">
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/health-coach" className={`cursor-pointer w-full ${location === "/health-coach" || location === "/ai-intelligence" ? "text-primary" : ""} text-body-text dark:text-gray-200`}>
                      Health Coach
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/connections" className={`cursor-pointer w-full ${location === "/connections" ? "text-primary" : ""} text-body-text dark:text-gray-200`}>
                      Connections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/forum" className={`cursor-pointer w-full ${location.startsWith("/forum") ? "text-primary" : ""} text-body-text dark:text-gray-200`}>
                      Forum
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/messenger" className={`cursor-pointer w-full ${location === "/messenger" ? "text-primary" : ""} text-body-text dark:text-gray-200`}>
                      Messenger
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/nutrition" className={`cursor-pointer w-full ${location === "/nutrition" ? "text-primary" : ""} text-body-text dark:text-gray-200`}>
                      Nutrition
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/longevity" className={`cursor-pointer w-full ${location === "/longevity" ? "text-primary" : ""} text-body-text dark:text-gray-200`}>
                      Longevity
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/metabolic" className={`cursor-pointer w-full ${location === "/metabolic" ? "text-primary" : ""} text-body-text dark:text-gray-200`}>
                      Metabolic Health
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/integrations" className={`cursor-pointer w-full ${location === "/integrations" ? "text-primary" : ""} text-body-text dark:text-gray-200`}>
                      Integrations
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
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 p-1">
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/profile" className="cursor-pointer text-body-text dark:text-gray-200">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/health-coach" className="cursor-pointer text-body-text dark:text-gray-200">Health Coach</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/connections" className="cursor-pointer text-body-text dark:text-gray-200">Connections</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/family" className="cursor-pointer text-body-text dark:text-gray-200">Family Health</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/messenger" className="cursor-pointer text-body-text dark:text-gray-200">Messenger</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/nutrition" className="cursor-pointer text-body-text dark:text-gray-200">Nutrition</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/longevity" className="cursor-pointer text-body-text dark:text-gray-200">Longevity</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/metabolic" className="cursor-pointer text-body-text dark:text-gray-200">Metabolic Health</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/profile#neural-profile" className="cursor-pointer text-body-text dark:text-gray-200">Neural Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
                    <Link href="/profile#settings" className="cursor-pointer text-body-text dark:text-gray-200">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-1"/>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:text-red-600 dark:hover:text-red-400 focus:bg-light-blue-bg dark:focus:bg-gray-700 py-2">
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
<<<<<<< HEAD
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary focus:outline-none"
              aria-label="Toggle mobile menu"
=======
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
            >
              {isDark ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              className="md:hidden text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">Toggle navigation menu</span>
            </button>
          </div>
        </div>

        {/* Mobile menu - cleaner organization */}
        {isMobileMenuOpen && (
<<<<<<< HEAD
          <div className="md:hidden py-3 px-2 border-t border-light-blue-border dark:border-gray-700">
            <nav className="flex flex-col space-y-0.5">
              <MobileNavLink href="/" active={location === "/"}>
=======
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav
              role="navigation"
              aria-label="mobile"
              className="flex flex-col space-y-4"
            >
              <Link
                href="/"
                className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                  location === "/" ? "text-primary" : ""
                }`}
              >
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
                Home
              </MobileNavLink>
              <MobileNavLink href="/profile" active={location === "/profile"}>
                Profile
<<<<<<< HEAD
              </MobileNavLink>
              <MobileNavLink href="/dashboard" active={location === "/dashboard"}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/health-coach" active={location === "/health-coach" || location === "/ai-intelligence"}>
                Health Coach
              </MobileNavLink>
              <MobileNavLink href="/connections" active={location === "/connections"}>
                Connections
              </MobileNavLink>
              <MobileNavLink href="/family" active={location === "/family"}>
                Family Health
              </MobileNavLink>
              <MobileNavLink href="/forum" active={location.startsWith("/forum")}>
=======
              </Link>
              <Link
                href="/messages"
                className={`relative text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                  location.startsWith("/messages") ? "text-primary" : ""
                }`}
              >
                Messages
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-3" variant="destructive">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/admin"
                className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                  location === "/admin" ? "text-primary" : ""
                }`}
              >
                Admin
              </Link>
              <Link
                href="/forum"
                className={`text-gray-700 hover:text-primary transition-colors duration-200 font-medium ${
                  location.startsWith("/forum") ? "text-primary" : ""
                }`}
              >
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
                Forum
              </MobileNavLink>
              <MobileNavLink href="/messenger" active={location === "/messenger"}>
                Messenger
              </MobileNavLink>
              <MobileNavLink href="/nutrition" active={location === "/nutrition"}>
                Nutrition
              </MobileNavLink>
              <MobileNavLink href="/longevity" active={location === "/longevity"}>
                Longevity
              </MobileNavLink>
              <MobileNavLink href="/metabolic" active={location === "/metabolic"}>
                Metabolic Health
              </MobileNavLink>
              <MobileNavLink href="/integrations" active={location === "/integrations"}>
                Integrations
              </MobileNavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
