import { RoleCategory } from "@/types/user";
import { TrendingUp, CheckSquare, Calendar, FileText, Users, Camera, MessageSquare, BarChart3 } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface DashboardCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "accent" | "success" | "warning" | "info";
}

export interface DashboardConfig {
  title: string;
  description: string;
  cards: DashboardCard[];
}

const clientDashboard: DashboardConfig = {
  title: "שלום, ברוך הבא!",
  description: "זה יהיה הדשבורד הראשי שלך, כאן תוכל לראות את כל התהליך, המשימות והתכנים שלך.",
  cards: [
    { title: "התקדמות בתהליך", value: "40%", icon: TrendingUp, color: "accent" },
    { title: "משימות פתוחות", value: 3, icon: CheckSquare, color: "info" },
    { title: "אירוע הבא", value: "15.06", icon: Calendar, color: "success" },
    { title: "תכנים שמחכים לאישור", value: 2, icon: FileText, color: "warning" },
  ],
};

const teamDashboard: DashboardConfig = {
  title: "שלום, ברוך הבא!",
  description: "כאן יופיע כל מה שמחכה לטיפול שלך מול הלקוחות.",
  cards: [
    { title: "משימות פתוחות", value: 8, icon: CheckSquare, color: "info" },
    { title: "משימות שבוצעו", value: 12, icon: CheckSquare, color: "success" },
    { title: "האירוע הבא", value: "12.06", icon: Calendar, color: "accent" },
    { title: "פניות לקוחות שמחכות למענה", value: 4, icon: MessageSquare, color: "warning" },
  ],
};

const adminDashboard: DashboardConfig = {
  title: "סקירה ניהולית",
  description: "כאן תופיע תמונת המצב הניהולית של כלל הלקוחות והצוות.",
  cards: [
    { title: "לקוחות פעילים", value: 24, icon: Users, color: "primary" },
    { title: "משימות פתוחות בצוות", value: 47, icon: CheckSquare, color: "info" },
    { title: "ימי צילום פתוחים", value: 5, icon: Camera, color: "accent" },
    { title: "פניות פתוחות", value: 8, icon: MessageSquare, color: "warning" },
    { title: "קמפיינים פעילים", value: 12, icon: BarChart3, color: "success" },
  ],
};

export function getDashboardConfig(category: RoleCategory): DashboardConfig {
  switch (category) {
    case "admin":
      return adminDashboard;
    case "client":
      return clientDashboard;
    case "team":
      return teamDashboard;
  }
}
