import { program } from 'commander'
import { createRequire } from 'module'
import { checkCommand } from './commands/check.js'
import { initCommand } from './commands/init.js'
import { fixCommand } from './commands/fix.js'

const require = createRequire(import.meta.url)
const { version } = require('../../package.json')

const SHARED_OPTIONS = [
  ['--dir <directory>', 'Root directory to scan', process.cwd()],
  ['--schema <file>', 'Schema file name', '.env.example'],
  ['--env <file>', 'Env file name', '.env']
] as const

program
  .name('env-aligner')
  .description('A CLI tool to initialize, check, and fix .env files against a schema.')
  .version(version, '-v', '--version')
  .showSuggestionAfterError()

// ── init ──────────────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Create .env from schema (.env.example). Skips if .env already exists.')
  .option(SHARED_OPTIONS[0][0], SHARED_OPTIONS[0][1], SHARED_OPTIONS[0][2])
  .option(SHARED_OPTIONS[1][0], SHARED_OPTIONS[1][1], SHARED_OPTIONS[1][2])
  .option(SHARED_OPTIONS[2][0], SHARED_OPTIONS[2][1], SHARED_OPTIONS[2][2])
  .action(initCommand)

// ── check ─────────────────────────────────────────────────────────────────────
program
  .command('check', { isDefault: true })
  .description('Check .env against schema and report missing, empty, or extra variables. (default command)')
  .option(SHARED_OPTIONS[0][0], SHARED_OPTIONS[0][1], SHARED_OPTIONS[0][2])
  .option(SHARED_OPTIONS[1][0], SHARED_OPTIONS[1][1], SHARED_OPTIONS[1][2])
  .option(SHARED_OPTIONS[2][0], SHARED_OPTIONS[2][1], SHARED_OPTIONS[2][2])
  .addHelpText('after', `
  Tip: Add to package.json to run before dev:
    "predev": "env-aligner check"
  `)
  .action(checkCommand)

// ── fix ───────────────────────────────────────────────────────────────────────
program
  .command('fix')
  .description('Auto-fix .env: add missing keys (with # TODO), remove extra keys, align order to schema.')
  .option(SHARED_OPTIONS[0][0], SHARED_OPTIONS[0][1], SHARED_OPTIONS[0][2])
  .option(SHARED_OPTIONS[1][0], SHARED_OPTIONS[1][1], SHARED_OPTIONS[1][2])
  .option(SHARED_OPTIONS[2][0], SHARED_OPTIONS[2][1], SHARED_OPTIONS[2][2])
  .action(fixCommand)

program.parse(process.argv)
