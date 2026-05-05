# FIISmart Frontend Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. For Phase 2, REQUIRED SUB-SKILL: superpowers:dispatching-parallel-agents.

**Goal:** Integrate every team's feature branch into a single working `dev` branch — one Vite + React 19 + TS + Tailwind v4 app that contains landing, auth, professor course-builder, professor dashboard, student dashboard, video lesson player, and quiz, behind one router with shared auth.

**Architecture:** Treat `migrate/vite-react-ts` as the canonical base (Vite + React 19 + Tailwind v4 + shadcn/ui + react-router-dom v7 + a working `lib/api.ts` for the course API). Do **not** attempt git-merges across branches — they have incompatible package.jsons, build tools (Next vs Vite), TS configs, Tailwind versions, source layouts, and React versions. Instead **port** each branch's source into a unified `src/features/<name>/` layout in `dev`, using parallel agents on isolated git worktrees. Each agent owns one feature, produces a `dev/feat-<name>` branch, and the integrator (you) merges them into `dev` in dependency order, resolving cross-cutting concerns (routing, auth, API base URL, design tokens) along the way.

**Tech Stack (target):** Vite 7, React 19, TypeScript 5.7, Tailwind v4, react-router-dom v7, shadcn/ui (Radix), lucide-react, sonner. Backend talked to via `/api` (proxied in `vite.config.ts`).

---

## Branch Inventory & Notes

| Source branch | Feature | Stack | Action |
|---|---|---|---|
| `migrate/vite-react-ts` | Course builder + courses list (prof) | Vite/React19/TSX/Tailwind4 | **Base** of `dev` |
| `dashboard-prof-front` | Professor dashboard | Vite/React19/TSX/Tailwind4 | Port → `src/features/dashboard-prof` |
| `landing-page-front` | Public landing page | Vite5/React18/Tailwind3, **commits node_modules** | Port → `src/features/landing` (upgrade to React19/Tailwind4) |
| `origin/curs-video-front` | Student video lesson + comments | Vite/React19/TSX/Tailwind4 | Port → `src/features/lesson-video` |
| `origin/login-signin-front` | Auth (login/signup, ToS, Privacy, ProtectedRoute, AuthContext) | Vite/React19/TSX, **inline styles** | Port → `src/features/auth` (Tailwind-ize) |
| `origin/quiz-page-front` | Quiz player | Vite/React19/TSX/Tailwind4, **nested in `ProiectIP_files/`** | Port → `src/features/quiz` |
| `origin/student-page-dashboard` | Student dashboard | Vite/React19 **JSX (no TS)**, monolith App.jsx | Port → `src/features/dashboard-student` (TSX-ify, decompose) |
| `origin/web-quizz-app` | Older quiz copy | duplicate | **Drop** (superseded by `origin/quiz-page-front`) |
| `create/modular-course-builder`, `feature/backend-integration` | Next.js predecessors of base | Next 14 | **Drop** (already migrated by `migrate/vite-react-ts`) |
| `pr-2`, local `create/edit-courses-front` | Same as base | — | **Drop** (alias of base) |

## Bad Code / Problems Surfaced (must fix during port)

