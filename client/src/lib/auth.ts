import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, InsertUser } from "@shared/schema";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { getAuthToken } from "./utils";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  register: (userData: InsertUser) => Promise<User>;
  updateUser: (userData: Partial<User>) => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch user data
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If token is invalid, clear it
          localStorage.removeItem("auth_token");
        }
      } catch (err) {
        setError("Failed to authenticate user");
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting login with username:", username);
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });

      const data = await response.json();
      console.log("Login successful:", data);
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: InsertUser): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest("PATCH", "/api/user/profile", userData);
      const updatedUser = await response.json();
      
      // Update the user state with the new information
      setUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
      
      // Invalidate user profile query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      const updated = await response.json();
      setUser(updated);
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Update failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    // Clear relevant queries
    queryClient.invalidateQueries();
  };

  const value = {
    user,
    login,
    register,
    updateUser,
    updateProfile,
    logout,
    isLoading,
    error,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};