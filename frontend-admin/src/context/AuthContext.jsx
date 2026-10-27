import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const processToken = (token) => {
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      // Validar expiração (optional safety net no frontend)
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expirado');
      }
      setUser({ id: decoded.id, email: decoded.email, role: decoded.role });
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Sessão Inválida ou Expirada', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Sincronizar estado JWT global (ex: login/logout em abas paralelas)
  useEffect(() => {
    const handleStorageChange = () => {
      processToken(localStorage.getItem('token'));
    };
    
    // Initial validation
    processToken(localStorage.getItem('token'));
    setIsInitializing(false);

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    processToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    processToken(null);
    window.location.href = '/';
  };

  // Previne "flicker" protegendo re-renders se estiver verificando memória local
  if (isInitializing) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
