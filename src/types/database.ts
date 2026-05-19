import type { UserRole } from "@/types/user";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase generated types — keep in sync with supabase/schema.sql
// ─────────────────────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      roadmap_stages: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string | null;
          expected_date: string | null;
          status: "completed" | "current" | "upcoming" | "locked";
          order_index: number;
          tasks: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description?: string | null;
          expected_date?: string | null;
          status?: "completed" | "current" | "upcoming" | "locked";
          order_index: number;
          tasks?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          expected_date?: string | null;
          status?: "completed" | "current" | "upcoming" | "locked";
          order_index?: number;
          tasks?: string[];
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience row types
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type RoadmapStageRow = Database["public"]["Tables"]["roadmap_stages"]["Row"];
