import { useState } from "react";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <AuthCard>
      {sent ? (
        <div className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">הקישור נשלח!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            שלחנו לך קישור לאיפוס הסיסמה.
          </p>
          <Link to="/login">
            <Button variant="outline">חזרה להתחברות</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">איפוס סיסמה</h2>
            <p className="text-sm text-muted-foreground">
              הכניסו מייל או מספר טלפון ונשלח לכם קישור לאיפוס הסיסמה.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>מייל או טלפון</Label>
              <Input
                placeholder="הכניסו מייל או טלפון"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-right"
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              שליחת קישור לאיפוס
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-accent hover:underline">
                חזרה להתחברות
              </Link>
            </div>
          </form>
        </>
      )}
    </AuthCard>
  );
}
