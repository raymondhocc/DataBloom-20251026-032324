import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthContextProvider } from "@/lib/auth.tsx";
import { useAuth } from "@/hooks/use-auth";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { UploadPage } from "@/pages/UploadPage";
import { ChatPage } from "@/pages/ChatPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Toaster } from "@/components/ui/sonner";
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/upload", element: <UploadPage /> },
      { path: "/chat", element: <ChatPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
function App() {
  return (
    <AuthContextProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthContextProvider>
  );
}
export default App;