# FitOS — Build Guide & Master Claude Code Prompt

---

## Setup (do this before opening Claude Code)

```bash
# 1. Create Next.js app
npx create-next-app@latest fitos --typescript --tailwind --app

# 2. Install dependencies
cd fitos
npm install @anthropic-ai/sdk @supabase/supabase-js @supabase/ssr zustand zod

# 3. Copy this entire fitos-public/ folder into your project root
#    Your project should now have:
#    fitos/CLAUDE.md
#    fitos/knowledge/nutrition.md
#    fitos/knowledge/training.md
#    fitos/rules/PROMPTS.md
#    fitos/docs/PRD.md

# 4. Create .env.local
ANTHROPIC_API_KEY=sk-ant-your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 5. Set up Supabase
#    - Create a new Supabase project
#    - Run the SQL from docs/PRD.md section 12 in the SQL editor
#    - Enable Email auth + Google OAuth in Authentication settings

# 6. Open Claude Code
claude
```

---

## Master Claude Code Kickoff Prompt

Copy and paste this **exactly** as your first message in Claude Code:

---

```
Please read the following files in this exact order before writing any code:

1. CLAUDE.md
2. docs/PRD.md
3. rules/PROMPTS.md
4. knowledge/nutrition.md
5. knowledge/training.md

Once you have read all five files, confirm you have read them by summarising:
- What FitOS is (1 sentence)
- The 3 most important rules from CLAUDE.md
- How macros are computed (1 sentence)
- What the system prompt does (1 sentence)

Then begin building in this exact order:

PHASE 1 — Foundation (no UI yet)
Step 1: Create lib/types.ts with ALL interfaces from PRD sections 5 and the SplitId/GoalMode/ExperienceLevel types. Export everything.

Step 2: Create lib/macros.ts with computeMetrics(profile) and getMealTargets(). Implement the exact formula from CLAUDE.md. Add JSDoc comments.

Step 3: Create lib/variety.ts with:
  - countMealInPlan(mealName, weekPlan) → number
  - canAddMeal(mealName, weekPlan) → boolean (max 2×)
  - getVarietyStatus(weekPlan) → Record<string, number>

Step 4: Create lib/splits.ts with SPLIT_TEMPLATES record for all 6 splits from PRD section 7.5.

Step 5: Create lib/schemas.ts with all Zod schemas (MealSchema, MealsBySlotSchema, TrainingPlanSchema).

Step 6: Create lib/prompts/system.ts, lib/prompts/cuisine.ts, lib/prompts/ingredients.ts, lib/prompts/training.ts — implement exactly as shown in rules/PROMPTS.md.

Step 7: Create lib/claude.ts with callClaude(), parseClaudeJSON(), and callClaudeJSON() — exactly as shown in rules/PROMPTS.md.

Step 8: Create store/useAppStore.ts with Zustand. Include only UI/generated state — no user profile, no auth. Add localStorage persistence for weekPlan only.

PHASE 2 — Auth & Middleware
Step 9: Create middleware.ts that protects all /dashboard/** and /onboarding routes. Redirect unauthenticated users to /login. Redirect authenticated users without a profile to /onboarding.

Step 10: Create app/(auth)/login/page.tsx — clean login form (email/password + Google OAuth button). Use Supabase client.

Step 11: Create app/(auth)/register/page.tsx — registration form (name, email, password, confirm password).

Step 12: Create app/auth/callback/route.ts — handles OAuth callback, checks if profile exists, redirects to /onboarding or /dashboard.

PHASE 3 — Onboarding
Step 13: Create app/(onboarding)/onboarding/page.tsx — 5-step flow:
  - Step 1: Name, age, sex, weight (with kg/lbs toggle), height (with cm/ft toggle)
  - Step 2: Goal selection (recomp / cut / bulk) with visual cards and science descriptions
  - Step 3: Meals per day, dietary restrictions (multi-select chips), free text box
  - Step 4: Training days slider, experience level, split picker (show all 6 splits with descriptions)
  - Step 5: Macro preview — show computed values with explanations, confirm button
  On confirm: POST to /api/profile to save, then redirect to /dashboard.

PHASE 4 — API Routes
Step 14: Create app/api/profile/route.ts (GET returns profile+metrics, PATCH updates profile)

Step 15: Create app/api/meals/cuisine/route.ts:
  - POST handler
  - Server-side: get session → load profile from Supabase → computeMetrics → buildCuisinePrompt → callClaudeJSON → return MealsBySlot
  - NEVER trust profile from request body

Step 16: Create app/api/meals/ingredients/route.ts (same pattern, different prompt)

Step 17: Create app/api/training/generate/route.ts — SSE streaming response using Anthropic streaming SDK

PHASE 5 — Dashboard UI
Step 18: Create app/(dashboard)/layout.tsx with:
  - Sidebar: logo, user profile summary (fetched server-side), nav links to all 8 sections
  - Mobile: collapsible nav

Step 19: Create app/(dashboard)/dashboard/page.tsx:
  - Fetch profile server-side (React Server Component)
  - Pass to client components
  - KPI cards, macro split bars, goal science explainer, supplement stack, quick-nav buttons

Step 20 onward: Build remaining pages in this order:
  - cuisine/page.tsx
  - ingredients/page.tsx  
  - planner/page.tsx
  - training/page.tsx
  - exercises/page.tsx
  - roadmap/page.tsx
  - stats/page.tsx
  - settings/page.tsx

DESIGN RULES (apply to every component):
- Dark theme only. Background: #090b0e. Cards: #0f1117 with 1px rgba(255,255,255,0.06) border.
- Fonts: Clash Display for titles/numbers, Syne for labels/buttons, DM Sans for body.
- Gold (#e8c27a) = primary accent. Teal (#2dd4bf) = training. Blue (#5b8dee) = protein/nutrition.
- Cards hover: translateY(-2px) + slightly brighter border.
- All grids: CSS grid with auto-fill minmax for responsive behaviour.
- Loading states: skeleton shimmer, never just a spinner alone.
- All forms: proper validation with inline error messages, not alerts.

After each phase, confirm what was built and list any decisions you made that deviated from the spec.
Do not skip any step. If you encounter an ambiguity, make a reasonable decision and note it.
```

---

## What Each File Does

| File | Purpose |
|---|---|
| `CLAUDE.md` | 10 unbreakable rules. Claude Code reads this automatically. |
| `docs/PRD.md` | Full product spec — features, API contracts, DB schema, types. |
| `rules/PROMPTS.md` | All prompt templates. Dynamic, user-data-driven. No hardcoded values. |
| `knowledge/nutrition.md` | Jeff Nippard PDF principles. Injected as system context for meal prompts. |
| `knowledge/training.md` | Training science rules. Injected for training plan prompts. |

## Token Cost Estimate

| Action | Tokens | Cost (Sonnet) |
|---|---|---|
| Generate 21 meals (1 cuisine) | ~5,000 | ~$0.015 |
| Generate from ingredients | ~4,400 | ~$0.013 |
| Generate training plan | ~5,900 | ~$0.018 |
| Swap 1 meal | ~400 | ~$0.001 |
| **Per active user / month (est.)** | | **~$0.15–0.25** |
