# 📜 gemini.md — Project Constitution
> **This file is LAW. Only update when schema, rules, or architecture change.**
> Last Updated: 2026-05-09

---

## 🏢 Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | JonJon H&G — Client Portal |
| **Built With** | React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui |
| **Source** | Lovable → GitHub: `https://github.com/goni-b/jonjon-h-g.git` |
| **Local Path** | `C:\Users\97255\פרוייקט ANTIGRAVITY` |
| **Stage** | Phase 0 → Blueprint |

---

## 🗂️ Data Schemas

### User Schema (`src/types/user.ts`)
```typescript
type UserRole =
  | "admin"          // אדמין
  | "team_manager"   // מנהל צוות
  | "client"         // לקוח
  | "video_editor"   // עורך וידיאו
  | "photographer"   // צלם
  | "content_writer" // כותב תוכן
  | "social_manager" // מנהלת סושיאל
  | "campaign_manager" // קמפיינר
  | "automation_specialist" // איש מערכות ואוטומציה
  | "office_manager"; // מנהלת משרד

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  assignedClients: string[];
  permissions: string[];
}
```

### Role Categories
- **admin** → `admin` + `team_manager`
- **client** → `client`
- **team** → כל השאר (editor, photographer, writer, etc.)

### Dashboard Card Schema
```typescript
interface DashboardCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "accent" | "success" | "warning" | "info";
}
```

### Roadmap Stage Schema (`ClientRoadmap`)
```typescript
interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  expectedDate: string;  // format: "DD.MM"
  status: "completed" | "current" | "upcoming" | "locked";
  tasks?: string[];
}
```

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Vite + React 18 + TypeScript
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: TailwindCSS v3
- **Routing**: React Router DOM v6
- **State**: React Context (AuthContext)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

### Directory Structure
```
src/
├── components/
│   ├── layout/       # AppLayout, Header, Sidebar, PageHeader
│   └── ui/           # shadcn components + custom: StatCard, ClientRoadmap, etc.
├── contexts/         # AuthContext (mock login)
├── data/             # mockUsers.ts, dashboardMock.ts, navigation.ts
├── hooks/            # use-mobile, use-toast
├── lib/              # utils.ts
├── pages/
│   ├── app/          # Dashboard, Settings, PlaceholderPage
│   └── auth/         # Login, ForgotPassword, RegisterInvite
├── types/            # user.ts, navigation.ts
└── test/
```

### Navigation by Role
| Role Category | Pages Available |
|--------------|-----------------|
| **admin** | דשבורד לקוחות, לקוחות פעילים, בניית מוצרים, מדדי צוות, משימות, יומן, פניות, הגדרות |
| **client** | דשבורד, משימות, יומן, דוחות, ניהול תכנים, גאנט תוכן, פניות, הגדרות |
| **team** | דשבורד, משימות, יומן, דוחות, ניהול תכנים, גאנט תוכן, פניות מלקוחות, הגדרות |

---

## ⚙️ Behavioral Rules

1. **Auth is Mock** — `login()` always logs in as `mockUsers[0]` (admin: חופית פינטו). No real backend yet.
2. **Most pages are `comingSoon: true`** — Only Dashboard and Settings are implemented.
3. **RTL Interface** — All UI text is Hebrew, direction is RTL.
4. **Data-First Rule** — Schema must be updated here before any new field is added to code.
5. **No Backend Yet** — All data is mocked. When a backend is added, this file must be updated with API endpoints and auth tokens.
6. **`gemini.md` is the Single Source of Truth** — Any architectural change must be reflected here first.

---

## 🔐 Environment Variables
```
# .env (not committed)
# No keys required yet — fully mock data
# Future: Supabase / Firebase keys will go here
```

---

## 📋 Invariants (Must Never Break)
- [ ] `AuthContext` must always provide `user`, `isAuthenticated`, `login`, `logout`, `switchRole`
- [ ] All routes under `/app/*` must be protected (require `isAuthenticated`)
- [ ] Navigation items must match the user's `RoleCategory`
- [ ] `gemini.md` is updated before any schema change is coded
