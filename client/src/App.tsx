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
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

function Router() {
  const [location] = useLocation();
  
  // Check if we're on the auth page or landing page to hide navbar and footer
  const isAuthPage = location.startsWith("/auth");
  const isLandingPage = location === "/landing";
  const hideNavAndFooter = isAuthPage || isLandingPage;

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavAndFooter && <Navbar />}
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/landing" component={LandingPage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/forum" component={Forum} />
          <Route path="/forum/:subreddit" component={Forum} />
          <Route path="/auth/:type" component={Auth} />
          <Route component={NotFound} />
        </Switch>
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
