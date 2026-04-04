import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed');

  return {
    id: data.user.id,
    email: data.user.email || '',
  };
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign in failed');

  return {
    id: data.user.id,
    email: data.user.email || '',
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email || '',
  };
}

export async function onAuthStateChange(
  callback: (user: AuthUser | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
      });
    } else {
      callback(null);
    }
  });

  return data.subscription;
}
