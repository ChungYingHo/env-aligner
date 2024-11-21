const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const chalk = require('chalk')

const defaultSchemaFileName = '.env.example'
const defaultEnvFileName = '.env'
const defaultDir = process.cwd()

/**
 * 解析環境變數
 * @param {string} filePath
 * @returns 應回傳一個物件，包含了檔案中的環境變數
 */
const parseEnvFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const parsedContent = dotenv.parse(fileContent)

  if (!parsedContent) {
    console.error(chalk.red.inverse(`\nFailed to parse ${filePath}`))
    process.exit(1)
  }

  return parsedContent
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
  const emptyValueKeys = schemaKeys.filter(key => schemaVars[key] && !envVars[key] && !missingKeys.includes(key))
  const duplicateKeys = envKeys.filter((key, index, self) => self.indexOf(key) !== index)
  const extraKeys = envKeys.filter(key => !schemaKeys.includes(key))

  const envDir = path.dirname(envPath)

  if (missingKeys.length > 0) {
    console.error(chalk.red.inverse(`\nMissing variables in ${envDir}`))
    console.log(chalk.red(`${missingKeys.join('、')}`))
  }

  if (emptyValueKeys.length > 0) {
    console.error(chalk.hex('#FFA500').inverse(`\nEmpty value variables in ${envDir}`))
    console.log(chalk.hex('#FFA500')(`${emptyValueKeys.join('、')}`))
  }

  if (duplicateKeys.length > 0) {
    console.error(chalk.yellow.inverse(`\nDuplicate variables in ${envDir}`))
    console.log(chalk.yellow(`${duplicateKeys.join('、')}`))
  }

  if (extraKeys.length > 0) {
    console.error(chalk.blue.inverse(`\nExtra variables in ${envDir}`))
    console.log(chalk.blue(`${extraKeys.join('、')}`))
  }

  if (missingKeys.length > 0 || emptyValueKeys.length > 0 || duplicateKeys.length > 0 || extraKeys.length > 0) {
    process.exit(1)
  } else {
    console.log(chalk.green.inverse(`\nAll variables in ${envDir} are correct!`))
  }
}

/**
 * 主程式，遞迴檢查目錄中的 env file 和 schema 檔案
 * @param {string} rootDir 根目錄
 * @param {string} schemaFileName schema 檔案名稱
 * @param {string} envFileName env 檔案名稱
 */
const envAligner = async (rootDir = defaultDir, schemaFileName = defaultSchemaFileName, envFileName = defaultEnvFileName) => {
  // 使用 fs.promises.readdir 來非同步列出目錄
  const entries = await fs.promises.readdir(rootDir, { withFileTypes: true })

  // 使用 Promise.all 非同步處理每個檔案和子目錄
  await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(rootDir, entry.name) // 組合檔案或目錄的路徑

    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      await envAligner(entryPath, schemaFileName, envFileName) // 如果是目錄，遞迴調用 envAligner
    } else if (entry.isFile() && entry.name === schemaFileName) {
      const envFilePath = path.join(rootDir, envFileName)

      try {
        await fs.promises.stat(envFilePath) // 使用 fs.promises.stat 來非同步檢查 .env 檔案是否存在
        checkEnvVariables(entryPath, envFilePath) // 如果檔案存在，檢查環境變數
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        console.warn(chalk.yellow(`\nNo matching env file found for ${entryPath}`))
      }
    }
  }))
}

module.exports = envAligner