import path from 'path'
import { cloneEnv } from '../../core/cloner.js'
import { logger } from '../../utils/logger.js'

const SCHEMA = '.env.example'
const ENV = '.env'

export async function initCommand(): Promise<void> {
  const cwd = process.cwd()
  const schemaPath = path.join(cwd, SCHEMA)
  const envPath = path.join(cwd, ENV)

  try {
    const created = await cloneEnv(schemaPath, envPath)
    if (created) {
      logger.success(`✅ Created ${ENV} from ${SCHEMA}`)
    } else {
      logger.info(`ℹ️  ${ENV} already exists, skipping.`)
    }
  } catch (err) {
    logger.error(`❌ ${(err as Error).message}`)
    process.exit(2)
  }
}
