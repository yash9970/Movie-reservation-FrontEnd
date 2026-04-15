import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as storage from '../utils/storage';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const storedToken = storage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = storage.getItem(STORAGE_KEYS.USER);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = useCallback((authResponse) => {
    const jwt = authResponse.token;

    const userData = {
      id: authResponse.userId,
      email: authResponse.email,
      role: authResponse.role,
    };

    storage.setItem(STORAGE_KEYS.TOKEN, jwt);
    storage.setItem(STORAGE_KEYS.USER, userData);

    setToken(jwt);
    setUser(userData);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    storage.clear();
    setUser(null);
    setToken(null);
  }, []);

  // Computed property for authentication status
  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
