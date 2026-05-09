# 🔍 findings.md — Research & Discoveries
> JonJon H&G — Client Portal
> Created: 2026-05-09

---

## Project Overview
- **Type**: B2B Client Portal for a marketing/content agency
- **Target Users**: 3 role categories — Admin, Team Members, Clients
- **Language**: Hebrew (RTL)
- **Stack**: React + Vite + TypeScript + TailwindCSS + shadcn/ui

---

## 📦 Dependencies Discovered
| Package | Version | Purpose |
|---------|---------|---------|
| React | ^18.3.1 | Core framework |
| Vite | ^5.4.19 | Build tool |
| TypeScript | ^5.8.3 | Type safety |
| TailwindCSS | ^3.4.17 | Styling |
| shadcn/ui | (components.json) | UI component library |
| React Router DOM | ^6.30.1 | Routing |
| React Hook Form | ^7.61.1 | Forms |
| Zod | ^3.25.76 | Schema validation |
| Recharts | ^2.15.4 | Charts/graphs |
| Lucide React | ^0.462.0 | Icons |
| TanStack Query | ^5.83.0 | Data fetching |
| next-themes | ^0.3.0 | Dark/light mode |
| Sonner | ^1.7.4 | Toast notifications |
| lovable-tagger | ^1.1.13 | Lovable integration |

---

## 📄 Pages Discovered
| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | Redirect to login |
| `/auth/login` | ✅ | Mock login |
| `/auth/forgot-password` | ✅ | UI only |
| `/auth/register-invite` | ✅ | UI only |
| `/app/dashboard` | ✅ | Role-aware, StatCards + ClientRoadmap |
| `/app/settings` | ✅ | Settings page |
| `/app/tasks` | 🔒 comingSoon | Placeholder |
| `/app/calendar` | 🔒 comingSoon | Placeholder |
| `/app/reports` | 🔒 comingSoon | Placeholder |
| `/app/shoot-days` | 🔒 comingSoon | Placeholder |
| `/app/content-calendar` | 🔒 comingSoon | Placeholder |
| `/app/tickets` | 🔒 comingSoon | Placeholder |
| `/app/clients` | 🔒 comingSoon | Admin only |
| `/app/products` | 🔒 comingSoon | Admin only |
| `/app/team-metrics` | 🔒 comingSoon | Admin only |

---

## 🧑‍💼 User Roles Found
```
admin → "אדמין" (חופית פינטו - mock default)
team_manager → "מנהל צוות" (גוני)
client → "לקוח"
video_editor → "עורך וידיאו"
photographer → "צלם"
content_writer → "כותב תוכן"
social_manager → "מנהלת סושיאל"
campaign_manager → "קמפיינר"
automation_specialist → "איש מערכות ואוטומציה"
office_manager → "מנהלת משרד"
```

---

## 🗺️ ClientRoadmap Feature
- 11-stage roadmap for client journey
- Stages: completed / current / upcoming / locked
- Progress bar (% calculated from completed stages)
- Expandable stage cards with task lists
- Avatar shown at current stage

---

## ⚠️ Environment Issues
| Issue | Status | Solution |
|-------|--------|---------|
| Git not installed | ⚠️ | Install Git or use ZIP (resolved via ZIP) |
| Node.js not installed | 🔴 BLOCKER | Must install from nodejs.org |
| npm not available | 🔴 BLOCKER | Resolved after Node.js install |

---

## 🔮 Future Considerations
- Auth: Currently 100% mock — need real auth (Supabase recommended)
- Database: No backend — need to decide on data layer
- Deployment: No CI/CD configured yet
- Real-time: Tickets/tasks may need WebSocket or polling
