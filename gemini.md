# 📜 gemini.md — Project Constitution
> **This file is LAW. Only update when schema, rules, or architecture change.**
> Last Updated: 2026-05-09

---

## 🏢 Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | JonJon H&G — Client Portal |
| **Company** | סוכנות שיווק ותוכן — JonJon H&G |
| **Built With** | React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui |
| **Source** | Lovable → GitHub: `https://github.com/goni-b/jonjon-h-g.git` |
| **Local Path** | `C:\Users\97255\פרוייקט ANTIGRAVITY` |
| **Stage** | Phase 3 → Architect (Building Pages) |

---

## 🗂️ Data Schemas

### User Schema (`src/types/user.ts`)
```typescript
type UserRole =
  | "admin"                  // אדמין ראשי
  | "team_manager"           // מנהל צוות
  | "client"                 // לקוח
  | "video_editor"           // עורך וידיאו
  | "photographer"           // צלם
  | "content_writer"         // כותב/כותבת תוכן
  | "social_manager"         // מנהלת סושיאל
  | "campaign_manager"       // קמפיינר
  | "automation_specialist"  // איש מערכות ואוטומציה
  | "office_manager";        // מנהלת משרד

type RoleCategory = "admin" | "team" | "client";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;         // URL or empty string
  assignedClients: string[];  // client user IDs
  permissions: string[];
}
```

### Role Category Mapping
| UserRole | RoleCategory |
|----------|-------------|
| `admin`, `team_manager` | `admin` |
| `client` | `client` |
| `video_editor`, `photographer`, `content_writer`, `social_manager`, `campaign_manager`, `automation_specialist`, `office_manager` | `team` |

---

### Task Schema
```typescript
type TaskStatus = "open" | "in_progress" | "pending_approval" | "done" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  clientId: string;         // which client this task belongs to
  assigneeId: string;       // team member assigned
  createdById: string;      // who created the task
  dueDate: string;          // "DD.MM.YYYY"
  createdAt: string;        // ISO timestamp
  updatedAt: string;
  tags: string[];           // e.g. ["סושיאל", "וידיאו", "קמפיין"]
}
```

**Status display (Hebrew + color):**
| Status | Label | Color |
|--------|-------|-------|
| `open` | פתוח | blue |
| `in_progress` | בביצוע | yellow |
| `pending_approval` | ממתין לאישור | orange |
| `done` | הושלם | green |
| `cancelled` | בוטל | gray |

---

### Ticket Schema
```typescript
type TicketStatus = "open" | "pending" | "in_progress" | "closed";
type TicketPriority = "low" | "normal" | "high" | "urgent";

interface Ticket {
  id: string;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  clientId: string;
  createdById: string;      // usually a client
  assignedToId: string;     // team member handling it
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
  triageNotes?: string;     // הנחיות מקצועיות/בריף פנימי של המנהל לאיש הצוות (לא גלוי ללקוח)
  approvedById?: string;    // מזהה המנהל שאישר את הפנייה וניתב אותה
  dueDate?: string;         // תאריך יעד שקבע המנהל לאיש הצוות
}

interface TicketReply {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  isInternal: boolean;      // internal note vs client-visible reply
}
```

---

### Event Schema (Calendar)
```typescript
type EventType = "shoot_day" | "meeting" | "deadline" | "campaign_launch" | "other";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  clientId: string;         // which client this event belongs to
  assigneeIds: string[];    // team members involved
  startDate: string;        // "YYYY-MM-DD"
  endDate: string;          // "YYYY-MM-DD" (same as start for single-day)
  startTime?: string;       // "HH:MM" optional
  endTime?: string;
  location?: string;
  isAllDay: boolean;
  createdById: string;
}
```

**Event type colors:**
| EventType | Label | Color |
|-----------|-------|-------|
| `shoot_day` | יום צילום | purple |
| `meeting` | פגישה | blue |
| `deadline` | דד-ליין | red |
| `campaign_launch` | השקת קמפיין | green |
| `other` | אחר | gray |

---

