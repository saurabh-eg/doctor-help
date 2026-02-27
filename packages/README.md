# Shared Packages

> **Status**: These packages are **scaffolded but not yet imported** by any application (backend, admin dashboard, or Flutter app). They exist as a foundation for future monorepo-wide shared code.

## Packages

| Package | Purpose | Status |
| --- | --- | --- |
| `@doctor-help/types` | Shared TypeScript interfaces (User, Doctor, Appointment, etc.) | Scaffolded — not imported |
| `@doctor-help/utils` | Date formatting, currency, validation helpers | Scaffolded — not imported |
| `@doctor-help/constants` | Roles, statuses, specialties, design system colors | Scaffolded — not imported |
| `@doctor-help/api-client` | Shared API client wrapper | Scaffolded — not imported |

## Integration Plan

To use these packages in your app:

1. Import from the package: `import { User } from '@doctor-help/types';`
2. Ensure the workspace `package.json` has the package listed in `workspaces`
3. Run `npm install` from the root to link

## Why Not Removed?

These packages define the canonical shared types and utilities for the monorepo. When the admin dashboard and backend are aligned to share code, these packages will be the integration point. Removing them would lose the design-system constants and type definitions already defined.
