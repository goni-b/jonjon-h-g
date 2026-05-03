import { Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export function EmptyState({
  title = "עדיין אין כאן נתונים",
  description = "ברגע שנתחיל לעבוד על המודול הזה, הנתונים יוצגו כאן בצורה מסודרת.",
  showBackButton = true,
}: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">{description}</p>
      {showBackButton && (
        <Button variant="outline" onClick={() => navigate("/app/dashboard")}>
          חזרה לדשבורד
        </Button>
      )}
    </div>
  );
}
