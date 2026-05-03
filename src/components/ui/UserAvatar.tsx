import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-lg",
};

export function UserAvatar({ name, avatar, size = "md" }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover border border-border`}
      />
    );
  }

  return (
    <div className={`${sizeMap[size]} rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground border border-border`}>
      {initials || <UserIcon className="w-4 h-4" />}
    </div>
  );
}
