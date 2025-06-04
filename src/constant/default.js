const defaultDir = process.cwd()
const defaultSchemaFileName = '.env.example'
const defaultEnvFileName = '.env'
const defaultFiles = {
  schemaName: defaultSchemaFileName,
  envName: defaultEnvFileName
}
const defaultMode = {
  isStrict: false,
  isAlign: false
}

module.exports = {
  defaultDir,
  defaultSchemaFileName,
  defaultEnvFileName,
  defaultFiles,
  defaultMode
}