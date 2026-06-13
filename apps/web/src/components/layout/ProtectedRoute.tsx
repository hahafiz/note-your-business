// block unauthenticated users
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // still checking session - render nothing
  if (loading) return <div>Loading...</div>;

  // not logged in - kick to login
  if (!user) return <Navigate to="/login" replace />;

  // logged in - render page
  return <>{children}</>;
}
