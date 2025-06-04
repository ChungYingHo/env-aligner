const fs = require('fs')
const dotenv = require('dotenv')
const path = require('path')
const colorFormat = require('./colorFormat')
const fileReader = require('./fileReader')
const { defaultDir, defaultSchemaFileName, defaultEnvFileName } = require('../constant/default')

/**
 * 這個函式會檢查 fileNames 物件是否有缺少必要的 key 或是 key 的值不是 string
 * @param {string} fileNames
 */
const validateFileNames = (fileNames) => {
  const requiredKeys = ['schemaName', 'envName']

  requiredKeys.forEach(key => {
    if(!(key in fileNames)) {
      console.error(colorFormat.formatRedInverse(`\nMissing required key: ${key}`))
      process.exit(1)
    }

    if (typeof fileNames[key] !== 'string') {
      console.error(colorFormat.formatRedInverse(`\n${key} must be a string`))
      process.exit(1)
    }
  })
}

/**
 * 根據 schema 對齊 .env 檔案的格式與變數順序
 * 支援多行變數值（例如憑證）
 */
const alignEnvWithSchema = async (schemaPath, envPath) => {
  const schemaRaw = fs.readFileSync(schemaPath, 'utf8')
  const schemaVars = dotenv.parse(schemaRaw)
  const envVars = fileReader.parseEnvFile(envPath)

  const outputLines = []
  const lineBuffer = schemaRaw.split(/\r?\n/)

  for (let i = 0; i < lineBuffer.length; i++) {
    const line = lineBuffer[i].trim()

    // 空行
    if (line === '') {
      outputLines.push('')
      continue
    }

    // 註解
    if (line.startsWith('#')) {
      outputLines.push(lineBuffer[i])
      continue
    }

    // 判斷是不是新的變數宣告
    const equalIndex = line.indexOf('=')
    if (equalIndex !== -1) {
      const key = line.slice(0, equalIndex).trim()

      if (key in schemaVars) {
        const value = envVars[key] ?? ''
        const quoted = value.includes('\n') ? `"${value}"` : value
        outputLines.push(`${key}=${quoted}`)
      }
    }
  }

  await fs.promises.writeFile(envPath, outputLines.join('\n'), 'utf8')

  console.log(colorFormat.formatGreenInverse(`\nAligned ${path.basename(envPath)} with ${path.basename(schemaPath)}`))
}

/**
 * 會檢查 schema 檔案中的變數是否都有在 env 檔案中出現
 * @param {string} schemaPath
 * @param {string} envPath
 */
const checkEnvVariables = async (schemaPath, envPath, isStrict, isAlign) => {
  const schemaVars = fileReader.parseEnvFile(schemaPath)
  const envVars = fileReader.parseEnvFile(envPath)
  const schemaKeys = Object.keys(schemaVars)
  const envKeys = Object.keys(envVars)

  const missingKeys = schemaKeys.filter(key => !envKeys.includes(key))
  const emptyValueKeys = schemaKeys.filter(
    key => schemaVars[key] && envVars[key] === '' && !missingKeys.includes(key)
  )
  const extraKeys = isStrict ? envKeys.filter(key => !schemaKeys.includes(key)) : []

  const envDir = path.dirname(envPath)

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
    await alignEnvWithSchema(schemaPath, envPath)
  } else if (!isStrict && isAlign) {
    console.warn(colorFormat.formatYellowInverse(
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

/**
 * 從 schema 複製出 .env 檔案（如果不存在）
 * @param {string} dirPath 資料夾路徑
 * @param {string} schemaName schema 檔案名稱（預設 .env.example）
 * @param {string} envName 要產出的 .env 檔名（預設 .env）
 */

const cloneSchemaToEnv = async (schemaName = defaultSchemaFileName, envName = defaultEnvFileName, dirPath = defaultDir) => {
  const schemaPath = path.join(dirPath, schemaName)
  const envPath = path.join(dirPath, envName)

  // 檢查 schema 檔案是否存在
  if (!(await fileReader.fileExists(schemaPath))) {
    console.error(colorFormat.formatRedInverse(`\nSchema file ${schemaName} does not exist in ${dirPath}`))
    process.exit(1)
  }

  // 如果 .env 檔案不存在，則複製 schema 檔案到 .env
  if (!(await fileReader.fileExists(envPath))) {
    await fs.promises.copyFile(schemaPath, envPath)
    console.log(colorFormat.formatGreen(`\nCopied ${schemaName} to ${envName} in ${dirPath}`))
  } else {
    console.log(colorFormat.formatBlue(`\n${envName} already exists in ${dirPath}, skipping copy.`))
  }
}

module.exports = {
  validateFileNames,
  checkEnvVariables,
  cloneSchemaToEnv,
  alignEnvWithSchema
}