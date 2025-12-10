import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrentUser } from '../types';

/**
 * @interface AuthContextType
 * @description Represents the shape of the authentication context.
 * @property {CurrentUser | null} user The current user.
 * @property {(id: number, name: string, clientId: string, role?: string) => void} login Logs in a user.
 * @property {() => void} logout Logs out the current user.
 * @property {boolean} isAuthenticated Whether the user is authenticated.
 * @property {boolean} isAdmin Whether the user is an admin.
 */
interface AuthContextType {
  user: CurrentUser | null;
  login: (id: number, name:string, clientId: string, role?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @component AuthProvider
 * @description Provides authentication context to its children.
 * @param {{ children: ReactNode }} props The component's props.
 * @returns {JSX.Element} The rendered component.
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
   * Logs in a user.
   * @param {number} id The user's ID.
   * @param {string} name The user's name.
   * @param {string} clientId The user's client ID.
   * @param {string} [role] The user's role.
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
   * Logs out the current user.
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
 * @hook useAuth
 * @description A custom hook for accessing the authentication context.
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