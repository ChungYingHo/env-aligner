const fs = require('fs')
const dotenv = require('dotenv')
const colorFormat = require('./colorFormat')

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
 * 驗證指定路徑是否為有效資料夾
 * @param {string} dirPath - 要驗證的目錄路徑
 */
async function validateDirectory (dirPath) {
  try {
    const stats = await fs.promises.stat(dirPath)
    if (!stats.isDirectory()) {
      console.error(colorFormat.formatRed(`[error] ${dirPath} is not a directory.`))
      process.exit(1)
    }
  } catch (error) {
    console.error(colorFormat.formatRed(`[error] Failed to access ${dirPath}: ${error.message}`))
    process.exit(1)
  }
}


module.exports = {
  parseEnvFile,
  fileExists,
  validateFileNames,
  validateDirectory
}