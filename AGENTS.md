# Phynix Solutions — Global Codex Instructions

## Identity
You are working on projects for **Phynix Solutions Pty Ltd**, a software development agency.
Owner: Keir Whitehead. Orchestrator: Pip (OpenClaw agent on Mac A).

## Stack
- **Frontend:** React 18/19, Next.js 15/16, TanStack Start/Router, Tailwind CSS, shadcn/ui
- **Backend:** Convex (primary), Express + Prisma + PostgreSQL (legacy)
- **Auth:** Clerk (JWT issuer via Convex)
- **Hosting:** Vercel (frontend), Convex Cloud (backend), Railway (legacy)
- **Language:** TypeScript (strict mode, always)

## Non-Negotiable Rules
1. **Zero type errors.** No `ignoreBuildErrors`, no `strict: false`, no `@ts-ignore`, no `--typecheck=disable`. Fix the actual types.
2. **No `any` types** unless explicitly justified in a comment.
3. **Run validation before finishing.** Always run the project's lint/build/test command as your final step. If AGENTS.md in the repo specifies a check command, use it.
4. **Commit messages:** `type: short description` (feat, fix, refactor, docs, chore, test). No periods. Lowercase.
5. **No new dependencies** without explicit instruction. Prefer what's already installed.
6. **Convex patterns:** Use `v.object()` schemas, `query`/`mutation`/`action` from `convex/server`, handle errors with proper validation. Never use `any` in Convex schemas.
7. **File organization:** Follow existing project conventions. Don't reorganize unless asked.
8. **Tests alongside implementation.** When building a feature, write at least one test.
9. **No secrets in code.** Use environment variables.
10. **Document public APIs** with JSDoc comments.
11. **shadcn/ui is the ONLY component library.** No Material UI, no Chakra, no Ant Design, no hand-rolled components when shadcn has one. Install via `npx shadcn@latest add <component>`. Components live in `components/ui/`. Build feature components that compose shadcn primitives — never modify base `ui/` components directly. Forms use react-hook-form + zod via shadcn Form. Toasts use Sonner. Use `cn()` from `@/lib/utils` for conditional classes.

## UI Component Standard — shadcn/ui

**Every project MUST use shadcn/ui for all interactive UI components.**

- **Install:** `npx shadcn@latest init` (New York style, Zinc, CSS variables)
- **Add components:** `npx shadcn@latest add button card dialog table input form ...`
- **Compose, don't modify:** Build feature components in `components/[feature]/` that import from `components/ui/`
- **Standard set for dashboards:** button, card, input, label, select, textarea, dialog, sheet, tabs, table, badge, separator, skeleton, dropdown-menu, avatar, toast, sonner, tooltip, form, command, popover, calendar
- **Dark mode:** `next-themes` for Next.js, custom provider for Vite
- **Never use:** raw `<input>`, `<button>`, `<select>`, custom modals, hand-rolled dropdowns, `alert()`, or direct Radix imports when shadcn wraps them
- **Theming:** CSS variables in globals.css, not Tailwind overrides on individual components

## Git Workflow — Branch + PR (Mandatory)
**NEVER commit directly to `main`.** All work goes on a feature branch with a PR.

1. **Before starting work**, create a feature branch:
   ```bash
   git checkout -b <type>/<short-description>
   ```
   Examples: `feat/phoenix-portfolio`, `fix/settings-tabs`, `refactor/remove-any`

2. **Commit to the feature branch** as you work. Multiple commits are fine.

3. **When done**, push the branch and create a PR:
   ```bash
   git push -u origin <branch-name>
   ```
   Do NOT merge. A review agent will handle that.

4. **PR title** = your main commit message. PR body = summary of changes + validation results.

## Validation Commands (by project type)
- **Next.js + Convex:** `npx tsc --noEmit && npx convex codegen`
- **Next.js only:** `npx tsc --noEmit && npm run build`
- **TanStack Start:** `npx tsc --noEmit`
- **Express + Prisma:** `npx tsc --noEmit && npx prisma generate`

## Complex Task Approach
For medium+ tasks, follow Explore → Plan → Code → Commit:
1. Read relevant files first. Understand the patterns.
2. Plan the changes. List every file you'll modify.
3. Implement step by step. Verify types after each change.
4. Run validation. Fix errors. Commit.

For bug fixes, prefer test-first: write a failing test, then fix until it passes.

## Red Team Mindset

When reviewing code (yours or another agent's), switch to adversarial thinking. Don't look for what's right — hunt for what's wrong.

### Before Marking Any Task Complete, Ask:

- [ ] How would a malicious user break this? (auth bypass, injection, privilege escalation)
- [ ] What happens with empty input? Null? Undefined? A 10MB string? Negative numbers? Unicode?
- [ ] What if the network fails mid-operation? (partial writes, dangling state, retry safety)
- [ ] What if two users hit this endpoint at the same time? (race conditions, optimistic update conflicts)
- [ ] What assumptions am I making about the data shape, user behavior, or environment?
- [ ] Am I returning sensitive data I shouldn't be? (PII in responses, secrets in logs)
- [ ] What happens when this runs at 100x the expected load?

### When in Review Mode Specifically

- Don't just flag patterns — try to construct an actual exploit path
- Check every `as any`, every unchecked `.data` access, every missing `try/catch`
- Look at what's NOT there: missing auth checks, missing validation, missing error handling
- Read the code as an attacker, then as a confused new developer, then as a production oncall at 3am

Reference: SOP-17 Red Team Review Framework, `prompts/red-team-prompts.md`

---

## When You're Stuck
- Read the existing code patterns before inventing new ones.
- Check package.json for available scripts.
- If a build fails, fix the error. Don't skip it.
- If you need clarification, state your assumption and proceed. Don't stall.

## Output Style
- Be concise. No filler text.
- Show file paths and line numbers when referencing changes.
- Summarize what you changed and why at the end.
