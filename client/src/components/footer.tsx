import { Link } from "wouter";
import { TipJar } from "@/components/tip-jar";

const Footer = () => {
  return (
<footer className="bg-gray-800 text-white py-12">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    {/* Simplified footer structure with more whitespace */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      {/* Brand column - cleaner layout */}
      <div className="md:col-span-4">
        <div className="flex items-center gap-3 mb-5">

              <i className="ri-heart-pulse-line text-primary text-2xl"></i>
              <span className="text-xl font-heading font-bold">Healthmap</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed text-sm max-w-md">
              Streamlining genetics, genealogy, and health data into a unified
              platform for better health outcomes.
            </p>
<div className="flex gap-5">
  <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
    <i className="ri-facebook-fill text-xl" aria-hidden="true"></i>
    <span className="sr-only">Facebook</span>
  </a>
  <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
    <i className="ri-twitter-fill text-xl" aria-hidden="true"></i>
    <span className="sr-only">Twitter</span>
  </a>
  <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
    <i className="ri-instagram-line text-xl" aria-hidden="true"></i>
    <span className="sr-only">Instagram</span>
  </a>
  <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
    <i className="ri-linkedin-fill text-xl" aria-hidden="true"></i>
    <span className="sr-only">LinkedIn</span>
  </a>
</div>

              </a>
            </div>
          </div>

          {/* Navigation columns - better spacing and organization */}
          <div className="md:col-span-2">
            <h3 className="text-base font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Forum
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-base font-semibold mb-4 text-white">Features</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/health-coach" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Health Coach
                </Link>
              </li>
              <li>
                <Link href="/connections" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Connections
                </Link>
              </li>
              <li>
                <Link href="/family" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Family Health
                </Link>
              </li>
              <li>
                <Link href="/python-integration" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Neural Profile
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-base font-semibold mb-4 text-white">Stay Updated</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Subscribe to our newsletter for the latest updates and health
              insights.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary-blue-hover transition-colors duration-200 text-sm font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Support section with Tip Jar */}
        <div className="border-t border-gray-700 mt-10 pt-10 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <TipJar minimal className="bg-gray-700 rounded-xl" />
            <div className="h-10 border-r border-gray-700 hidden md:block"></div>
            <Link 
              href="/integrations"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              <i className="ri-link text-xl"></i>
              <span className="text-sm">Connect Your Health Apps</span>
            </Link>
          </div>
        </div>
        
        {/* Clean footer separator and bottom section */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Healthmap. All rights reserved.
          </p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/settings/privacy"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              Privacy Settings
            </Link>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
