import { describe, expect, it } from 'vitest'
import { createHistory, pushHistory, redoHistory, undoHistory } from './history'

describe('history', () => {
  it('撤销后回到上一个状态，重做后恢复', () => {
    let h = createHistory(0)
    h = pushHistory(h, 1)
    h = pushHistory(h, 2)

    h = undoHistory(h)
    expect(h.present).toBe(1)

    h = redoHistory(h)
    expect(h.present).toBe(2)
  })

  it('撤销后执行新操作，会截断后面的历史', () => {
    let h = createHistory(0)
    h = pushHistory(h, 1)
    h = pushHistory(h, 2)
    h = undoHistory(h) // 回到 1，future 里有 2
    h = pushHistory(h, 3) // 新操作

    expect(h.present).toBe(3)
    expect(h.future).toEqual([])
    expect(redoHistory(h)).toBe(h) // 没有可重做的内容，原样返回
  })

  it('没有历史时撤销不报错', () => {
    const h = createHistory(0)
    expect(undoHistory(h)).toBe(h)
  })

  it('超过上限时丢弃最早的记录', () => {
    let h = createHistory(0)
    for (let i = 1; i <= 5; i++) h = pushHistory(h, i, 3)
    expect(h.past).toEqual([2, 3, 4])
    expect(h.present).toBe(5)
  })

  it('不修改传入的对象', () => {
    const h = createHistory(0)
    pushHistory(h, 1)
    expect(h).toEqual({ past: [], present: 0, future: [] })
  })
})
