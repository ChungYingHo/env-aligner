import { describe, it, expect } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseEnvFile, parseEnvRaw } from '../src/core/parser.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixture = (dir: string, file: string) => path.join(__dirname, 'fixtures', dir, file)

describe('parseEnvFile', () => {
  it('parses key-value pairs correctly', () => {
    const result = parseEnvFile(fixture('basic', '.env.example'))
    expect(result).toMatchObject({
      APP_NAME: 'my-app',
      APP_PORT: '3000',
      DB_HOST: 'localhost'
    })
  })
})

describe('parseEnvRaw', () => {
  it('preserves raw value strings including quotes', () => {
    const result = parseEnvRaw(fixture('basic', '.env'))
    expect(result['DB_PASSWORD']).toBe("''")
  })
})
