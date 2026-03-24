import type { CheckResult } from '../types.js'
import { parseEnvFile, parseEnvRaw } from './parser.js'

/**
 * 比對 schema 與 .env 檔案，回傳差異結果
 * 純函式：不做任何 I/O 輸出，不呼叫 process.exit()
 */
export function checkEnv(schemaPath: string, envPath: string): CheckResult {
  const schemaVars = parseEnvFile(schemaPath)
  const envRaw = parseEnvRaw(envPath)

  const schemaKeys = Object.keys(schemaVars)
  const envKeys = Object.keys(envRaw)

  const missing = schemaKeys.filter(key => !(key in envRaw))

  const empty = schemaKeys.filter(key => {
    if (!(key in envRaw)) return false

    const rawValue = envRaw[key]
    // 明確設為 '' 或 "" 視為有意留空，不算 empty
    if (rawValue === "''" || rawValue === '""') return false

    // 引號包裹的值不做 inline comment 分割（引號內的 # 是值的一部分）
    const isQuoted = rawValue.startsWith('"') || rawValue.startsWith("'")
    const effective = isQuoted ? rawValue : rawValue.split('#')[0].trim()

    return effective === ''
  })

  const extra = envKeys.filter(key => !(key in schemaVars))

  return {
    missing,
    empty,
    extra,
    passed: missing.length === 0 && empty.length === 0
  }
}
