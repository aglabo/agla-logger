# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for the **ag-logger** project - a lightweight & pluggable logger for TypeScript. The repository uses pnpm workspaces and contains multiple packages organized under different prefixes:

- **@agla-*** packages: Legacy/transition packages (ag-logger related)
- **@esta-*** packages: Core infrastructure packages (error handling, tools, utilities)
- **shared/** packages: Common types and constants

Key focus: Currently migrating to a structured error handling system with AglaError framework.

## Essential Commands

### Development Workflow
```bash
# Build all packages (ESM + CommonJS)
pnpm run build

# Run all tests across packages
pnpm -r run test:develop    # Unit tests
pnpm -r run test:ci         # Integration tests

# Code quality checks
pnpm run lint:all           # ESLint (basic + typed)
pnpm run check:types        # TypeScript type checking
pnpm run check:dprint       # Code formatting check
pnpm run check:spells       # Spell checking

# Fix formatting and linting
pnpm run format:dprint      # Format code
pnpm run lint -- --fix     # Auto-fix lint issues
```

### Single Package Development
```bash
# Navigate to specific package
cd packages/@esta-core/error-handler

# Run package-specific commands
pnpm run test:develop
pnpm run build
pnpm run lint
```

### Testing Specific Files
```bash
# Run specific test file
pnpm exec vitest run --config ./configs/vitest.config.unit.ts src/__tests__/AglaError.spec.ts
```

## Architecture

### Module System
- **ESM-first** with CommonJS compatibility
- **Dual builds**: `lib/` (CJS) and `module/` (ESM)
- **Path aliases**: `@shared/types`, `@shared/constants`, etc.
- **TypeScript strict mode** with comprehensive type definitions

### Package Structure
```
packages/
├── @esta-core/           # Core infrastructure
│   ├── error-handler/    # Centralized error handling
│   └── tools-config/     # Tool configuration management
├── @esta-utils/          # Utilities
│   ├── command-runner/   # Command execution
│   └── config-loader/    # Configuration loading
└── @agla-utils/          # Legacy utilities
    └── ag-logger/        # Main logger package

shared/packages/
├── types/                # Shared TypeScript types (AglaError)
└── constants/            # Shared constants
```

### Build Configuration
- **tsup** for building with dual-target output
- **Centralized configs** in `configs/` directory
- **Base TypeScript config** in `base/configs/tsconfig.base.json`

## Important Notes

### File Editing Rules
- **Never edit** `lib/` or `module/` directories (build outputs)
- **Always edit** `src/` files and run build
- **Follow existing patterns** and conventions in each package

### Testing Structure
- **Unit tests**: `src/__tests__/`
- **Integration tests**: `tests/integration/`
- **E2E tests**: `tests/e2e/`
- **Multiple vitest configs** for different test types

### Code Quality
- **ESLint**: Two configs (basic + TypeScript-aware)
- **dprint**: Primary formatter
- **secretlint**: Prevents secrets in commits
- **lefthook**: Pre-commit hooks for quality checks

## Task Completion Checklist
After making changes:
1. `pnpm run check:types`
2. `pnpm run lint:all`
3. `pnpm run check:dprint`
4. `pnpm run test:develop` (or appropriate test level)
5. `pnpm run build`

## Documentation References

**Detailed documentation available in `docs/claude/`:**
- `docs/claude/project-overview.md`: Complete package structure
- `docs/claude/commands.md`: Comprehensive command reference
- `docs/claude/architecture.md`: Technical architecture details
- `docs/claude/development.md`: Development workflows
- `docs/claude/testing.md`: Testing strategies
- `docs/claude/conventions.md`: Code conventions and standards

**Supplementary documentation in `temp/` (Git-ignored working files):**
- Project structure maps, symbol search guides, advanced tooling guides
