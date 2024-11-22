const chalk = require("chalk")
const { program, Option } = require("commander")
const envAligner = require("../lib")
const { version } = require("../../package.json")

const defaultSchemaFileName = '.env.example'
const defaultEnvFileName = '.env'
const defaultDir = process.cwd()

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
  .description("A tool to align the env variables in the project")
  .version(version, '-v', '--version')
  .showSuggestionAfterError() // 顯示錯誤時的建議
  .addHelpText('beforeAll', () => {
    console.log(chalk.green('Env Aligner is working!'))
  })
  .addOption(new Option('-s, --schema <schema>', 'The schema file for environment variables, default is .env.example.').default('.env.example'))
  .addOption(new Option('-e, --env <env>', 'The env file to check, default is .env.').default('.env'))
  .addOption(new Option('-m, --missing', 'Check missing variables in the env file.').default(true))
  .addOption(new Option('-n, --empty', 'Check empty value variables in the env file.').default(true))
  .addOption(new Option('-d, --duplicate', 'Check duplicate variables in the env file.').default(true))
  .addOption(new Option('-x, --extra', 'Check extra variables in the env file.').default(true))
  .addHelpText('after', 
    `
    Examples:
        $ env-aligner
        $ env-aligner -s .env.example -e .env
        $ env-aligner -s .env.example
        $ env-aligner -e .env
    `
  )
  .parse(process.argv)


// 取得當前工作目錄
const { INIT_CWD } = process.env
const rootDir = INIT_CWD || defaultDir

// 取得參數
const {
  schemaFileName = defaultSchemaFileName,
  envFileName = defaultEnvFileName,
  checkMissing = true,
  checkEmpty = true,
  checkDuplicate = true,
  checkExtra = true
} = program.opts()

const customFileNames= {
  schemaName: schemaFileName,
  envName: envFileName
}

const customOptions = {
  isCheckMissing: checkMissing,
  isCheckEmptyValue: checkEmpty,
  isCheckDuplicate: checkDuplicate,
  isCheckExtra: checkExtra
}


// 執行 envAligner
envAligner(rootDir, customFileNames, customOptions)
