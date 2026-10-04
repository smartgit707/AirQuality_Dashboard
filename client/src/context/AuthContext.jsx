import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  apiLogout,
  getAuthToken,
  apiAddUserFavorite,
  apiRemoveUserFavorite,
  apiUpdateUserPreferences
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  // Load session from stored JWT on startup
  useEffect(() => {
    async function initAuth() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiGetMe();
        if (res.success && res.user) {
          setUser(res.user);
          setPreferences(res.preferences || null);
          setFavorites(res.favorites || []);
        } else {
          // Token invalid
          apiLogout();
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('[Auth] Session validation failed:', err.message);
        apiLogout();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      // Fetch full profile (preferences & favorites)
      try {
        const meRes = await apiGetMe();
        if (meRes.success) {
          setPreferences(meRes.preferences);
          setFavorites(meRes.favorites || []);
        }
      } catch (_) {}
      return res;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (formData) => {
    const res = await apiRegister(formData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      try {
        const meRes = await apiGetMe();
        if (meRes.success) {
          setPreferences(meRes.preferences);
          setFavorites(meRes.favorites || []);
        }
      } catch (_) {}
      return res;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setPreferences(null);
    setFavorites([]);
    setToken(null);
  };

  const refreshMe = async () => {
    try {
      const res = await apiGetMe();
      if (res.success) {
        setUser(res.user);
        setPreferences(res.preferences);
        setFavorites(res.favorites || []);
      }
    } catch (err) {
      console.error('[Auth] Refresh user failed:', err);
    }
  };

  const addFavoriteCity = async (city) => {
    const res = await apiAddUserFavorite(city);
    if (res.success) {
      setFavorites(prev => {
        const exists = prev.find(c => c.toLowerCase() === city.toLowerCase());
        return exists ? prev : [...prev, city];
      });
    }
    return res;
  };

  const removeFavoriteCity = async (city) => {
    const res = await apiRemoveUserFavorite(city);
    if (res.success) {
      setFavorites(prev => prev.filter(c => c.toLowerCase() !== city.toLowerCase()));
    }
    return res;
  };

  const savePreferences = async (newPrefs) => {
    const res = await apiUpdateUserPreferences(newPrefs);
    if (res.success) {
      setPreferences(res.preferences);
    }
    return res;
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        favorites,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshMe,
        addFavoriteCity,
        removeFavoriteCity,
        savePreferences,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
