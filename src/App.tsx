import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Login from "@/pages/auth/Login";
import RegisterInvite from "@/pages/auth/RegisterInvite";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/app/Dashboard";
import Settings from "@/pages/app/Settings";
import PlaceholderPage from "@/pages/app/PlaceholderPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register-invite" element={<PublicRoute><RegisterInvite /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected app routes */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="tasks" element={<PlaceholderPage title="משימות" />} />
              <Route path="calendar" element={<PlaceholderPage title="יומן אירועים" />} />
              <Route path="reports" element={<PlaceholderPage title="דוחות" />} />
              <Route path="shoot-days" element={<PlaceholderPage title="ניהול תכנים וימי צילום" />} />
              <Route path="content-calendar" element={<PlaceholderPage title="גאנט תוכן" />} />
              <Route path="tickets" element={<PlaceholderPage title="פניות" />} />
              <Route path="clients" element={<PlaceholderPage title="לקוחות פעילים" />} />
              <Route path="products" element={<PlaceholderPage title="בניית מוצרים וטיים ליינים" />} />
              <Route path="team-metrics" element={<PlaceholderPage title="מדדי צוות" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
