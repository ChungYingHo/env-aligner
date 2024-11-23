const envAligner = require('../src/lib/index')

// 預設情況下，應該會讀取當前目錄下的 .env.example 與 .env 檔案
envAligner()

// 傳一個 options false 進去
// const test1options = {
//   isCheckMissing: false
// }
// envAligner({ checkOptions: test1options })

// 傳一個路徑 frontend
// const rootDir = 'frontend'
// envAligner({ rootDir })

// 傳一個路徑 test/test-folder/frontend
const rootDir = 'frontend'
envAligner({ rootDir })