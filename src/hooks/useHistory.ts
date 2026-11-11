import { useCallback, useState } from 'react'
import {
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type History,
} from '../lib/history'

/** 把 lib/history.ts 里的纯函数包装成 React Hook */
export function useHistory<T>(initial: T) {
  const [history, setHistory] = useState<History<T>>(() => createHistory(initial))

  // 用函数式更新 setHistory(h => ...)，保证连续调用时拿到的是最新状态
  const push = useCallback((next: T) => setHistory((h) => pushHistory(h, next)), [])
  const undo = useCallback(() => setHistory((h) => undoHistory(h)), [])
  const redo = useCallback(() => setHistory((h) => redoHistory(h)), [])
  const reset = useCallback((value: T) => setHistory(createHistory(value)), [])

  return {
    present: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    push,
    undo,
    redo,
    reset,
  }
}
