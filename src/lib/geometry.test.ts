import { describe, expect, it } from 'vitest'
import { fitSize, getOutputSize, getRotatedSize, rotateBy } from './geometry'
import { buildExportName } from './exportImage'
import { validateFile } from './file'

describe('geometry', () => {
  it('旋转 90° / 270° 时宽高互换', () => {
    const size = { width: 400, height: 300 }
    expect(getRotatedSize(size, 0)).toEqual({ width: 400, height: 300 })
    expect(getRotatedSize(size, 90)).toEqual({ width: 300, height: 400 })
    expect(getRotatedSize(size, 180)).toEqual({ width: 400, height: 300 })
    expect(getRotatedSize(size, 270)).toEqual({ width: 300, height: 400 })
  })

  it('导出尺寸 = 旋转后的尺寸 × 缩放比例', () => {
    const natural = { width: 4000, height: 3000 }
    expect(getOutputSize(natural, { rotation: 90, brightness: 100, scale: 50 })).toEqual({
      width: 1500,
      height: 2000,
    })
  })

  it('预览等比缩小到容器内，小图不放大', () => {
    expect(fitSize({ width: 4000, height: 3000 }, { width: 800, height: 800 })).toEqual({
      width: 800,
      height: 600,
    })
    expect(fitSize({ width: 100, height: 50 }, { width: 800, height: 800 })).toEqual({
      width: 100,
      height: 50,
    })
  })

  it('旋转角度在 0 ~ 270 之间循环', () => {
    expect(rotateBy(270, 90)).toBe(0)
    expect(rotateBy(0, -90)).toBe(270)
  })
})

describe('file', () => {
  it('拒绝不支持的格式和过大的文件', () => {
    expect(validateFile({ type: 'image/png', size: 1024 })).toBeNull()
    expect(validateFile({ type: 'image/gif', size: 1024 })).toMatch('仅支持')
    expect(validateFile({ type: 'image/png', size: 11 * 1024 * 1024 })).toMatch('10 MB')
  })

  it('生成导出文件名', () => {
    expect(buildExportName('photo.jpg', 'image/png')).toBe('photo-edited.png')
    expect(buildExportName('a.b.png', 'image/jpeg')).toBe('a.b-edited.jpg')
  })
})
