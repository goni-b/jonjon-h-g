---
name: designing-premium-interfaces
description: Designs high-converting, premium web and mobile applications using UI/UX Pro Max principles. Use when the user requests an app, website, landing page, or dashboard design.
---

# Premium App & Website Designer

## When to use this skill
- User requests to build, design, or style a new website, landing page, or application.
- User wants to upgrade the UI/UX of an existing project.
- The project requires a "Pro Max", premium, glassmorphism, or highly modern aesthetic.

## Workflow

### 1. Requirements & Vibe Analysis
- **Analyze Request:** Determine the product type (SaaS, e-commerce, portfolio), required stack (e.g., React, Tailwind), and desired emotional response (trust, excitement, luxury).
- **Determine Style:** Choose a premium aesthetic (e.g., Glassmorphism, Dark Mode, Brutalism, Minimalist Luxury).
- **Select Palette:** Choose a harmonious, curated color palette. Avoid generic primary colors. Use HSL-tailored colors or sleek dark modes.

### 2. Implementation Protocol
Execute the design using these "Pro Max" rules:

```css
/* Example: Premium Glassmorphism Card (Tailwind) */
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
  <!-- Content -->
</div>
```

- **Typography:** Use modern Google Fonts (Inter, Roboto, Outfit, Plus Jakarta Sans) instead of browser defaults.
- **Icons:** NEVER use emojis as UI icons. ALWAYS use SVG icons (Lucide, Heroicons, Simple Icons). Maintain consistent sizing (e.g., `w-6 h-6` with fixed `viewBox`).
- **Interaction & Feedback:** 
  - Ensure all clickable elements have `cursor-pointer`.
  - Add smooth transitions (`transition-colors duration-200` or `duration-300`).
  - Provide clear hover feedback (color, shadow, border) without causing layout-shifting scale transforms.
- **Layout & Spacing:** Use consistent max-widths (`max-w-6xl` or `max-w-7xl`). For floating navbars, use spacing like `top-4 left-4 right-4` rather than sticking them directly to edges.
- **Light/Dark Mode Contrast:** Ensure glass elements in light mode are visible (e.g., `bg-white/80`). Maintain minimum 4.5:1 text contrast. Use slate/gray tones properly (e.g., `#0F172A` for light mode text).

### 3. Execution Checklist
Copy and update this checklist during execution:

- [ ] Typography is modern and consistent.
- [ ] No emojis used as icons (SVG used exclusively).
- [ ] Hover states provide visual feedback without layout shifts.
- [ ] Transitions and micro-animations are smooth (150-300ms).
- [ ] Light/Dark mode contrast is verified (glass elements and borders visible).
- [ ] Layout is responsive (mobile to desktop) with no horizontal scroll on mobile.
- [ ] Design feels dynamic, alive, and "Pro Max" premium.

## Instructions
- **Aesthetics First:** The user should be wowed at first glance. If your web app looks simple and basic, you have failed.
- **No Placeholders:** If you need an image, use standard image generation or high-quality unsplash placeholders. Do not leave empty gray boxes.
- **SEO Best Practices:** If building web pages, include proper Title Tags, Meta Descriptions, and Semantic HTML (single `<h1>`, proper heading hierarchy).
