const chalk = require("chalk")
const commander = require("commander")
const envAligner = require("../lib")
const { version } = require("../../package.json")

const { program, Option } = commander
const defaultSchemaFileName = '.env.example'
const defaultEnvFileName = '.env'
const defaultDir = process.cwd()

program
  .name("env-aligner")
  .description("A tool to align the env variables in the project")
  .version(version, '-v', '--version')
  .addHelpCommand(false) // 禁用預設的 --help 選項
  .showSuggestionAfterError() // 顯示錯誤時的建議
  .addHelpText('beforeAll', () => {
    console.log(chalk.green('Env Aligner is working!'))
  })
  .addOption(new Option('-s, --schema <schema>', 'The schema file for environment variables, default is .env.example.').default('.env.example'))
  .addOption(new Option('-e, --env <env>', 'The env file to check, default is .env.').default('.env'))
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
const { schemaFileName = defaultSchemaFileName, envFileName = defaultEnvFileName } = program.opts()


// 執行 envAligner
envAligner(rootDir, schemaFileName, envFileName)
