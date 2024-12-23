import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);


export const useAuth = () => {
  return useContext(AuthContext); // Return context values when using the hook
};

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => {
    const token = localStorage.getItem('authToken');
    console.log('[AuthProvider] Initial token from localStorage:', token); // Debug log
    return token || null; // Ensure null if no token exists
  });

  useEffect(() => {
    if (authToken) {
      console.log('[AuthProvider] Storing token in localStorage:', authToken); // Debug log
      localStorage.setItem('authToken', authToken);
    } else {
      console.log('[AuthProvider] Removing token from localStorage'); // Debug log
      localStorage.removeItem('authToken');
    }
  }, [authToken]);

  const login = (token) => {
    console.log('[AuthProvider] Logging in with token:', token); // Debug log
    setAuthToken(token); // Update the state with the new token
  };

  const logout = () => {
    console.log('[AuthProvider] Logging out'); // Debug log
    setAuthToken(null); // Clear the state and remove the token
  };

  const isAuthenticated = Boolean(authToken);

  return (
    <AuthContext.Provider value={{ authToken, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};




























