import path from 'path'
import { checkEnv } from '../../core/checker.js'
import { fileExists } from '../../utils/fs.js'
import { logger } from '../../utils/logger.js'

interface CheckOptions {
  dir: string
  schema: string
  env: string
}

export async function checkCommand(opts: CheckOptions): Promise<void> {
  const schemaPath = path.join(opts.dir, opts.schema)
  const envPath = path.join(opts.dir, opts.env)

  if (!(await fileExists(schemaPath))) {
    logger.error(`❌ Schema file not found: ${schemaPath}`)
    process.exit(2)
  }
  if (!(await fileExists(envPath))) {
    logger.error(`❌ Env file not found: ${envPath}`)
    logger.info(`   Run "env-aligner init" to create it.`)
    process.exit(2)
  }

  const result = checkEnv(schemaPath, envPath)

  if (result.missing.length > 0) {
    logger.label.error(` [Missing Variables] `)
    logger.error(`→ ${result.missing.join(', ')}`)
  }

  if (result.empty.length > 0) {
    logger.label.warn(` [Empty Variables] `)
    logger.warn(`→ ${result.empty.join(', ')}`)
  }

  if (result.extra.length > 0) {
    logger.label.info(` [Extra Variables] `)
    logger.info(`→ ${result.extra.join(', ')}`)
  }

  if (!result.passed) {
    logger.error(`\n❌ Check failed. Run "env-aligner fix" to auto-fix.`)
    process.exit(1)
  }

  logger.success(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SUCCESS! ENV CHECK PASSED

✅ All required variables are present in:
   ${opts.dir}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}
