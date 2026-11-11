import { useCallback, useEffect, useRef, useState } from 'react'
import { CanvasPreview } from './components/CanvasPreview'
import { Slider } from './components/Slider'
import { UploadArea } from './components/UploadArea'
import { useHistory } from './hooks/useHistory'
import { buildExportName, exportImage, type ExportFormat } from './lib/exportImage'
import { ACCEPTED_TYPES, loadImage, validateFile } from './lib/file'
import { getOutputSize, rotateBy } from './lib/geometry'
import { DEFAULT_PARAMS, isSameParams, type EditParams } from './types'

interface Message {
  type: 'error' | 'success'
  text: string
}

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [format, setFormat] = useState<ExportFormat>('image/png')
  const [message, setMessage] = useState<Message | null>(null)
  const [exporting, setExporting] = useState(false)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  // history.present 是“已确认”的参数，每次变化都会留下一条历史记录
  const history = useHistory<EditParams>(DEFAULT_PARAMS)

  // draft 是拖动滑块过程中的临时参数：只用于实时预览，不进历史。
  // 否则拖一次滑块会产生几十条记录，撤销要按几十次。
  const [draft, setDraft] = useState<EditParams | null>(null)
  const params = draft ?? history.present

  /** 提交一次修改：与当前参数不同才写入历史 */
  function commit(next: EditParams) {
    if (!isSameParams(next, history.present)) history.push(next)
    setDraft(null)
  }

  async function handleFile(file: File) {
    const error = validateFile(file)
    if (error) {
      setMessage({ type: 'error', text: error })
      return
    }
    try {
      const loaded = await loadImage(file)
      setImage(loaded)
      setFileName(file.name)
      setDraft(null)
      history.reset(DEFAULT_PARAMS) // 换图后清空历史
      setMessage(null)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '图片加载失败' })
    }
  }

  async function handleExport() {
    if (!image) return
    setExporting(true)
    try {
      await exportImage(image, history.present, format, buildExportName(fileName, format))
      setMessage({ type: 'success', text: '导出成功' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '导出失败' })
    } finally {
      setExporting(false)
    }
  }

  const { undo, redo } = history
  const handleUndo = useCallback(() => {
    setDraft(null)
    undo()
  }, [undo])
  const handleRedo = useCallback(() => {
    setDraft(null)
    redo()
  }, [redo])

  // 快捷键：Ctrl/Cmd + Z 撤销，Ctrl/Cmd + Shift + Z 或 Ctrl + Y 重做
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) return
      const key = event.key.toLowerCase()
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) handleRedo()
        else handleUndo()
      } else if (key === 'y') {
        event.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleUndo, handleRedo])

  const natural = image ? { width: image.naturalWidth, height: image.naturalHeight } : null
  const output = natural ? getOutputSize(natural, params) : null

  return (
    <div className="app">
      <header className="header">
        <h1>在线图片编辑器</h1>
        {image && (
          <span className="header__file" title={fileName}>
            {fileName}
          </span>
        )}
      </header>

      {message && (
        <div className={`message message--${message.type}`} role="alert">
          <span>{message.text}</span>
          <button className="message__close" onClick={() => setMessage(null)} aria-label="关闭提示">
            ×
          </button>
        </div>
      )}

      {!image || !natural || !output ? (
        <UploadArea onFile={handleFile} />
      ) : (
        <main className="workspace">
          <CanvasPreview image={image} params={params} />

          <aside className="panel">
            <section className="panel__group">
              <h2>历史</h2>
              <div className="row">
                <button className="btn" onClick={handleUndo} disabled={!history.canUndo}>
                  撤销
                </button>
                <button className="btn" onClick={handleRedo} disabled={!history.canRedo}>
                  重做
                </button>
                <button
                  className="btn"
                  onClick={() => commit(DEFAULT_PARAMS)}
                  disabled={isSameParams(params, DEFAULT_PARAMS)}
                >
                  重置
                </button>
              </div>
            </section>

            <section className="panel__group">
              <h2>旋转</h2>
              <div className="row">
                <button
                  className="btn"
                  onClick={() => commit({ ...params, rotation: rotateBy(params.rotation, -90) })}
                >
                  向左 90°
                </button>
                <button
                  className="btn"
                  onClick={() => commit({ ...params, rotation: rotateBy(params.rotation, 90) })}
                >
                  向右 90°
                </button>
              </div>
            </section>

            <section className="panel__group">
              <h2>调整</h2>
              <Slider
                label="亮度"
                value={params.brightness}
                min={0}
                max={200}
                onChange={(brightness) => setDraft({ ...params, brightness })}
                onCommit={() => draft && commit(draft)}
              />
              <Slider
                label="导出缩放"
                value={params.scale}
                min={10}
                max={100}
                onChange={(scale) => setDraft({ ...params, scale })}
                onCommit={() => draft && commit(draft)}
              />
            </section>

            <section className="panel__group">
              <h2>尺寸</h2>
              <dl className="sizes">
                <dt>原图</dt>
                <dd>
                  {natural.width} × {natural.height}
                </dd>
                <dt>导出</dt>
                <dd>
                  {output.width} × {output.height}
                </dd>
              </dl>
            </section>

            <section className="panel__group">
              <h2>导出</h2>
              <div className="row">
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value as ExportFormat)}
                  aria-label="导出格式"
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPG</option>
                </select>
                <button className="btn btn--primary" onClick={handleExport} disabled={exporting}>
                  {exporting ? '导出中…' : '下载图片'}
                </button>
              </div>
              <button className="btn btn--block" onClick={() => replaceInputRef.current?.click()}>
                更换图片
              </button>
              <input
                ref={replaceInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) handleFile(file)
                  event.target.value = ''
                }}
              />
            </section>
          </aside>
        </main>
      )}
    </div>
  )
}
