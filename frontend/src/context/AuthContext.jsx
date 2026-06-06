import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/endpoints';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, check if user is logged in
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access, refresh, user: userData } = response.data.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success(`Welcome back, ${userData.username}!`);
      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.detail?.detail ||
        error.response?.data?.detail ||
        'Login failed. Please check your credentials.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };


  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      const data = error.response?.data;
      let errorMsg = 'Registration failed.';

      if (data) {
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey];
        if (Array.isArray(firstError)) {
          errorMsg = `${firstKey}: ${firstError[0]}`;
        } else if (typeof firstError === 'string') {
          errorMsg = firstError;
        }
      }

      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };


  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      
      if (refresh) {
        await authAPI.logout(refresh);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      toast.info('Logged out successfully.');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};