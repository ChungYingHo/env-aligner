# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

env-aligner is a Node.js CLI tool that validates and fixes `.env` files against a schema file (e.g., `.env.example`). It provides three focused commands: `init`, `check`, and `fix`.

## Commands

- **Build:** `npm run build` (tsup)
- **Dev (watch mode):** `npm run dev`
- **Test:** `npm test` (vitest)
- **Lint:** `npx eslint src/`

## Architecture

Three-layer architecture: **CLI → Core → Utils**. TypeScript + ESM throughout.

### CLI Layer (`src/cli/`)

- **`index.ts`** — Commander entry point. Registers three subcommands with shared options (`--dir`, `--schema`, `--env`).
- **`commands/init.ts`** — Creates `.env` from schema; skips if already exists.
- **`commands/check.ts`** — Reports missing / empty / extra keys. Default command.
- **`commands/fix.ts`** — Adds missing keys (with `# TODO`), removes extra keys, aligns order to schema.

### Core Layer (`src/core/`)

Pure functions — no `process.exit()`, no `console.log`. Return typed result objects.

- **`parser.ts`** — `parseEnvFile()` (dotenv-based) and `parseEnvRaw()` (preserves raw values including quotes).
- **`checker.ts`** — `checkEnv()` → `CheckResult` (missing / empty / extra / passed).
- **`cloner.ts`** — `cloneEnv()` → copies schema to .env if not exists.
- **`fixer.ts`** — `fixEnv()` → `FixResult` (added / removed / reordered). Rebuilds .env following schema line structure.

### Utils Layer (`src/utils/`)

- **`logger.ts`** — picocolors-based colored output (success/info/warn/error + label variants).
- **`fs.ts`** — `fileExists()` async helper.

### Types (`src/types.ts`)

- `CheckResult` — `{ missing, empty, extra, passed }`
- `FixResult` — `{ added, removed, reordered }`

### Exit Codes

- `0` — success
- `1` — check failed (missing or empty variables)
- `2` — fatal error (file not found)

## Build & Dependencies

- **Build tool:** tsup (esbuild), single entry `src/cli/index.ts` → `dist/cli/index.js`
- **Runtime deps:** commander, dotenv, picocolors
- **Dev deps:** typescript, tsup, vitest, eslint-config-jeremy
- **Target:** Node 18+, ESM

## Code Style

Enforced via `eslint-config-jeremy` (`eslint.config.js`):
- 2-space indentation
- No semicolons
- Single quotes
- Comments in Traditional Chinese (繁體中文)

## Workflow Rules

- Every conversation or adjustment must end with a Chinese summary starting with「親愛的 Jeremy」.
- All code changes will be reviewed by **antigravity** and **codex** — keep changes clear and easy to review.
