import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import path from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { fixEnv } from '../src/core/fixer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureDir = path.join(__dirname, 'fixtures', 'mixed')
const schemaPath = path.join(fixtureDir, '.env.example')
const tempEnv = path.join(fixtureDir, '.env.tmp')

describe('fixEnv', () => {
  beforeEach(async () => {
    // 複製 fixture .env 作為測試對象，避免污染原始 fixture
    await fs.copyFile(path.join(fixtureDir, '.env'), tempEnv)
  })

  afterEach(async () => {
    try { await fs.unlink(tempEnv) } catch {}
  })

  it('adds missing keys with # TODO marker', () => {
    const result = fixEnv(schemaPath, tempEnv)
    expect(result.added).toContain('APP_PORT')
    expect(result.added).toContain('DB_PASSWORD')
    expect(result.added).toContain('API_KEY')
  })

  it('removes extra keys', () => {
    const result = fixEnv(schemaPath, tempEnv)
    expect(result.removed).toContain('OLD_KEY')
  })

  it('writes # TODO marker for added keys', async () => {
    fixEnv(schemaPath, tempEnv)
    const content = await fs.readFile(tempEnv, 'utf8')
    expect(content).toMatch(/APP_PORT=3000 # TODO/)
    expect(content).toMatch(/API_KEY=your-api-key # TODO/)
  })

  it('preserves existing values', async () => {
    fixEnv(schemaPath, tempEnv)
    const content = await fs.readFile(tempEnv, 'utf8')
    expect(content).toMatch(/APP_NAME=my-app/)
    expect(content).toMatch(/DB_HOST=localhost/)
  })

  it('aligns output order to schema order', async () => {
    fixEnv(schemaPath, tempEnv)
    const content = await fs.readFile(tempEnv, 'utf8')
    const lines = content.split('\n').filter(l => l.includes('='))
    const keys = lines.map(l => l.split('=')[0].trim())
    // Schema order: APP_NAME, APP_PORT, DB_HOST, DB_PORT, DB_PASSWORD, API_KEY
    expect(keys.indexOf('APP_NAME')).toBeLessThan(keys.indexOf('DB_HOST'))
    expect(keys.indexOf('DB_HOST')).toBeLessThan(keys.indexOf('API_KEY'))
  })

  it('preserves CRLF line endings from schema', async () => {
    const crlfDir = path.join(__dirname, 'fixtures', 'crlf')
    const crlfSchema = path.join(crlfDir, '.env.example')
    const crlfTmp = path.join(crlfDir, '.env.tmp')
    await fs.copyFile(path.join(crlfDir, '.env'), crlfTmp)
    try {
      const result = fixEnv(crlfSchema, crlfTmp)
      expect(result.added).toContain('APP_PORT')
      const content = await fs.readFile(crlfTmp, 'utf8')
      expect(content).toContain('\r\n')
      // Verify no bare \n (all newlines should be \r\n)
      const withoutCRLF = content.replace(/\r\n/g, '')
      expect(withoutCRLF).not.toContain('\n')
    } finally {
      try { await fs.unlink(crlfTmp) } catch {}
    }
  })

  it('returns reordered=false when env already matches schema order', async () => {
    const syncedDir = path.join(__dirname, 'fixtures', 'synced')
    const syncedSchema = path.join(syncedDir, '.env.example')
    const syncedTmp = path.join(syncedDir, '.env.tmp')
    await fs.copyFile(path.join(syncedDir, '.env'), syncedTmp)
    try {
      const result = fixEnv(syncedSchema, syncedTmp)
      expect(result.added).toHaveLength(0)
      expect(result.removed).toHaveLength(0)
      expect(result.reordered).toBe(false)
    } finally {
      try { await fs.unlink(syncedTmp) } catch {}
    }
  })
})
