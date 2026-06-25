import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback((userData, accessToken, refreshToken) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
    return data.data.user;
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    clearAuth();
  };

  const refreshUser = async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch {
      clearAuth();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshUser,
        setAuth,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
