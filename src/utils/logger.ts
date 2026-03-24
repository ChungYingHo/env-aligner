import pc from 'picocolors'

const print = (msg: string) => process.stdout.write(msg + '\n')

export const logger = {
  success: (msg: string) => print(pc.green(msg)),
  info: (msg: string) => print(pc.blue(msg)),
  warn: (msg: string) => console.warn(pc.yellow(msg)),
  error: (msg: string) => console.error(pc.red(msg)),
  label: {
    error: (msg: string) => console.error(pc.bgRed(pc.white(msg))),
    warn: (msg: string) => console.warn(pc.bgYellow(pc.white(msg))),
    info: (msg: string) => print(pc.bgBlue(pc.white(msg))),
    success: (msg: string) => print(pc.bgGreen(pc.white(msg)))
  }
}
