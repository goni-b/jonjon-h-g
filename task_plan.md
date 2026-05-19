# 📋 task_plan.md — B.L.A.S.T. Project Plan
> JonJon H&G — Client Portal
> Created: 2026-05-09 | Updated: 2026-05-10

---

## 🎯 Current Phase: Phase 3 → Sprint 2 (Tickets + Calendar)

---

## ✅ Phase 0 + 1 + 2 — DONE
- Node.js v24 installed ✅
- npm install + dev server running on localhost:8080 ✅
- All schemas, mock data, and navigation wired up ✅

---

## 🔨 Phase 3: A — Architect (BUILD PAGES)

### ✅ Sprint 1 — COMPLETED

| Page | Route | Status |
|------|-------|--------|
| משימות | `/app/tasks` | ✅ Built (Kanban, DnD, Updates, Notifications, Files) |

**Tasks features shipped:**
- Kanban board (4 columns: חדש / בטיפול / תקוע / הושלם)
- Drag & Drop between columns + Trash drop zone (delete)
- Task detail panel: Status chips, Meta info, Tabs (Updates/Files/Activity)
- Monday.com-style chat: own/other bubbles, @mention, reply threads
- File attachments on updates (view + download lightbox)
- Dedicated Files tab with drag-drop upload + view/download/delete
- Rocket animation 🚀 on task completion
- Notification bell: real-time @mention notifications
- Clicking notification → opens correct task + auto-focuses reply
- Custom Hebrew date picker (calendar popup)
- Role-based: Admin sees all / Team sees assigned / Client sees own
- Auto-assign current user as default assignee
- Delete via 3-dot menu in panel

---

### 🔨 Sprint 1 (continued) — BUILDING NOW

#### ✅ `/app/tickets` — פניות

- [x] Create `src/data/ticketsMock.ts`
- [x] Create `src/pages/app/Tickets.tsx`
- [x] Wire into `App.tsx`
- [x] Remove `comingSoon` from navigation

**Features:**
- Ticket list with tab filter: פתוחות / בטיפול / סגורות
- Ticket card: priority border, subject, client, status badge, time
- Ticket detail panel: header, meta, original message, reply thread
- Reply editor (clients reply + team/admin reply + internal notes)
- Status change (team/admin only)
- New ticket dialog (client creates, admin/team can too)
- Role-based: Client sees own / Team sees assigned clients / Admin sees all

#### ✅ `/app/calendar` — יומן אירועים

- [x] Create `src/data/eventsMock.ts`
- [x] Create `src/pages/app/CalendarPage.tsx`
- [x] Wire into `App.tsx`
- [x] Remove `comingSoon` from navigation

**Features:**
- Full-page monthly calendar grid (Hebrew day names, RTL)
- Events as colored chips inside day cells (color by type)
- Event types: יום צילום / פגישה / דד-ליין / השקת קמפיין
- Click day → day detail panel with event list
- "הוסף אירוע" dialog (admin/team only)
- Role filtering: Client sees own / Team sees assigned clients / Admin sees all
- Dots on days that have tasks due (linked from tasksMock)

---

### ⏳ Sprint 2 — NEXT

#### `/app/shoot-days` — ניהול תכנים וימי צילום
- [ ] `src/data/shootDaysMock.ts`
- [ ] `src/pages/app/ShootDays.tsx`
- [ ] Tabs: ימי צילום / תכנים
- [ ] Status pipeline: תכנון → צילום → עריכה → אישור → פרסום
- [ ] Role filtering

#### `/app/content-calendar` — גאנט תוכן
- [ ] `src/data/contentCalendarMock.ts`
- [ ] `src/pages/app/ContentCalendar.tsx`
- [ ] Gantt rows per platform (Instagram/TikTok/YouTube/Facebook)
- [ ] Week/month view switcher

---

### ⏳ Sprint 3 — Admin Only

- [ ] `/app/clients` — לקוחות פעילים
- [ ] `/app/products` — בניית מוצרים וטיים ליינים
- [ ] `/app/team-metrics` — מדדי צוות

---

### ⏳ Sprint 4

- [ ] `/app/reports` — דוחות

---

## ✨ Phase 4: S — Stylize (after all pages)
- [ ] RTL audit across all pages
- [ ] Mobile responsiveness (sidebar collapse, card stacking)
- [ ] Dark mode verification
- [ ] Loading skeleton states
- [ ] Global empty states polish

---

## 🛰️ Phase 5: T — Deploy
- [ ] Vercel deploy + GitHub auto-deploy
- [ ] Custom domain
- [ ] Final QA: all roles, all pages, all devices

---

## 📊 Progress

| Phase | Status | % |
|-------|--------|---|
| Phase 0-2 | ✅ Done | 100% |
| Phase 3: Sprint 1 | ✅ Tasks done | 100% |
| Phase 3: Sprint 1 cont. | 🔨 Now | Tickets + Calendar |
| Phase 3: Sprint 2 | ⏳ | 0% |
| Phase 3: Sprint 3 | ⏳ | 0% |
| Phase 3: Sprint 4 | ⏳ | 0% |
| Phase 4-5 | ⏳ | 0% |

**Pages:** Dashboard ✅ | Settings ✅ | Tasks ✅ | Tickets 🔨 | Calendar 🔨 | Others ⏳
