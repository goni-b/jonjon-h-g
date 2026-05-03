import { UserRole, roleLabels } from "@/types/user";

const roleColorMap: Record<UserRole, string> = {
  admin: "bg-accent/15 text-accent-foreground border-accent/30",
  team_manager: "bg-info/15 text-info border-info/30",
  client: "bg-success/15 text-success border-success/30",
  video_editor: "bg-primary/10 text-primary border-primary/20",
  photographer: "bg-primary/10 text-primary border-primary/20",
  content_writer: "bg-primary/10 text-primary border-primary/20",
  social_manager: "bg-primary/10 text-primary border-primary/20",
  campaign_manager: "bg-primary/10 text-primary border-primary/20",
  automation_specialist: "bg-primary/10 text-primary border-primary/20",
  office_manager: "bg-primary/10 text-primary border-primary/20",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColorMap[role]}`}>
      {roleLabels[role]}
    </span>
  );
}
