export type UserRole =
  | "admin"
  | "team_manager"
  | "client"
  | "video_editor"
  | "photographer"
  | "content_writer"
  | "social_manager"
  | "campaign_manager"
  | "automation_specialist"
  | "office_manager";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  assignedClients: string[];
  permissions: string[];
}

export const roleLabels: Record<UserRole, string> = {
  admin: "אדמין",
  team_manager: "מנהל צוות",
  client: "לקוח",
  video_editor: "עורך וידיאו",
  photographer: "צלם",
  content_writer: "כותב תוכן",
  social_manager: "מנהלת סושיאל",
  campaign_manager: "קמפיינר",
  automation_specialist: "איש מערכות ואוטומציה",
  office_manager: "מנהלת משרד",
};

export type RoleCategory = "admin" | "team" | "client";

export function getRoleCategory(role: UserRole): RoleCategory {
  if (role === "admin" || role === "team_manager") return "admin";
  if (role === "client") return "client";
  return "team";
}
