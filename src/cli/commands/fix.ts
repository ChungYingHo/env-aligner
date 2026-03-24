import path from 'path'
import { fixEnv } from '../../core/fixer.js'
import { fileExists } from '../../utils/fs.js'
import { logger } from '../../utils/logger.js'

interface FixOptions {
  dir: string
  schema: string
  env: string
}

export async function fixCommand(opts: FixOptions): Promise<void> {
  const schemaPath = path.join(opts.dir, opts.schema)
  const envPath = path.join(opts.dir, opts.env)

  if (!(await fileExists(schemaPath))) {
    logger.error(`❌ Schema file not found: ${schemaPath}`)
    process.exit(2)
  }
  if (!(await fileExists(envPath))) {
    logger.error(`❌ Env file not found: ${envPath}`)
    logger.info('   Run "env-aligner init" to create it.')
    process.exit(2)
  }

  try {
    const result = fixEnv(schemaPath, envPath)

    if (result.added.length > 0) {
      logger.label.warn(' [Added Keys] ')
      logger.warn(`→ ${result.added.join(', ')}`)
      logger.warn('  (marked with # TODO — please fill in actual values)')
    }

    if (result.removed.length > 0) {
      logger.label.info(' [Removed Keys] ')
      logger.info(`→ ${result.removed.join(', ')}`)
    }

    const hasChanges = result.added.length > 0 || result.removed.length > 0 || result.reordered

    if (hasChanges) {
      logger.success(`\n✅ ${opts.env} has been fixed and aligned with ${opts.schema}`)
    } else {
      logger.success(`\n✅ ${opts.env} is already in sync with ${opts.schema} — no changes needed.`)
    }
  } catch (err) {
    logger.error(`❌ ${(err as Error).message}`)
    process.exit(2)
  }
}
