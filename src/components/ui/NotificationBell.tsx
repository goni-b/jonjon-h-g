import { Bell, CheckCheck, AtSign, RefreshCw } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, AppNotification } from "@/contexts/NotificationsContext";
import { UserAvatar } from "@/components/ui/UserAvatar";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return "עכשיו";
  if (diff < 3600)  return `לפני ${Math.floor(diff / 60)} דק׳`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שע׳`;
  return `לפני ${Math.floor(diff / 86400)} ימים`;
}

const typeIcon: Record<AppNotification["type"], React.ReactNode> = {
  mention:      <AtSign   className="w-3 h-3 text-primary" />,
  update:       <RefreshCw className="w-3 h-3 text-blue-500" />,
  task_assigned:<Bell     className="w-3 h-3 text-orange-500" />,
};

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleClickNotification = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    // Navigate to the task and open it via URL param
    navigate(`/app/tasks?open=${n.taskId}&reply=true`);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="התראות"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full
            text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          dir="rtl"
          className="absolute left-0 top-full mt-2 w-[340px] bg-card rounded-2xl shadow-xl
            border border-border z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-foreground" />
              <span className="font-semibold text-sm text-foreground">התראות</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                סמן הכל כנקרא
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">אין התראות</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-muted/60
                    transition-colors text-right group
                    ${!n.isRead ? "bg-primary/5" : ""}`}
                >
                  {/* Avatar + icon badge */}
                  <div className="relative shrink-0 mt-0.5">
                    <UserAvatar name={n.fromUserName} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 bg-card rounded-full p-0.5 shadow-sm">
                      {typeIcon[n.type]}
                    </span>
                    {!n.isRead && (
                      <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs leading-snug text-foreground">
                      <span className="font-semibold">{n.fromUserName}</span>{" "}
                      {n.type === "mention" ? "תייג אותך ב" : n.type === "update" ? "עדכן את" : "שייך אותך ל"}{" "}
                      <span className="font-medium text-primary">{n.taskTitle}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span className="text-muted-foreground/30 group-hover:text-primary transition-colors text-xs mt-1 shrink-0">
                    ←
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
