import pc from 'picocolors'

const stdout = (msg: string) => process.stdout.write(msg + '\n')
const stderr = (msg: string) => process.stderr.write(msg + '\n')

export const logger = {
  success: (msg: string) => stdout(pc.green(msg)),
  info: (msg: string) => stdout(pc.blue(msg)),
  warn: (msg: string) => stderr(pc.yellow(msg)),
  error: (msg: string) => stderr(pc.red(msg)),
  label: {
    error: (msg: string) => stderr(pc.bgRed(pc.white(msg))),
    warn: (msg: string) => stderr(pc.bgYellow(pc.white(msg))),
    info: (msg: string) => stdout(pc.bgBlue(pc.white(msg))),
    success: (msg: string) => stdout(pc.bgGreen(pc.white(msg)))
  }
}
