import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// 3. custom hook - how any component accesses auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
