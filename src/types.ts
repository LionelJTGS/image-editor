/** 旋转角度只允许 90° 的倍数 */
export type Rotation = 0 | 90 | 180 | 270

/**
 * 编辑参数：描述“对原图做了什么”，而不是保存编辑后的像素。
 * 画布上显示的内容永远由「原图 + 这组参数」重新绘制得到。
 */
export interface EditParams {
  /** 顺时针旋转角度 */
  rotation: Rotation
  /** 亮度百分比，100 表示不变，范围 0 ~ 200 */
  brightness: number
  /** 导出尺寸相对原图的百分比，范围 10 ~ 100 */
  scale: number
}

export const DEFAULT_PARAMS: EditParams = {
  rotation: 0,
  brightness: 100,
  scale: 100,
}

export interface Size {
  width: number
  height: number
}

export function isSameParams(a: EditParams, b: EditParams): boolean {
  return (
    a.rotation === b.rotation &&
    a.brightness === b.brightness &&
    a.scale === b.scale
  )
}