### ShootDay & Content Schema
```typescript
type ContentStatus = "planning" | "shooting" | "editing" | "pending_client_approval" | "approved" | "published";
type ContentPlatform = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "other";
type ContentType = "reel" | "post" | "story" | "video" | "article" | "ad";

interface ShootDay {
  id: string;
  clientId: string;
  date: string;             // "DD.MM.YYYY"
  location: string;
  status: "planned" | "in_progress" | "done" | "cancelled" | "rescheduled";
  crewIds: string[];        // team member IDs (photographer, editor, etc.)
  notes: string;
  
  // Photographer App fields (Sprint 3)
  clockInTime?: string;     // ISO timestamp when photographer arrived
  clockOutTime?: string;    // ISO timestamp when shoot finished
  selfieVerificationUrl?: string; // URL to the selfie taken with the client
  locationUrl?: string;     // Google Maps link
  isOrganic?: boolean;      // True if organic content, false if sponsored
  
  contentItems: string[];   // Legacy IDs
}

// ─── Scripts Engine (Sprint 2) ───────────────────────────────
type ScriptStatus = "draft" | "pending_approval" | "revision_requested" | "approved";

interface Script {
  id: string;
  clientId: string;
  shootDayId: string;
  title: string;
  content: string;          // Rich text / HTML
  status: ScriptStatus;
  createdById: string;
  createdAt: string;
  approvedAt?: string;
  fileUrl?: string;         // If uploaded as Word doc
  comments: ScriptComment[];
}

interface ScriptComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  resolved: boolean;
  highlightId?: string;     // Ties comment to a highlighted text block in TipTap
  replies?: ScriptComment[];
  likedBy?: string[];
}

// ─── Video Review Engine (Sprint 4) ──────────────────────────
type VideoStatus = "backlog" | "in_progress" | "in_review" | "approved" | "done";

interface VideoFile {
  id: string;
  clientId: string;
  shootDayId: string;
  title: string;
  status: VideoStatus;
  fileUrl: string;          // AWS/Storage URL
  thumbnailUrl?: string;
  durationSeconds: number;
  fileSizeMB: number;
  version: number;          // Version control
  editorId: string;
  uploadedAt: string;
  comments: VideoComment[];
}

interface VideoComment {
  id: string;
  authorId: string;
  text: string;
  timestampSeconds: number; // The exact frame/time in the video
  x?: number;               // Optional click coordinates on the video player
  y?: number;
  createdAt: string;
  resolved: boolean;
  replies?: VideoComment[];
}

interface ContentItem {
  id: string;
  clientId: string;
  shootDayId?: string;      // optional — may not be tied to a shoot
  title: string;
  description: string;
  platform: ContentPlatform;
  contentType: ContentType;
  status: ContentStatus;
  assigneeId: string;       // who's responsible (writer, editor, etc.)
  dueDate: string;
  publishDate?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  notes: string;
  tags: string[];
}
```

**Content status pipeline (in order):**
תכנון → צילום → עריכה → ממתין לאישור לקוח → מאושר → פורסם

---

### Client Schema (for Clients page)
```typescript
type ClientStatus = "active" | "onboarding" | "paused" | "churned";

interface Client {
  id: string;
  name: string;             // business name
  contactName: string;      // primary contact person
  email: string;
  phone: string;
  logoUrl: string;
  status: ClientStatus;
  productId: string;        // which product/package they're on
  assignedTeamIds: string[]; // team members assigned
  startDate: string;
  roadmapProgress: number;  // 0-100
  notes: string;
  industry: string;         // e.g. "נדל״ן", "אופנה", "מסעדנות"
}
```

---

### Product Schema (Services/Packages)
```typescript
interface ProductStage {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  requiredRoles: UserRole[];   // which team roles are needed
  deliverables: string[];      // what is delivered
}

interface Product {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  priceTier: "starter" | "growth" | "premium" | "enterprise";
  includedServices: string[];  // e.g. ["ניהול סושיאל", "צילום", "עריכת וידיאו"]
  stages: ProductStage[];      // the timeline of the onboarding/delivery
  defaultAssignedRoles: UserRole[];
}
```

---

### Team Metrics Schema
```typescript
interface TeamMemberMetric {
  userId: string;
  period: string;            // "MM.YYYY"
  tasksOpen: number;
  tasksDone: number;
  tasksOverdue: number;
  avgResponseTimeHours: number;
  ticketsHandled: number;
  activeClientsCount: number;
  shootDaysParticipated: number;
  contentItemsProduced: number;
}
```

---

### Dashboard Card Schema
```typescript
interface DashboardCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "accent" | "success" | "warning" | "info";
  trend?: {
    direction: "up" | "down" | "neutral";
    percent: number;
    label: string;
  };
}
```

