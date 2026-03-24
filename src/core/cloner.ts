import { promises as fs } from 'fs'
import { fileExists } from '../utils/fs.js'

/**
 * 從 schema 複製出 .env（若 .env 不存在）
 * 回傳 true 表示成功建立，false 表示已存在而跳過
 * 不呼叫 process.exit()，schema 不存在時 throw Error
 */
export async function cloneEnv(schemaPath: string, envPath: string): Promise<boolean> {
  if (!(await fileExists(schemaPath))) {
    throw new Error(`Schema file not found: ${schemaPath}`)
  }

  if (await fileExists(envPath)) {
    return false
  }

  await fs.copyFile(schemaPath, envPath)
  return true
}