1. **`landing-page-front` commits `node_modules/`** — port source only; never bring the directory across.
2. **`landing-page-front` is React 18 + Tailwind v3** — must upgrade JSX to React 19 idioms; rewrite `tailwind.config.js` content into Tailwind v4 `@theme` in `src/index.css`.
3. **`student-page-dashboard` is one 200-line `App.jsx`, plain JS, hardcoded `http://localhost:8081/api/dashboard/<STUDENT_ID>`** — split into components, convert to TSX, route the API through the shared `/api` proxy, take `studentId` from the auth user.
4. **`curs-video-front` hardcodes `http://localhost:8081/api/...` and `TEST_STUDENT_ID`/`TEST_COURSE_ID`** — switch to `lib/api.ts` + `/api` and read course/lecture IDs from route params.
5. **`login-signin-front` uses heavy inline `style={{...}}` objects** instead of Tailwind/shadcn — re-style with `cn` + Tailwind classes; reuse shadcn `<Button>`, `<Input>`, `<Label>`, `<Card>`.
6. **`quiz-page-front` source is buried in `ProiectIP_files/src/`** — drop the prefix when porting.
7. **`quiz-page-front` declares `typescript@~6.0.2`** which doesn't exist — ignore that package.json; use the base's TS 5.7.
8. **Three backend ports observed in code (8080, 8081, and the new canonical 8000)** — **canonical backend is `http://localhost:8000`**. `vite.config.ts` `server.proxy['/api']` targets `http://localhost:8000` by default; per-feature overrides via `.env.local`'s `VITE_API_ORIGIN`. Every port-referenced URL in feature branches must be rewritten to `/api/...` (proxied) — never raw `localhost:8081`/`localhost:8080`.
9. **`@/` alias points to repo root** in the base, with `components/` and `lib/` *outside* `src/`. **Decision: relocate `components/`, `hooks/`, `lib/` under `src/`** during Phase 1 so the alias means `src/`. This fixes the unusual layout and makes ported features less surprising.
10. **No central auth wiring in base** — Phase 1 introduces `AuthProvider` (from auth branch) at the root and `<ProtectedRoute>` for guarded segments.
11. **Test/teacher IDs (`TEACHER_ID = "aaaa..."`, `TEST_STUDENT_ID`)** hardcoded in current pages — replace with `useAuth().user.id` (or role-derived ID) once auth is in.
12. **Design tokens differ per branch** (`bg-edu-bg`, hardcoded `#F4EFE8`, `#9b8ec7`) — Phase 1 establishes a single token set in `src/index.css` (Tailwind v4 `@theme`) and each port maps to it.

---

## Phase 0 — Bootstrap dev (sequential, one task each)

### Task 0.1: Confirm `dev` is anchored on `main`

**Files:** none (git only)

**Step 1:** `git status` — expect clean tree, branch `dev`.
**Step 2:** `git log --oneline -3` — expect to see `c090a39a Update README to simplify content` as HEAD.
**Step 3 (commit):** none (no changes yet).

### Task 0.2: Bootstrap `dev` with the Vite base

**Goal:** Get `dev` to the same shape as `migrate/vite-react-ts` so subsequent ports have a place to land.

**Files:** every file from `migrate/vite-react-ts` lands on `dev`.

**Step 1:** `git merge --no-ff migrate/vite-react-ts -m "chore(dev): seed dev with vite base from migrate/vite-react-ts"`
Expected: fast-forward (since `dev` is a strict ancestor of that branch).
**Step 2:** `npm install` — verify lockfile resolves.
**Step 3:** `npm run build` — must succeed.
**Step 4:** `npm run dev`, open `http://localhost:3000/cursuri` — page renders (with backend offline, expect API toasts but no crash).

### Task 0.3: Move `components/`, `hooks/`, `lib/` under `src/` and re-point `@/` alias

**Why:** Today `@/` resolves to repo root because top-level `components/`/`lib/`/`hooks/` are outside `src/`. Ports from other branches assume `@/` = `src/`. Standardize.

**Files:**
- Move: `components/` → `src/components/`, `hooks/` → `src/hooks/`, `lib/` → `src/lib/`
- Modify: `vite.config.ts` (`alias['@']` → `path.resolve(__dirname, "src")`)
- Modify: `tsconfig.json` (`paths['@/*']` → `["./src/*"]`)
- Modify: `components.json` (shadcn aliases → `@/components`, `@/lib`, `@/hooks`)

**Step 1:** `git mv components src/components && git mv hooks src/hooks && git mv lib src/lib`
**Step 2:** Update `vite.config.ts` alias and `tsconfig.json` paths.
**Step 3:** `npm run build` — fix any import path drift.
**Step 4:** `git commit -am "refactor(layout): move components/hooks/lib under src/, repoint @/ alias"`

### Task 0.4: Establish unified design tokens & global CSS

**Files:**
- Modify: `src/index.css` — add `@theme` block with the FIISmart palette (`--color-edu-bg: #F2EAE0`, `--color-edu-purple: #9b8ec7`, `--color-edu-mint: #2dd4bf`, `--color-edu-foreground: #1a1a2e`, etc.) so `bg-edu-bg`, `text-edu-foreground` work everywhere.

**Step 1:** Add the `@theme` block; remove any conflicting per-branch overrides as they're ported.
**Step 2:** `npm run build` (must succeed).
**Step 3:** `git commit -am "feat(theme): unified Tailwind v4 design tokens for FIISmart"`

### Task 0.5: Push `dev` to origin

**Step 1:** `git push -u origin dev`

---

## Phase 1 — Cross-cutting scaffolding (sequential, blocks Phase 2)

### Task 1.1: Introduce `AuthProvider` + `ProtectedRoute` at the app root

