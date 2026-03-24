# env-aligner v3.0.0 — 通盤整理與優化計畫

## Context

env-aligner 目前 v2.0.0 功能分散（check / strict / align / clone / 遞迴掃描 / programmatic API），多項屬於雞肋。此次重構目標：**聚焦三個核心指令** —— `init`（建立初始 .env）、`check`（檢查差異）、`fix`（一鍵修復）。同時現代化技術棧。

---

## 一、移除項目（雞肋功能）

| 功能 | 位置 | 移除原因 |
|------|------|----------|
| **Strict 作為獨立旗標** (`--strict`) | `cli.js:33-34`, `envHandler.js:161` | extra keys 偵測改為預設行為，不需額外旗標 |
| **Align 作為獨立旗標** (`--align`) | `cli.js:36-38` | 併入 `fix` 指令，不再需要 `--strict --align` 組合 |
| **遞迴目錄掃描** | `index.js:53-101` | 過度工程化，絕大多數專案 .env 在根目錄，monorepo 用 `--dir` 指定即可 |
| **Programmatic API 匯出** | `rollup.config.js` (lib bundle) | 到處 `process.exit(1)` 使其不適合作為 library 使用 |
| **Rollup 建構工具** | `rollup.config.js` + 相關套件 | rollup@2 + rollup-plugin-terser 已棄用，改用 tsup |

## 二、三個核心指令

### `env-aligner init`
從 .env.example 建立 .env。若 .env 已存在則跳過不動作。

- 沿用現有 `cloneSchemaToEnv` 邏輯（`envHandler.js:13-30`）
- 行為單純：複製檔案，不做任何修改

### `env-aligner check`
純檢查模式，報告 missing / empty / extra keys，**不修改任何檔案**。

- 適合放在 `npm run dev` 前作為 predev hook
- 有問題時 exit code 1，CI/CD 可攔截
- extra keys 預設就會報告（不再需要 `--strict`）

### `env-aligner fix`
一鍵修復 .env，三件事一次做完：

1. **補上缺少的 key** — 帶入 .env.example 的值，並加上 `# TODO` 註解標記
2. **移除多餘的 key** — .env 中有但 .env.example 沒有的 key 會被移除
3. **對齊順序** — 讓 .env 的 key 順序與 .env.example 一致，方便肉眼比對

