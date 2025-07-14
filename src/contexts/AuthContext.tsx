"use client";

import { createContext, useContext, ReactNode } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

interface AuthContextProps {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: typeof signIn;
  signOut: typeof signOut;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  return (
    <AuthContext.Provider value={{ session, status, signIn, signOut }}>
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

// Usage: Wrap your app with <SessionProvider><AuthProvider>...</AuthProvider></SessionProvider>
export { SessionProvider }; 