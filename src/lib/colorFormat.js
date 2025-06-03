// 紅底白字
function formatRedInverse (msg) {
  return `\x1b[41m\x1b[37m${msg}\x1b[0m`
}

// 紅字
function formatRed (msg) {
  return `\x1b[31m${msg}\x1b[0m`
}

// 黃底白字
function formatYellowInverse (msg) {
  return `\x1b[43m\x1b[37m${msg}\x1b[0m`
}

// 黃字
function formatYellow (msg) {
  return `\x1b[33m${msg}\x1b[0m`
}

// 藍底白字
function formatBlueInverse (msg) {
  return `\x1b[44m\x1b[37m${msg}\x1b[0m`
}

// 藍字
function formatBlue (msg) {
  return `\x1b[34m${msg}\x1b[0m`
}

// 綠底白字
function formatGreenInverse (msg) {
  return `\x1b[42m\x1b[37m${msg}\x1b[0m`
}

// 綠字
function formatGreen (msg) {
  return `\x1b[32m${msg}\x1b[0m`
}

module.exports = {
  formatRedInverse,
  formatRed,
  formatYellowInverse,
  formatYellow,
  formatBlueInverse,
  formatBlue,
  formatGreenInverse,
  formatGreen
}