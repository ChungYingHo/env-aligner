const envAligner = require('../src/lib/index')

// 預設情況下，應該會讀取當前目錄下的 .env.example 與 .env 檔案
// envAligner({ isClone: true })
envAligner()



// 傳一個 options false 進去
// const test1options = {
//   isCheckMissing: false
// }
// envAligner({ checkOptions: test1options })

// 傳全 false 進去
// const checkOptions = {
//   isCheckMissing: false,
//   isCheckEmptyValue: false,
//   isCheckExtra: false
// }
// envAligner({ checkOptions })

// 傳一個路徑 frontend
// const rootDir = 'frontend'
// envAligner({ rootDir })

// 傳一個路徑 test/test_folder/frontend
// const rootDir = 'test/test_folder/frontend'
// envAligner({ rootDir })

// 傳路徑 'use default' - 棄用
// const rootDir = 'use default'
// envAligner({ rootDir })

// 傳 .env.sample 與 .env.local
// const fileNames = {
//   schemaName: '.env.sample',
//   envName: '.env.local'
// }
// envAligner({ fileNames })

// 傳 .env.sample 與 .env
// const fileNames = {
//   schemaName: '.env.sample',
//   envName: '.env'
// }
// envAligner({ fileNames })

// 傳 .env.schema 與 .env
// const fileNames = {
//   schemaName: '.env.schema',
//   envName: '.env'
// }
// envAligner({ fileNames })

// 全傳客製化參數
// const customRootDir = 'test/test_folder/frontend'
// const customFileNames = {
//   schemaName: '.env.sample',
//   envName: '.env.local'
// }
// const customCheckOptions = {
//   isCheckExtra: false
// }
// envAligner({ rootDir: customRootDir, fileNames: customFileNames, checkOptions: customCheckOptions })