import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">JONJON</h1>
        </div>
        <div className="bg-card rounded-lg shadow-card p-8 border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
