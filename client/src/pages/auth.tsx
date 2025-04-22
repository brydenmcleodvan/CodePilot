import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRoute, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema } from "@shared/schema";

// Extended schemas with validation
const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const [, params] = useRoute('/auth/:type');
  const [location, setLocation] = useLocation();
  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");

  // Update auth type based on route
  useEffect(() => {
    if (params && (params.type === "login" || params.type === "register")) {
      setAuthType(params.type);
    }
  }, [params]);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      profilePicture: "",
      healthData: ""
    }
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values.username, values.password);
      toast({
        title: "Login successful",
        description: "Welcome back to Healthmap!"
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...userData } = values;
      
      // Default profile picture if none provided
      if (!userData.profilePicture) {
        userData.profilePicture = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
      }
      
      // Initialize empty health data
      userData.healthData = JSON.stringify({});
      
      await register(userData);
      toast({
        title: "Registration successful",
        description: "Welcome to Healthmap!"
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthType = () => {
    const newType = authType === "login" ? "register" : "login";
    setAuthType(newType);
    setLocation(`/auth/${newType}`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Illustration/Image side */}
      <div className="hidden md:flex md:w-1/2 bg-primary/10 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40 z-10"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-repeat opacity-10 z-10" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full p-12 text-white">
          <div className="mb-6">
            <i className="ri-heart-pulse-line text-white text-6xl"></i>
          </div>
          <h2 className="text-3xl font-heading font-bold mb-4 text-center">Welcome to Healthmap</h2>
          <p className="text-xl mb-8 text-center max-w-md">
            Your comprehensive health tracking and wellness platform for a better, healthier life
          </p>
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <i className="ri-heart-pulse-line text-white text-2xl mb-2"></i>
              <h3 className="font-medium mb-1">Health Tracking</h3>
              <p className="text-sm opacity-80">Monitor all your vital health metrics in one place</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <i className="ri-mental-health-line text-white text-2xl mb-2"></i>
              <h3 className="font-medium mb-1">Mental Wellness</h3>
              <p className="text-sm opacity-80">Track your mood and mental health journey</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <i className="ri-calendar-line text-white text-2xl mb-2"></i>
              <h3 className="font-medium mb-1">Appointment Management</h3>
              <p className="text-sm opacity-80">Never miss an important health appointment</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <i className="ri-user-heart-line text-white text-2xl mb-2"></i>
              <h3 className="font-medium mb-1">Family Health</h3>
              <p className="text-sm opacity-80">Keep your family's health information organized</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <i className="ri-heart-pulse-line text-primary text-3xl"></i>
              <h1 className="text-2xl font-heading font-bold text-gray-800 dark:text-white">Healthmap</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Your unified health and wellness platform</p>
          </div>

          <Card className="border dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle>
                {authType === "login" ? "Sign in to your account" : "Create a new account"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {authType === "login" ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {authType === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <Button variant="link" className="p-0" onClick={toggleAuthType}>
                    {authType === "login" ? "Sign up" : "Sign in"}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;