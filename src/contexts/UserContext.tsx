import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, User, LoginCredentials } from '@/services/authService';

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored user and refresh auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = AuthService.getStoredUser();
        if (storedUser && AuthService.isAuthenticated()) {
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Try to refresh user data from server
          try {
            await AuthService.getCurrentUser();
            const refreshedUser = AuthService.getStoredUser();
            if (refreshedUser) {
              setUser(refreshedUser);
            }
          } catch (error) {
            console.error('Failed to refresh user data:', error);
            // Keep using stored user data if refresh fails
          }
        } else {
          // Clean up if not authenticated
          AuthService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      const credentials: LoginCredentials = { email, password };
      const response = await AuthService.login(credentials);
      
      if (response.success && response.data?.user) {
        const loggedInUser = response.data.user;
        setUser(loggedInUser);
        setIsAuthenticated(true);
        return loggedInUser;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      AuthService.updateStoredUser(userData);
      setUser(updatedUser);
    }
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      await AuthService.getCurrentUser();
      const refreshedUser = AuthService.getStoredUser();
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout the user
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser, isLoading, isAuthenticated, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 