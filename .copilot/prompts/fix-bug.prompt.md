# Fix Bug Prompt — Suchi Kids Fashion

## How to Use

Open Copilot Chat, type:

```
/fix-bug [describe the symptom]
```

Example:

```
/fix-bug clicking "Add to Cart" does nothing on mobile
```

---

## What Copilot Will Do

1. Ask you to paste the relevant component/service code
2. Identify the root cause using the debugging checklist below
3. Propose a minimal, targeted fix
4. Explain WHY the bug happened so you understand it

---

## Prompt Template (Copilot reads this)

You are debugging a bug in **Suchi Kids Fashion** — an Angular 17+ standalone app with Firebase auth, signals, MongoDB backend, and Cloudinary images.

### Bug Report

**Symptom:** {{SYMPTOM}}  
**Where it happens:** {{PAGE_OR_COMPONENT}}  
**Steps to reproduce:** {{STEPS}}  
**Expected behaviour:** {{EXPECTED}}  
**Actual behaviour:** {{ACTUAL}}

### Debugging Checklist — Check These First

1. **SCSS specificity** — Is a component style overriding a global style? e.g. `padding: 0` wiping out `.container`'s side padding?
2. **Firebase auth race** — Is `currentUser()` read before `loading()` becomes false?
3. **Signal not triggering CD** — Was a nested object mutated instead of `.set()` being called?
4. **Admin redirect loop** — Guard checked synchronously before Firebase resolved?
5. **Form invalid silently** — Was `form.markAllAsTouched()` called before submit check?
6. **Missing `async`** — Did `await` get dropped on a Firebase or HTTP call?
7. **CORS error** — Is the backend running on port 4000 and frontend on 4200?
8. **Cloudinary upload** — Was the file uploaded before the form was submitted? (Must upload on submit, not on select)
9. **Environment flag** — Is `useMockData: true` hiding real backend errors?
10. **Missing breakpoint** — Does the bug only appear at certain screen widths?

### Response Format

```
## Root Cause
[Clear one-paragraph explanation]

## Fix
[Minimal code change with before/after]

## Why This Happened
[Explanation so it won't recur]

## Prevention
[What to check in future to avoid this class of bug]
```
