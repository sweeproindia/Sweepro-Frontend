import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserStatus } from '@/types/user';

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Sample users for demonstration
const sampleUsers: User[] = [
  {
    id: '1',
    email: 'active@example.com',
    name: 'John Active',
    status: 'active',
    subscription: {
      id: 'sub_1',
      planName: 'Standard',
      planType: 'Standard',
      price: 3499,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      autoRenewal: true,
      nextBillingDate: '2024-12-15'
    },
    profile: {
      name: 'John Active',
      location: 'Mumbai',
      pincode: '400001',
      services: ['Regular Cleaning', 'Deep Cleaning'],
      phoneNumber: '+91 9876543210'
    }
  },
  {
    id: '2',
    email: 'inactive@example.com',
    name: 'Jane Inactive',
    status: 'inactive',
    profile: {
      name: 'Jane Inactive',
      location: 'Delhi',
      pincode: '110001',
      services: [],
      phoneNumber: '+91 9876543211'
    }
  },
  {
    id: '3',
    email: 'pending@example.com',
    name: 'Bob Pending',
    status: 'pending',
    subscription: {
      id: 'sub_2',
      planName: 'Premium',
      planType: 'Premium',
      price: 5999,
      startDate: '2024-01-01',
      endDate: '2024-11-30',
      isActive: false,
      autoRenewal: false,
      nextBillingDate: '2024-11-30'
    },
    profile: {
      name: 'Bob Pending',
      location: 'Bangalore',
      pincode: '560001',
      services: ['Regular Cleaning', 'Deep Cleaning', 'Laundry'],
      phoneNumber: '+91 9876543212'
    }
  }
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email (in real app, this would be an API call)
    const foundUser = sampleUsers.find(u => u.email === email);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(foundUser));
    setUser(foundUser);
    setIsLoading(false);
    
    return foundUser;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
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