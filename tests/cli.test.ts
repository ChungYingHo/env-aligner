import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { execFileSync } from 'child_process'
import { existsSync, copyFileSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLI = path.join(__dirname, '..', 'dist', 'cli', 'index.js')
const fixture = (dir: string) => path.join(__dirname, 'fixtures', dir)

function run(args: string[]): { code: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync('node', [CLI, ...args], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
    return { code: 0, stdout, stderr: '' }
  } catch (err: unknown) {
    const e = err as { status: number; stdout: string; stderr: string }
    return { code: e.status, stdout: e.stdout ?? '', stderr: e.stderr ?? '' }
  }
}

describe('CLI integration', () => {
  beforeAll(() => {
    expect(existsSync(CLI)).toBe(true)
  })

  describe('check', () => {
    it('exits 0 when env is in sync', () => {
      const result = run(['check', '--dir', fixture('basic')])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('SUCCESS')
    })

    it('exits 1 when missing keys found', () => {
      const result = run(['check', '--dir', fixture('missing-keys')])
      expect(result.code).toBe(1)
      expect(result.stderr).toContain('Missing')
    })

    it('exits 2 when schema file not found', () => {
      const result = run(['check', '--dir', fixture('basic'), '--schema', 'nonexistent'])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('not found')
    })

    it('runs as default command (no subcommand)', () => {
      const result = run(['--dir', fixture('basic')])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('SUCCESS')
    })
  })

  describe('init', () => {
    const tmpDir = path.join(__dirname, 'fixtures', '_tmp-init')

    beforeEach(() => {
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true })
      mkdirSync(tmpDir, { recursive: true })
    })

    afterEach(() => {
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true })
    })

    it('creates .env from schema', () => {
      copyFileSync(
        path.join(fixture('basic'), '.env.example'),
        path.join(tmpDir, '.env.example')
      )

      const result = run(['init', '--dir', tmpDir])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('Created')
      expect(existsSync(path.join(tmpDir, '.env'))).toBe(true)
    })

    it('skips when .env already exists', () => {
      copyFileSync(
        path.join(fixture('basic'), '.env.example'),
        path.join(tmpDir, '.env.example')
      )
      writeFileSync(path.join(tmpDir, '.env'), 'EXISTING=true\n')

      const result = run(['init', '--dir', tmpDir])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('already exists')
    })

    it('exits 2 when schema not found', () => {
      const result = run(['init', '--dir', tmpDir])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('Schema file not found')
    })
  })

  describe('fix', () => {
    const tmpDir = path.join(__dirname, 'fixtures', '_tmp-fix')

    afterEach(() => {
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true })
    })

    it('adds missing keys and reports changes', () => {
      mkdirSync(tmpDir, { recursive: true })
      copyFileSync(path.join(fixture('missing-keys'), '.env.example'), path.join(tmpDir, '.env.example'))
      copyFileSync(path.join(fixture('missing-keys'), '.env'), path.join(tmpDir, '.env'))

      const result = run(['fix', '--dir', tmpDir])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('fixed')
    })

    it('reports no changes when already synced', () => {
      mkdirSync(tmpDir, { recursive: true })
      copyFileSync(path.join(fixture('synced'), '.env.example'), path.join(tmpDir, '.env.example'))
      copyFileSync(path.join(fixture('synced'), '.env'), path.join(tmpDir, '.env'))

      const result = run(['fix', '--dir', tmpDir])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('no changes')
    })
  })

  describe('-v (version)', () => {
    it('prints version', () => {
      const result = run(['-v'])
      expect(result.code).toBe(0)
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })
})
