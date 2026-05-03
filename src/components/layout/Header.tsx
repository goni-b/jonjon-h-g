import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { SearchInput } from "@/components/ui/SearchInput";
import { UserRole, roleLabels } from "@/types/user";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const allRoles: UserRole[] = [
  "admin", "team_manager", "client", "video_editor", "photographer",
  "content_writer", "social_manager", "campaign_manager", "automation_specialist", "office_manager",
];

export function Header({ pageTitle }: { pageTitle: string }) {
  const { user, switchRole } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Right side — page title */}
      <h2 className="text-lg font-semibold text-foreground">{pageTitle}</h2>

      {/* Left side — search, notifications, profile */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block w-64">
          <SearchInput />
        </div>

        <NotificationBell />

        {/* Profile & Role Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground">{roleLabels[user.role]}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-card rounded-lg shadow-card-hover border border-border py-2 z-50">
              <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border mb-1">
                החלפת תפקיד (פיתוח)
              </div>
              {allRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setShowRoleSwitcher(false);
                  }}
                  className={`w-full text-right px-3 py-2 text-sm transition-colors ${
                    user.role === role
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
