import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">העמוד לא נמצא</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          נראה שהעמוד שחיפשת לא קיים או שאין לך הרשאה לצפות בו.
        </p>
        <Button onClick={() => navigate("/app/dashboard")} className="bg-primary text-primary-foreground hover:bg-primary/90">
          חזרה לדשבורד
        </Button>
      </div>
    </div>
  );
}
