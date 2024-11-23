const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const chalk = require('chalk')

const defaultDir = process.cwd()
const defaultSchemaFileName = '.env.example'
const defaultEnvFileName = '.env'
const defaultFiles = {
  schemaName: defaultSchemaFileName,
  envName: defaultEnvFileName
}
const defaultOptions = {
  isCheckMissing: true,
  isCheckEmptyValue: true,
  isCheckExtra: true
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
    console.error(chalk.red.inverse(`\nFailed to parse ${filePath}`))
    process.exit(1)
  }

  return parsedContent
}


/**
 * 這個函式會檢查 options 物件是否有缺少必要的 key 或是 key 的值不是 boolean
 * @param {object} options 
 */
const validateOptions = (options) => {
  const requiredKeys = ['isCheckMissing', 'isCheckEmptyValue', 'isCheckExtra']

  requiredKeys.forEach(key => {
    if(!(key in options)) {
      console.error(chalk.red.inverse(`\nMissing required key: ${key}`)) // 這句沒意外應該都不會出現，如果出現表示 bug 出現
      process.exit(1)
    }

    if (typeof options[key] !== 'boolean') {
      console.error(chalk.red.inverse(`\n${key} must be a boolean`))
      process.exit(1)
    }
  })
}

/**
 * 這個函式會檢查 fileNames 物件是否有缺少必要的 key 或是 key 的值不是 string
 * @param {string} fileNames 
 */
const validateFileNames = (fileNames) => {
  const requiredKeys = ['schemaName', 'envName']

  requiredKeys.forEach(key => {
    if(!(key in fileNames)) {
      console.error(chalk.red.inverse(`\nMissing required key: ${key}`)) // 這句沒意外應該都不會出現，如果出現表示 bug 出現
      process.exit(1)
    }

    if (typeof fileNames[key] !== 'string') {
      console.error(chalk.red.inverse(`\n${key} must be a string`))
      process.exit(1)
    }
  })
}

/**
 * 會檢查 schema 檔案中的變數是否都有在 env 檔案中出現
 * @param {string} schemaPath 
 * @param {string} envPath 
 */
const checkEnvVariables = (schemaPath, envPath, checkOptions) => {
  const mergedOptions = { ...defaultOptions, ...checkOptions }
  validateOptions(mergedOptions)
  const { isCheckMissing, isCheckEmptyValue, isCheckDuplicate, isCheckExtra } = mergedOptions

  if (!isCheckMissing && !isCheckEmptyValue && !isCheckDuplicate && !isCheckExtra) {
    console.log(chalk.hex('#ff69b4').inverse('You have disabled all checks, nothing to do.'))
  }

  const schemaVars = parseEnvFile(schemaPath)
  const envVars = parseEnvFile(envPath)
  const schemaKeys = Object.keys(schemaVars)
  const envKeys = Object.keys(envVars)

  const missingKeys = isCheckMissing ? schemaKeys.filter(key => !envKeys.includes(key)) : []
  const emptyValueKeys = isCheckEmptyValue ? schemaKeys.filter(key => schemaVars[key] && !envVars[key] && !missingKeys.includes(key)) : []
  const extraKeys = isCheckExtra ? envKeys.filter(key => !schemaKeys.includes(key)) : []

  const envDir = path.dirname(envPath)

  if (missingKeys.length > 0) {
    console.error(chalk.red.inverse(`\nMissing variables in ${envDir}`))
    console.log(chalk.red(`${missingKeys.join('、')}`))
  }

  if (emptyValueKeys.length > 0) {
    console.error(chalk.hex('#FFA500').inverse(`\nEmpty value variables in ${envDir}`))
    console.log(chalk.hex('#FFA500')(`${emptyValueKeys.join('、')}`))
  }

  if (extraKeys.length > 0) {
    console.error(chalk.blue.inverse(`\nExtra variables in ${envDir}`))
    console.log(chalk.blue(`${extraKeys.join('、')}`))
  }

  if (missingKeys.length > 0 || emptyValueKeys.length > 0 ) { 
    process.exit(1)
  } else {
    console.log(chalk.green.inverse(`\nAll variables in ${envDir} are correct!`))
  }
}

/**
 * 主程式，遞迴檢查目錄中的 env file 和 schema 檔案
 * 函式使用方式：
 * envAligner(rootDir, fileNames, checkOptions)
 * envAligner({fileNames: customFileNamesObject})
 * envAligner({checkOptions: customCheckOptionsObject})
 * @param {string} rootDir 根目錄
 * @param {string} schemaFileName schema 檔案名稱
 * @param {string} envFileName env 檔案名稱
 */
const envAligner = async (rootDir = defaultDir, fileNames = defaultFiles, checkOptions = defaultOptions) => {
 
  if (rootDir === 'use default') {
    rootDir = defaultDir
  }

  try {
    // 檢查 rootDir 是否存在且是目錄
    const stats = await fs.promises.stat(rootDir)
    if (!stats.isDirectory()) {
      throw new Error(`${rootDir} is not a valid directory`)
    }
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    console.error(chalk.red(`\nError: ${rootDir} does not exist or is not accessible.`))
    process.exit(1)
  }

  const mergedFileNames = { ...defaultFiles, ...fileNames }
  validateFileNames(mergedFileNames)
  const { schemaName: schemaFileName, envName: envFileName } = mergedFileNames

  // 使用 fs.promises.readdir 來非同步列出目錄
  const entries = await fs.promises.readdir(rootDir, { withFileTypes: true })

  await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(rootDir, entry.name) // 組合檔案或目錄的路徑

    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist' ) {
      await envAligner(entryPath, fileNames, checkOptions) // 如果是目錄，遞迴調用 envAligner
    } else if (entry.isFile() && entry.name === schemaFileName) {
      const envFilePath = path.join(rootDir, envFileName)

      try {
        await fs.promises.stat(envFilePath)
        checkEnvVariables(entryPath, envFilePath, checkOptions)
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        console.warn(chalk.yellow(`\nNo matching env file found for ${entryPath}`))
      }
    }
  }))
}

module.exports = envAligner