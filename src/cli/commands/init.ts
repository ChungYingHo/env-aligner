import path from 'path'
import { cloneEnv } from '../../core/cloner.js'
import { logger } from '../../utils/logger.js'

interface InitOptions {
  dir: string
  schema: string
  env: string
}

export async function initCommand(opts: InitOptions): Promise<void> {
  const schemaPath = path.join(opts.dir, opts.schema)
  const envPath = path.join(opts.dir, opts.env)

  try {
    const created = await cloneEnv(schemaPath, envPath)
    if (created) {
      logger.success(`✅ Created ${opts.env} from ${opts.schema} in ${opts.dir}`)
    } else {
      logger.info(`ℹ️  ${opts.env} already exists in ${opts.dir}, skipping.`)
    }
  } catch (err) {
    logger.error(`❌ ${(err as Error).message}`)
    process.exit(2)
  }
}
