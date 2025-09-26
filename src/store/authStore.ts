import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await apiFetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Login failed');
          }
          const data = await res.json();
          if (data?.token) {
            try { localStorage.setItem('token', data.token); } catch (_e) {}
          }
          const user: User = {
            id: data?.user?.id || data?.user?._id || 'me',
            email: data?.user?.email || email,
            name: data?.user?.name || email.split('@')[0],
            avatar: data?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.user?.name || email)}&background=6366f1&color=fff`,
          };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await apiFetch('/api/v1/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Signup failed');
          }
          const data = await res.json();
          if (data?.token) {
            try { localStorage.setItem('token', data.token); } catch (_e) {}
          }
          const user: User = {
            id: data?.user?.id || data?.user?._id || 'me',
            email: data?.user?.email || email,
            name: data?.user?.name || name,
            avatar: data?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          // Simulate Google OAuth
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const user: User = {
            id: '1',
            email: 'user@gmail.com',
            name: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff',
          };
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
); 