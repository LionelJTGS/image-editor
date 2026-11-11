import type { EditParams } from '../types'

/**
 * 统一的绘制函数：预览和导出都调用它，区别只是传入的画布大小不同。
 *
 * @param canvas 目标画布（页面上的预览画布，或导出用的离屏画布）
 * @param image  原图
 * @param params 编辑参数
 * @param width  画布的像素宽度（已经是旋转之后的宽度）
 * @param height 画布的像素高度（已经是旋转之后的高度）
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  params: EditParams,
  width: number,
  height: number,
): void {
  // 设置 width/height 会同时清空画布
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('当前浏览器不支持 Canvas 2D')

  // 部分旧版浏览器不支持 ctx.filter，这时改用逐像素计算
  const supportsFilter = typeof ctx.filter === 'string'

  ctx.save()
  if (supportsFilter) {
    ctx.filter = `brightness(${params.brightness}%)`
  }

  // 旋转的做法：把坐标原点移到画布中心，旋转坐标系，再以原点为中心画图
  ctx.translate(width / 2, height / 2)
  ctx.rotate((params.rotation * Math.PI) / 180)

  // 画布尺寸是旋转后的；旋转 90°/270° 时，图片自身的宽高要换回来
  const swapped = params.rotation === 90 || params.rotation === 270
  const drawWidth = swapped ? height : width
  const drawHeight = swapped ? width : height
  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  ctx.restore()

  if (!supportsFilter && params.brightness !== 100) {
    applyBrightnessByPixels(ctx, width, height, params.brightness)
  }
}

/** 兜底方案：读取像素数据，把每个像素的 R、G、B 乘以亮度系数 */
function applyBrightnessByPixels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brightness: number,
): void {
  const factor = brightness / 100
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data // Uint8ClampedArray，超过 255 会自动截断
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * factor
    data[i + 1] = data[i + 1] * factor
    data[i + 2] = data[i + 2] * factor
    // data[i + 3] 是透明度，不改
  }
  ctx.putImageData(imageData, 0, 0)
}
