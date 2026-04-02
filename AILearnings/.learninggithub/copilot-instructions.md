<!-- MANDATORY PROTOCOL — THIS OVERRIDES ALL OTHER INSTRUCTIONS -->

## Table of Contents

1. [Two-Tier Architecture](#two-tier-architecture)
2. [Instructions Router](#instructions-router--what-is-auto-loaded-19-files)
3. [Step 0 Protocol](#-step-0--load-skills-before-any-code)
4. [Skill Catalog](#skill-catalog-for-step-0a-scan)
5. [Task Planning](#task-planning--mandatory-todo-items)

---

## Two-Tier Architecture

This project uses a **two-tier knowledge system**:

| Type             | Source                           | Loading            | Purpose                                                                       |
| ---------------- | -------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| **Instructions** | `.github/instructions/*.md`      | Auto-loaded        | Universal rules: coding style, naming, guardrails, tech stack, project vision |
| **Skills**       | `.github/skills/<name>/SKILL.md` | On-demand (Step 0) | Domain-specific: React, testing, forms, i18n, performance, security           |

### Instructions Router — What is auto-loaded (19 files)

| Category                   | File                                            | What it covers                                                              |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| **Core philosophy**        | `typescript-core-intent`                        | Respect architecture, readable > clever, extend before inventing            |
| **AI response rules**      | `frontend-ai-response-guidelines`               | Code quality, type safety, a11y defaults, proactive suggestions             |
| **Coding style**           | `typescript-coding-style-and-conventions`       | Boolean naming, guard clauses, async/await, destructuring, strict equality  |
| **Verification**           | `verification-pipeline`                         | pnpm verify:all, typecheck, lint, test, build, startup validation           |
| **TS guardrails**          | `typescript-general-guardrails`                 | No any, no console.log, #logger, process.env → config.ts, no CommonJS       |
| **TS naming**              | `typescript-naming-and-style`                   | PascalCase types, camelCase vars, named exports, Props naming               |
| **TS architecture**        | `typescript-architecture-and-patterns`          | No enum, explicit return types, no @ts-ignore, no circular deps             |
| **Tech stack**             | `frontend-tech-stack-and-context`               | React 18, Next.js 14 Pages Router, Apollo, SCSS, Vitest — ALLOWED/FORBIDDEN |
| **Imports**                | `frontend-standards-imports-and-aliases`        | # path aliases, import order, no deep relative imports                      |
| **Naming/exports**         | `frontend-standards-naming-and-exports`         | PascalCase components, kebab-case folders, named exports                    |
| **Libraries**              | `frontend-library-standards`                    | dayjs, sonner, classnames, immer, react-i18next — approved/banned           |
| **Boy Scout Rule**         | `frontend-boy-scout-rule`                       | Isolate refactoring, no big bang, respect legacy                            |
| **Gatekeeper**             | `devcontainer-and-gatekeeper`                   | Protected commands (rm, mv, git push/commit), sudo gatekeeper allow         |
| **Terminal ops**           | `terminal-commands`                             | git mv/rm for tracked files, verification commands, batch ops               |
| **Project: As-Is**         | `project-current-state-as-is`                   | Current architecture, tech debt, CMS coupling, code quality issues          |
| **Project: To-Be**         | `project-strategic-vision-to-be`                | Library-First Architecture, NX conventions, CMS decoupling, micro-FE        |
| **Project: Goals**         | `project-immediate-refactoring-goals`           | Refactor God components, extract hooks, remove PubSub/Zustand               |
| **Project: Anti-patterns** | `project-anti-patterns-legacy-do-not-replicate` | Atomic Design legacy, cms-elements coupling, data-modules God Objects       |
| **Project: Structure**     | `project-project-structure-rules`               | NX library rules, import aliases, utils vs helpers, dependency direction    |

> **Note:** Instructions are auto-injected — no manual file reads needed.

---

## ⛔ STEP 0 — LOAD SKILLS BEFORE ANY CODE

**You MUST NOT write, edit, generate, or suggest ANY code until ALL steps below are completed.**

**EXECUTION PROTOCOL**: Steps 0A–0C MUST execute fully. The `read_file` calls in Step 0B are MANDATORY tool calls, not optional. Only user-facing artifact: collapsed `<details>` block with skill list (Step 0A). After ALL skills are read and verified, proceed to task response.

### Step 0A — Build the skill reading list

Instructions are auto-loaded. Only Skills (`.github/skills/`) require `read_file` calls.

**Algorithm:**

1. Evaluate **EVERY** rule against your task (do not stop at first match)
2. **Stack rules**: union of all matching rule skills
3. Include all skills from matching rules — no relevance filtering
4. Scan Skill Catalog for missed skills — default INCLUDE
5. Deduplicate final list
6. **Enumerate EVERY skill by its full name, ONE PER LINE, numbered sequentially** in the output block — NEVER summarize as "Rule N → X skills"

---

#### Rule 1 — TypeScript / TSX code (10 skills)

**Trigger:** Task involves writing or editing ANY `.ts` or `.tsx` file.
This rule matches virtually every coding task in this project.

Add all 10:

1. `typescript-type-system-expectations`
2. `typescript-async-events-and-error-handling`
3. `typescript-testing-expectations`
4. `typescript-documentation-and-comments`
5. `typescript-project-organization`
6. `typescript-performance-and-reliability`
7. `typescript-external-integrations`
8. `typescript-configuration-and-secrets`
9. `typescript-security-practices`
10. `typescript-ui-and-ux-components`

#### Rule 2 — React component or hook (5 skills)

**Trigger:** Task involves writing or editing ANY React component, JSX, or custom hook.

Add all 5:

1. `frontend-react-component-patterns`
2. `frontend-react-hooks-and-effects`
3. `frontend-react-advanced-patterns`
4. `frontend-react-state-management-strategy`
5. `frontend-react-storage-and-persistence`

#### Rule 3 — Test files (2 skills)

**Trigger:** Task involves ANY test file (`.spec.ts`, `.spec.tsx`, `.test.ts`).

Add both:

1. `typescript-testing-expectations` _(may already be included from Rule 1)_
2. `frontend-testing-strategy`

#### Rule 4 — Refactoring (1 skill)

**Trigger:** Task involves refactoring, restructuring, or migrating existing code.

Add:

1. `frontend-architectural-anti-patterns-and-refactoring-guide`

#### Rule 5 — New files or moving code (3 skills)

**Trigger:** Task involves creating new files, new components, or relocating code.

Add all 3:

1. `frontend-standards-conditionals-comments-docs`
2. `frontend-standards-assets-and-media`
3. `frontend-project-structure-and-organization`

#### Rule 6 — Styles (1 skill)

**Trigger:** Task involves SCSS, CSS, or CSS Modules.

Add:

1. `frontend-styling-rules`

#### Rule 7 — Forms (1 skill)

**Trigger:** Task involves form implementation or validation.

Add:

1. `frontend-forms-and-validation`

#### Rule 8 — i18n (1 skill)

**Trigger:** Task involves translations, i18next, or locale handling.

Add:

1. `frontend-internationalization-i18n`

#### Rule 9 — Performance (11 skills)

**Trigger:** Task explicitly involves performance optimization or profiling.

Add all 11:

1. `performance-general-principles`
2. `performance-code-review-checklist`
3. `performance-frontend-javascript-performance`
4. `performance-frontend-rendering-and-dom`
5. `performance-frontend-asset-optimization`
6. `performance-frontend-network-optimization`
7. `performance-frontend-framework-specific-tips`
8. `performance-frontend-common-pitfalls`
9. `performance-frontend-troubleshooting`
10. `performance-frontend-accessibility-and-performance`
11. `performance-advanced-topics-mobile-performance`

---

**Output a collapsed `<details>` block** listing EVERY skill individually by full name, one per line:

> ⛔ **CRITICAL — DYNAMIC LIST, NOT A TEMPLATE:**
> The skills list is **UNIQUE per task**. You MUST build it fresh each time by evaluating Rules 1–9 against YOUR SPECIFIC TASK. Different tasks produce different skill lists.
>
> - A React component refactoring produces ~16+ skills (Rules 1+2+4)
> - A test file refactoring produces ~12+ skills (Rules 1+3+4)
> - A form implementation produces ~17+ skills (Rules 1+2+7)
> - Each task is different — NEVER copy a fixed list.
>
> **FORMAT RULES:**
>
> - List each skill by its FULL NAME, ONE SKILL PER LINE, numbered sequentially.
> - Never group skills by rule (e.g., "Rule 1 → 10 skills" is **WRONG**).
> - Never use `…` or abbreviate. EVERY skill MUST appear by name.

**Template** (the actual skill names come from YOUR rule evaluation):

```html
<details>
  <summary>Loading N skills…</summary>

  **Skills to load (N total):** 1. {first-skill-from-your-rule-evaluation} 2.
  {second-skill-from-your-rule-evaluation} 3.
  {third-skill-from-your-rule-evaluation} … (continue numbering ALL skills —
  every one you identified from Rules 1–9 + catalog scan)
</details>
```

**This list is binding** — EVERY skill listed MUST be read in Step 0B.

**Sanity Check — Minimum Skills by Task Type:**

| Task                     | Min Skills | Why                      |
| ------------------------ | ---------- | ------------------------ |
| Any TypeScript edit      | ≥ 10       | Rule 1 (TS/TSX)          |
| React component/hook     | ≥ 15       | Rules 1 + 2 (TS + React) |
| Refactoring React        | ≥ 16       | Rules 1 + 2 + 4          |
| Editor test file         | ≥ 12       | Rules 1 + 3              |
| Performance optimization | ≥ 21       | Rules 1 + 9              |

> **⚠️ Hard floor:** Fewer than 10 skills on code edits = Rule 1 not applied. Re-scan.

**Example:** Refactor `usePage.ts` hook

- Rule 1 ✅ (`.ts` file) → +10 skills
- Rule 2 ✅ (React hook) → +5 skills
- Rule 4 ✅ (refactoring) → +1 skill
- Scan: `frontend-nextjs-pages-router` → +1 skill
- **Total: 17 skills**

### Step 0B — Read EVERY skill on the list (MANDATORY read_file calls)

> Only descriptions are in context. Actual rules are in `.github/skills/<name>/SKILL.md`.
> **Mentioning skills ≠ reading them. Only actual `read_file` tool calls count.**

**Path template:** Every skill file lives at:

```
.github/skills/{SKILL_NAME}/SKILL.md
```

Example: skill `typescript-type-system-expectations` → `read_file(".github/skills/typescript-type-system-expectations/SKILL.md")`

> ⛔ **FULL FILE READS ONLY:** NEVER specify `startLine` or `endLine` when reading skill files. Always read the **entire** SKILL.md file. A partial read (e.g., `lines 1 to 100`) means the skill is **NOT loaded** — rules at the end of the file will be missed.

**Execution steps:**

1. Take your FULL Step 0A skill list
2. For EACH skill, construct its file path using the template above
3. Call `read_file` on up to **5** skills simultaneously in one parallel batch (max 5 per batch — NOT 8)
4. **After batch completes, COUNT the actual `read_file` responses you RECEIVED** — not the number you planned to send, but the number of actual successful file contents returned to you
5. Compute: `remaining = total_skills - total_successfully_read_so_far`
6. If remaining > 0 → immediately execute next parallel batch with the remaining skills
7. **RETRY RULE:** If any `read_file` call in a batch returned an error, was empty, or was only partially read (line range), add that skill back to the remaining list and retry it in the next batch
8. Repeat until EVERY skill from Step 0A has been **fully and successfully** read

**Post-batch checkpoint (MANDATORY after EVERY batch):**

```
Batch N result: X/Y calls returned successfully.
Total progress: Z/{TOTAL} skills loaded.
Remaining: [list of unread skill names]
```

If remaining list is empty → proceed to Step 0C. Otherwise → next batch.

**Concrete example (12 skills):**

```
Batch 1 (5 parallel read_file calls):
  .github/skills/typescript-type-system-expectations/SKILL.md
  .github/skills/typescript-async-events-and-error-handling/SKILL.md
  .github/skills/typescript-testing-expectations/SKILL.md
  .github/skills/typescript-documentation-and-comments/SKILL.md
  .github/skills/typescript-project-organization/SKILL.md

→ Batch 1 result: 5/5 returned. Total: 5/12. Remaining: 7.

Batch 2 (5 parallel read_file calls):
  .github/skills/typescript-performance-and-reliability/SKILL.md
  .github/skills/typescript-external-integrations/SKILL.md
  .github/skills/typescript-configuration-and-secrets/SKILL.md
  .github/skills/typescript-security-practices/SKILL.md
  .github/skills/typescript-ui-and-ux-components/SKILL.md

→ Batch 2 result: 5/5 returned. Total: 10/12. Remaining: 2.

Batch 3 (2 parallel read_file calls):
  .github/skills/frontend-testing-strategy/SKILL.md
  .github/skills/frontend-architectural-anti-patterns-and-refactoring-guide/SKILL.md

→ Batch 3 result: 2/2 returned. Total: 12/12. Remaining: 0. COMPLETE.
```

**⛔ COMMON FAILURE MODES (you MUST avoid these):**

1. **Relevance filtering** — Reading only skills that "seem relevant" to the task. ALL listed skills MUST be read, even `typescript-configuration-and-secrets` for a test refactoring task.
2. **Stopping early** — Reading 3-4 skills then proceeding to code. You MUST read ALL of them.
3. **Claiming skills are read without read_file calls** — Listing skills in `<details>` block does NOT count as reading them.
4. **Batching only once** — If you have 12 skills, you need at least 3 batches (5+5+2). Do NOT stop after batch 1.
5. **Confusing "auto-loaded instructions" with skills** — Instructions (`.github/instructions/`) are auto-loaded. Skills (`.github/skills/`) are NOT and REQUIRE explicit `read_file` calls.
6. **Grouping skills by rule instead of listing individually** — Writing "Rule 1 → 10 skills" or "Rule 2 → 5 skills" in the output instead of listing each skill by name. The `<details>` block MUST contain the header **"Skills to load (N total):"** followed by EVERY skill name, one per line, numbered sequentially (1. skill-name, 2. skill-name, etc.).
7. **Partial file reads** — Using `startLine`/`endLine` (e.g., `lines 1 to 100`) when reading a skill file. This means rules at the bottom of the file are MISSED. Always read the FULL file with NO line range.
8. **Rubber-stamp verification** — Filling in ✅ for all skills in the Step 0C checklist without actually counting the `read_file` tool responses you received. You MUST count **actual tool outputs**, not your **planned calls**.
9. **Skipping post-batch checkpoint** — Not outputting the `Batch N result: X/Y` checkpoint after each batch. This checkpoint is MANDATORY — it forces you to count actual responses and catch failures.
10. **Not retrying failed reads** — If a `read_file` call fails, returns an error, or returns partial content, you MUST retry it in the next batch. Do NOT mark it as read.

### Step 0C — Verify Completeness (MANDATORY before any code)

**BLOCKING REQUIREMENT** — Run this checklist before ANY implementation:

For EACH skill from your Step 0A list, verify that you received a **FULL, successful `read_file` response** (not an error, not a partial read):

```
Verification checklist:
[ ] skill-name-1 — FULL read_file response received? YES/NO
[ ] skill-name-2 — FULL read_file response received? YES/NO
... (one line per skill)

Result: X/N skills FULLY read.
```

**Verification rules:**

- **COUNT ACTUAL RESPONSES** — Go through your conversation history and count the actual `read_file` tool outputs you received. Do NOT just assume your planned calls all succeeded.
- **Check for partial reads** — If any skill was read with `startLine`/`endLine` (line range), mark it as NO and re-read the FULL file.
- **Check for errors** — If any `read_file` returned an error or empty content, mark it as NO and retry.
- If ANY skill shows NO → call `read_file` on it RIGHT NOW before proceeding.
- If result is X/N where X < N → you are NOT DONE, keep reading.
- Only when X = N (ALL skills **fully** read) → proceed to implementation.

> ⛔ Writing code before all skills are read = **non-compliant output**
> ⛔ If you read fewer skills than listed in Step 0A, your entire response is INVALID
> ⛔ If any skill was only partially read (line range), your entire response is INVALID

---

## Skill Catalog (for Step 0A scan)

> Skills that were previously mandatory (typescript-core-intent, frontend-ai-response-guidelines, typescript-coding-style-and-conventions, verification-pipeline, etc.) are now **Instructions** and auto-loaded. They do NOT appear here.

### frontend skills — React 18, Next.js Pages Router

| Skill name                                                   | What it covers                                          |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| `frontend-react-component-patterns`                          | Component structure, composition, props patterns        |
| `frontend-react-hooks-and-effects`                           | Custom hooks, useEffect rules, hook composition         |
| `frontend-react-advanced-patterns`                           | HOCs, render props, compound components, advanced React |
| `frontend-react-state-management-strategy`                   | State management approach, stores, data flow            |
| `frontend-react-storage-and-persistence`                     | LocalStorage, session, persistence patterns             |
| `frontend-styling-rules`                                     | CSS/SCSS rules, className conventions, theming          |
| `frontend-standards-conditionals-comments-docs`              | Conditionals style, JSDoc, comments                     |
| `frontend-standards-assets-and-media`                        | Images, icons, static assets conventions                |
| `frontend-forms-and-validation`                              | Form libraries, validation, form patterns               |
| `frontend-internationalization-i18n`                         | i18n, translations, locale handling                     |
| `frontend-testing-strategy`                                  | Test structure, what/how to test, mocking               |
| `frontend-nextjs-pages-router`                               | Pages Router specifics, SSR, SSG, routing               |
| `frontend-performance-optimization`                          | Frontend perf: lazy loading, memoization, bundles       |
| `frontend-project-structure-and-organization`                | Folder structure, feature slicing, module boundaries    |
| `frontend-architectural-anti-patterns-and-refactoring-guide` | Anti-patterns to avoid, refactoring strategies          |
| `frontend-accessibility-and-security`                        | a11y requirements, security practices for frontend      |
| `frontend-analytics-and-gtm`                                 | GTM, analytics events, tracking implementation          |

### typescript skills — TypeScript 5.x, ES2022

| Skill name                                   | What it covers                                     |
| -------------------------------------------- | -------------------------------------------------- |
| `typescript-type-system-expectations`        | Types, generics, type guards, discriminated unions |
| `typescript-async-events-and-error-handling` | Async/await, error handling, event patterns        |
| `typescript-testing-expectations`            | TS test patterns, assertion style, test structure  |
| `typescript-documentation-and-comments`      | When/how to document, JSDoc, comment standards     |
| `typescript-project-organization`            | TS module organization, barrel files, layering     |
| `typescript-performance-and-reliability`     | TS perf patterns, memory, reliability              |
| `typescript-external-integrations`           | API calls, third-party service integration         |
| `typescript-configuration-and-secrets`       | Env vars, config files, secrets handling           |
| `typescript-security-practices`              | Input validation, XSS, CSRF, secure coding         |
| `typescript-ui-and-ux-components`            | UI component contracts, UX behavior rules          |

### performance skills — Use only when task explicitly involves performance optimization

| Skill name                                           | Scope                                               |
| ---------------------------------------------------- | --------------------------------------------------- |
| `performance-general-principles`                     | Universal perf principles, measure first, budgets   |
| `performance-code-review-checklist`                  | Perf review checklist for PRs                       |
| `performance-frontend-javascript-performance`        | Web Workers, memory leaks, Maps/Sets, event loop    |
| `performance-frontend-rendering-and-dom`             | Layout thrashing, virtual DOM, CSS animations       |
| `performance-frontend-asset-optimization`            | WebP/AVIF, font-display, tree-shaking, minification |
| `performance-frontend-network-optimization`          | HTTP/2, preload/prefetch, CDN, Service Workers      |
| `performance-frontend-framework-specific-tips`       | React.memo, code splitting, Suspense, profiling     |
| `performance-frontend-common-pitfalls`               | Large bundles, unoptimized images, memory leaks     |
| `performance-frontend-troubleshooting`               | Chrome DevTools, Lighthouse, Core Web Vitals        |
| `performance-frontend-accessibility-and-performance` | ARIA updates, screen reader perf                    |
| `performance-advanced-topics-mobile-performance`     | Capacitor/mobile: startup time, storage, profiling  |

---

---

## ⛔ GATE CHECK

**Do NOT proceed if:**

- No `<details>` block with active skills (Step 0A) ✗
- No `read_file` calls on all skills (Step 0B) ✗
- Any skill read with line range instead of FULL file (Step 0B) ✗
- No post-batch checkpoints showing actual response counts (Step 0B) ✗
- No completeness verification (Step 0C) ✗
- Verification checklist marked ✅ without counting actual tool responses (Step 0C) ✗

---

## Task Planning — Mandatory Todo Structure

**Every todo list MUST start with:**

```
1. [ ] Load coding standards (Steps 0A–0C)
   - Determine active skills (Step 0A)
   - Read all skill .md files (Step 0B)
   - Verify all skills read (Step 0C)
2. [ ] <first actual task>
3. [ ] <second actual task>
…
```

**Why one todo item?** Keeps list clean for user. Internally execute all 3 sub-steps (0A → 0B → 0C) before marking complete.

**Blocking rule:** Do not start implementation until this todo is marked completed. **Every time, no exceptions.**
