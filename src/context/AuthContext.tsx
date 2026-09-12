import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthChangeEvent, User, Session  } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  currentUser: User | null;
  authChecked: boolean;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setAuthChecked(true);
    };
    fetchCurrentSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          return;
        }
        setCurrentUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, authChecked, isPasswordRecovery, setIsPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}