import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { NotificationProvider } from "@/lib/notifications";
import SystemAlerts from "@/components/system-alerts";
import { ThemeProvider } from "@/components/theme-provider";
import { Loader2 } from "lucide-react";

// Core pages with immediate loading
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";

// Lazy loaded pages (heavier components)
const Profile = lazy(() => import("@/pages/profile"));
const ProfileEdit = lazy(() => import("@/pages/profile-edit"));
const Forum = lazy(() => import("@/pages/forum"));
const MessagesPage = lazy(() => import("@/pages/messages"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-background">
              <SystemAlerts />
              <Suspense fallback={<LoadingSpinner />}>
                <Switch>
                  <Route path="/" component={LandingPage} />
                  <Route path="/home" component={Home} />
                  <Route path="/auth" component={Auth} />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/admin" component={AdminDashboard} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/profile/edit" component={ProfileEdit} />
                  <Route path="/forum" component={Forum} />
                  <Route path="/messages" component={MessagesPage} />
                  <Route path="/python-integration" component={PythonIntegrationPage} />
                  <Route path="/health-coach" component={HealthCoach} />
                  <Route path="/connections" component={Connections} />
                  <Route path="/family" component={Family} />
                  <Route path="/family-tree" component={FamilyTreePage} />
                  <Route path="/nutrition" component={NutritionPage} />
                  <Route path="/messenger" component={MessengerPage} />
                  <Route path="/shop" component={Shop} />
                  <Route path="/longevity" component={LongevityPage} />
                  <Route path="/metabolic" component={MetabolicHealthPage} />
                  <Route path="/enhanced-home" component={EnhancedHome} />
                  <Route path="/integrations" component={IntegrationsPage} />
                  <Route path="/oauth-callback" component={OAuthCallbackPage} />
                  <Route path="/thank-you" component={ThankYouPage} />
                  <Route path="/ai-intelligence" component={AIIntelligencePage} />
                  <Route path="/privacy-policy" component={PrivacyPolicyPage} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
              <Toaster />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;