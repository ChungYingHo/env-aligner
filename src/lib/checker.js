const path = require('path')
const colorFormat = require('./colorFormat')
const fileReader = require('./fileReader')

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
  const schemaVars = fileReader.parseEnvFile(schemaPath)
  const envVars = fileReader.parseEnvFile(envPath)
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

module.exports = {
  validateFileNames,
  checkEnvVariables
}