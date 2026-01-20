"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Zustand store for authentication state management
 * Provides robust state management with localStorage persistence
 * 
 * @example
 * // Basic usage - accessing user
 * const user = useAuthStore((state) => state.user);
 * 
 * @example
 * // Multiple selectors
 * const user = useAuthStore((state) => state.user);
 * const loading = useAuthStore((state) => state.loading);
 * 
 * @example
 * // Actions
 * const login = useAuthStore((state) => state.login);
 * const logout = useAuthStore((state) => state.logout);
 * 
 * Migration from Context API:
 * OLD: const { user, loading } = useAuth();
 * NEW: const user = useAuthStore((state) => state.user);
 *      const loading = useAuthStore((state) => state.loading);
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      loading: true,
      error: null,
      cacheExpiry: null,

      // Actions
      setUser: (user) => set({ user, error: null }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      /**
       * Validate session with server
       * Called automatically after rehydration to verify cached data
       */
      validateSession: async () => {
        try {
          // Check cache expiry
          const { cacheExpiry } = get();
          
          // Check if cache is still valid
          if (cacheExpiry && Date.now() < cacheExpiry) {
            set({ loading: false });
            return;
          }

          // Fetch fresh data from server
          const response = await fetch("/api/auth/user", {
            cache: "no-store",
          });
          const data = await response.json();

          if (data.success && data.user) {
            set({
              user: data.user,
              loading: false,
              error: null,
              cacheExpiry: Date.now() + 600000, // 10 minutes cache
            });
          } else {
            // No valid session
            set({
              user: null,
              loading: false,
              error: null,
              cacheExpiry: null,
            });
          }
        } catch (err) {
          console.error("Session check failed:", err);
          set({
            user: null,
            loading: false,
            error: err.message,
            cacheExpiry: null,
          });
        }
      },

      /**
       * Login user with email and password
       * @param {string} email - User email
       * @param {string} password - User password
       * @returns {Promise<Object>} Session data
       */
      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            cache: "no-store",
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Login failed");
          }

          // If MFA is required, don't fetch user data yet as the session is pending
          if (data.mfaRequired) {
            set({ loading: false });
            return data; // Return the whole object containing mfaRequired and tempSecret
          }

          // Fetch user data after successful verified login
          const userResponse = await fetch("/api/auth/user");
          const userData = await userResponse.json();

          if (userData.success && userData.user) {
            set({
              user: userData.user,
              loading: false,
              error: null,
              cacheExpiry: Date.now() + 600000,
            });
          }

          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      /**
       * Register a new user
       * @param {Object} authData - Registration data (email, password, name, etc.)
       * @returns {Promise<Object>} Session data
       */
      register: async (authData) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(authData),
            cache: "no-store",
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Registration failed");
          }

          // Auto login after registration
          const { login } = get();
          return await login(authData.email, authData.password);
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      /**
       * Logout user and clear session
       */
      logout: async () => {
        set({ loading: true, error: null });

        try {
          const response = await fetch("/api/auth/session", {
            method: "DELETE",
            cache: "no-store",
          });

          const data = await response.json();

          if (!data.success) {
            console.warn("Logout API failed:", data.error);
          }

          // Always clear user state regardless of API response
          set({
            user: null,
            loading: false,
            error: null,
            cacheExpiry: null,
          });
        } catch (err) {
          console.error("Logout error:", err);
          // Still clear user state on error
          set({
            user: null,
            loading: false,
            error: "Logout failed",
            cacheExpiry: null,
          });
        }
      },

      /**
       * Refresh user data from server
       * Useful for updating user info after profile changes
       */
      refreshUser: async () => {
        try {
          const response = await fetch("/api/auth/user", {
            cache: "no-store",
          });
          const data = await response.json();

          if (data.success && data.user) {
            set({
              user: data.user,
              error: null,
              cacheExpiry: Date.now() + 600000, // 10 minutes cache
            });
          }
        } catch (err) {
          console.error("Failed to refresh user data:", err);
          set({ error: err.message });
        }
      },

      /**
       * Clear error state
       */
      clearError: () => set({ error: null }),
    }),
    {
      name: "kdsm-auth-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user and cacheExpiry, not loading/error states
      partialize: (state) => ({
        user: state.user,
        cacheExpiry: state.cacheExpiry,
      }),
      // Validate session with server after rehydration
      onRehydrateStorage: () => (state) => {
        // After rehydration completes, validate the session
        if (state) {
          state.validateSession();
        }
      },
    }
  )
);

export default useAuthStore;
