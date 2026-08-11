import { create } from 'zustand';
import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  lookingFor: string;
  bio?: string;
  occupation?: string;
  education?: string;
  location?: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
  photos: { id: string; url: string; isMain: boolean; order: number }[];
  interests: { interest: { id: string; name: string; emoji?: string } }[];
  lastSeen: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  lookingFor: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('mapenzi_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('mapenzi_token', data.token);
      set({ user: data.user, token: data.token });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('mapenzi_token', data.token);
      set({ user: data.user, token: data.token });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('mapenzi_token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch {
      localStorage.removeItem('mapenzi_token');
      set({ user: null, token: null });
    }
  },

  updateUser: (data) => {
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
  },
}));
