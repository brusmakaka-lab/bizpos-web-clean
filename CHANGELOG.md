# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0-rc.1] - 2026-02-18

### Added
- Security hardening on auth and checkout paths with rate limiting and stricter headers.
- Request correlation (`x-request-id`) and structured server-side error logging.
- Sentry integration for server/client/global error capture.
- CI pipeline with validate job (test + build + prisma validate).
- Separate E2E workflow job for manual/nightly execution.
- Vitest coverage for critical Server Actions:
  - `loginAction`
  - `createProductAction`
  - `createCategoryAction`
  - `createOrderAction`
- Playwright critical flow:
  - public catalog → checkout → admin orders visibility.

### Changed
- Lint configuration unified with flat config in `eslint.config.mjs`.
- Auth/middleware boundary adjusted to avoid edge runtime issues with auth imports.
- Password hashing/compare standardized on `bcryptjs`.

### Fixed
- Runtime/module issues during test/build around auth action test imports.
- E2E reliability by using unique test customer names and explicit login navigation waits.

### Validation
- `npm run lint` ✅
- `npm test` ✅
- `npm run build` ✅
- `npx prisma validate` ✅
- `npm run test:e2e` ✅

---

## Release notes

This RC focuses on production hardening and release readiness for single-tenant deployment on Vercel + Neon.
