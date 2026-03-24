export interface CheckResult {
  /** schema 有但 .env 沒有的 keys */
  missing: string[]
  /** .env 中值為空的 keys */
  empty: string[]
  /** .env 有但 schema 沒有的 keys */
  extra: string[]
  /** missing.length === 0 && empty.length === 0 */
  passed: boolean
}

export interface FixResult {
  /** 補上的 keys（帶 # TODO 標記） */
  added: string[]
  /** 移除的 keys */
  removed: string[]
  /** 是否有重新排序 */
  reordered: boolean
}
