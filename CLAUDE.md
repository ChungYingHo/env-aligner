# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

env-aligner is a Node.js CLI tool and library that validates and aligns `.env` files against schema files (e.g., `.env.example`). It recursively searches directories, detects missing/empty/extra keys, can auto-align `.env` format to match the schema, and can clone schema files to create new `.env` files.

## Commands

- **Build:** `npm run build` (deletes `dist/` then runs rollup)
- **Dev (watch mode):** `npm run dev`
- **Lint:** `npx eslint .`
- **Run manually:** `node test/test.js` (runs envAligner with strict+align against cwd)

There is no test framework configured — `npm test` just exits with an error.

## Architecture

The project uses CommonJS throughout (no ESM). Rollup bundles two entry points into `dist/`:

- **`src/bin/cli.js`** → `dist/cli.min.js` — CLI entry point using Commander. Parses `--dir`, `--schema`, `--env`, `--strict`, `--align`, `--clone` options and calls the library.
- **`src/lib/index.js`** → `dist/index.min.js` — Library entry point (programmatic API). Exported as `module.exports = envAligner`. Recursively walks directories, skipping `node_modules` and `dist`.

### Core modules (`src/lib/`)

- **`envHandler.js`** — Core logic: `checkEnvVariables` (compare schema vs env, report missing/empty/extra keys), `alignEnvWithSchema` (rewrite .env to match schema order, handles multiline values), `cloneSchemaToEnv` (copy schema to env if missing).
- **`fileReader.js`** — File utilities: `parseEnvFile` (uses `dotenv.parse`), `fileExists`, `validateFileNames`, `validateDirectory`.
- **`colorFormat.js`** — ANSI color helpers (no dependencies). Functions: `formatRed`, `formatRedInverse`, `formatYellow`, `formatYellowInverse`, `formatBlue`, `formatBlueInverse`, `formatGreen`, `formatGreenInverse`.

### Constants (`src/constant/default.js`)

Default config values: root dir (`process.cwd()`), schema name (`.env.example`), env name (`.env`), mode flags.

## Code Style

Enforced via ESLint (`eslint.config.mjs`):
- 2-space indentation
- No semicolons
- No trailing commas
- Space before function parentheses
- Spaces inside curly braces

Comments in the codebase are written in Traditional Chinese (繁體中文).

## Key Behaviors

- `--align` only works when `--strict` is also enabled; the CLI warns and ignores it otherwise.
- `process.exit(1)` is called on missing/empty variables or fatal errors — not exceptions.
- The recursive directory walk stops at the first directory containing a matching env file.
- Dependencies `dotenv` and `commander` are runtime; `rollup`, `eslint` are dev-only.

## Workflow Rules

- Every conversation or adjustment must end with a Chinese summary starting with「親愛的 Jeremy」.
- All code changes will be reviewed by **antigravity** and **codex** — keep changes clear and easy to review.
