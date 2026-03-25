## [v3.1.0](https://github.com/ChungYingHo/env-aligner/compare/v3.0.0...v3.1.0) (2026-03-25)

### Changes
1. Removed `--dir`, `--schema`, `--env` shared options. CLI now always operates on the current working directory with `.env.example` and `.env`.
2. Simplified CLI interface — just `cd` into your project and run `env-aligner`.

---

## [v3.0.0](https://github.com/ChungYingHo/env-aligner/compare/v2.0.0...v3.0.0) (2026-03-24)

### Breaking Changes
1. Replaced flag-based CLI (`--strict`, `--align`, `--clone`) with three focused subcommands: `init`, `check`, `fix`.
2. Removed programmatic API — env-aligner is now CLI-only.
3. Removed recursive directory scanning.
4. Extra keys are now always reported (previously required `--strict`).

### New Features
1. `env-aligner init` — Creates `.env` from schema file; skips if already exists.
2. `env-aligner check` — Reports missing, empty, and extra variables. Default command when no subcommand is given.
3. `env-aligner fix` — Adds missing keys (with `# TODO` marker), removes extra keys, and reorders to match schema.

### Technical Migration
1. Rewritten in TypeScript with ESM modules.
2. Build tool: Rollup → tsup (esbuild).
3. Test framework: manual test script → vitest (30 tests).
4. Color output: hand-written ANSI codes → picocolors.
5. Architecture: three-layer separation (CLI → Core → Utils). Core functions are pure — no `process.exit()` or `console.log`.

---

## [v2.0.0](https://github.com/ChungYingHo/env-aligner/compare/v1.0.0...v2.0.0) (2025-06-09)

### Bug Fixes
1. In v1.0.0, a bug caused keys with empty values in both the schema and the env file to be treated as valid, when they should have been reported as missing values.

### Deprecated Functions
1. We removed the `--missing`, `--empty`, and `--extra` options because users who install this package are typically aiming to check both missing keys and missing values by default. Extra keys are now only checked in strict mode, which will be explained in the Updated Functions section.
2. In v1.0.0, env-aligner recursively scanned the entire project directory. Starting from v2.0.0, once a target file is found and checked, the recursion stops immediately. This change improves performance by avoiding unnecessary checks in deeper directories.
3. We replaced Chalk with ANSI escape codes because Chalk does not render colors correctly in CI/CD pipelines.

### Update Functions
1. We added the `--clone` option, which allows users to generate an `.env` file based on the schema file.
2. We added the `--strict` option, which enables checking for extra keys in the `.env` file.
3. We added the `--align` option, which helps align the keys between the schema and `.env` file. It removes unnecessary keys and comments from the `.env` file while preserving existing values.
    - This option only works when used together with `--strict`.
