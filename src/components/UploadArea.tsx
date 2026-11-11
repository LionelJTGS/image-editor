import { useRef, useState, type DragEvent } from 'react'
import { ACCEPTED_TYPES } from '../lib/file'

interface Props {
  onFile: (file: File) => void
}

/** 空状态下的上传区域：支持点击选择和拖拽 */
export function UploadArea({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(event: DragEvent) {
    event.preventDefault() // 阻止浏览器默认的“打开文件”行为
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={`upload ${dragging ? 'upload--dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <p className="upload__title">拖拽图片到这里，或</p>
      <button className="btn btn--primary" onClick={() => inputRef.current?.click()}>
        选择图片
      </button>
      <p className="upload__hint">支持 JPG、PNG、WebP，不超过 10 MB。图片只在本地处理，不会上传。</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = '' // 清空，否则再次选择同一个文件不会触发 change
        }}
      />
    </div>
  )
}
