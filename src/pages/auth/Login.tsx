import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

import { Logo } from "@/components/ui/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate("/app/dashboard");
    }
  };

  return (
    <AuthCard>
      <div className="flex flex-col items-center text-center mb-6">
        <Logo className="mb-4 transform scale-125" />
        <h2 className="text-xl font-bold text-foreground mb-2">ברוכים הבאים ל־JONJON</h2>
        <p className="text-sm text-muted-foreground">
          מערכת ניהול הלקוחות, התוכן והתהליכים שלכם במקום אחד.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">טלפון או מייל</Label>
          <Input
            id="email"
            type="text"
            placeholder="הכניסו מייל או טלפון"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-right"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">סיסמה</Label>
          <Input
            id="password"
            type="password"
            placeholder="הכניסו סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-right"
          />
        </div>

        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          התחברות
        </Button>

        <div className="text-center">
          <Link to="/forgot-password" className="text-sm text-accent hover:underline">
            שכחתי סיסמה
          </Link>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          אין לך גישה?{" "}
          <span className="text-accent">צור קשר עם הצוות</span>
        </p>
      </div>
    </AuthCard>
  );
}
