import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Camera,
  GanttChart,
  MessageSquare,
  Settings,
  Users,
  Package,
  Activity,
} from "lucide-react";
import { NavItem } from "@/types/navigation";
import { RoleCategory } from "@/types/user";

const clientNav: NavItem[] = [
  { title: "דשבורד", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "משימות", url: "/app/tasks", icon: CheckSquare, comingSoon: true },
  { title: "יומן אירועים", url: "/app/calendar", icon: Calendar, comingSoon: true },
  { title: "דוחות", url: "/app/reports", icon: BarChart3, comingSoon: true },
  { title: "ניהול תכנים וימי צילום", url: "/app/shoot-days", icon: Camera, comingSoon: true },
  { title: "גאנט תוכן", url: "/app/content-calendar", icon: GanttChart, comingSoon: true },
  { title: "פניות לצוות", url: "/app/tickets", icon: MessageSquare, comingSoon: true },
  { title: "הגדרות", url: "/app/settings", icon: Settings },
];

const teamNav: NavItem[] = [
  { title: "דשבורד", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "משימות", url: "/app/tasks", icon: CheckSquare, comingSoon: true },
  { title: "יומן אירועים", url: "/app/calendar", icon: Calendar, comingSoon: true },
  { title: "דוחות", url: "/app/reports", icon: BarChart3, comingSoon: true },
  { title: "ניהול תכנים וימי צילום", url: "/app/shoot-days", icon: Camera, comingSoon: true },
  { title: "גאנט תוכן", url: "/app/content-calendar", icon: GanttChart, comingSoon: true },
  { title: "פניות מלקוחות", url: "/app/tickets", icon: MessageSquare, comingSoon: true },
  { title: "הגדרות", url: "/app/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { title: "דשבורד לקוחות", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "לקוחות פעילים", url: "/app/clients", icon: Users, comingSoon: true },
  { title: "בניית מוצרים וטיים ליינים", url: "/app/products", icon: Package, comingSoon: true },
  { title: "מדדי צוות", url: "/app/team-metrics", icon: Activity, comingSoon: true },
  { title: "משימות", url: "/app/tasks", icon: CheckSquare, comingSoon: true },
  { title: "יומן אירועים", url: "/app/calendar", icon: Calendar, comingSoon: true },
  { title: "פניות מלקוחות", url: "/app/tickets", icon: MessageSquare, comingSoon: true },
  { title: "הגדרות", url: "/app/settings", icon: Settings },
];

export function getNavigation(category: RoleCategory): NavItem[] {
  switch (category) {
    case "admin":
      return adminNav;
    case "client":
      return clientNav;
    case "team":
      return teamNav;
  }
}
