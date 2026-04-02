---
name: frontend-nextjs-pages-router
description: "USE FOR: Next.js Pages Router specifics — getServerSideProps, getStaticProps, _app.tsx, _document.tsx, routing patterns, SSR/SSG, dynamic routes, API routes. NOT App Router."
---

## Next.js Specifics (Pages Router)

- **Page Architecture (Thin Pages):**

  - **Role of `pages/`:** Files in `pages/` must be "thin wrappers".
  - **Responsibilities:**
    1.  Define the route.
    2.  Fetch initial data (getServerSideProps/getStaticProps).
    3.  Render a Layout and a main Feature View.
  - **❌ Anti-Pattern:** Do NOT write business logic, `useEffect`, or complex state inside `pages/` files.
  - **✅ Best Practice:**

    ```tsx
    // pages/cart.tsx
    import { CartView } from '#features/cart';
    import { MainLayout } from '#layouts';

    export default function CartPage() {
      return (
        <MainLayout>
          <CartView />
        </MainLayout>
      );
    }
    ```

- **Data Fetching:**
  - Prefer `getServerSideProps` (SSR) for dynamic data.
  - Use `getStaticProps` (SSG) for static content (CMS pages).
  - **Avoid** fetching data in `useEffect` if it can be done on the server (SEO & Performance).
- **Routing:**
  - Use `next/link` for internal navigation.
  - Use `useRouter` for programmatic navigation.
- **Route Guards:**
  - **Rule:** Do NOT implement auth checks inside `useEffect` in the page component. This causes content flashes.
  - **Pattern:** Use a Higher-Order Component (HOC) or a wrapper in `_app.tsx` to handle protected routes.
- **Provider Composition:**
  - **Rule:** Avoid the "Pyramid of Doom" in `_app.tsx`.
  - **Pattern:** Compose providers into a single `AppProviders` component.
- **API Routes:**
  - Place API logic in `pages/api/`.
  - Validate inputs (Zod) and handle errors gracefully.
