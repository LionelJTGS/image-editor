export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
export const MAX_DIMENSION = 8000 // 单边最大像素，过大的图会让 Canvas 占用过多内存

/** 校验文件，返回错误提示；通过则返回 null */
export function validateFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return '仅支持 JPG、PNG、WebP 格式的图片'
  }
  if (file.size > MAX_FILE_SIZE) {
    return '图片大小不能超过 10 MB'
  }
  return null
}

/** 把文件加载成 HTMLImageElement，加载失败或尺寸过大时 reject */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // createObjectURL 生成一个指向本地文件的临时地址，图片不会上传到任何服务器
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url) // 图片已解码，释放临时地址
      if (image.naturalWidth > MAX_DIMENSION || image.naturalHeight > MAX_DIMENSION) {
        reject(new Error(`图片尺寸过大，单边不能超过 ${MAX_DIMENSION} 像素`))
        return
      }
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败，文件可能已损坏'))
    }
    image.src = url
  })
}