### Roadmap Stage Schema (`ClientRoadmap`)
```typescript
interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  expectedDate: string;   // format: "DD.MM"
  status: "completed" | "current" | "upcoming" | "locked";
  tasks?: string[];
}
```

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 18 + TypeScript |
| UI Library | shadcn/ui (Radix UI primitives) |
| Styling | TailwindCSS v3 (RTL support) |
| Routing | React Router DOM v6 |
| State | React Context (AuthContext) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | Sonner + Toaster |
| Data Fetching | TanStack Query (ready for real API) |
| Theme | next-themes (dark/light) |

### Directory Structure
```
src/
├── components/
│   ├── layout/       # AppLayout, Header, Sidebar, PageHeader
│   └── ui/           # shadcn + custom: StatCard, ClientRoadmap, EmptyState, etc.
├── contexts/         # AuthContext (mock login → real auth later)
├── data/             # mock data files per module
│   ├── mockUsers.ts
│   ├── dashboardMock.ts
│   ├── navigation.ts
│   ├── tasksMock.ts          ← to build
│   ├── ticketsMock.ts        ← to build
│   ├── eventsMock.ts         ← to build
│   ├── shootDaysMock.ts      ← to build
│   ├── contentCalendarMock.ts ← to build
│   ├── clientsMock.ts        ← to build
│   ├── productsMock.ts       ← to build
│   └── teamMetricsMock.ts    ← to build
├── hooks/            # use-mobile, use-toast
├── lib/              # utils.ts
├── pages/
│   ├── app/
│   │   ├── Dashboard.tsx     ✅ built
│   │   ├── Settings.tsx      ✅ built
│   │   ├── Tasks.tsx         ← to build
│   │   ├── Tickets.tsx       ← to build
│   │   ├── CalendarPage.tsx  ← to build
│   │   ├── ShootDays.tsx     ← to build
│   │   ├── ContentCalendar.tsx ← to build
│   │   ├── Clients.tsx       ← to build (admin only)
│   │   ├── Products.tsx      ← to build (admin only)
│   │   ├── TeamMetrics.tsx   ← to build (admin only)
│   │   └── Reports.tsx       ← to build
│   └── auth/
│       ├── Login.tsx         ✅ built
│       ├── ForgotPassword.tsx ✅ built
│       └── RegisterInvite.tsx ✅ built
└── types/
    ├── user.ts
    └── navigation.ts
```

---

## 📱 Page Specifications

### `/app/tasks` — משימות
**Visible to:** כולם (admin, team, client)
**Layout:** PageHeader + FilterBar + TaskList/Cards

**Role behavior:**
- **Admin/team_manager:** רואה את כל המשימות של כל הלקוחות + יכול ליצור, לערוך, למחוק
- **Team:** רואה רק משימות שמשויכות אליו — יכול לעדכן סטטוס
- **Client:** רואה רק משימות שקשורות אליו — צפייה בלבד

**UI Components:**
- `TabBar` → "הכל" | "שלי" | "ממתינות לאישור"
- `FilterBar` → dropdown: סטטוס, משויך, לקוח, תאריך
- `TaskCard` → title, status badge, priority badge, assignee avatar, due date, client name
- `NewTaskDialog` → form: title, description, client, assignee, due date, priority, tags
- `EmptyState` → when no tasks match filter

---

### `/app/tickets` — פניות
**Visible to:** כולם
**Layout:** PageHeader + Tabs + TicketList + TicketDetailDrawer

**Role behavior:**
- **Client:** יוצר פניות, רואה רק שלו, רואה תגובות
- **Team:** רואה פניות של הלקוחות שמשויכים אליו, יכול להגיב
- **Admin/team_manager:** רואה הכל, יכול להקצות לאנשי צוות, לסגור

**UI Components:**
- `TabBar` → "פתוחות" | "בטיפול" | "סגורות"
- `TicketCard` → subject, client name, status badge, priority, time since opened, assignee
- `NewTicketDialog` → form: subject, body, priority (for clients)
- `TicketDetailDrawer` → side drawer: full ticket thread, reply box, status controls
- `ReplyBubble` → chat-style message bubble (author, timestamp, text)

---

### `/app/calendar` — יומן אירועים
**Visible to:** כולם
**Layout:** PageHeader + ViewSwitcher + CalendarGrid + EventDetailPanel

