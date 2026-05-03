import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getNavigation } from "@/data/navigation";
import { getRoleCategory } from "@/types/user";
import { LogOut, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const category = getRoleCategory(user.role);
  const navItems = getNavigation(category);

  return (
    <aside
      className={`h-screen bg-card border-l border-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <span className="text-xl font-bold text-foreground tracking-tight">JONJON</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;

            if (item.comingSoon) {
              return (
                <li key={item.url}>
                  <NavLink
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </li>
              );
            }

            return (
              <li key={item.url}>
                <NavLink
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>התנתקות</span>}
        </button>
      </div>
    </aside>
  );
}
