/**
 * @file This file provides authentication context for the application, including the AuthProvider component and the useAuth hook.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrentUser } from '../types';

/**
 * Defines the shape of the authentication context.
 */
interface AuthContextType {
  /** The current user object, or null if not logged in. */
  user: CurrentUser | null;
  /** Function to log in a user. */
  login: (id: number, name: string, clientId: string, role?: string) => void;
  /** Function to log out the current user. */
  logout: () => void;
  /** Boolean indicating if a user is authenticated. */
  isAuthenticated: boolean;
  /** Boolean indicating if the current user is an admin. */
  isAdmin: boolean;
}

/**
 * React context for authentication.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state to its children components.
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to render.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('vtg_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /**
   * Logs in a user and stores their information in state and local storage.
   * @param {number} id - The user's ID.
   * @param {string} name - The user's name.
   * @param {string} clientId - The user's client ID.
   * @param {string} [role] - The user's role.
   */
  const login = (id: number, name: string, clientId: string, role?: string) => {
    // Determine Admin status:
    // 1. Explicit role from backend
    // 2. Fallback check on clientId
    const isAdmin = role === 'admin' || role === 'ADMIN' || clientId === 'admin'; 
    
    const newUser: CurrentUser = { 
      id, 
      name, 
      is_admin: isAdmin,
      role: role || (isAdmin ? 'ADMIN' : 'USER')
    };
    setUser(newUser);
    localStorage.setItem('vtg_user', JSON.stringify(newUser));
  };

  /**
   * Logs out the current user and removes their information from state and local storage.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('vtg_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isAdmin: !!user?.is_admin }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for accessing the authentication context.
 * @returns {AuthContextType} The authentication context.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};