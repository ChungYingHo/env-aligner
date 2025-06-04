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


module.exports = {
  parseEnvFile,
  fileExists
}