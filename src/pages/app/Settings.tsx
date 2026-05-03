import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LogIn, UserCog, CheckSquare, Bell } from "lucide-react";

const activityLog = [
  { text: "התחברת למערכת", icon: LogIn, time: "לפני 5 דקות" },
  { text: "עדכנת פרטים אישיים", icon: UserCog, time: "לפני שעה" },
  { text: "נוצרה משימה חדשה", icon: CheckSquare, time: "אתמול" },
  { text: "התקבלה התראה חדשה", icon: Bell, time: "לפני יומיים" },
];

export default function Settings() {
  const { user } = useAuth();
  if (!user) return null;

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);

  return (
    <div className="max-w-3xl animate-fade-in">
      <PageHeader title="הגדרות" description="ניהול פרטים אישיים ואבטחה" />

      {/* Personal Details */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">פרטים אישיים</h3>

        <div className="flex items-center gap-4 mb-6">
          <UserAvatar name={user.name} avatar={user.avatar} size="lg" />
          <Button variant="outline" size="sm">שינוי תמונה</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>שם מלא</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="text-right" />
          </div>
          <div className="space-y-2">
            <Label>טלפון</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-right" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>מייל</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="text-right" />
          </div>
        </div>

        <div className="mt-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            שמירת שינויים
          </Button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">אבטחה</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>סיסמה חדשה</Label>
            <Input type="password" placeholder="הכניסו סיסמה חדשה" className="text-right" />
          </div>
          <div className="space-y-2">
            <Label>אימות סיסמה</Label>
            <Input type="password" placeholder="הכניסו סיסמה שוב" className="text-right" />
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline">עדכון סיסמה</Button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">לוג פעילות</h3>
        <div className="space-y-3">
          {activityLog.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground flex-1">{item.text}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
