import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Loader2 } from "lucide-react";

// Core pages with immediate loading
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";

// Lazy loaded pages (heavier components)
const Profile = lazy(() => import("@/pages/profile"));
const Forum = lazy(() => import("@/pages/forum"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const PythonIntegrationPage = lazy(() => import("@/pages/python-integration"));
const HealthCoach = lazy(() => import("@/pages/health-coach").then(module => ({ default: module.HealthCoach })));
const Connections = lazy(() => import("@/pages/connections").then(module => ({ default: module.Connections })));
const Family = lazy(() => import("@/pages/family").then(module => ({ default: module.Family })));
const FamilyTreePage = lazy(() => import("@/pages/family-tree"));
const NutritionPage = lazy(() => import("@/pages/nutrition"));
const MessengerPage = lazy(() => import("@/pages/messenger"));
const Shop = lazy(() => import("@/pages/shop"));
const LongevityPage = lazy(() => import("@/pages/longevity"));
const MetabolicHealthPage = lazy(() => import("@/pages/metabolic"));
const EnhancedHome = lazy(() => import("@/pages/enhanced-home"));
const IntegrationsPage = lazy(() => import("@/pages/integrations"));
const OAuthCallbackPage = lazy(() => import("@/pages/oauth-callback"));
const ThankYouPage = lazy(() => import("@/pages/thank-you"));
const AIIntelligencePage = lazy(() => import("@/pages/ai-intelligence"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy-page"));
const ChangelogPage = lazy(() => import("@/pages/changelog"));
const LandingPageNew = lazy(() => import("@/pages/landing-page"));
const FeatureVotingPage = lazy(() => import("@/pages/feature-voting"));

// Privacy & Security pages
const PrivacySettingsPage = lazy(() => import("@/pages/privacy-settings-page"));
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

function Router() {
  const [location] = useLocation();
  
  // Check if we're on the auth page or landing page to hide navbar and footer
  const isAuthPage = location.startsWith("/auth");
  const isLandingPage = location === "/landing";
  const hideNavAndFooter = isAuthPage || isLandingPage;

  // Apply cleaner layout with improved spacing
  // Loading component for lazy-loaded routes
  const LoadingComponent = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-200">
      {!hideNavAndFooter && <Navbar />}
      
      <main className="flex-grow py-8">
        <div className="clean-container">
          <Suspense fallback={<LoadingComponent />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/enhanced" component={EnhancedHome} />
              <Route path="/landing" component={LandingPage} />
              <Route path="/landing-new" component={LandingPageNew} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/profile" component={Profile} />
              <Route path="/forum" component={Forum} />
              <Route path="/forum/:subreddit" component={Forum} />
              <Route path="/auth/:type" component={Auth} />
              <Route path="/python-integration" component={PythonIntegrationPage} />
              <Route path="/health-coach" component={HealthCoach} />
              <Route path="/connections" component={Connections} />
              <Route path="/family" component={Family} />
              <Route path="/family-tree" component={FamilyTreePage} />
              <Route path="/messenger" component={MessengerPage} />
              <Route path="/shop" component={Shop} />
              <Route path="/nutrition" component={NutritionPage} />
              <Route path="/longevity" component={LongevityPage} />
              <Route path="/metabolic" component={MetabolicHealthPage} />
              <Route path="/integrations" component={IntegrationsPage} />
              <Route path="/integrations/callback/:service" component={OAuthCallbackPage} />
              <Route path="/thank-you" component={ThankYouPage} />
              <Route path="/ai-intelligence" component={AIIntelligencePage} />
              <Route path="/privacy-policy" component={PrivacyPolicyPage} />
              <Route path="/settings/privacy" component={PrivacySettingsPage} />
              <Route path="/changelog" component={ChangelogPage} />
              <Route path="/feature-voting" component={FeatureVotingPage} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </div>
      </main>
      
      {!hideNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <Router />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
