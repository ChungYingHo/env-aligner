import { describe, it, expect } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import { checkEnv } from '../src/core/checker.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixture = (dir: string, file: string) => path.join(__dirname, 'fixtures', dir, file)

describe('checkEnv', () => {
  it('passes when all keys are present and filled', () => {
    const result = checkEnv(
      fixture('basic', '.env.example'),
      fixture('basic', '.env')
    )
    expect(result.passed).toBe(true)
    expect(result.missing).toHaveLength(0)
    expect(result.empty).toHaveLength(0)
  })

  it('detects missing keys', () => {
    const result = checkEnv(
      fixture('missing-keys', '.env.example'),
      fixture('missing-keys', '.env')
    )
    expect(result.passed).toBe(false)
    expect(result.missing).toContain('DB_HOST')
    expect(result.missing).toContain('DB_PASSWORD')
  })

  it('detects empty values', () => {
    const result = checkEnv(
      fixture('empty-values', '.env.example'),
      fixture('empty-values', '.env')
    )
    expect(result.passed).toBe(false)
    expect(result.empty).toContain('API_KEY')
    expect(result.empty).toContain('DB_PASSWORD')
  })

  it('detects extra keys', () => {
    const result = checkEnv(
      fixture('extra-keys', '.env.example'),
      fixture('extra-keys', '.env')
    )
    expect(result.extra).toContain('OLD_SECRET')
    expect(result.extra).toContain('DEPRECATED_KEY')
    // extra keys alone do not fail the check
    expect(result.passed).toBe(true)
  })

  it('treats explicitly quoted empty strings as valid', () => {
    const result = checkEnv(
      fixture('basic', '.env.example'),
      fixture('basic', '.env')
    )
    // DB_PASSWORD='' should be considered valid (intentionally empty)
    expect(result.empty).not.toContain('DB_PASSWORD')
  })
})
