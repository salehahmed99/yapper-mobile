# Git Workflow & Development Guidelines

## Table of Contents

1. [Overview](#overview)
2. [Branch Structure](#branch-structure)
3. [Branch Naming Conventions](#branch-naming-conventions)
4. [Development Workflow](#development-workflow)
5. [Release Process](#release-process)
6. [Hotfix Process](#hotfix-process)
7. [Commit Message Guidelines](#commit-message-guidelines)
8. [Pull Request Process](#pull-request-process)
9. [Code Quality Standards](#code-quality-standards)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Version Management](#version-management)
12. [Emergency Procedures](#emergency-procedures)
13. [Common Commands](#common-commands)
14. [Troubleshooting](#troubleshooting)

---

## Overview

This project follows a **Git Flow-based workflow** optimized for mobile app development with continuous integration and automated quality checks. The workflow ensures:

- ✅ Stable production releases
- ✅ Isolated feature development
- ✅ Comprehensive QA testing
- ✅ Quick hotfix deployment
- ✅ Automated quality enforcement

### Key Principles

1. **Never commit directly to `main` or `dev`** - Always use pull requests
2. **All code must pass CI/CD checks** - Linting, type checking, and tests
3. **Follow semantic versioning** - MAJOR.MINOR.PATCH (e.g., v1.2.3)
4. **Write meaningful commit messages** - Follow conventional commits
5. **Keep branches up to date** - Regularly sync with base branches

---

## Branch Structure

### Permanent Branches

#### `main` (Production)

- **Purpose**: Production-ready code
- **Protected**: Yes
- **Direct commits**: ❌ Never
- **Merges from**: `release/*`, `hotfix/*`
- **Tagged**: Every merge creates a version tag (e.g., `v1.2.0`)

#### `dev` (Development)

- **Purpose**: Integration branch for features
- **Protected**: Yes
- **Direct commits**: ❌ Never
- **Merges from**: `feature/*`, `release/*` (after production merge), `hotfix/*`
- **CI/CD**: Automated preview builds

### Temporary Branches

#### `feature/*` (Feature Development)

- **Purpose**: New features or enhancements
- **Created from**: `dev`
- **Merged to**: `dev`
- **Lifetime**: Until feature is complete and merged
- **Example**: `feature/AUTH-123-user-login`

#### `bugfix/*` (Bug Fixes in Release)

- **Purpose**: Fix bugs found during QA testing
- **Created from**: `release/*`
- **Merged to**: `release/*`
- **Lifetime**: Until bug is fixed and merged
- **Example**: `bugfix/fix-login-crash`

#### `hotfix/*` (Emergency Production Fixes)

- **Purpose**: Critical fixes for production issues
- **Created from**: `main`
- **Merged to**: `main` AND `dev`
- **Lifetime**: Until fix is deployed
- **Example**: `hotfix/v1.2.1-security-patch`

#### `release/*` (QA & Staging)

- **Purpose**: Prepare and test releases before production
- **Created from**: `dev`
- **Merged to**: `main`, then `dev`
- **Lifetime**: Until released to production
- **Example**: `release/v1.2.0`
- **Deleted**: After merge to main

---

## Branch Naming Conventions

### Format

```
<type>/<ticket-id>-<short-description>
```

### Examples

```bash
# Feature branches
feature/AUTH-123-add-login
feature/user-profile-page
feat/API-456-payment-integration

# Bugfix branches (from release)
bugfix/AUTH-789-fix-session-timeout
bugfix/fix-crash-on-startup
fix/payment-validation

# Hotfix branches (from main)
hotfix/v1.2.1-critical-security
hotfix/v1.2.1-payment-failure

# Release branches
release/v1.2.0
release/v2.0.0
```

### Rules

1. Use **lowercase** and **hyphens** (kebab-case)
2. Include **ticket/issue ID** when available
3. Keep descriptions **short but meaningful**
4. Use **semantic prefixes**: `feature/`, `bugfix/`, `hotfix/`, `release/`

---

## Development Workflow

### 1. Starting a New Feature

```bash
# 1. Ensure dev is up to date
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/AUTH-123-user-login

# 3. Work on your feature
# ... make changes ...

# 4. Commit regularly with conventional commits
git add .
git commit -m "feat(auth): add login form component"

# 5. Push to remote
git push origin feature/AUTH-123-user-login

# 6. Keep feature branch updated with dev
git checkout dev
git pull origin dev
git checkout feature/AUTH-123-user-login
git merge dev
# Resolve conflicts if any
git push origin feature/AUTH-123-user-login
```

### 2. Completing a Feature

```bash
# 1. Ensure all tests pass locally
npm run lint
npm run type-check
npm test  # if you have tests

# 2. Push final changes
git push origin feature/AUTH-123-user-login

# 3. Create Pull Request on GitHub
# - Base branch: dev
# - Compare branch: feature/AUTH-123-user-login
# - Fill PR template with description, screenshots, testing notes

# 4. Wait for:
#    ✅ CI/CD checks to pass
#    ✅ Code review approval (minimum 1-2 reviewers)

# 5. Merge PR (use "Squash and merge")

# 6. Delete feature branch
git checkout dev
git pull origin dev
git branch -d feature/AUTH-123-user-login
git push origin --delete feature/AUTH-123-user-login
```

### 3. Code Review Checklist

**Before requesting review:**

- ✅ All CI/CD checks pass
- ✅ Code is self-documented with clear naming
- ✅ No console.log or debug code
- ✅ Tests added/updated (when applicable)
- ✅ No sensitive data (API keys, passwords)

**Reviewer responsibilities:**

- ✅ Code quality and best practices
- ✅ Logic correctness
- ✅ Performance considerations
- ✅ Security vulnerabilities
- ✅ Test coverage
- ✅ Documentation updates

---

## Release Process

### 1. Creating a Release Branch

```bash
# 1. Ensure dev is stable and ready
git checkout dev
git pull origin dev

# 2. Bump version in package.json
npm version minor  # 1.1.0 -> 1.2.0
# or
npm version patch  # 1.1.0 -> 1.1.1
# or
npm version major  # 1.1.0 -> 2.0.0

# 3. Create release branch
VERSION=$(node -p "require('./package.json').version")
git checkout -b release/v$VERSION

# 4. Push release branch
git push origin release/v$VERSION

# 5. Notify QA team for testing
```

### 2. Fixing Bugs in Release

```bash
# 1. Create bugfix branch from release
git checkout release/v1.2.0
git checkout -b bugfix/fix-login-crash

# 2. Fix the bug
# ... make changes ...

# 3. Commit with conventional format
git add .
git commit -m "fix(auth): resolve crash on invalid credentials"

# 4. Push and create PR to release branch
git push origin bugfix/fix-login-crash

# Create PR: bugfix/fix-login-crash -> release/v1.2.0

# 5. After merge, delete bugfix branch
git branch -d bugfix/fix-login-crash
git push origin --delete bugfix/fix-login-crash
```

### 3. Deploying Release to Production

```bash
# 1. Ensure release branch is stable
# - All QA tests passed
# - All bugfixes merged
# - Final smoke tests complete

# 2. Create PR: release/v1.2.0 -> main
# Get 2+ approvals from tech leads

# 3. Merge to main (use "Merge commit" not squash)
git checkout main
git pull origin main
git merge release/v1.2.0 --no-ff
git push origin main

# 4. Create version tag
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# 5. Merge release back to dev
git checkout dev
git pull origin dev
git merge release/v1.2.0 --no-ff
git push origin dev

# 6. Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0

# 7. GitHub Actions will automatically:
#    - Build production APK
#    - Create GitHub release
#    - Generate changelog
```

---

## Hotfix Process

### When to Use Hotfixes

Use hotfixes for **critical production issues** that can't wait for the next release:

- 🔴 Security vulnerabilities
- 🔴 Data loss bugs
- 🔴 Complete feature failures
- 🔴 Critical performance issues

**Do NOT use for:**

- Minor bugs that can wait
- New features
- Non-critical improvements

### Hotfix Workflow

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main

# Get current version (e.g., 1.2.0)
CURRENT_VERSION=$(git describe --tags --abbrev=0)
# Increment patch version (1.2.0 -> 1.2.1)
NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g')

git checkout -b hotfix/$NEW_VERSION-description

# 2. Fix the critical issue
# ... make changes ...

# 3. Update version in package.json
npm version patch

# 4. Commit
git add .
git commit -m "hotfix(security): patch XSS vulnerability"

# 5. Push
git push origin hotfix/$NEW_VERSION-description

# 6. Create PR to main (requires urgent approval)
# Create PR: hotfix/v1.2.1-description -> main

# 7. After approval, merge to main
git checkout main
git merge hotfix/$NEW_VERSION-description --no-ff
git push origin main

# 8. Tag the hotfix
git tag -a $NEW_VERSION -m "Hotfix $NEW_VERSION"
git push origin $NEW_VERSION

# 9. IMPORTANT: Also merge to dev
git checkout dev
git pull origin dev
git merge hotfix/$NEW_VERSION-description --no-ff
git push origin dev

# 10. Delete hotfix branch
git branch -d hotfix/$NEW_VERSION-description
git push origin --delete hotfix/$NEW_VERSION-description

# 11. Notify team about the hotfix deployment
```

---

## Commit Message Guidelines

### Format

We use **Conventional Commits** format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type       | Description              | Example                                  |
| ---------- | ------------------------ | ---------------------------------------- |
| `feat`     | New feature              | `feat(auth): add OAuth login`            |
| `fix`      | Bug fix                  | `fix(api): resolve timeout issue`        |
| `hotfix`   | Emergency production fix | `hotfix(security): patch XSS`            |
| `refactor` | Code refactoring         | `refactor(utils): simplify date parsing` |
| `perf`     | Performance improvement  | `perf(list): optimize rendering`         |
| `test`     | Adding/updating tests    | `test(auth): add login unit tests`       |
| `docs`     | Documentation changes    | `docs: update API documentation`         |
| `style`    | Code style/formatting    | `style: format with prettier`            |
| `chore`    | Maintenance tasks        | `chore: update dependencies`             |
| `ci`       | CI/CD changes            | `ci: add GitHub Actions workflow`        |
| `build`    | Build system changes     | `build: configure webpack`               |
| `revert`   | Revert previous commit   | `revert: revert feat(auth)`              |

### Scope (Optional)

The scope specifies the area of change:

- `auth` - Authentication/authorization
- `api` - API integration
- `ui` - User interface
- `db` - Database
- `config` - Configuration
- `deps` - Dependencies

### Subject

- Use **imperative mood**: "add" not "added" or "adds"
- **Lowercase** first letter
- No period at the end
- **Max 50 characters**

### Examples

```bash
# Good commits
git commit -m "feat(auth): add biometric login support"
git commit -m "fix(payment): resolve crash on invalid card"
git commit -m "docs: update installation instructions"
git commit -m "refactor(api): extract common request logic"

# Bad commits (will be rejected)
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "updates"
git commit -m "."
```

### Body (Optional but recommended for complex changes)

```bash
git commit -m "feat(auth): add social login providers

Added support for Google, Facebook, and Apple sign-in.
Implements OAuth 2.0 flow with secure token storage.

Closes AUTH-123"
```

### Breaking Changes

For changes that break backward compatibility:

```bash
git commit -m "feat(api)!: change authentication endpoint

BREAKING CHANGE: /auth/login endpoint now requires email instead of username.
All clients must update to use email field.

Migration guide: docs/migrations/v2.0.0.md"
```

---

## Pull Request Process

### 1. PR Review Process

**Assignee responsibilities:**

1. Create PR with complete description
2. Ensure all CI/CD checks pass
3. Request reviews from 1-2 team members
4. Address review comments
5. Get approval before merging

**Reviewer responsibilities:**

1. Review within 24 hours
2. Test changes locally if needed
3. Provide constructive feedback
4. Approve or request changes
5. Check for security issues

### 2. Merge Strategies

| Scenario                 | Strategy                   | Reason           |
| ------------------------ | -------------------------- | ---------------- |
| `feature/*` → `dev`      | **Squash and merge**       | Clean history    |
| `bugfix/*` → `release/*` | **Squash and merge**       | Clean history    |
| `release/*` → `main`     | **Merge commit (--no-ff)** | Preserve release |
| `release/*` → `dev`      | **Merge commit (--no-ff)** | Keep all changes |
| `hotfix/*` → `main`      | **Merge commit (--no-ff)** | Traceable        |
| `hotfix/*` → `dev`       | **Merge commit (--no-ff)** | Traceable        |

### 3. After Merge

```bash
# 1. Update local branches
git checkout dev
git pull origin dev

# 2. Delete merged feature branch
git branch -d feature/AUTH-123-login
git push origin --delete feature/AUTH-123-login

# 3. Verify merge in GitHub/GitLab
```

---

## Code Quality Standards

### Pre-commit Checks (Automatic)

The following checks run automatically before every commit:

1. **ESLint** - Code linting and style
2. **Prettier** - Code formatting
3. **TypeScript** - Type checking
4. **Commit message** - Conventional commits format

If any check fails, the commit is blocked.

### Bypassing Checks (Emergency Only)

```bash
# Skip pre-commit hooks (use sparingly!)
git commit -m "fix: urgent production hotfix" --no-verify

# Skip pre-push hooks
git push --no-verify

# Temporarily disable all hooks
export HUSKY=0
git commit -m "your message"
unset HUSKY
```

⚠️ **Warning:** Bypassed commits will still be checked by CI/CD and may cause PR failures.

### CI/CD Checks (GitHub Actions)

Every push triggers:

1. **Lint check** - ESLint validation
2. **Format check** - Prettier validation
3. **Type check** - TypeScript compilation
4. **Commit messages** - Conventional format (PRs only)
5. **Build check** - Ensure app builds successfully

### Local Development Commands

```bash
# Check for issues
npm run lint              # Run ESLint
npm run format:check      # Check Prettier formatting
npm run type-check        # Run TypeScript checks

# Auto-fix issues
npm run lint:fix          # Fix ESLint issues
npm run format            # Format with Prettier

# Run all checks
npm run lint && npm run type-check
```

---

## CI/CD Pipeline

### Overview

We use **GitHub Actions** for continuous integration and deployment.

### Workflows

#### 1. `lint-and-type-check.yml` - Code Quality (All PRs)

**Triggers:**

- Pull requests to `dev` or `main` or `release/*` branches

**Steps:**

1. Checkout code
2. Install dependencies
3. Run ESLint
4. Check Prettier formatting
5. Run TypeScript type check
6. Validate commit messages (PRs only)

**Result:** PR is blocked if any check fails

---

#### 2. `build-android-apk.yml` - QA Builds (Release Branches)

**Triggers:**

- Pushes to `release/*` branches

**Steps:**

1. Checkout code
2. Install dependencies
3. Build APK with EAS (preview profile)

**Result:** QA team gets APK for testing

---

### Manual Workflow Trigger

```bash
# Trigger build manually in GitHub
# 1. Go to Actions tab
# 2. Select "Build Android APK"
# 3. Click "Run workflow"
# 4. Select branch
# 5. Click "Run workflow" button
```

---

## Version Management

### Semantic Versioning

We follow **Semantic Versioning 2.0.0** (semver.org):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─── Bug fixes (backward compatible)
  │     └───────── New features (backward compatible)
  └─────────────── Breaking changes (not backward compatible)
```

### Examples

| Version           | Change Type | Description                       |
| ----------------- | ----------- | --------------------------------- |
| `1.0.0` → `1.0.1` | Patch       | Bug fixes only                    |
| `1.0.0` → `1.1.0` | Minor       | New features, backward compatible |
| `1.0.0` → `2.0.0` | Major       | Breaking changes, API changes     |

### Version Bumping

```bash
# Patch release (1.2.0 -> 1.2.1) - Bug fixes
npm version patch

# Minor release (1.2.0 -> 1.3.0) - New features
npm version minor

# Major release (1.2.0 -> 2.0.0) - Breaking changes
npm version major

# This automatically:
# 1. Updates package.json
# 2. Creates a git commit
# 3. Creates a git tag
```

### Version in Files

Maintain version consistency across:

1. **package.json** - Source of truth
2. **app.json** - Expo version
3. **eas.json** - Build version (auto-incremented)

### Release Notes

Every release must have release notes documenting:

- 🎉 New features
- 🐛 Bug fixes
- ⚠️ Breaking changes
- 📝 Migration guides (for major versions)

---

## Changelog

### v1.0.0 - Initial Documentation

- Complete workflow documentation
- Branch strategies defined
- CI/CD pipeline documented

---

**Last Updated**: 25/10/2025  
**Maintained By**: Saleh Ahmed (Team Leader)
**Questions?** Contact: saleh.work0004@gmail.com