**Files:**
- Create: `src/features/auth/` (empty for now; populated in Phase 2 by the auth agent)
- Modify: `src/main.tsx` — wrap `<App/>` with `<AuthProvider>` (interface only; provider lives under `src/features/auth/context/AuthContext.tsx`)
- Modify: `src/App.tsx` — top-level `<Routes>` skeleton with placeholders so feature agents only need to drop their routes in:

```tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { UserRole } from "@/features/auth/types";

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<div>landing placeholder</div>} />
      <Route path="/auth/*" element={<div>auth placeholder</div>} />
      <Route path="/terms" element={<div>terms placeholder</div>} />
      <Route path="/privacy" element={<div>privacy placeholder</div>} />

      {/* student */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
        <Route path="/student/dashboard" element={<div>student dash placeholder</div>} />
        <Route path="/student/courses/:courseId/lectures/:lectureId" element={<div>video placeholder</div>} />
        <Route path="/student/quizzes/:quizId" element={<div>quiz placeholder</div>} />
      </Route>

      {/* professor */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.PROFESSOR]} />}>
        <Route path="/professor/dashboard" element={<div>prof dash placeholder</div>} />
        <Route path="/professor/courses" element={<div>course list placeholder</div>} />
        <Route path="/professor/courses/:courseId" element={<div>course builder placeholder</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

**Step 1:** Add `src/features/auth/types.ts` with the `UserRole` enum (`STUDENT`, `PROFESSOR`) so the placeholder Routes import succeeds.
**Step 2:** Add a stub `ProtectedRoute` and stub `AuthProvider` that pass-through their children — to be replaced in Phase 2 by the auth agent.
**Step 3:** `npm run build` (must succeed).
**Step 4:** `git commit -am "feat(app): top-level route skeleton with auth/protectedroute stubs"`

### Task 1.2: Centralize the API client and env config

**Files:**
- Modify: `src/lib/api.ts` — keep current course-builder helpers; export `apiFetch(path, init)` as a single primitive every feature uses.
- Create: `.env.example` documenting `VITE_API_URL` (used by the client) and `VITE_API_ORIGIN` (used by the dev proxy).
- Modify: `vite.config.ts` — keep existing `/api` proxy.

**Step 1:** Refactor `request` into named export `apiFetch`; current course functions stay.
**Step 2:** `npm run build`.
**Step 3:** `git commit -am "feat(api): export apiFetch primitive for all features to share"`

### Task 1.3: Move existing pages into `src/features/`

**Why:** Make the layout `src/features/<feature>/{components,pages,services,types,hooks}.ts` uniform so feature agents only have one shape to learn.

**Files:**
- `git mv src/pages/CourseBuilderPage.tsx src/features/course-builder/pages/CourseBuilderPage.tsx`
- `git mv src/pages/CoursesListPage.tsx src/features/courses/pages/CoursesListPage.tsx`
- `git mv src/components/course-builder src/features/course-builder/components`
- Update imports in moved files (`@/components/course-builder/...` → `@/features/course-builder/components/...`)
- Update `src/App.tsx` placeholder imports.

**Step 1:** Do the moves.
**Step 2:** `grep -rn "@/components/course-builder\|src/pages/Course" src` and fix every reference.
**Step 3:** `npm run build` — must pass.
**Step 4:** `git commit -am "refactor(features): adopt src/features/<name> layout for course-builder, courses"`

### Task 1.4: Push the scaffolding

**Step 1:** `git push origin dev`

After Phase 1, every feature agent will branch from `dev` and own one folder under `src/features/`.

---

## Phase 2 — Parallel feature ports (parallel agents)

> **REQUIRED SUB-SKILL:** superpowers:dispatching-parallel-agents

Each agent gets a **git worktree** (`isolation: "worktree"`), branches from `dev` as `dev/feat-<feature>`, and edits **only** its own subtree. Cross-feature edits (App.tsx routes, package.json deps) are batched and applied by the integrator after merge.

Common rules baked into every agent prompt:
- Branch from `dev`. Worktree-isolated.
- Stack is fixed: React 19 + TS + Tailwind v4 + shadcn/ui + react-router-dom v7. Do not introduce alternative routers, styling libs, state libs.
- Use `import * as api from "@/lib/api"` or `import { apiFetch } from "@/lib/api"`. Never hardcode `http://localhost:8081`. If a backend route doesn't exist in `lib/api.ts`, add it there with TypeScript types.
- Use `useAuth()` from `@/features/auth/context/AuthContext` for the current user. Never hardcode user/student/teacher IDs.
- Inline `style={{...}}` is forbidden — use Tailwind classes; prefer shadcn primitives in `@/components/ui/*`.
- The agent must not edit `src/App.tsx`, `src/main.tsx`, `package.json`, `vite.config.ts`, or `src/index.css`. Instead, the agent's final report lists the routes/deps/theme tokens it needs added — the integrator applies them.
- Each agent must produce a working `npm run build` on its branch before reporting done.

