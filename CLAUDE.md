# Eminence CRM Frontend

## Stack
React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + TanStack Query + Zustand

## Rules
- ALWAYS push to GitHub after every commit
- ALWAYS test with Playwright after changes
- Deploy via git push to Railway (never `railway up`)
- Feature-based folder structure in src/features/
- All API responses validated with Zod
- TanStack Query for all server state
- React Hook Form + Zod for all forms

## Brand Colors
- Primary: #00594C (dark green)
- Primary Dark: #003D2E (sidebar)
- Accent Gold: #C9A84C
- Accent Teal: #4ECDC4

## Directory Structure
- src/components/ui/ - Reusable UI components
- src/components/layout/ - AppLayout, Sidebar, TopBar
- src/features/ - Feature modules (auth, pipeline, companies, etc.)
- src/api/ - API client and hooks
- src/lib/ - Utilities
- src/providers/ - React context providers
- src/routes/ - Route definitions
- src/stores/ - Zustand stores
