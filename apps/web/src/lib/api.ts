import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiFetch(path: string, options: RequestInit = {}) {
  // get current session token (from localStorage)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "API request failed");
  }

  return response.json();
}
