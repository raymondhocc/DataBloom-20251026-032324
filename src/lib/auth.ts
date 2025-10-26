import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
interface User {
  name: string;
  email: string;
}
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedUser = localStorage.getItem('user');
      if (storedAuth === 'true' && storedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    }
  }, []);
  const login = (email: string) => {
    const mockUser = { name: 'Illustrator', email };
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsAuthenticated(true);
    setUser(mockUser);
    navigate('/dashboard');
  };
  const signup = (name: string, email: string) => {
    const mockUser = { name, email };
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsAuthenticated(true);
    setUser(mockUser);
    navigate('/dashboard');
  };
  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};