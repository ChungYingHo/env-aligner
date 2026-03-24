import pc from 'picocolors'

export const logger = {
  success: (msg: string) => console.log(pc.green(msg)),
  info: (msg: string) => console.log(pc.blue(msg)),
  warn: (msg: string) => console.warn(pc.yellow(msg)),
  error: (msg: string) => console.error(pc.red(msg)),
  label: {
    error: (msg: string) => console.error(pc.bgRed(pc.white(msg))),
    warn: (msg: string) => console.warn(pc.bgYellow(pc.white(msg))),
    info: (msg: string) => console.log(pc.bgBlue(pc.white(msg))),
    success: (msg: string) => console.log(pc.bgGreen(pc.white(msg)))
  }
}
