import type { User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}