**Role behavior:**
- **Client:** רואה אירועים שלו בלבד (ימי צילום, דד-ליינים, השקות)
- **Team:** רואה אירועים של כל הלקוחות שמשויכים אליו
- **Admin:** רואה הכל, יכול ליצור/לערוך/למחוק אירועים

**UI Components:**
- `ViewSwitcher` → "חודש" | "שבוע" | "רשימה"
- `CalendarGrid` → 7-column month grid with event chips
- `EventChip` → color-coded by EventType, truncated title
- `DayDetailPanel` → slide-in panel on date click — lists all events that day
- `EventCard` → expanded view: title, type, time, location, assignees, description
- `NewEventDialog` → form: title, type, date/time, client, assignees, location, notes

---

### `/app/shoot-days` — ניהול תכנים וימי צילום
**Visible to:** כולם (different data per role)
**Layout:** PageHeader + TopTabs (ימי צילום / תכנים) + List/Cards

**Tab 1: ימי צילום**
- `ShootDayCard` → date, client name, location, status, crew avatars, linked content count
- Status tags: תוכנן / בוצע / בוטל / נדחה
- "יום צילום חדש" → dialog: client, date, location, crew, notes

**Tab 2: תכנים**
- `ContentItemCard` → thumbnail, title, platform icon, status badge, due date, assignee
- Status pipeline display: progress bar across stages
- Filter by: platform, status, client, date
- "תוכן חדש" → dialog: client, type, platform, due date, publish date, assignee, notes

**Role behavior:**
- **Client:** רואה רק סטטוס תכנים שלו — צפייה + אישור תוכן
- **Team:** רואה ומנהל תכנים ולקוחות שמשויכים אליו
- **Admin:** רואה ומנהל הכל

---

### `/app/content-calendar` — גאנט תוכן
**Visible to:** כולם
**Layout:** PageHeader + PeriodSwitcher + GanttGrid

**UI Components:**
- `PeriodSwitcher` → "שבוע" | "חודש" (arrows to navigate)
- `GanttGrid` → rows = platforms (Instagram/TikTok/YouTube/Facebook), columns = days
- `ContentBlock` → colored block on timeline: platform color, content title, status dot
- `ContentBlockTooltip` → hover shows: title, type, assignee, status, publish date
- Filter: by client (admin/team only)

**Role behavior:**
- **Client:** רואה גאנט שלו
- **Team:** רואה לפי לקוחות משויכים
- **Admin:** רואה הכל, יכול לסנן לפי לקוח

---

### `/app/clients` — לקוחות פעילים *(Admin Only)*
**Visible to:** admin, team_manager only
**Layout:** PageHeader + SearchBar + FilterBar + ClientsGrid

**UI Components:**
- `ClientCard` → logo, name, industry, status badge, product tier, assignee avatars, roadmap %
- Click → `ClientDetailDrawer`:
  - Info tab: contact details, package, start date, notes
  - Tasks tab: active tasks count, list of recent tasks
  - Roadmap tab: roadmap progress visual
  - Content tab: latest content items
- `NewClientDialog` → form: name, contact, email, phone, industry, product, assigned team
- SearchBar → filter by name, industry, status, product

---

### `/app/products` — בניית מוצרים וטיים ליינים *(Admin Only)*
**Visible to:** admin, team_manager only
**Layout:** PageHeader + ProductCards grid

**UI Components:**
- `ProductCard` → name, price tier badge, included services list, stage count
- Click → `ProductDetailView`:
  - Overview: name, description, price, included services
  - Timeline: visual stage builder (ordered list of stages)
  - `StageCard` → stage title, duration, required roles, deliverables
- "מוצר חדש" → multi-step form dialog:
  - Step 1: name, description, price tier, included services
  - Step 2: build stages (add/remove/reorder)

---

### `/app/team-metrics` — מדדי צוות *(Admin Only)*
**Visible to:** admin, team_manager only
**Layout:** PageHeader + DateRangePicker + MetricsOverview + TeamTable + Charts

**UI Components:**
- `MetricsOverviewRow` → top stat cards: total tasks done, avg response time, active clients, content published
- `TeamMemberRow` → name, role badge, tasks open, tasks done, tickets handled, active clients, health indicator
- Charts:
  - Bar chart: tasks completed per team member (Recharts)
  - Pie chart: task distribution by status
  - Line chart: team productivity over time (weekly)
