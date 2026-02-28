# Mobile App Architecture

## Monorepo Packages

| Package | Purpose |
|---------|---------|
| `@bookfelt/ui` | Shared React Native UI components (Button, Input, Card, etc.) |
| `@bookfelt/core` | Platform-agnostic services and HTTP layer. Lives in `packages/core/` because it contains no React or React Native code — just HTTP clients and API services. This keeps it reusable across any consumer (mobile, web, backend) and avoids coupling data-fetching logic to a specific UI framework. React-specific wrappers (TanStack Query hooks) live in the mobile app's feature modules. |

```
packages/core/
  src/
    http/              # Axios-based HTTP client factory
    services/          # External API integrations (Google Books, Supabase, etc.)
    auth/              # Auth client (Better Auth) — future
    index.ts           # Barrel export
```

## File Structure

```
src/
├── app/                        # Expo Router — screens and layouts
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── library.tsx
│       └── search.tsx
│
├── features/                   # Feature modules (domain-driven)
│   └── <feature>/
│       ├── index.ts            # Barrel export (public API)
│       ├── components/         # Feature-specific UI
│       ├── types/              # TypeScript types and interfaces
│       ├── queries/            # TanStack Query useQuery hooks
│       ├── mutations/          # TanStack Query useMutation hooks
│       ├── services/           # Raw Supabase API calls
│       ├── schema/             # Zod validation schemas
│       ├── stores/             # Zustand stores (feature-level)
│       ├── hooks/              # Other custom hooks
│       ├── converters/         # API response <-> UI model transforms
│       ├── constants/          # Feature-specific constants
│       └── utils/              # Feature-specific utilities
│
├── shared/                     # Code shared across features
│   ├── index.ts                # Barrel export
│   ├── components/             # Shared UI components
│   └── stores/                 # Global Zustand stores
│
└── __tests__/
```

## Conventions

- **Create folders only when needed.** The template above lists all allowed subdirectories — add them per feature as content arises.
- **Barrel exports** (`index.ts`) exist at feature and shared roots for cross-boundary imports only. Route files import from the barrel, not from internal paths.
- **Import style:**
  ```ts
  // From a route file
  import { BookCards } from '../../features/books';
  import { ScreenWrapper } from '../../shared';
  ```

## Data Layer

| Concern | Tool | Location |
|---------|------|----------|
| Server state | TanStack Query | `features/<name>/queries/`, `features/<name>/mutations/` |
| Data access | Supabase | `features/<name>/services/` |
| Validation | Zod | `features/<name>/schema/` |
| Global state | Zustand | `shared/stores/` |
| Feature state | Zustand | `features/<name>/stores/` |
| Model mapping | Converters | `features/<name>/converters/` |
