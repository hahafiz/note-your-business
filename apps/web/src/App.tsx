import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import EditNotePage from "./pages/notes/EditNotePage";
import CreateNotePage from "./pages/notes/CreateNotePage";
import ProtectedRoute from "./components/layout/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notes/new",
    element: (
      <ProtectedRoute>
        <CreateNotePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notes/:id",
    element: (
      <ProtectedRoute>
        <EditNotePage />
      </ProtectedRoute>
    ),
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
