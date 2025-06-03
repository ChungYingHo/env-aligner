const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const colorFormat = require('./colorFormat')

const defaultDir = process.cwd()
const defaultSchemaFileName = '.env.example'
const defaultEnvFileName = '.env'
const defaultFiles = {
  schemaName: defaultSchemaFileName,
  envName: defaultEnvFileName
}

/**
 * 解析環境變數
 * @param {string} filePath
 * @returns 應回傳一個物件，包含了檔案中的環境變數
 */
const parseEnvFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const parsedContent = dotenv.parse(fileContent)

  if (!parsedContent) {
    console.error(colorFormat.formatRedInverse(`\nFailed to parse ${filePath}`))
    process.exit(1)
  }

  if (!Object.keys(parsedContent).length) {
    console.error(colorFormat.formatRedInverse(`\n${filePath} is empty or has no valid variables.`))
    process.exit(1)
  }

  return parsedContent
}

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
 * 會檢查 schema 檔案中的變數是否都有在 env 檔案中出現
 * @param {string} schemaPath
 * @param {string} envPath
 */
const checkEnvVariables = (schemaPath, envPath) => {
  const schemaVars = parseEnvFile(schemaPath)
  const envVars = parseEnvFile(envPath)
  const schemaKeys = Object.keys(schemaVars)
  const envKeys = Object.keys(envVars)

  const missingKeys = schemaKeys.filter(key => !envKeys.includes(key))
  const emptyValueKeys = schemaKeys.filter(
    key => schemaVars[key] && envVars[key] === '' && !missingKeys.includes(key)
  )
  const extraKeys = envKeys.filter(key => !schemaKeys.includes(key))

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
 * 檢查檔案是否存在
 * @param {string} targetPath
 * @returns {Promise<boolean>} 如果檔案存在則回傳 true，否則回傳 false
 */
async function fileExists (targetPath) {
  try {
    await fs.promises.access(targetPath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

/**
 * 主程式，遞迴檢查目錄中的 env file 和 schema 檔案
 * 函式使用方式：
 * envAligner(rootDir, fileNames)
 * envAligner({fileNames: customFileNamesObject})
 * @param {string} rootDir 根目錄
 * @param {string} schemaFileName schema 檔案名稱
 * @param {string} envFileName env 檔案名稱
 */

const envAligner = async ({ rootDir = defaultDir, fileNames = defaultFiles } = {}) => {
  const mergedFileNames = { ...defaultFiles, ...fileNames }
  validateFileNames(mergedFileNames)

  const { schemaName: schemaFileName, envName: envFileName } = mergedFileNames

  // 確保目錄存在且為資料夾
  try {
    const rootStats = await fs.promises.stat(rootDir)
    if (!rootStats.isDirectory()) {
      console.error(colorFormat.formatRed(`[error] ${rootDir} is not a directory.`))
      process.exit(1)
    }
  } catch (error) {
    console.error(colorFormat.formatRed(`[error] Failed to access ${rootDir}: ${error.message}`))
    process.exit(1)
  }

  // 讀取目錄內容
  const dirContents = await fs.promises.readdir(rootDir, { withFileTypes: true })
  const directoryEntries = dirContents.map(entry => entry.name)

  // 組合 schema 和 env 檔案的完整路徑
  const schemaFilePath = path.join(rootDir, schemaFileName)
  const envFilePath = path.join(rootDir, envFileName)

  // 若有 .env 檔案，執行比對並停止遞迴
  if (directoryEntries.includes(envFileName)) {
    const [schemaExists, envExists] = await Promise.all([
      fileExists(schemaFilePath),
      fileExists(envFilePath)
    ])

    if (schemaExists && envExists) {
      checkEnvVariables(schemaFilePath, envFilePath)

      return true
    } else {
      console.log(
        colorFormat.formatBlue(`[info] Skipping check in ${rootDir}, searching deeper...`)
      )
    }
  }

  // 否則遞迴檢查子目錄
  for (const item of dirContents) {
    if (item.isDirectory() && !['node_modules', 'dist'].includes(item.name)) {
      const subDirPath = path.join(rootDir, item.name)
      const isChecked = await envAligner({ rootDir: subDirPath, fileNames })
      if (isChecked) {
        return true
      }
    }
  }

  return false
}

module.exports = envAligner