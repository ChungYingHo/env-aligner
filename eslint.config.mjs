import globals from "globals"
import pluginJs from "@eslint/js"


/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'indent': ['error', 2], // 強制使用 2 個空格進行縮排
      'comma-dangle': ['error', 'never'], // 禁止在最後一個元素後添加逗號
      'semi': ['error', 'never'], // 強制不使用分號結尾
      'space-before-function-paren': ['error', 'always'], // 強制函數括號前有空格
      "object-curly-spacing": ["error", "always"] // 强制在 {} 中使用空格
    }
  },
  pluginJs.configs.recommended
]