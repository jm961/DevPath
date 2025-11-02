import { getSupabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

/**
 * Get the current authenticated user from Supabase
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Get the current session from Supabase
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.auth.signOut();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}
