# Samadhan - Architecture & Developer Onboarding Guide

This document describes the architectural layout, core patterns, security structures, and onboarding workflows of the Samadhan platform.

---

## 1. Directory Structure

Samadhan follows a strict **Feature-Based Layered Architecture**. Code is divided into domain-specific features (`auth`, `issues`, `dashboard`, `profile`, `admin`, `schemes`, `documents`, `ai-assistant`) under `src/features/`, and cross-cutting libraries under `src/shared/`.

```
src/
  app/                          # Global routing, layout, and context providers
  features/                     # Feature modules containing bounded domains
    [feature-name]/
      components/               # Visual presenter components (no direct fetches)
      domain/                   # Entities, Enums, and contracts (no side-effects)
      hooks/                    # Hook managers connecting UI elements to Services
      pages/                    # Lazy-load container layouts
      repositories/             # Direct data managers (encapsulates Supabase queries)
      services/                 # Business logic, transforms, and validations
  shared/                       # Cross-cutting concern modules
    auth/                       # Role-Based Access Control and permissions mapping
    components/                 # Global UI layouts and Shadcn primitives
    config/                     # Centralized configurations and environment variables
    constants/                  # Core categories, statuses, and route lists
    contracts/                  # Database representation shapes
    errors/                     # Unified error classes (APIError, AuthError, etc.)
    services/                   # Structured environment logging
    validation/                 # Common file signature and format validators
```

---

## 2. Core Architectural Flow

Every feature must follow a unidirectional, strict dependency boundary:

```
[ UI Component / Page ]
          │
          ▼
    [ Hook Layer ]
          │
          ▼
   [ Service Layer ]  ◄── (Validates inputs via Zod, maps API shapes to Domain entities)
          │
          ▼
  [ Repository Layer ] ◄── (Wrapper around Supabase client database, storage, and function calls)
          │
          ▼
   [ Supabase Backend ]
```

- **Persistence Layer Rule**: No UI component or hook may communicate with the Supabase client directly. All network queries, mutations, and channels must reside inside repositories.
- **Error Handling Rule**: Repositories catch database/network exceptions and wrap them into unified error models (`APIError`, `StorageError`, `AuthError`).

---

## 3. Core Workflows

### A. Authentication & Authorization Flow
1. **Frontend Authentication**: Users sign in via `authService.signIn()`. Session state is maintained in `AuthProvider`.
2. **Access Guards**: Navigation routes are protected by `AuthGuard` (validates active session) and `AdminGuard` (verifies permissions using `hasPermission` from `src/shared/auth/permissions.ts` before mounting dashboard routes).
3. **Database Security**: All tables have Row-Level Security (RLS) policies checking the requester's user ID (`auth.uid() = user_id`) or admin status (`public.has_role()`).

### B. Issue Reporting & Image Validation Flow
```
[User Selects Image] ──► [Client Size/MIME Check] ──► [Magic Byte Check]
                                                            │ (If valid)
                                                            ▼
[DB Inserted] ◄── [UUID Filename & Upload] ◄── [Zod Input Verification]
```
1. **Size check**: Frontend verifies image size is $\le$ 5MB.
2. **Signature verification**: `validateFileSignature` checks the first 12 bytes of the file to verify the raw signature (e.g. `FF D8 FF` for JPEGs), blocking disguised executables (`evil.exe` renamed to `image.jpg`).
3. **Storage Sanitization**: The repository generates a random UUID filename (e.g., `unique-id.jpg`) and sets the `contentType` metadata on upload, preventing HTML/script uploads.

### C. AI Chat Assistant Flow
1. **Query Inspection**: User input is intercepted, sanitized to strip script tags, and scanned by `scanForPromptInjection` in `guardrails.ts` to block jailbreak attempts.
2. **JWT & Rate Limiting**: The request to `samadhan-chat` Edge Function passes through the `verifyUser` JWT filter and `checkRateLimit` check (30 requests/minute tier, IP fingerprint is SHA-256 hashed).
3. **Gemini Streaming**: The Edge Function translates user messages to Gemini's format, calls the Google Gemini API with `alt=sse`, reads the stream, and translates incoming chunks on-the-fly to an OpenAI-compatible SSE format for the frontend.

---

## 4. Onboarding Checklist for Developers

1. **Local Setup**:
   - Copy `.env.example` to `.env` and configure credentials.
   - Run `npm install` to load node dependencies.
   - Run `npm run dev` to launch the local Vite compiler.
2. **Testing**:
   - Execute unit tests using `npm run test` before committing.
3. **Coding Guidelines**:
   - Avoid `any` types. Enforce strict typescript properties.
   - Place all database queries inside repository files.
   - Wrap errors into standardized exceptions (`APIError`, `ValidationError`).
   - Run GitLeaks / TruffleHog checks regularly to avoid key exposure.

---

## 5. Enterprise Architectural Configurations & Upgrades

The codebase implements several enterprise-level configurations and safety guarantees:

- **Centralized Domain Models**: Business models and schemas (e.g., `Issue`, `Profile`, `Scheme`, `Document`, `NotificationPreferences`, `UserRole`) are defined once in `src/shared/types/domain/`. Feature modules must not declare duplicate models and instead import from this single source of truth.
- **Route & Query Key Safety**: All routing links (e.g., `ROUTES.DASHBOARD`) and React Query keys (e.g., `queryKeys.issues.list()`) are centralized in `src/shared/config/` to prevent magic string mismatches and improve cache invalidation patterns.
- **Feature Public APIs**: To prevent tight coupling, features expose a clean public API via root `index.ts` files. Other parts of the application import components, hooks, services, or types from the feature root (e.g., `import { useAuth } from "@/features/auth"`) rather than deep importing file internals.
- **Root Error Boundary**: A global React Error Boundary wrapper handles rendering-level crashes gracefully, shows a fallback alert, and logs failures via the custom `logger` service.
- **Vite Bundle Splitting**: Code-splitting is customized in `vite.config.ts` using manual chunk splitting (vendor-react, vendor-lucide, vendor-recharts, vendor-motion, etc.) to optimize browser download speeds and minimize initial asset size warning indicators.
- **UI State Standardization**: Pages use unified `LoadingState`, `EmptyState`, and `ErrorState` visual elements to enforce layout consistency and micro-interaction branding.
