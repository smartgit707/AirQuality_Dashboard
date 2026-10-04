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
  // Synchronous session initialization to prevent race conditions & page flashes
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ecosense_user') || localStorage.getItem('ecosense_mock_user');
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });
  const [preferences, setPreferences] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Validate or refresh session in the background
  useEffect(() => {
    async function initAuth() {
      const storedToken = getAuthToken();
      if (!storedToken) return;

      try {
        const res = await apiGetMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('ecosense_user', JSON.stringify(res.user));
          setPreferences(res.preferences || null);
          setFavorites(res.favorites || []);
        }
      } catch (err) {
        console.warn('[Auth] Background session verification:', err.message);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success && res.user) {
      // Synchronously store user and token
      localStorage.setItem('ecosense_user', JSON.stringify(res.user));
      setUser(res.user);
      setToken(res.token);

      // Async background fetch of full preferences
      apiGetMe().then(meRes => {
        if (meRes && meRes.success) {
          if (meRes.user) {
            setUser(meRes.user);
            localStorage.setItem('ecosense_user', JSON.stringify(meRes.user));
          }
          if (meRes.preferences) setPreferences(meRes.preferences);
          if (meRes.favorites) setFavorites(meRes.favorites || []);
        }
      }).catch(() => {});

      return res;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (formData) => {
    const res = await apiRegister(formData);
    if (res.success && res.user) {
      localStorage.setItem('ecosense_user', JSON.stringify(res.user));
      setUser(res.user);
      setToken(res.token);

      apiGetMe().then(meRes => {
        if (meRes && meRes.success) {
          if (meRes.user) {
            setUser(meRes.user);
            localStorage.setItem('ecosense_user', JSON.stringify(meRes.user));
          }
          if (meRes.preferences) setPreferences(meRes.preferences);
          if (meRes.favorites) setFavorites(meRes.favorites || []);
        }
      }).catch(() => {});

      return res;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = () => {
    apiLogout();
    localStorage.removeItem('ecosense_user');
    localStorage.removeItem('ecosense_mock_user');
    setUser(null);
    setPreferences(null);
    setFavorites([]);
    setToken(null);
  };

  const refreshMe = async () => {
    try {
      const res = await apiGetMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('ecosense_user', JSON.stringify(res.user));
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
  const isAdmin = Boolean(user && (user.role === 'ADMIN' || (user.email && user.email.toLowerCase().includes('admin'))));

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
