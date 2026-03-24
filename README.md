# Env Aligner

A lightweight CLI tool to keep your `.env` files in sync with `.env.example`.

- **init** — Create `.env` from your schema file
- **check** — Detect missing, empty, or extra variables
- **fix** — Auto-fix: add missing keys, remove extras, align order

## Installation

```bash
npm install -D env-aligner
```

## Quick Start

```bash
# Create .env from .env.example (skips if .env already exists)
npx env-aligner init

# Check for issues
npx env-aligner check

# Auto-fix everything
npx env-aligner fix
```

**Pro tip:** Add a predev hook to catch missing variables before starting your dev server:

```json
{
  "scripts": {
    "predev": "env-aligner check"
  }
}
```

## Commands

### `env-aligner init`

Creates `.env` by copying from the schema file (`.env.example` by default). If `.env` already exists, it is skipped.

### `env-aligner check`

Compares `.env` against the schema and reports:
- **Missing variables** — keys in schema but not in `.env`
- **Empty variables** — keys present in `.env` but with no value
- **Extra variables** — keys in `.env` but not in schema (warning only)

Exit code `1` if missing or empty variables are found. Extra variables alone do not fail the check.

This is the **default command** — running `npx env-aligner` without a subcommand is equivalent to `npx env-aligner check`.

### `env-aligner fix`

Automatically fixes `.env`:
1. **Adds** missing keys with the schema's default value and a `# TODO` marker
2. **Removes** extra keys not defined in the schema
3. **Reorders** keys to match the schema's order (for easier visual comparison)

### Shared Options

| Option | Description | Default |
|---|---|---|
| `--dir <directory>` | Root directory to scan | `process.cwd()` |
| `--schema <file>` | Schema file name | `.env.example` |
| `--env <file>` | Env file name | `.env` |

```bash
# Examples with custom paths
npx env-aligner check --dir ./apps/web --schema .env.local.example --env .env.local
npx env-aligner init --schema .env.production.example
```

## Exit Codes

| Code | 意義 |
|------|------|
| `0` | 成功（check 通過 / init 完成 / fix 完成） |
| `1` | check 失敗（有 missing 或 empty 變數） |
| `2` | Fatal error（檔案不存在、寫入失敗等） |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for full version history.

## License

MIT © 2025 Jeremy Ho & MJC
