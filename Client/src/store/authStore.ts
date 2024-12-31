import { create } from 'zustand';
import { User } from '../types/auth';

interface AuthState {
  user: (User & { impersonating?: boolean }) | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  switchOrganization: (org: { id: string; name: string; role: 'orgadmin' }) => void;
  resetRole: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:  JSON.parse((localStorage.getItem('auth')) ?? '{}').result || null,
  isAuthenticated: !!localStorage.getItem('auth'),
  login: (user) => { 
    set({ user, isAuthenticated: true })
    // localStorage.setItem('token',user)
  },
  logout: () => {
    localStorage.removeItem('auth');
    // localStorage.removeItem('userKey');
    set({ user: null, isAuthenticated: false });
  },
  switchOrganization: (org) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const impersonatedUser = {
      ...currentUser,
      role: org.role,
      organization: org.name,
      originalRole: currentUser.role,
      impersonating: true,
    };

    set({ user: impersonatedUser });
  },
  resetRole: () => {
    const currentUser = get().user;
    if (!currentUser?.impersonating) return;

    const originalUser = {
      ...currentUser,
      role: currentUser.originalRole,
      organization: undefined,
      originalRole: undefined,
      impersonating: false,
    };

    set({ user: originalUser });
  },
}));