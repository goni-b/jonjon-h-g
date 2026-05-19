import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AppNotification {
  id: string;
  toUserId: string;
  fromUserId: string;
  fromUserName: string;
  type: "mention" | "update" | "task_assigned";
  taskId: string;
  taskTitle: string;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO string
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "isRead">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Seed a few demo notifications so the bell shows life on first load
const INITIAL: AppNotification[] = [
  {
    id: "n0",
    toUserId: "1",
    fromUserId: "4",
    fromUserName: "עורך וידיאו",
    type: "mention",
    taskId: "t1",
    taskTitle: "עריכת סרטון לרילס אינסטגרם",
    message: "תייג אותך בעדכון: \"הגרסה הראשונה מוכנה — שלחתי לינק ב-Dropbox\"",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "n1",
    toUserId: "1",
    fromUserId: "8",
    fromUserName: "קמפיינר",
    type: "update",
    taskId: "t3",
    taskTitle: "הגשת קמפיין גוגל לאישור",
    message: "הוסיף עדכון חדש למשימה",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "n2",
    toUserId: "1",
    fromUserId: "9",
    fromUserName: "איש מערכות",
    type: "mention",
    taskId: "t6",
    taskTitle: "בניית משפך שיווקי — ליד מגנט",
    message: "תייג אותך בעדכון על המשימה",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = (n: Omit<AppNotification, "id" | "createdAt" | "isRead">) => {
    const newN: AppNotification = {
      ...n,
      id: `n${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newN, ...prev]);
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationsProvider");
  return ctx;
}
