import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import path from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { cloneEnv } from '../src/core/cloner.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixture = (file: string) => path.join(__dirname, 'fixtures', 'basic', file)

describe('cloneEnv', () => {
  const tempEnv = path.join(__dirname, 'fixtures', 'basic', '.env.tmp')

  afterEach(async () => {
    try { await fs.unlink(tempEnv) } catch {}
  })

  it('creates env file from schema if it does not exist', async () => {
    const created = await cloneEnv(fixture('.env.example'), tempEnv)
    expect(created).toBe(true)
    const content = await fs.readFile(tempEnv, 'utf8')
    expect(content).toContain('APP_NAME=my-app')
  })

  it('skips if env file already exists', async () => {
    await fs.copyFile(fixture('.env'), tempEnv)
    const created = await cloneEnv(fixture('.env.example'), tempEnv)
    expect(created).toBe(false)
  })

  it('throws if schema file does not exist', async () => {
    await expect(
      cloneEnv(fixture('.env.nonexistent'), tempEnv)
    ).rejects.toThrow('Schema file not found')
  })
})
