import type { EditParams } from '../types'
import { getOutputSize } from './geometry'
import { renderToCanvas } from './render'

export type ExportFormat = 'image/png' | 'image/jpeg'

/**
 * 导出：新建一个不挂到页面上的离屏画布，按导出尺寸重新绘制一遍。
 * 不能直接导出预览画布，因为预览是缩小过的，导出会变模糊。
 */
export async function exportImage(
  image: HTMLImageElement,
  params: EditParams,
  format: ExportFormat,
  fileName: string,
): Promise<void> {
  const size = getOutputSize(
    { width: image.naturalWidth, height: image.naturalHeight },
    params,
  )

  const canvas = document.createElement('canvas')
  renderToCanvas(canvas, image, params, size.width, size.height)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, format, 0.92) // 第三个参数是 JPEG 质量，PNG 会忽略
  })
  if (!blob) {
    throw new Error('导出失败，图片尺寸可能超出浏览器限制')
  }

  // 用一个临时的 <a download> 触发浏览器下载
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

/** photo.jpg + image/png → photo-edited.png */
export function buildExportName(originalName: string, format: ExportFormat): string {
  const dot = originalName.lastIndexOf('.')
  const base = dot > 0 ? originalName.slice(0, dot) : originalName
  const ext = format === 'image/png' ? 'png' : 'jpg'
  return `${base || 'image'}-edited.${ext}`
}
