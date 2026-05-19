import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useLocation } from "react-router-dom";
import { GlobalSupportButton } from "./GlobalSupportButton";

const pageTitles: Record<string, string> = {
  "/app/dashboard": "דשבורד",
  "/app/settings": "הגדרות",
  "/app/tasks": "משימות",
  "/app/calendar": "יומן אירועים",
  "/app/reports": "דוחות",
  "/app/shoot-days": "ניהול תכנים וימי צילום",
  "/app/content-calendar": "גאנט תוכן",
  "/app/tickets": "פניות",
  "/app/clients": "לקוחות פעילים",
  "/app/products": "בניית מוצרים וטיים ליינים",
  "/app/team-metrics": "מדדי צוות",
};

export function AppLayout() {
  const { pathname } = useLocation();
  const pageTitle = pageTitles[pathname] || "JONJON";

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Sidebar on the right (RTL) */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header pageTitle={pageTitle} />
        <main className="flex-1 p-6 overflow-auto relative">
          <Outlet />
        </main>
      </div>

      {/* Global Support Button */}
      <GlobalSupportButton />
    </div>
  );
}