### Agent A — Auth (`feat-auth`)

**Source branch:** `origin/login-signin-front` (used for *contracts* — `auth.service.ts`, validation rules, `UserRole`, `ProtectedRoute` semantics, ToS/Privacy copy. **UI is to be re-imagined**, not literally ported.)
**Target dir:** `src/features/auth/`
**Required outputs:**
- `context/AuthContext.tsx`, `services/auth.service.ts`, `types.ts` (export `UserRole`), `utils/validation.ts`, `components/ProtectedRoute.tsx`, `components/TermsOfService.tsx`, `components/PrivacyPolicy.tsx` — keep functional contracts/copy from the source branch.
- **Re-imagined UI:** `pages/AuthPage.tsx` — modern split-screen layout (brand panel + form panel), shadcn `<Tabs>` for Login/Signup, `<Card>`, `<Button>`, `<Input>`, `<Label>`, `<Form>` (react-hook-form + zod from existing deps), full keyboard a11y, error states, loading states. Use the FIISmart palette (`bg-edu-bg`, `text-edu-foreground`, accent `bg-edu-purple`).
- **Forbidden:** any `style={{...}}` block. Tailwind only.
- Service must call backend via `apiFetch` (not `fetch` directly). All paths go through `/api`.
**Routes to register (reported back to integrator):**
- `/auth` → `<AuthPage>`, `/terms` → `<TermsOfServicePage>`, `/privacy` → `<PrivacyPolicyPage>`
- Replace stub `<ProtectedRoute>` and `<AuthProvider>` with the real ones.
**Done when:** `npm run build` passes; visiting `/auth` renders the form (no backend required).

### Agent B — Landing (`feat-landing`)

**Source branch:** `origin/landing-page-front`
**Target dir:** `src/features/landing/`
**Required outputs:**
- Port `src/components/{Navbar,Hero,Features,About,HowItWorks,Stats,Courses,Testimonials,CTA,Footer}.tsx` into `src/features/landing/components/`.
- `pages/LandingPage.tsx` composes them.
- Upgrade JSX/types to React 19 (no `React.FC`, function components only). Replace any Tailwind v3 directives with v4. Convert `tailwind.config.js` color extensions into Tailwind v4 `@theme` tokens reported back to integrator.
- **Do NOT bring `node_modules/` over.** Source files only.
- Replace `lucide-react@0.383` usage with the existing `lucide-react@^0.564` (no version bumps needed).
- Replace any `<a href="#cursuri">` style anchor links with react-router `<Link to="/auth">` for "Sign up" CTAs and `<a href="#section">` for in-page section nav.
**Routes:** `/` → `<LandingPage>`.
**Done when:** `npm run build` passes; `/` renders the landing page.

### Agent C — Professor Dashboard (`feat-dashboard-prof`)

**Source branch:** `dashboard-prof-front`
**Target dir:** `src/features/dashboard-prof/`
**Required outputs:**
- Port `src/components/{Navbar,Sidebar,StatCard,CourseCard,QuizTable,CommentList,ActionCard}.tsx` and `src/pages/Dashboard.tsx`, plus `src/types.ts` → `types.ts`.
- Compose into `pages/ProfessorDashboardPage.tsx`.
- The existing `Navbar` from this branch likely conflicts with the auth/landing navbar — rename to `ProfDashboardNavbar` to avoid confusion; it's only used inside the dashboard layout.
- Wire data via `apiFetch` (replace any direct `fetch`); the teacher ID comes from `useAuth().user.id` — never the hardcoded `"aaaaaaaaaaaaaaaaaaaaaaaa"`.
**Routes:** `/professor/dashboard` → `<ProfessorDashboardPage>`.
**Done when:** `npm run build` passes; `/professor/dashboard` renders (mock data acceptable if backend offline; no crashes).

### Agent D — Student Dashboard (`feat-dashboard-student`)

