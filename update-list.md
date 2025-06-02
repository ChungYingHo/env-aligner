# 2025 預計更新 1.2 版
## 更新功能
### 棄用與調整
1. 棄用 chalk package，因為它的終端機顏色並不會在 pipeline 中出現，因此以 ANSI escape code 實現。
2. 棄用 `-m` 以及 `-n` 指令，因為理論上會裝這個 pkg 就是要檢查這兩項。
3. 移除 `-x` 指令，因為它略有些雞肋。
4. 調整檢查模式：
    - before: env-aligner 會去遍歷所有 folder 去做檢查
    - after: 調整為 env-aligner 在某一層如果有檢測到 .env file 有錯誤，它會檢查完該檔案後即停止往下層繼續檢查

### 新增功能
1. 新增 `--help` 支援指令 (理論上現在應該就有，但要確認一下)
2. 新增 `env-aligner --clone schema` 與 `env-aligner -c schema` 指令，功能為從 schema (ex: .env.example) clone 一份作為 .env 放在同層路徑上。
3. 新增 `env-aligner --strict`，嚴格檢查模式會進行下列檢查：
    - missing variables (非嚴格模式下也會檢查)
    - missing values (非嚴格模式下也會檢查)
    - extra variables
    - extra comments (會輸出 .env 的 Line 幾是多出來的註解)
    - 新增搭配指令 `env-aligner --format` 與 `env-aligner -f`。意思是叫 env-aligner 幫忙對齊 .env 與 .env.example，並且會移除多餘的環境變數與註解，但會保留原環境變數的值。
        - 新增搭配指令 `env-aligner --format --output`，跟只有 `--format` 不同，這個指令產生的 align file 不會覆蓋原 .env，而是會產生一份 .env.cleaned 放在同層位置

### 待檢查
1. 如果使用者自己在 .env 或 .env.example 裡多很多註解，env-aligner 能否正常運作。