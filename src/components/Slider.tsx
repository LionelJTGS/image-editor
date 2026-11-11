interface Props {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  /** 拖动过程中持续触发，用于实时预览 */
  onChange: (value: number) => void
  /** 松手（或键盘操作结束）时触发一次，用于写入历史记录 */
  onCommit: () => void
}

export function Slider({ label, value, min, max, unit = '%', onChange, onCommit }: Props) {
  return (
    <label className="slider">
      <span className="slider__label">
        {label}
        <span className="slider__value">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        onBlur={onCommit}
      />
    </label>
  )
}
