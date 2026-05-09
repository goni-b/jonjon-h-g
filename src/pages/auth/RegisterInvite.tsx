import { useState } from "react";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export default function RegisterInvite() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock — no real registration
  };

  return (
    <AuthCard>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">הוזמנת להצטרף ל־JONJON</h2>
        <p className="text-sm text-muted-foreground">
          השלימו את הפרטים שלכם כדי להתחיל לעבוד במערכת.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>שם מלא</Label>
          <Input placeholder="הכניסו שם מלא" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="text-right" />
        </div>

        <div className="space-y-2">
          <Label>טלפון</Label>
          <Input placeholder="050-0000000" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="text-right" />
        </div>

        <div className="space-y-2">
          <Label>מייל</Label>
          <Input type="email" placeholder="example@email.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="text-right" />
        </div>

        <div className="space-y-2">
          <Label>העלאת תמונת פרופיל</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-accent/50 transition-colors">
            <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">לחצו להעלאת תמונה</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>יצירת סיסמה</Label>
          <Input type="password" placeholder="הכניסו סיסמה" value={form.password} onChange={(e) => handleChange("password", e.target.value)} className="text-right" />
        </div>

        <div className="space-y-2">
          <Label>אימות סיסמה</Label>
          <Input type="password" placeholder="הכניסו סיסמה שוב" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} className="text-right" />
        </div>

        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          יצירת חשבון
        </Button>
      </form>
    </AuthCard>
  );
}
