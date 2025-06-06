'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          next: { revalidate: 60 } // Cache for 60 seconds
        });
        const data = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store' // Don't cache POST requests
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Fetch user data after successful login
      const userResponse = await fetch('/api/auth/session', {
        next: { revalidate: 60 } // Cache for 60 seconds
      });
      const userData = await userResponse.json();
      
      if (userData.success && userData.user) {
        setUser(userData.user);
      }
      
      return data.session;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, name) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        cache: 'no-store' // Don't cache POST requests
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Auto login after registration
      return await login(email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
        cache: 'no-store' // Don't cache DELETE requests
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.warn('Logout API failed:', data.error);
      }
      
      // Always clear user state regardless of API response
      setUser(null);
      
      // Optional: Redirect to login page
      // window.location.href = '/auth/login';
      
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
      // Still clear user state on error
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};