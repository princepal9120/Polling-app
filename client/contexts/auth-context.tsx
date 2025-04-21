"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {

    const storedUser = localStorage.getItem("pollUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("pollUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string) => {
    try {
      setIsLoading(true);
      const user = await loginUser(username);

      // Save user to localStorage
      localStorage.setItem("pollUser", JSON.stringify(user));
      setUser(user);

      toast({
        title: "Success",
        description: `Welcome, ${username}!`,
        variant: "default",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        setIsLoading(true);
        await logoutUser(user.id);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description:
          error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    } finally {
      localStorage.removeItem("pollUser");
      setUser(null);
      setIsLoading(false);
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
        variant: "default",
      });
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
