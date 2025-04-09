import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userAPI } from "@/lib/api";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  company_logo?: string;
  role: "employer" | "admin";
  title?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  profileCompleted?: boolean;
  profileProgress?: number;
  is_profile_complete?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, companyName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updateProfileProgress: (progress: number) => Promise<void>;
  checkProfileCompletion: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // If token is invalid, try to refresh
          try {
            await authAPI.refreshToken();
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
          } catch (refreshError) {
            // If refresh fails, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data?.detail) {
        if (error.response.status === 401) {
          throw new Error('Invalid email or password');
        }
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to login. Please try again.');
    }
  };

  const updateProfileProgress = async (progress: number) => {
    if (!user) return;
    
    try {
      // Update backend
      await userAPI.updateProfile({
        profileProgress: progress,
        is_profile_complete: progress === 100
      });

      // Update local state
      const updatedUser = { 
        ...user, 
        profileProgress: progress,
        profileCompleted: progress === 100,
        is_profile_complete: progress === 100
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Profile progress update failed:", error);
      throw error;
    }
  };

  // Check if profile is complete
  const checkProfileCompletion = () => {
    if (!user) return false;
    return user.profileCompleted === true || 
           user.profileProgress === 100 || 
           user.is_profile_complete === true;
  };


  const signup = async (email: string, password: string, name: string, companyName: string) => {
    try {
      // Basic validation
      if (!email || !password || !name || !companyName) {
        throw new Error('All fields are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await authAPI.register({
        email,
        password,
        name,
        companyName,
        is_profile_complete: false,
      });
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      // Handle validation errors
      if (error.message) {
        throw new Error(error.message);
      }
      // Handle API errors
      if (error.response?.data?.detail) {
        if (error.response.data.detail === 'Email already registered') {
          throw new Error('This email is already registered. Please use a different email or try logging in.');
        }
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to create account');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      // Even if the logout API call fails, we still want to clear the local state
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await userAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateUserProfile,
        updateProfileProgress,
        checkProfileCompletion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
