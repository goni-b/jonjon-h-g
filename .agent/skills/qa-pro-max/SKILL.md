---
name: qa-pro-max
description: Quality Assurance (QA) testing intelligence for web applications. Specializes in verifying button functionality, UI/UX aesthetics, responsive design, and bug detection after changes.
---
# qa-pro-max

QA Testing Guide for web applications. This skill equips the agent to act as a dedicated QA Tester to ensure application stability, verify interactive elements (buttons, links, forms), and validate UI aesthetics ("נעים לעין" - pleasant to the eye) after any codebase changes.

## How to Use This Skill

When the user requests QA testing, UI validation after making a change, or asks you to act as a QA Tester, follow this workflow:

### Step 1: Analyze What Changed
Review the recent codebase changes to understand the scope of the testing required:
- What components or pages were affected?
- Are there new buttons, forms, or interactive elements?
- Was there a change to the layout, styling, or logic?

### Step 2: Verification Checklist (Static Code & Logic)

Perform the following checks based on the code context:

#### 1. Functional Testing (Buttons & Interactivity)
- Verify that every button has an `onClick` handler or valid navigation logic/type (`type="submit"` for forms).
- Ensure that forms handle submissions properly and have validation (e.g., Zod).
- Check that loading states (spinners, disabled buttons), success messages (Toasts/Sonner), and error states are implemented.
- If there are navigation links, ensure they point to the correct routes (using React Router DOM).
- Check that role-based access controls are respected (e.g., admin-only buttons are hidden from regular users).

#### 2. Visual & Aesthetic Testing ("נעים לעין")
- Verify that components use the correct design system tokens (e.g., Tailwind classes from JONJON design guidelines).
- Ensure consistent spacing (margins, paddings), alignment, and typography.
- Check hover and active states for buttons and interactive elements (e.g., `hover:bg-primary/90`, `transition-colors`).
- Ensure dark mode and light mode visibility (text contrast, card backgrounds, proper border colors).
- Ensure that all icons are consistent (e.g., Lucide React).

#### 3. Responsive Design & RTL
- Ensure UI components are responsive (mobile, tablet, desktop) using Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).
- Verify that there are no horizontal scrollbars on mobile views.
- Ensure RTL layout rules are respected (use logical properties like `ms-2`, `me-2`, `ps-4`, `pe-4` instead of `ml-2`, `mr-2` where applicable, or ensure the UI structure flows correctly from right to left).

#### 4. Edge Cases & Empty States
- Verify that lists/tables/grids have an `EmptyState` component when there is no data.
- Ensure text truncation (`truncate`, `line-clamp`) is used where necessary to avoid UI breakage with long text.

### Step 3: Dynamic Validation (If requested or necessary)

**Using Browser Subagent:**
If you need to test the actual rendered output, use the `browser_subagent` tool to navigate the local dev server (e.g., `http://localhost:5173`) and visually interact with the changes.
- Click buttons and submit forms.
- Verify visual output and layout shifts.
- Check for console errors.

### Step 4: Report Findings & Fixes

Present a QA Report to the user:
- **Pass/Fail Status:** State clearly if the feature passes QA.
- **Bugs Found:** Detail any broken functionality or missing logic.
- **UI/UX Improvements:** Suggest adjustments to make the UI more "נעים לעין" (e.g., "The button needs more padding", "The color contrast in dark mode is low").
- **Auto-Fixing:** If you are instructed to be proactive, fix the bugs in the code and notify the user of the fixes applied.

---

## Pre-Delivery QA Checklist

Before concluding any development task or marking a QA run as "Pass", confirm:

- [ ] All buttons have a clear purpose, interaction state (hover/active/disabled), and standard components (e.g., `shadcn/ui` `<Button>`).
- [ ] No raw `<button>` elements are used unless absolutely necessary.
- [ ] UI looks polished and professional ("נעים לעין") matching the brand DNA.
- [ ] Mock data or real data is integrated smoothly without breaking the layout.
- [ ] The feature respects the `gemini.md` schema and invariant rules.
