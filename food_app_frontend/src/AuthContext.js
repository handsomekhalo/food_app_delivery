import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext); // Access AuthContext
};

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => {
    const token = localStorage.getItem('authToken');
    return token || null; // Retrieve auth token from localStorage
  });

  const [csrfToken, setCSRFToken] = useState(() => {
    const token = localStorage.getItem('csrfToken');
    return token || null; // Retrieve CSRF token from localStorage
  });

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken); // Store auth token
    } else {
      localStorage.removeItem('authToken'); // Clear auth token
    }
  }, [authToken]);

  useEffect(() => {
    if (csrfToken) {
      localStorage.setItem('csrfToken', csrfToken); // Store CSRF token
    } else {
      localStorage.removeItem('csrfToken'); // Clear CSRF token
    }
  }, [csrfToken]);

  const login = (token, csrf) => {
    setAuthToken(token); // Store auth token
    setCSRFToken(csrf); // Store CSRF token
  };

  const logout = () => {
    setAuthToken(null); // Clear auth token
    setCSRFToken(null); // Clear CSRF token
  };

  const isAuthenticated = Boolean(authToken);

  return (
    <AuthContext.Provider value={{ authToken, csrfToken, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
