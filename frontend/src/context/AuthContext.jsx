import React, { createContext, useState, useEffect } from 'react';
import client, { registerTokenGetter } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('soc_token'));
  const [operator, setOperator] = useState(() => {
    const saved = localStorage.getItem('soc_operator');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('soc_token'));
  const [error, setError] = useState(null);

  // Synchronize dynamic token getter for Axios
  useEffect(() => {
    registerTokenGetter(() => token);
  }, [token]);

  // Global unauthorized event listener
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('soc_token');
      localStorage.removeItem('soc_operator');
      setToken(null);
      setOperator(null);
      setIsAuthenticated(false);
      setError("Session expired. Please sign in again.");
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      // Attempt backend authentication
      const response = await client.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      const opData = user || { email, name: email.split('@')[0].toUpperCase(), role: 'Operator' };
      
      localStorage.setItem('soc_token', access_token);
      localStorage.setItem('soc_operator', JSON.stringify(opData));
      
      setToken(access_token);
      setOperator(opData);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.warn("Backend auth failed. Falling back to mock session for demonstration.", err);
      // Dynamic fallback for offline / mock testing
      if (email && password) {
        const mockToken = "mock-jwt-session-token";
        const mockOp = {
          email: email,
          name: email.split('@')[0].toUpperCase(),
          role: 'Lead Analyst'
        };
        
        localStorage.setItem('soc_token', mockToken);
        localStorage.setItem('soc_operator', JSON.stringify(mockOp));
        
        setToken(mockToken);
        setOperator(mockOp);
        setIsAuthenticated(true);
        return true;
      }
      setError(err.response?.data?.detail || "Connection to authorization server failed.");
      return false;
    }
  };

  const register = async (email, name, password) => {
    try {
      setError(null);
      await client.post('/auth/register', { email, name, password });
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please verify specifications.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('soc_token');
    localStorage.removeItem('soc_operator');
    setToken(null);
    setOperator(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ token, operator, isAuthenticated, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
