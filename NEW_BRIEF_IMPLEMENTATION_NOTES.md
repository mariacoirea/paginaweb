# COIREA new brief implementation notes

Sources reviewed:

- `Auditoria y Diagnositco - COIREA.pdf`
- `COIREA — Website Design Brief v1.2.pdf`

## Strategic changes applied

1. Homepage now leads with solutions, not problems.
   - Hero uses the confirmed positioning: "The People Operating System for organizations that care."
   - Primary CTA is now "Book a conversation."
   - The assessment/reflection was moved lower as a fit check.

2. COIREA is positioned as a tool and connection space.
   - Copy now describes COIREA as a People Operating System supported by GiA and Stewards.
   - The narrative emphasizes evolutionary potential, coherence, regeneration, and systemic thinking.

3. Added "Who we work with" early in the page.
   - Purpose-driven companies and B Corps.
   - Consultancies and organizational advisors.
   - Foundations, NGOs, and social impact organizations.

4. Added a clearer methodology section.
   - Five pillars are presented as an interactive living system: Vision, Leadership, Strategy, Collaboration, and Well-Being.
   - Scores match the v1.2 brief direction and are clearly treated as illustrative.

5. Platform section is more dynamic.
   - Added an animated dashboard-reel surface instead of a static dashboard-only presentation.
   - Signal -> insight -> next action flow now mirrors the GiA example from the design brief.

6. Process language updated.
   - Public entry language uses "Consultation / Soil" instead of only "Soil."
   - The three phases are now Diagnose, Align and execute, Evolve and regenerate.

7. GiA is more tangible.
   - Added a full GiA section showing signal, insight, and reflection question.
   - Kept the floating GiA chatbox from the previous prototype.

8. Contact path simplified.
   - Final CTA offers a simple message path and `hello@coirea.com`.
   - Copy avoids heavy "apply to work" language.

## QA completed

- Production build passes with Vite.
- Local dev server returns HTTP 200 at `http://127.0.0.1:4173`.
- Browser smoke test verified:
  - New section order renders.
  - Interactive pillar selection works.
  - GiA chat opens and responds.
  - Fit check reaches the result state.
- Visual screenshot saved at:
  - `qa-new-brief-final.png`

## Animation pass added

- Scroll progress indicator in the fixed header.
- Hero choreography: staggered copy, drifting landscape, dashboard sheen, live status pulse, and scroll cue.
- Who We Work With: staggered section reveal, card lift, organic background rotation, and CTA arrow motion.
- Methodology: animated living-system orbit, morphing container, core pulse, and stable interactive pillar buttons.
- Platform: animated dashboard reel, scanning lines, flow-step lift feedback, and active action pulse.
- Process: existing stage icon hover and organic background motion preserved.
- GiA: large card orbital detail, hover-responsive insight rows, and animated chat entrance.
- Fit Check: animated question transitions, score orbit, and soft signal pulse.
- Closing: drifting landscape background and CTA hover feedback.
- Accessibility: `prefers-reduced-motion` remains enabled.
- QA screenshot after animation pass:
  - `qa-animation-pass.png`
- Dashboard score bars now animate from zero to their final percentage, and score numbers count up to the final values.
- QA screenshot for the dashboard bars:
  - `qa-bars-counter.png`

## Known follow-up items

- Replace illustrative dashboard animation with the real 60-90 second platform demo when available.
- Add real booking link, WhatsApp link, LinkedIn URL, and founder/Steward assets.
- Consider code-splitting Recharts and motion before production to reduce bundle size.
- Build the proposed `/about`, `/who-we-work-with`, `/insights`, and `/contact` pages once repo scope is confirmed.

## Real GitHub repo findings

Repo inspected: `mariacoirea/coireawebsite.git`

Useful information pulled into the prototype:

- GiA formal name: Guided Intelligence for Alignment.
- OVI formal name: Organizational Vitality Index.
- OVI scoring tiers:
  - 80-100: Systemic Coherence
  - 60-79: Emerging Alignment
  - 40-59: Fragile Stability
  - 0-39: Structural Risk
- Best-fit audience from existing FAQ: founder-led or mission-driven organizations navigating growth complexity, commonly 15-300 people.
- Public email: `hello@coirea.com`.
- Public LinkedIn: `https://www.linkedin.com/company/coirea`.

Useful implementation context:

- Current site is a Vite + React + TypeScript + Tailwind + shadcn app.
- It already has English and Spanish i18n with JSON locale files.
- It has Supabase functions for form submissions and Resend email.
- It has Search Console verification and GA4 in `index.html`.
- It has existing SEO helpers: `SEOHead.tsx` and `StructuredData.tsx`.
- Existing routes include `/`, `/about`, `/platform`, `/insights`, `/tools`, `/journey`, `/purpose`, `/guardians`, plus Spanish equivalents.

Information intentionally not pulled into the prototype:

- The old primary CTA "Apply Here", because the new brief recommends "Book a Conversation" or simple contact.
- `/purpose` as the public concept, because the new brief recommends replacing ecosystem/purpose framing with "Who We Work With."
- "Vision" as the About nav label, because the new brief recommends "About."
- The current consultancy-heavy schema/meta language, because it conflicts with the new platform-led positioning.
- Large existing hero images, because several are multi-megabyte files and the audit specifically flagged digital carbon/performance.
