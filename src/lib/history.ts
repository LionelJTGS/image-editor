/**
 * 撤销 / 重做的数据结构：
 *   past    —— 之前的状态，最后一个是“上一步”
 *   present —— 当前状态
 *   future  —— 被撤销掉的状态，第一个是“下一步”
 *
 * 这里全部是纯函数（不修改传入的对象，返回新对象），方便单元测试，也符合 React 的状态更新方式。
 */
export interface History<T> {
  past: T[]
  present: T
  future: T[]
}

export const MAX_HISTORY = 50

export function createHistory<T>(initial: T): History<T> {
  return { past: [], present: initial, future: [] }
}

/** 执行一个新操作：当前状态进入 past，future 被清空（历史截断） */
export function pushHistory<T>(history: History<T>, next: T, limit = MAX_HISTORY): History<T> {
  const past = [...history.past, history.present]
  // 超出上限时丢弃最早的记录
  if (past.length > limit) past.shift()
  return { past, present: next, future: [] }
}

export function undoHistory<T>(history: History<T>): History<T> {
  if (history.past.length === 0) return history
  const previous = history.past[history.past.length - 1]
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

export function redoHistory<T>(history: History<T>): History<T> {
  if (history.future.length === 0) return history
  const next = history.future[0]
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  }
}
