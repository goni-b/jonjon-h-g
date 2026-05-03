import { Bell } from "lucide-react";
import { useState } from "react";

export function NotificationBell() {
  const [count] = useState(3);

  return (
    <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
      <Bell className="w-5 h-5 text-muted-foreground" />
      {count > 0 && (
        <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
