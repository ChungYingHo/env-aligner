import type { CheckResult } from '../types.js'
import { parseEnvFile, parseEnvRaw } from './parser.js'

/**
 * 比對 schema 與 .env 檔案，回傳差異結果
 * 純函式：不做任何 I/O 輸出，不呼叫 process.exit()
 */
export function checkEnv(schemaPath: string, envPath: string): CheckResult {
  const schemaVars = parseEnvFile(schemaPath)
  const envVars = parseEnvFile(envPath)
  const envRaw = parseEnvRaw(envPath)

  const schemaKeys = Object.keys(schemaVars)
  const envKeys = Object.keys(envVars)

  const missing = schemaKeys.filter(key => !envKeys.includes(key))

  const empty = schemaKeys.filter(key => {
    if (!envKeys.includes(key)) return false

    const rawValue = envRaw[key] ?? ''
    // 明確設為 '' 或 "" 視為有意留空，不算 empty
    if (rawValue === "''" || rawValue === '""') return false

    const parsed = envVars[key]
    // 去掉行內 comment 後若為空字串，視為 empty
    const isQuoted = parsed.startsWith('"') || parsed.startsWith("'")
    const valueWithoutComment = !isQuoted
      ? parsed.split('#')[0].trim()
      : parsed.trim()

    return valueWithoutComment === ''
  })

  const extra = envKeys.filter(key => !schemaKeys.includes(key))

  return {
    missing,
    empty,
    extra,
    passed: missing.length === 0 && empty.length === 0
  }
}
