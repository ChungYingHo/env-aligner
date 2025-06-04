const fs = require('fs')
const path = require('path')
const colorFormat = require('./colorFormat')
const fileReader = require('./fileReader')
const checker = require('./checker')

const defaultDir = process.cwd()
const defaultSchemaFileName = '.env.example'
const defaultEnvFileName = '.env'
const defaultFiles = {
  schemaName: defaultSchemaFileName,
  envName: defaultEnvFileName
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
  checker.validateFileNames(mergedFileNames)

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
      fileReader.fileExists(schemaFilePath),
      fileReader.fileExists(envFilePath)
    ])

    if (schemaExists && envExists) {
      checker.checkEnvVariables(schemaFilePath, envFilePath)

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