**Source branch:** `origin/student-page-dashboard`
**Target dir:** `src/features/dashboard-student/`
**Required outputs:**
- **Convert `App.jsx` → TSX** and **decompose** the 200-line monolith into:
  - `pages/StudentDashboardPage.tsx`
  - `components/{StudentNavbar,StatsGrid,QuickActions,MyCourses,QuizzesTable,AnswersFeed,StatCard,CourseCard}.tsx`
- Replace `axios` with `apiFetch`. Remove `axios` from any new dependency request — the integrator already has `fetch`.
- Replace `STUDENT_ID = "69ca821fd0882443e8ed8c75"` with `useAuth().user.id`.
- Add types for the API responses (`StudentStats`, `StudentCourse`, `StudentQuiz`, `Answer`, `Recommendation`, `ContinueStudy`) in `types.ts`.
- Backend route base is `/api/dashboard/<studentId>/...` — keep the path, only change origin/baseUrl handling to use `apiFetch`.
**Routes:** `/student/dashboard` → `<StudentDashboardPage>`.
**Done when:** `npm run build` passes; `/student/dashboard` renders without runtime errors when the backend is offline (must handle 404/empty gracefully).

### Agent E — Lesson Video (`feat-lesson-video`)

**Source branch:** `origin/curs-video-front`
**Target dir:** `src/features/lesson-video/`
**Required outputs:**
- Port `src/components/{VideoPlayer,CommentItem,CommentsSection,CourseInfo,Header,Sidebar}.tsx`, `src/services/courseService.ts` → `services/lesson-video.service.ts`, `src/types/{index.ts,loadYouTubeAPI.ts,videoUtils.ts,youtube.d.ts}` → `types/`.
- `pages/LessonVideoPage.tsx` consumes route params: `useParams<{ courseId: string; lectureId: string }>()`.
- Replace `TEST_STUDENT_ID`/`TEST_COURSE_ID` with `useAuth().user.id` + route params.
- Replace `fetch('http://localhost:8081/api/...')` with `apiFetch('/students/...')`.
- Add the YouTube API loader; reuse the existing `youtube.d.ts` ambient types.
**Routes:** `/student/courses/:courseId/lectures/:lectureId` → `<LessonVideoPage>`.
**Done when:** `npm run build` passes; route renders with stub data when backend is offline.

### Agent F — Quiz (`feat-quiz`)

