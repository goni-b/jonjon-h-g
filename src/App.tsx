import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";

import Login from "@/pages/auth/Login";
import RegisterInvite from "@/pages/auth/RegisterInvite";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/app/Dashboard";
import Settings from "@/pages/app/Settings";
import Tasks from "@/pages/app/Tasks";
import Tickets from "@/pages/app/Tickets";
import CalendarPage from "@/pages/app/CalendarPage";
import ShootDays from "@/pages/app/ShootDays";
import ContentCalendar from "@/pages/app/ContentCalendar";
import PlaceholderPage from "@/pages/app/PlaceholderPage";
import NotFound from "@/pages/NotFound";
import SharedScript from "@/pages/shared/SharedScript";

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
          <NotificationsProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register-invite" element={<PublicRoute><RegisterInvite /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/share/script/:id" element={<SharedScript />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected app routes */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="reports" element={<PlaceholderPage title="דוחות" />} />
              <Route path="shoot-days" element={<ShootDays />} />
              <Route path="content-calendar" element={<ContentCalendar />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="clients" element={<PlaceholderPage title="לקוחות פעילים" />} />
              <Route path="products" element={<PlaceholderPage title="בניית מוצרים וטיים ליינים" />} />
              <Route path="team-metrics" element={<PlaceholderPage title="מדדי צוות" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
