import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChange, AuthUser } from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    }).then((subscription) => {
      unsubscribe = () => subscription?.unsubscribe();
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
