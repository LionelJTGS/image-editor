import { useEffect, useRef, useState } from 'react'
import type { EditParams, Size } from '../types'
import { fitSize, getRotatedSize } from '../lib/geometry'
import { renderToCanvas } from '../lib/render'

interface Props {
  image: HTMLImageElement
  params: EditParams
}

/** 预览区：监听容器大小，把图片等比缩放后画到 Canvas 上 */
export function CanvasPreview({ image, params }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [containerSize, setContainerSize] = useState<Size>({ width: 0, height: 0 })

  // ResizeObserver：容器大小变化（比如拖动浏览器窗口）时更新尺寸
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setContainerSize({ width, height })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // 图片、参数或容器大小任意一个变化，就重新绘制
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || containerSize.width === 0 || containerSize.height === 0) return

    const rotated = getRotatedSize(
      { width: image.naturalWidth, height: image.naturalHeight },
      params.rotation,
    )
    const display = fitSize(rotated, containerSize)

    // 高分屏上一个 CSS 像素对应多个物理像素，画布像素要乘以 devicePixelRatio 才不会模糊
    const dpr = window.devicePixelRatio || 1
    renderToCanvas(
      canvas,
      image,
      params,
      Math.round(display.width * dpr),
      Math.round(display.height * dpr),
    )
    canvas.style.width = `${display.width}px`
    canvas.style.height = `${display.height}px`
  }, [image, params, containerSize])

  return (
    <div className="preview" ref={containerRef}>
      <canvas ref={canvasRef} aria-label="图片预览" />
    </div>
  )
}
