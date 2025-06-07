const fs = require('fs')
const path = require('path')
const colorFormat = require('./colorFormat')
const fileReader = require('./fileReader')
const envHandler = require('./envHandler')
const { defaultDir, defaultFiles, defaultMode } = require('../constant/default')

/**
 * envAligner：主程式入口，用於驗證或建立各資料夾中的 .env 檔案。
 * 
 * 支援功能：
 * 1. 遞迴檢查指定目錄與子目錄下的 `.env` 與 schema（預設為 `.env.example`）
 * 2. 可啟用嚴格模式（isStrict）檢查多餘變數
 * 3. 可啟用對齊模式（isAlign）自動修正 .env 格式
 * 4. 可啟用複製模式（isClone）從 schema 建立 .env 檔案（若不存在）
 * 
 * @param {Object} options
 * @param {string} [options.rootDir] - 根目錄路徑，預設為 process.cwd()
 * @param {Object} [options.fileNames] - 自定義檔名（例如 `{ schemaName: '.env.example', envName: '.env' }`）
 * @param {Object} [options.mode] - 模式控制物件 `{ isStrict?: boolean, isAlign?: boolean }`
 * @param {boolean} [options.isClone] - 是否為複製模式，預設為 false
 * 
 * @returns {Promise<boolean>} - 若成功完成檢查或建立，回傳 true，否則遞迴至下一層
 */

const envAligner = async ({
  rootDir = defaultDir,
  fileNames = defaultFiles,
  mode = defaultMode,
  isClone = false
} = {}) => {

  const mergedFileNames = { ...defaultFiles, ...fileNames }
  // 檢查檔案名稱是否正確
  fileReader.validateFileNames(mergedFileNames)

  const { schemaName: schemaFileName, envName: envFileName } = mergedFileNames
  const { isStrict, isAlign } = mode

  // 確保目錄存在且為資料夾
  await fileReader.validateDirectory(rootDir)

  // 若 isClone 為 true，則嘗試複製 schema 檔案到 env 檔案
  if (isClone) {
    const didClone = await envHandler.cloneSchemaToEnv(schemaFileName, envFileName, rootDir)
    if (didClone) {
      console.log(colorFormat.formatGreen(`✅ env file created successfully in ${rootDir}`))
    }
    return
  }

  // 讀取目錄內容
  const dirContents = await fs.promises.readdir(rootDir, { withFileTypes: true })
  const directoryEntries = dirContents.map(entry => entry.name)

  // 組合 schema 和 env 檔案的完整路徑
  const schemaFilePath = path.join(rootDir, schemaFileName)
  const envFilePath = path.join(rootDir, envFileName)

  // 檢查是否為使用者指定的 env/schema
  const isEnvExplicit = fileNames.envName !== defaultFiles.envName
  const isSchemaExplicit = fileNames.schemaName !== defaultFiles.schemaName

  // 若有 .env 檔案，執行比對並停止遞迴
  if (directoryEntries.includes(envFileName)) {
    const [schemaExists, envExists] = await Promise.all([
      fileReader.fileExists(schemaFilePath),
      fileReader.fileExists(envFilePath)
    ])

    if (schemaExists && envExists) {
      envHandler.checkEnvVariables(schemaFilePath, envFilePath, isStrict, isAlign)

      return true
    } else {
      console.log(
        colorFormat.formatBlue(`[info] Skipping check in ${rootDir}, searching deeper...`)
      )
    }
  }

  // 否則遞迴檢查子目錄
  for (const item of dirContents) {
    if (!item.isDirectory() || ['node_modules', 'dist'].includes(item.name)) {
      continue
    }

    const subDirPath = path.join(rootDir, item.name)
    const isChecked = await envAligner({ rootDir: subDirPath, fileNames, mode })

    if (isChecked) return true
  }

  // 若完全沒找到符合條件的檔案
  if (isEnvExplicit || isSchemaExplicit) {
    console.error(colorFormat.formatRed(
      `\n❌ No matching env/schema file found for "${envFileName}" or "${schemaFileName}" under: ${rootDir}`
    ))
    process.exit(1)
  }

  return false
}

module.exports = envAligner