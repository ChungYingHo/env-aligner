import path from 'path'
import { checkEnv } from '../../core/checker.js'
import { fileExists } from '../../utils/fs.js'
import { logger } from '../../utils/logger.js'

const SCHEMA = '.env.example'
const ENV = '.env'

export async function checkCommand(): Promise<void> {
  const cwd = process.cwd()
  const schemaPath = path.join(cwd, SCHEMA)
  const envPath = path.join(cwd, ENV)

  if (!(await fileExists(schemaPath))) {
    logger.error(`❌ Schema file not found: ${schemaPath}`)
    process.exit(2)
  }
  if (!(await fileExists(envPath))) {
    logger.error(`❌ Env file not found: ${envPath}`)
    logger.info('   Run "env-aligner init" to create it.')
    process.exit(2)
  }

  const result = checkEnv(schemaPath, envPath)

  if (result.missing.length > 0) {
    logger.label.error(' [Missing Variables] ')
    logger.error(`→ ${result.missing.join(', ')}`)
  }

  if (result.empty.length > 0) {
    logger.label.warn(' [Empty Variables] ')
    logger.warn(`→ ${result.empty.join(', ')}`)
  }

  if (result.extra.length > 0) {
    logger.label.info(' [Extra Variables] ')
    logger.info(`→ ${result.extra.join(', ')}`)
  }

  if (!result.passed) {
    logger.error('\n❌ Check failed. Run "env-aligner fix" to auto-fix.')
    process.exit(1)
  }

  logger.success(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SUCCESS! ENV CHECK PASSED

✅ All required variables are present.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}
