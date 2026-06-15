# Secret Scanning Safeguards & Repository Security Checklist

This document details the secret scanning guidelines and pre-release security validation checks required for the Samadhan repository.

---

## 1. Secret Scanning Tools

To prevent accidental exposure of API keys, database credentials, private keys, or tokens in source code or Git history, all developers **must** run automated secret scanners before committing or merging code.

### A. GitLeaks
[GitLeaks](https://github.com/gitleaks/gitleaks) is a fast, open-source tool for detecting and preventing hardcoded secrets like passwords, API keys, and tokens in git repos.

#### Installation
- **macOS**: `brew install gitleaks`
- **Linux**: `sudo apt install gitleaks` (or download release binary)
- **Windows**: `scoop install gitleaks`

#### Commands
- **Scan entire repository history**:
  ```bash
  gitleaks detect --verbose --redact
  ```
- **Scan uncommitted changes (as a pre-commit check)**:
  ```bash
  gitleaks protect --verbose
  ```

---

### B. Trufflehog
[TruffleHog](https://github.com/trufflesecurity/trufflehog) scans git repositories for high-entropy strings and secrets, digging deep into commit history and branches.

#### Installation
- **macOS / Linux / Windows**:
  ```bash
  brew install trufflesecurity/trufflehog/trufflehog
  ```
  or run via Docker:
  ```bash
  docker run --rm -v "$PWD:/pwd" trufflesecurity/trufflehog:latest git file:///pwd
  ```

#### Commands
- **Scan local git repository history**:
  ```bash
  trufflehog git file://. --only-verified
  ```
- **Scan a specific branch**:
  ```bash
  trufflehog git file://. --branch main
  ```

---

## 2. Pre-Release Security Checklist

Perform this checklist before merging any pull request to the `main` branch or deploying to staging/production environments.

### [ ] No Hardcoded Credentials
- [ ] No Supabase Service Role Key (`service_role` / `service_key`) exists in code files.
- [ ] No Roboflow API keys, Gemini API keys, or private credentials are hardcoded.
- [ ] No local `.env` files are tracked by Git (verified via `.gitignore`).

### [ ] Environment Variables
- [ ] Environment variables are loaded using `Deno.env.get` on Edge Functions and `import.meta.env` on Frontend.
- [ ] `.env.example` is updated with all new variables required for service operations.

### [ ] API and Endpoint Controls
- [ ] Every custom Supabase Edge function verifies the incoming Supabase JWT token.
- [ ] CORS is restricted to allowed origins (no `Access-Control-Allow-Origin: *` in production).
- [ ] Security headers (CSP, X-Frame-Options, etc.) are appended to responses.
- [ ] All inputs are strictly parsed using Zod schemas.

### [ ] Storage & File Verification
- [ ] Uploaded files are verified via magic byte signature checks.
- [ ] File sizes are restricted (max 5MB for images).
- [ ] Filenames are replaced with unique UUIDs to prevent directory traversal and injection.

### [ ] Database RLS
- [ ] Row-Level Security (RLS) is enabled on all tables.
- [ ] No SELECT, INSERT, UPDATE, or DELETE privileges are granted without explicitly verified policies.
- [ ] Target tables have triggers feeding into append-only audit logging logs.
