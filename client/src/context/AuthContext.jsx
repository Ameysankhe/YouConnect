import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get('http://localhost:4000/auth/status', { withCredentials: true });
        setIsAuthenticated(res.data.loggedIn);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
