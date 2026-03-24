import { readFileSync, writeFileSync } from 'fs'
import { parse } from 'dotenv'
import type { FixResult } from '../types.js'
import { parseEnvRaw } from './parser.js'

/**
 * 修復 .env 檔案：
 * 1. 補上缺少的 key（帶入 schema 的值，加上 # TODO 標記）
 * 2. 移除多餘的 key（.env 有但 schema 沒有）
 * 3. 對齊順序（依照 schema 順序重排）
 *
 * 不呼叫 process.exit()，回傳 FixResult
 */
export function fixEnv(schemaPath: string, envPath: string): FixResult {
  const schemaRaw = readFileSync(schemaPath, 'utf8')
  const schemaVars = parse(schemaRaw)
  const schemaKeys = Object.keys(schemaVars)

  const envRaw = parseEnvRaw(envPath)
  const envKeys = Object.keys(envRaw)

  const added: string[] = []
  const removed = envKeys.filter(key => !schemaKeys.includes(key))

  // 依照 schema 行結構重建 .env
  const schemaLines = schemaRaw.split(/\r?\n/)
  const outputLines: string[] = []

  for (const line of schemaLines) {
    const trimmed = line.trim()

    // 空行或純註解：直接保留
    if (trimmed === '' || trimmed.startsWith('#')) {
      outputLines.push(line)
      continue
    }

    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 1) continue

    const key = trimmed.slice(0, eqIdx).trim()
    if (!(key in schemaVars)) continue

    if (key in envRaw) {
      // 已存在的 key：保留原本的值
      outputLines.push(`${key}=${envRaw[key]}`)
    } else {
      // 缺少的 key：帶入 schema 值並標記 TODO
      const schemaValue = schemaVars[key]
      outputLines.push(`${key}=${schemaValue} # TODO`)
      added.push(key)
    }
  }

  // 比較修復前後的 key 順序是否有變化
  const outputKeys = outputLines
    .filter(l => l.includes('=') && !l.trimStart().startsWith('#'))
    .map(l => l.split('=')[0].trim())
  const reordered = outputKeys.length !== envKeys.length
    || !envKeys.every((k, i) => outputKeys[i] === k)

  // 保留原始檔案的換行符風格
  const eol = schemaRaw.includes('\r\n') ? '\r\n' : '\n'
  writeFileSync(envPath, outputLines.join(eol), 'utf8')

  return { added, removed, reordered }
}
