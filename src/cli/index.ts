import { program } from 'commander'
import { createRequire } from 'module'
import { checkCommand } from './commands/check.js'
import { initCommand } from './commands/init.js'
import { fixCommand } from './commands/fix.js'

const require = createRequire(import.meta.url)
const { version } = require('../../package.json')

const SHARED_OPTIONS = [
  { flag: '--dir <directory>', description: 'Root directory to scan', defaultValue: process.cwd() },
  { flag: '--schema <file>', description: 'Schema file name', defaultValue: '.env.example' },
  { flag: '--env <file>', description: 'Env file name', defaultValue: '.env' }
]

function applySharedOptions(cmd: import('commander').Command) {
  for (const { flag, description, defaultValue } of SHARED_OPTIONS) {
    cmd.option(flag, description, defaultValue)
  }
  return cmd
}

program
  .name('env-aligner')
  .description('A CLI tool to initialize, check, and fix .env files against a schema.')
  .version(version, '-v, --version')
  .showSuggestionAfterError()

// ── init ──────────────────────────────────────────────────────────────────────
applySharedOptions(
  program
    .command('init')
    .description('Create .env from schema (.env.example). Skips if .env already exists.')
).action(initCommand)

// ── check ─────────────────────────────────────────────────────────────────────
applySharedOptions(
  program
    .command('check', { isDefault: true })
    .description('Check .env against schema and report missing, empty, or extra variables. (default command)')
).addHelpText('after', `
  Tip: Add to package.json to run before dev:
    "predev": "env-aligner check"
  `)
  .action(checkCommand)

// ── fix ───────────────────────────────────────────────────────────────────────
applySharedOptions(
  program
    .command('fix')
    .description('Auto-fix .env: add missing keys (with # TODO), remove extra keys, align order to schema.')
).action(fixCommand)

program.parse(process.argv)
