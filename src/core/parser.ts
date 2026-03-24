import { readFileSync } from 'fs'
import { parse } from 'dotenv'

/**
 * 解析 .env 或 .env.example 檔案
 * 回傳 key-value 物件，value 為空字串表示未設值
 */
export function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf8')
  return parse(content)
}

/**
 * 讀取 .env 檔案的原始 key=value 對應（保留原始字串，含引號）
 * 用於判斷是否真正留空（`''` 或 `""`）
 */
export function parseEnvRaw(filePath: string): Record<string, string> {
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/)
  const result: Record<string, string> = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    result[key] = value
  }

  return result
}