fix 後的 .env 範例：
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=your_password  # TODO
API_KEY=  # TODO
```

> align 邏輯保留但重寫（v2 的實作太脆弱），整合進 `fix` 而非獨立旗標。

## 三、CLI 介面設計

```
# v3 指令
env-aligner init                     # 從 .env.example 建立 .env（已存在則跳過）
env-aligner check                    # 報告 missing / empty / extra keys（不修改檔案）
env-aligner fix                      # 補缺少、刪多餘、對齊順序 — 一鍵修復
env-aligner                          # 預設等同 check
```

共用選項：`--dir <path>` / `--schema <file>` / `--env <file>`

### v2 → v3 遷移對照

| v2 指令 | v3 對應 |
|---------|---------|
| `env-aligner` | `env-aligner check`（或直接 `env-aligner`） |
| `env-aligner --clone` | `env-aligner init` |
| `env-aligner --strict` | `env-aligner check`（extra keys 預設顯示） |
| `env-aligner --strict --align` | `env-aligner fix` |
| `require('env-aligner')` | 移除 — 改用 CLI |

## 四、專案架構 Refactor

### 現有結構（v2）

```
env-aligner/
├── src/
│   ├── bin/
│   │   └── cli.js               # CLI 入口，commander 選項解析
│   ├── constant/
│   │   └── default.js           # 預設值常數
│   └── lib/
│       ├── index.js             # 主程式入口，遞迴目錄掃描 + 模式分流
│       ├── envHandler.js        # 核心邏輯：check / align / clone 全混在一起
│       ├── fileReader.js        # 工具函式：parse / exists / validate
│       └── colorFormat.js       # 手寫 ANSI 顏色格式化（8 個函式）
├── test/
│   ├── test.js                  # 手動測試腳本（無框架）
│   ├── .env / .env.example      # 測試用 fixture
│   └── mockSrc/                 # 遞迴掃描測試用的模擬目錄結構
│       ├── backend/             #   （v3 移除遞迴掃描後不再需要）
│       ├── frontend/
│       └── frontend/submodule/
├── assets/
│   └── shortcut.png             # README 用截圖
├── rollup.config.js             # Rollup 建構設定（兩個 bundle：lib + CLI）
├── eslint.config.mjs            # ESLint 設定
├── package.json                 # CommonJS, rollup@2, 無 type:module
├── CLAUDE.md
├── README.md
└── CHANGELOG.md
```

**問題點**：
- `src/lib/` 下所有邏輯（check / align / clone / 遞迴掃描）混在一起，職責不清
- `envHandler.js` 一個檔案 200+ 行包了三個功能，且到處 `process.exit(1)`
- `index.js` 同時負責遞迴掃描和模式分流，過度耦合
- `constant/default.js` 只有 5 個常數，單獨開資料夾沒必要
- `colorFormat.js` 手寫 ANSI，不偵測終端支援
- `test/` 無測試框架，`mockSrc/` 是為遞迴掃描設計的（要移除）
- Rollup 建構兩個 bundle（lib + CLI），lib bundle 移除後不再需要

### 目標結構（v3）

```
env-aligner/
├── src/
│   ├── cli/
│   │   ├── index.ts             # commander 入口 + 子命令路由
│   │   └── commands/
│   │       ├── check.ts         # check 命令：呼叫 core，格式化輸出，處理 exit code
│   │       ├── init.ts          # init 命令：呼叫 core，格式化輸出，處理 exit code
│   │       └── fix.ts           # fix 命令：呼叫 core，格式化輸出，處理 exit code
│   ├── core/
│   │   ├── checker.ts           # checkEnv(): CheckResult — 純函式，只回傳結果
│   │   ├── fixer.ts             # fixEnv(): FixResult — 補缺少 + 刪多餘 + 對齊順序
│   │   ├── cloner.ts            # cloneEnv() — 複製 schema → .env
│   │   └── parser.ts            # parseEnvFile() — .env 檔案解析
│   ├── utils/
│   │   ├── fs.ts                # fileExists() 檔案存在檢查
│   │   └── logger.ts            # picocolors 封裝，統一輸出格式
│   └── types.ts                 # CheckResult, FixResult 介面定義
├── tests/
│   ├── checker.test.ts          # checker 單元測試
│   ├── fixer.test.ts            # fixer 單元測試
│   ├── cloner.test.ts           # cloner 單元測試
│   ├── parser.test.ts           # parser 單元測試
│   └── fixtures/                # 測試用 .env / .env.example 檔案
│       ├── basic/               #   正常情境
│       ├── missing-keys/        #   缺少 keys
│       ├── empty-values/        #   空值
│       ├── extra-keys/          #   多餘 keys
│       └── mixed/               #   綜合情境（fix 測試用）
├── docs/
│   └── v3-plan.md               # 本文件
├── tsup.config.ts               # tsup 建構設定（僅 CLI 單一入口）
├── tsconfig.json                # TypeScript 設定
├── vitest.config.ts             # Vitest 測試設定
├── eslint.config.mjs            # ESLint 設定（保留）
├── package.json                 # ESM, type:module, tsup/vitest/picocolors
├── CLAUDE.md                    # （隨重構更新）
├── README.md                    # （重寫，對應 v3 指令）
└── CHANGELOG.md                 # （新增 v3.0.0 紀錄）
```

### 檔案搬移 / 重寫對照

| v2 檔案 | 動作 | v3 對應 |
|---------|------|---------|
| `src/bin/cli.js` | **重寫** | `src/cli/index.ts` + `src/cli/commands/*.ts` |
| `src/lib/index.js` | **刪除** | 遞迴掃描 + 模式分流邏輯全部移除 |
| `src/lib/envHandler.js` checkEnvVariables | **搬移重寫** | `src/core/checker.ts` |
| `src/lib/envHandler.js` alignEnvWithSchema | **搬移重寫** | `src/core/fixer.ts`（整合 sync + align） |
| `src/lib/envHandler.js` cloneSchemaToEnv | **搬移重寫** | `src/core/cloner.ts` |
| `src/lib/fileReader.js` parseEnvFile | **搬移重寫** | `src/core/parser.ts` |
| `src/lib/fileReader.js` fileExists | **搬移** | `src/utils/fs.ts` |
| `src/lib/fileReader.js` validateFileNames | **刪除** | TypeScript 型別系統取代 |
| `src/lib/fileReader.js` validateDirectory | **刪除** | 簡化至 CLI 層直接處理 |
| `src/lib/colorFormat.js` | **刪除** | `src/utils/logger.ts`（picocolors 取代） |
| `src/constant/default.js` | **刪除** | 常數直接寫在各模組中或 `types.ts` |
| `rollup.config.js` | **刪除** | `tsup.config.ts` 取代 |
| `test/test.js` | **刪除** | `tests/*.test.ts`（vitest）取代 |
| `test/mockSrc/` | **刪除** | 遞迴掃描移除後不再需要 |
| `test/.env*` | **搬移** | `tests/fixtures/` 重新整理 |

### 分層設計原則

```
┌─────────────────────────────────────────────┐
│  CLI 層 (src/cli/)                          │
│  - commander 解析、子命令路由                  │
│  - 呼叫 core 層取得結果                       │
│  - 格式化輸出（用 logger）                     │
│  - 決定 process.exit code                    │
│  - 這一層是唯一允許 console.log / exit 的地方  │
├─────────────────────────────────────────────┤
│  Core 層 (src/core/)                        │
│  - 純函式，不做 I/O 輸出                      │
│  - 回傳型別化結果物件（CheckResult, FixResult） │
│  - 可被 CLI 層呼叫，也方便測試                  │
│  - 不呼叫 process.exit()                     │
├─────────────────────────────────────────────┤
│  Utils 層 (src/utils/)                      │
│  - 檔案操作、顏色輸出等共用工具                  │
│  - 無業務邏輯                                │
└─────────────────────────────────────────────┘
```

### 型別定義

```typescript
interface CheckResult {
  missing: string[]    // schema 有但 .env 沒有的 keys
  empty: string[]      // .env 中值為空的 keys
  extra: string[]      // .env 有但 schema 沒有的 keys
  passed: boolean      // missing.length === 0 && empty.length === 0
}

interface FixResult {
  added: string[]      // 補上的 keys（帶 # TODO 標記）
  removed: string[]    // 移除的 keys
  reordered: boolean   // 是否有重新排序
}
```

## 五、技術棧現代化

| 項目 | v2 (舊) | v3 (新) |
|------|---------|---------|
| 語言 | CommonJS JavaScript | TypeScript (ESM) |
| 建構 | rollup@2 + rollup-plugin-terser | tsup (esbuild) |
| 測試 | 手動 test.js | vitest |
| 顏色 | 手寫 ANSI escape codes | picocolors |
| 模組 | CommonJS (`require`) | ESM (`import`) |
| build 指令 | `rmdir /s /q dist && rollup -c`（僅 Windows） | `tsup`（跨平台） |

### package.json 變更重點

```jsonc
{
  "type": "module",                          // +++ CommonJS → ESM
  "bin": {
    "env-aligner": "dist/cli/index.js"       // ~~~ 原本指向 dist/cli.min.js
  },
  // "main": "dist/index.min.js",            // --- 移除 programmatic API
  "scripts": {
    "build": "tsup",                         // ~~~ 原本 rmdir /s /q dist && rollup -c
    "test": "vitest run",                    // ~~~ 原本無實作
    "test:watch": "vitest",                  // +++ 新增
    "dev": "tsup --watch"                    // ~~~ 原本 rollup -c -w
  },
  "dependencies": {
    "commander": "^12.1.0",                  // === 保留
    "dotenv": "^16.4.5"                      // === 保留
  },
  "devDependencies": {
    "typescript": "^5.x",                    // +++ 新增
    "tsup": "^8.x",                          // +++ 取代 rollup
    "vitest": "^3.x",                        // +++ 取代手動 test.js
    "picocolors": "^1.x",                    // +++ 取代手寫 ANSI
    "@types/node": "^22.x"                   // +++ 新增
    // --- 移除: rollup, rollup-plugin-terser, @rollup/plugin-commonjs, @rollup/plugin-json
    // --- 移除: eslint, @eslint/js, globals（獨立處理 lint）
  }
}
// 圖例: +++ 新增 | --- 移除 | ~~~ 修改 | === 保留
```

### .gitignore 更新

```gitignore
node_modules/
dist/

# v3: 簡化，不再需要 test/ 中的 .env 例外規則
# 測試 fixtures 改放 tests/fixtures/，不是 .env 檔名，不會被誤忽略
```

## 六、實作順序

1. **Scaffold** — 安裝 typescript / tsup / vitest / picocolors / @types/node，建立 tsconfig.json、tsup.config.ts，更新 package.json（`"type": "module"`）
2. **Core 層** — 實作 `types.ts` → `parser.ts` → `checker.ts` → `cloner.ts` → `fixer.ts`，從既有程式碼搬移核心邏輯
3. **Utils 層** — 實作 `logger.ts`、`fs.ts`
4. **CLI 層** — 實作 `cli/index.ts` + `commands/check.ts` + `commands/init.ts` + `commands/fix.ts`
5. **測試** — 用 vitest 撰寫 core 層單元測試，搬移既有 test fixtures
6. **清理** — 刪除舊檔案（`src/lib/`、`src/bin/`、`src/constant/`、`rollup.config.js`、`test/`）
7. **文件** — 更新 README.md、CHANGELOG.md，版本升至 v3.0.0

## 七、Exit Codes

| Code | 意義 |
|------|------|
| 0 | 所有檢查通過（check）/ 修復完成（fix）/ 建立完成（init） |
| 1 | 有 missing 或 empty keys（check 未通過） |
| 2 | 檔案不存在或其他致命錯誤 |

## 八、驗證方式

- `npm run build` 成功產出 dist
- `npm run test` 全部通過
- 手動測試：`npx env-aligner init` 能從 .env.example 建立 .env
- 手動測試：`npx env-aligner check` 能正確報告 missing / empty / extra keys
- 手動測試：`npx env-aligner fix` 能補缺少（帶 # TODO）、刪多餘、對齊順序
- 確認 `npx env-aligner --help` 顯示正確

## 九、關鍵參考檔案

- `src/lib/envHandler.js` — check 邏輯 (L122-201)、align 邏輯 (L36-115)、clone 邏輯 (L13-30) 要搬移
- `src/bin/cli.js` — commander 設定模式可參考
- `src/lib/fileReader.js` — parseEnvFile (L10-25) 和 fileExists 要保留
- `package.json` — 需大幅更新依賴和設定
