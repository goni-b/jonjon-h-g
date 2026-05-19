import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getNavigation } from "@/data/navigation";
import { getRoleCategory } from "@/types/user";
import { LogOut, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const category = getRoleCategory(user.role);
  const navItems = getNavigation(category);

  return (
    <aside
      className={`h-screen bg-sidebar border-l border-sidebar-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-sidebar-border overflow-hidden shrink-0">
        <div className={`transition-all duration-300 ${collapsed ? "mx-auto" : "scale-90 origin-right"}`}>
          <Logo iconOnly={collapsed} />
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? (
              <ChevronLeft className="w-4 h-4 text-sidebar-foreground/60" />
            ) : (
              <ChevronRight className="w-4 h-4 text-sidebar-foreground/60" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;

            return (
              <li key={item.url}>
                <NavLink
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>התנתקות</span>}
        </button>
      </div>
    </aside>
  );
}