**Source branch:** `origin/quiz-page-front` (drop the `ProiectIP_files/` prefix when porting; ignore that branch's package.json)
**Target dir:** `src/features/quiz/`
**Required outputs:**
- `components/{Header,QuizStartPage,QuizQuestionPage,QuizResultPage}.tsx`
- `pages/QuizPlayerPage.tsx` orchestrates the three subpages with internal state (no nested `BrowserRouter` — the app already has one).
- Replace mock `quizData.ts` with a `services/quiz.service.ts` that calls `apiFetch('/quizzes/:quizId')`. Keep `quizData.ts` exported as `MOCK_QUESTIONS` for offline dev.
- Add types: `QuizQuestion`, `QuizSubmission`, `QuizResult`.
**Routes:** `/student/quizzes/:quizId` → `<QuizPlayerPage>`.
**Done when:** `npm run build` passes; route renders.

### Agents finish — report back

Each agent reports:
1. Branch name (e.g., `dev/feat-auth`).
2. Files added/changed.
3. Routes to register (path + element).
4. Theme tokens needed (if any).
5. New dependencies needed (if any) — agent should not add to `package.json`; integrator will batch.
6. Outstanding TODOs the agent could not resolve.

---

## Phase 3 — Integration (sequential, integrator does this)

### Task 3.1: Merge auth first

**Why:** Other features depend on `useAuth()` and `<ProtectedRoute>`.
**Step 1:** `git checkout dev && git merge --no-ff dev/feat-auth`
**Step 2:** Replace stubs in `src/App.tsx` and `src/main.tsx` with real `AuthProvider` + `ProtectedRoute`. Register `/auth`, `/terms`, `/privacy` routes.
**Step 3:** `npm run build` — must pass.
**Step 4:** `git commit -am "feat(auth): integrate AuthProvider, ProtectedRoute, AuthPage"`

### Task 3.2: Merge landing

**Step 1:** `git merge --no-ff dev/feat-landing`
**Step 2:** Register `/` → `<LandingPage>` (replacing stub).
**Step 3:** Apply theme-token additions to `src/index.css`.
**Step 4:** `npm run build`. `npm run dev` and visit `/` — verify it renders.
**Step 5:** `git commit -am "feat(landing): integrate landing page"`

### Task 3.3: Merge dashboards (prof, student) in parallel-friendly order

**Step 1:** `git merge --no-ff dev/feat-dashboard-prof`. Register `/professor/dashboard`. Build.
**Step 2:** `git merge --no-ff dev/feat-dashboard-student`. Register `/student/dashboard`. Build.
**Step 3:** Visit each route logged in as the matching role; verify no console errors.
**Step 4:** Commit after each merge.

### Task 3.4: Merge content features (course-builder is already in; lesson-video, quiz)

**Step 1:** `git merge --no-ff dev/feat-lesson-video`. Register `/student/courses/:courseId/lectures/:lectureId`. Build.
**Step 2:** `git merge --no-ff dev/feat-quiz`. Register `/student/quizzes/:quizId`. Build.
**Step 3:** Add a "Lessons" link from the student dashboard course card to the lesson route, and a "Quiz" link to the quiz route — small follow-up commit.

### Task 3.5: Cross-feature wiring

- **Top nav:** Conditional on auth state — landing nav for guests, role nav (`/student/...` or `/professor/...`) for logged-in users. Keep one `<Navbar>` in `src/components/AppNavbar.tsx` that switches on `useAuth().user?.role`.
- **404:** `*` route → friendly `NotFoundPage` in `src/components/NotFound.tsx`.
- **Logout:** Hook a logout button from auth context into the appropriate navbar items.

### Task 3.6: Smoke test the whole app

**Step 1:** `npm run build` — passes.
**Step 2:** `npm run dev` and walk every route:
- `/` (landing)
- `/auth` (login + signup, both tabs render)
- `/professor/dashboard`, `/professor/courses`, `/professor/courses/<id>`
- `/student/dashboard`, `/student/courses/<id>/lectures/<id>`, `/student/quizzes/<id>`
- `/terms`, `/privacy`
- `/nonexistent` → NotFound

**Step 3:** Verify in DevTools that each route either renders with mock data or hits `/api/...` (proxied). No `localhost:8081` direct calls.

### Task 3.7: Push dev

`git push origin dev`

---

## Phase 4 — Cleanup

### Task 4.1: Remove dead branches' artifacts

- `feature/backend-integration`, `create/modular-course-builder` (Next.js predecessors): leave them on origin (history). Local branches: prune.
- `origin/web-quizz-app`: superseded by `origin/quiz-page-front`. Leave on origin; do not port.

### Task 4.2: Update README

Replace placeholder README with: project description, quick-start (`npm install && npm run dev`), env vars (`VITE_API_URL`, `VITE_API_ORIGIN`), feature directory map.

### Task 4.3: Add an `.nvmrc` and lockfile sanity

- `.nvmrc` → `20` (matches Vite 7 / TS 5.7).
- `npm ci` from a clean `node_modules` to confirm lockfile health.

---

## Risks & Tradeoffs (call these out to the user)

1. **No git-merge across feature branches** — we *port*, not merge. This loses the file-level history of source branches. Acceptable because the original branches are kept on origin for reference.
2. **Landing branch's React 18 → 19 jump** is small (no breaking changes for these components), but `lucide-react` icon set is older — port may surface missing icons that need substitutes.
3. **Auth branch has zero Tailwind** — re-styling from inline styles to Tailwind is the bulk of Agent A's work; preserve original UX (color, spacing) to avoid review churn.
4. **Student dashboard JSX → TSX** introduces type-correctness work the original team skipped; expect 30-60min of typing API responses.
5. **Backend port mismatch (8080 vs 8081)** is settled by `vite.config.ts` proxy. If two backends genuinely exist, surface that to the user; do not silently ignore.
6. **Course builder uses `TEACHER_ID = "aaaa..."`** today — Phase 3 swaps it for `useAuth().user.id`, which means the page won't render until login works. That's the right behavior, but flag the cross-cutting break to the integrator.

## Success Criteria

- `dev` branch contains every feature; `npm run build` and `npm run dev` both succeed.
- Every route in the route table above renders without runtime errors when the backend is offline.
- No file imports `http://localhost:8081` anywhere.
- No `style={{...}}` blocks survive in `src/features/auth/`.
- `node_modules/` is not committed.
- Single `package.json`, single `vite.config.ts`, single Tailwind config, single design-token block.
