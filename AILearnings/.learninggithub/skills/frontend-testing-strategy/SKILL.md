---
name: frontend-testing-strategy
description: "USE FOR: test structure (Vitest + RTL), what to test, how to test, mocking strategies, test file organization, assertion patterns, coverage expectations."
---

## Testing Strategy

- **Philosophy (TDD):**
  - **Behavior Driven:** Test **User Behavior**, not implementation details.
  - **Resilience:** Tests should NOT break when you refactor code, only when you break functionality.
  - **Queries:** Prefer `screen.getByRole` (accessibility first), then `screen.getByText`. Avoid `getByTestId` unless absolutely necessary.
- **Tools:** Vitest + React Testing Library.
- **Rules:**
  - **User Event:** Use `userEvent.click()` instead of `fireEvent.click()` to simulate real browser interactions.
  - **No Snapshots:** Do NOT use `toMatchSnapshot()` for UI components. They are brittle and ignored in code reviews. Use `toBeInTheDocument()` instead.
  - **Mocking Router:** Do not mock `useRouter` manually in every file. Use a shared `renderWithRouter` helper.
  - **Isolation:** Ensure tests clean up after themselves (e.g., `vi.clearAllMocks()` in `afterEach`).
  - **No alias workarounds:** Do not alias imports in tests just to avoid name collisions. Refactor the test layout or rename symbols instead.
  - **Source-of-truth imports:** Tests must import the unit under test from its canonical module, not from similarly named wrappers.
  - **Prefer refactor over shortcuts:** When naming conflicts appear, update the test structure rather than keeping a workaround.
- **Test File Location:**
  - **Co-location:** Test files (`*.spec.ts`, `*.test.tsx`) must be located NEXT TO the file they are testing.
  - **❌ Bad:** `src/tests/components/MyComponent.spec.tsx`
  - **✅ Good:** `src/features/cart/components/CartSummary/CartSummary.spec.tsx`
  - **Reason:** This ensures that when a component is moved or deleted, its tests are moved or deleted with it.
- **Patterns:**
  - **Colocation:** Write tests alongside components (e.g., `Component.test.tsx`).
  - Use `screen.getByRole`, `screen.getByText`.
  - Use `userEvent` for interactions.
  - **Mocking:** Mock network requests (MSW or Apollo `MockedProvider`). Avoid shallow rendering.
