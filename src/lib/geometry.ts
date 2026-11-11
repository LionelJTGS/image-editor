import type { EditParams, Rotation, Size } from '../types'

/**
 * 这个项目里有三种尺寸，容易混淆：
 * 1. 原图尺寸：图片文件本身的像素大小
 * 2. 预览尺寸：为了放进页面容器而等比缩小后的显示大小
 * 3. 导出尺寸：最终下载的图片大小 = 旋转后的原图尺寸 × 缩放比例
 */

/** 旋转 90° 或 270° 后，宽高互换 */
export function getRotatedSize(size: Size, rotation: Rotation): Size {
  const swapped = rotation === 90 || rotation === 270
  return swapped
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height }
}

/** 导出尺寸：先旋转，再按比例缩放，至少为 1 像素 */
export function getOutputSize(natural: Size, params: EditParams): Size {
  const rotated = getRotatedSize(natural, params.rotation)
  const ratio = params.scale / 100
  return {
    width: Math.max(1, Math.round(rotated.width * ratio)),
    height: Math.max(1, Math.round(rotated.height * ratio)),
  }
}

/**
 * 预览尺寸：把内容等比缩小到容器内（类似 CSS 的 object-fit: contain）。
 * 小图不会被放大，避免预览模糊。
 */
export function fitSize(content: Size, container: Size): Size {
  if (content.width <= 0 || content.height <= 0) return { width: 0, height: 0 }
  const ratio = Math.min(
    container.width / content.width,
    container.height / content.height,
    1,
  )
  return {
    width: Math.max(1, Math.floor(content.width * ratio)),
    height: Math.max(1, Math.floor(content.height * ratio)),
  }
}

/** 顺时针（+90）或逆时针（-90）旋转后的新角度 */
export function rotateBy(rotation: Rotation, delta: 90 | -90): Rotation {
  return ((((rotation + delta) % 360) + 360) % 360) as Rotation
}
