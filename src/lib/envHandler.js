const fs = require('fs')
const dotenv = require('dotenv')
const path = require('path')
const colorFormat = require('./colorFormat')
const fileReader = require('./fileReader')
/**
 * 從 schema 複製出 .env 檔案（如果不存在）
 * @param {string} rootDir 資料夾路徑
 * @param {string} schemaFileName schema 檔案名稱（預設 .env.example）
 * @param {string} envFileName 要產出的 .env 檔名（預設 .env）
 */

const cloneSchemaToEnv = async (schemaFileName, envFileName, rootDir) => {
  const schemaFilePath = path.join(rootDir, schemaFileName)
  const envFilePath = path.join(rootDir, envFileName)

  // 檢查 schema 檔案是否存在
  if (!(await fileReader.fileExists(schemaFilePath))) {
    console.error(colorFormat.formatRedInverse(`\nSchema file ${schemaFileName} does not exist in ${rootDir}`))
    process.exit(1)
  }

  // 如果 .env 檔案不存在，則複製 schema 檔案到 .env
  if (!(await fileReader.fileExists(envFilePath))) {
    await fs.promises.copyFile(schemaFilePath, envFilePath)
    console.log(colorFormat.formatGreen(`\nCopied ${schemaFileName} to ${envFileName} in ${rootDir}`))
  } else {
    console.log(colorFormat.formatBlue(`\n${envFileName} already exists in ${rootDir}, skipping copy.`))
  }
}

/**
 * 根據 schema 對齊 .env 檔案的格式與變數順序
 * 支援多行變數值（例如憑證）
 */
const alignEnvWithSchema = async (schemaFilePath, envFilePath) => {
  const schemaRaw = fs.readFileSync(schemaFilePath, 'utf8')
  const schemaVars = dotenv.parse(schemaRaw)

  // 解析 env 並保留 ""、'' 判斷
  const envRawLines = fs.readFileSync(envFilePath, 'utf-8').split('\n')
  const envRawMap = {}
  let currentKey = null
  let buffer = []

  for (const line of envRawLines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) continue

    const equalIndex = trimmed.indexOf('=')
    const hasNewAssignment = equalIndex > 0 && trimmed[equalIndex - 1] !== '\\'

    if (hasNewAssignment) {
      if (currentKey) {
        envRawMap[currentKey] = buffer.join('\n')
        buffer = []
      }

      const key = trimmed.slice(0, equalIndex).trim()
      const value = trimmed.slice(equalIndex + 1)
      currentKey = key
      buffer.push(value)
    } else if (currentKey) {
      buffer.push(trimmed)
    }
  }

  if (currentKey) {
    envRawMap[currentKey] = buffer.join('\n')
  }

  // 開始對齊
  const outputLines = []
  const schemaLines = schemaRaw.split(/\r?\n/)

  for (const originalLine of schemaLines) {
    const trimmed = originalLine.trim()

    if (trimmed === '') {
      outputLines.push('')
      continue
    }

    if (trimmed.startsWith('#')) {
      outputLines.push(originalLine)
      continue
    }

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex !== -1) {
      const key = trimmed.slice(0, equalIndex).trim()

      if (key in schemaVars) {
        let value = envRawMap[key] ?? ''
        const needsQuote = value.includes('\n')

        if (needsQuote && !(value.startsWith('"') || value.startsWith("'"))) {
          console.log(colorFormat.formatYellow(`ℹ️  Variable "${key}" has multi-line value. Automatically quoting to preserve it.`))
          value = `"${value}"`
        }

        outputLines.push(`${key}=${value}`)
      }
    }
  }

  await fs.promises.writeFile(envFilePath, outputLines.join('\n'), 'utf8')

  console.log(
    colorFormat.formatGreenInverse(
      `\nAligned ${path.basename(envFilePath)} with ${path.basename(schemaFilePath)}`
    )
  )
}

/**
 * 會檢查 schema 檔案中的變數是否都有在 env 檔案中出現
 * @param {string} schemaFilePath
 * @param {string} envFilePath
 */
const checkEnvVariables = async (schemaFilePath, envFilePath, isStrict, isAlign) => {
  const schemaVars = fileReader.parseEnvFile(schemaFilePath)
  const envVars = fileReader.parseEnvFile(envFilePath)
  const schemaKeys = Object.keys(schemaVars)
  const envKeys = Object.keys(envVars)

  const envRawLines = fs.readFileSync(envFilePath, 'utf-8').split('\n')
  const envRawMap = {}
  for (const line of envRawLines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [key, ...rest] = trimmed.split('=')
    const value = rest.join('=').trim()
    envRawMap[key.trim()] = value
  }

  const missingKeys = schemaKeys.filter(key => !envKeys.includes(key))
  const emptyValueKeys = schemaKeys.filter(
    key => {
      if (!envKeys.includes(key) || missingKeys.includes(key)) return false

      const rawValue = envVars[key]
      if (typeof rawValue !== 'string') return false

      // 用原始 map 判斷是否填了 '' 或 ""
      const rawString = envRawMap[key] ?? ''
      if (rawString === "''" || rawString === '""') return false

      const isQuoted = rawValue.startsWith('"') || rawValue.startsWith("'")
      const trimmed = rawValue.trim()

      const valueWithoutComment = !isQuoted
        ? trimmed.split('#')[0].trim()
        : trimmed

      return valueWithoutComment === ''
    }
  )

  const extraKeys = isStrict ? envKeys.filter(key => !schemaKeys.includes(key)) : []

  const envDir = path.dirname(envFilePath)

  if (missingKeys.length > 0) {
    console.error(colorFormat.formatRedInverse(`\n[Missing Variables] in ${envDir}`))
    console.log(colorFormat.formatRed(`→ ${missingKeys.join(', ')}`))
  }

  if (emptyValueKeys.length > 0) {
    console.error(colorFormat.formatYellowInverse(`\n[Empty Variables] in ${envDir}`))
    console.log(colorFormat.formatYellow(`→ ${emptyValueKeys.join(', ')}`))
  }

  if (extraKeys.length > 0) {
    console.error(colorFormat.formatBlueInverse(`\n[Extra Variables] in ${envDir}`))
    console.log(colorFormat.formatBlue(`→ ${extraKeys.join(', ')}`))
  }

  if (isStrict && isAlign) {
    await alignEnvWithSchema(schemaFilePath, envFilePath)
  } else if (!isStrict && isAlign) {
    console.log(colorFormat.formatYellow(
      `\n[Warning] The "align" option can only be used in strict mode. Skipping alignment.`
    ))
  }

  if (missingKeys.length > 0 || emptyValueKeys.length > 0 ) {
    process.exit(1)
  } else {
    const msg = `
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      🎉 SUCCESS! ENV CHECK PASSED 🎉

      ✅ All variables in: ${envDir}

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `
    console.log(colorFormat.formatGreen(msg))
  }
}

module.exports = {
  cloneSchemaToEnv,
  alignEnvWithSchema,
  checkEnvVariables
}