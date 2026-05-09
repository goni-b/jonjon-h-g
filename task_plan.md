# 📋 task_plan.md — B.L.A.S.T. Project Plan
> JonJon H&G — Client Portal
> Created: 2026-05-09

---

## 🎯 Current Phase: Phase 0 → Blueprint

---

## ✅ Phase 0: Initialization
- [x] Clone/import project from GitHub
- [x] Read and understand full project structure
- [x] Create `gemini.md` (Project Constitution)
- [x] Create `task_plan.md`, `findings.md`, `progress.md`
- [ ] **Install Node.js** ← BLOCKER (not installed on machine)
- [ ] Install npm dependencies (`npm install`)
- [ ] Verify dev server runs (`npm run dev`)
- [ ] Answer 5 Blueprint Discovery Questions with user

---

## 🏗️ Phase 1: B — Blueprint
- [ ] North Star: Define singular desired outcome
- [ ] Integrations: Identify external services needed
- [ ] Source of Truth: Define where real data will live
- [ ] Delivery Payload: Define final output format
- [ ] Behavioral Rules: Lock down system behavior

**→ BLOCKED ON: Discovery Questions (see below)**

---

## ⚡ Phase 2: L — Link
- [ ] Set up real backend (Supabase / Firebase / custom API?)
- [ ] Test all API connections
- [ ] Create `.env` with verified credentials
- [ ] Build minimal handshake scripts

---

## ⚙️ Phase 3: A — Architect
- [ ] Build Pages: Tasks (`/app/tasks`)
- [ ] Build Pages: Calendar (`/app/calendar`)
- [ ] Build Pages: Reports (`/app/reports`)
- [ ] Build Pages: Shoot Days (`/app/shoot-days`)
- [ ] Build Pages: Content Calendar/Gantt (`/app/content-calendar`)
- [ ] Build Pages: Tickets (`/app/tickets`)
- [ ] Build Pages: Clients (`/app/clients`) — admin only
- [ ] Build Pages: Products (`/app/products`) — admin only
- [ ] Build Pages: Team Metrics (`/app/team-metrics`) — admin only
- [ ] Connect real auth (replace mock login)
- [ ] Connect real data to Dashboard

---

## ✨ Phase 4: S — Stylize
- [ ] Review RTL polish across all pages
- [ ] Mobile responsiveness audit
- [ ] Dark/light mode verification
- [ ] Animation and UX polish

---

## 🛰️ Phase 5: T — Trigger
- [ ] Deploy to production (Vercel / Netlify?)
- [ ] Set up CI/CD from GitHub
- [ ] Finalize Maintenance Log in `gemini.md`

---

## 🔴 Current Blockers
1. **Node.js not installed** — Cannot run dev server or install packages
   - Fix: Install from https://nodejs.org/en/download (LTS version)
2. **Blueprint Discovery Questions** — Not yet answered by user
