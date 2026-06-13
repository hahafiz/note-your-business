import { createContext } from "react";
import type { AuthContextType } from "../types/auth";

// 1. create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
