import { supabase } from "./supabaseClient";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Auth error:", error.message);
    return null;
  }

  return data.user;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}