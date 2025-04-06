import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";

import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Forum from "@/pages/forum";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import PythonIntegrationPage from "@/pages/python-integration";
import { HealthCoach } from "@/pages/health-coach";
import { Connections } from "@/pages/connections";
import { Family } from "@/pages/family";
import FamilyTreePage from "@/pages/family-tree";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

function Router() {
  const [location] = useLocation();
  
  // Check if we're on the auth page or landing page to hide navbar and footer
  const isAuthPage = location.startsWith("/auth");
  const isLandingPage = location === "/landing";
  const hideNavAndFooter = isAuthPage || isLandingPage;

  // Apply cleaner layout with improved spacing
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!hideNavAndFooter && <Navbar />}
      
      <main className="flex-grow py-8">
        <div className="clean-container">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/landing" component={LandingPage} />
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
            <Route component={NotFound} />
          </Switch>
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
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
