const { program, Option } = require("commander")
const envAligner = require("../lib")
const { version } = require("../../package.json")
const colorFormat = require("../lib/colorFormat")
const { defaultDir, defaultSchemaFileName, defaultEnvFileName } = require("../constant/default")

/**
 * 指令使用方式：
 * npx env-aligner -s .env.example -e .env
 * npx env-aligner -s .env.example
 * npx env-aligner -e .env
 * npx env-aligner
 * npx env-aligner -m false -n false -d false -x false
 */
program
  .name("env-aligner")
  .description("A simple tool to align the env variables in the project")
  .version(version, '-v', '--version')
  .showSuggestionAfterError() // 顯示錯誤時的建議
  .addHelpText('beforeAll', () => {
    console.log(colorFormat.formatGreen('Env Aligner is working!'))
  })
  .addOption(
    new Option('--dir <directory>', 'Root directory to scan.').default(defaultDir)
  )
  .addOption(
    new Option('--schema <schema>', 'Schema file name.').default(defaultSchemaFileName)
  )
  .addOption(
    new Option('--env <env>', 'Env file name.').default(defaultEnvFileName)
  )
  .addOption(
    new Option('--strict', 'Enable strict mode: warn on extra variables.').default(false)
  )
  .addOption(
    new Option('--align', 'Enable align mode: auto-fix env format (only works with --strict).').default(false)
  )
  .addOption(
    new Option('--clone', 'Clone schema to env file if env does not exist.').default(false)
  )
  .addHelpText('after',
    `
    Examples:
        $ env-aligner --dir ./apps/frontend
        $ env-aligner
        $ env-aligner --schema .env.example --env .env
        $ env-aligner --schema .env.example
        $ env-aligner --env .env
        $ env-aligner --strict --align
        $ env-aligner --clone
    `
  )
  .parse(process.argv)

// 取得參數
const opts = program.opts()

// align 被啟用但 strict 沒開
if (opts.align && !opts.strict) {
  console.log(colorFormat.formatYellow('⚠️  Align mode (--align) only works when strict mode (--strict) is enabled. It will be ignored.'))
}

// 強制 align 僅在 strict 為 true 時生效
const isStrict = opts.strict
const isAlign = isStrict && opts.align

// 執行主邏輯
envAligner({
  rootDir: opts.dir,
  fileNames: {
    schemaName: opts.schema,
    envName: opts.env
  },
  mode: {
    isStrict,
    isAlign
  },
  isClone: opts.clone
})