- `DateRangePicker` → filter metrics by period (this week / this month / custom)

---

### `/app/reports` — דוחות
**Visible to:** כולם (different content per role)
**Layout:** PageHeader + RoleTabs + Charts + DataTable

**Client view:**
- סקירת קמפיינים: impressions, clicks, CTR, conversions
- תכנים שפורסמו החודש: count by platform
- סטטוס משימות: progress circle
- Charts: bar (posts per week), line (engagement over time)

**Team view:**
- ביצועים אישיים: tasks done, tickets responded, avg response time
- עומס עבודה: pie chart by status
- לקוחות בטיפול: list with health indicators

**Admin view:**
- סקירת סוכנות: active clients, total revenue (optional), team utilization
- לקוחות לפי בריאות: green/yellow/red indicators
- תפוקת צוות: leaderboard
- Charts: all Recharts-based

---

## 🏛️ Navigation by Role

| RoleCategory | Pages | Count |
|-------------|-------|-------|
| **admin** | דשבורד לקוחות, לקוחות פעילים, מוצרים, מדדי צוות, משימות, יומן, פניות, הגדרות | 8 |
| **client** | דשבורד, משימות, יומן, דוחות, ניהול תכנים, גאנט תוכן, פניות, הגדרות | 8 |
| **team** | דשבורד, משימות, יומן, דוחות, ניהול תכנים, גאנט תוכן, פניות, הגדרות | 8 |

---

## ⚙️ Behavioral Rules

1. **Auth is Mock** — `login()` logs in as `mockUsers[0]` (admin: חופית פינטו). No real backend yet.
2. **Role Guard** — Admin-only pages (`/clients`, `/products`, `/team-metrics`) must redirect non-admins.
3. **RTL Interface** — All UI is Hebrew, `dir="rtl"` everywhere.
4. **Data-First Rule** — Schema must be updated here before any new field is added to code.
5. **No Backend Yet** — All data is mocked. Supabase is the preferred future backend.
6. **`gemini.md` is the Single Source of Truth** — Any architectural change must be reflected here first.
7. **shadcn/ui Only** — All new UI components must use shadcn primitives or Radix UI. No other component libraries.
8. **Recharts Only** — All charts use Recharts (already installed). No Chart.js or other chart libs.
9. **Consistent Layout** — Every page uses `PageHeader` at the top with title + optional action button.
10. **Empty States** — Every list/table must have an `EmptyState` component for the zero-data case.

---

## 🔐 Environment Variables
```
# .env (not committed)
# Currently: No keys required — fully mock data
# Future (Supabase):
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 📋 Invariants (Must Never Break)
- [ ] `AuthContext` must always provide `user`, `isAuthenticated`, `login`, `logout`, `switchRole`
- [ ] All routes under `/app/*` must require `isAuthenticated`
- [ ] Admin-only pages must check `roleCategory === "admin"` and redirect otherwise
- [ ] Navigation items must match the user's `RoleCategory`
- [ ] All pages must handle empty state (no data)
- [ ] All pages must have RTL layout (`dir="rtl"`)
- [ ] `gemini.md` is updated before any schema change is coded

---

## 🎨 Design System

### Colors (Tailwind custom classes)
| Token | Usage |
|-------|-------|
| `primary` | Brand main color — buttons, active states |
| `accent` | Highlight — badges, special cards |
| `success` | Done, published, active |
| `warning` | Pending, in-progress, review |
| `destructive` | Cancelled, error, urgent |
| `muted` | Secondary text, placeholders |

### Typography Rules
- All text: Hebrew (RTL)
- Page titles: `text-2xl font-bold`
- Section headers: `text-lg font-semibold`
- Body: `text-sm` or `text-base`
- Labels/badges: `text-xs`

### Component Standards
- Cards: `rounded-2xl border bg-card shadow-sm`
- Buttons: shadcn `<Button>` — never raw `<button>`
- Forms: shadcn `<Input>`, `<Select>`, `<Textarea>` via React Hook Form + Zod
- Dialogs: shadcn `<Dialog>` for modals
- Drawers: shadcn `<Sheet>` for side panels
- Tables: shadcn `<Table>` with `<TableHeader>`, `<TableBody>`, `<TableRow>`
