import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { NotificationProvider } from "@/lib/notifications";
import SystemAlerts from "@/components/system-alerts";

import Home from "@/pages/home";
import Profile from "@/pages/profile";
import ProfileEdit from "@/pages/profile-edit";
import Forum from "@/pages/forum";
import MessagesPage from "@/pages/messages";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

function Router() {
  const [location] = useLocation();
  
  // Check if we're on the auth page to hide navbar and footer
  const isAuthPage = location.startsWith("/auth");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <SystemAlerts />}
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/profile/edit" component={ProfileEdit} />
          <Route path="/forum" component={Forum} />
          <Route path="/forum/:subreddit" component={Forum} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/auth/:type" component={Auth} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
