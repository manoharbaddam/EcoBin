import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  isAnonymous: boolean;
  loading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAnonymous: false,
  loading: true,
  setUser: (user) =>
    set({ user, isAnonymous: user?.isAnonymous ?? false }),
  setLoading: (loading) => set({ loading }),
}));
