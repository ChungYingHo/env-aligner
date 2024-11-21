## 預期套件功能
1. .env 缺少 .env.example 的變數時會叫
2. .env 變數缺值時會叫
3. .env 有重複變數時會叫
4. .env 有多餘變數時會叫

## 使用方式
### 在程式中引入
```
const envAligner = require('env-aligner')

envAligner() // 檢查預設 .env 與預設 .env.example
envAligner('.env.sample', '.env.local') // 檢查指定 .env.sample 與指定 .env.local
envAligner({schemaFileName: '.env.example'}) // 檢查指定 .env.sample 與預設 .env
envAligner({envFileName: '.env.local'}) // 檢查預設 .env.example 與指定 .env.local
```

### 在終端機中執行 (還沒實現)
```bash
env-aligner // 檢查預設 .env 與預設 .env.example
env-aligner -s .env.sample -e .env.local // 檢查指定 .env.sample 與指定 .env.local
env-aligner -s .env.example // 檢查指定 .env.sample 與預設 .env
env-aligner -e .env.local // 檢查預設 .env.example 與指定 .env.local
```

## 如何測試
1. 在本套建專案下 `npm link`
2. 建立一個測試專案 (空資料夾)
```
npm init
npm link env-aligner
```
3. 在測試專案中建一個 `test.js` 檔案
```
const envAligner = require('env-aligner')
envAligner()
```
4. 在測試專案中建一個 frontend 資料夾，並在其中建立一個 `.env` 跟 `.env.example` 檔案
- .env
```
ENV_SHOULD_PASS=pass
ENV_WITH_EMPTY_VALUE=
ENV_WITH_EMPTY_VALUE_IN_ENV_FILE=
```

- .env.example
```
ENV_SHOULD_PASS=pass
ENV_NOT_EXIST='not in env'
ENV_WITH_EMPTY_VALUE=
ENV_WITH_EMPTY_VALUE_IN_ENV_FILE='should not pass'
```

5. 在終端機中執行 `node test.js`

![](./asset/shortcut.png)
