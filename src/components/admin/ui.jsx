import { useState } from 'react'
import { Plus, Trash2, GripVertical, Upload, Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import { uploadFile } from '../../lib/upload'

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------
export function Button({ variant = 'primary', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-brand-navy border-brand-accent text-white hover:bg-brand-accent',
    ghost: 'bg-transparent border-brand-border text-white/70 hover:text-white hover:border-brand-accent',
    danger: 'bg-transparent border-red-500/40 text-red-300 hover:bg-red-500/10 hover:border-red-500',
    success: 'bg-green-600 border-green-500 text-white hover:bg-green-500',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Labeled field wrapper
// ---------------------------------------------------------------------------
export function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      {label && (
        <span className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="block text-white/55 text-xs mt-1">{hint}</span>}
    </label>
  )
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-brand-dark border border-brand-border text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-accent'

export function TextInput(props) {
  return <input type="text" className={inputClass} {...props} />
}

export function TextArea({ rows = 3, ...props }) {
  return <textarea rows={rows} className={`${inputClass} resize-y`} {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className={inputClass} {...props}>
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-white/80"
    >
      <span
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-brand-accent' : 'bg-brand-border'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </span>
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Editable list of plain strings (tags, outcomes, deliverables, highlights…)
// ---------------------------------------------------------------------------
export function StringListEditor({ label, hint, items, onChange, placeholder = 'Add item…' }) {
  const list = items || []
  const update = (i, v) => onChange(list.map((x, j) => (j === i ? v : x)))
  const remove = (i) => onChange(list.filter((_, j) => j !== i))
  const add = () => onChange([...list, ''])
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <GripVertical size={14} className="text-white/20 flex-shrink-0" />
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
            <button type="button" onClick={() => move(i, -1)} className="text-white/55 hover:text-white p-1" title="Move up">
              <ChevronUp size={14} />
            </button>
            <button type="button" onClick={() => move(i, 1)} className="text-white/55 hover:text-white p-1" title="Move down">
              <ChevronDown size={14} />
            </button>
            <button type="button" onClick={() => remove(i)} className="text-red-400/60 hover:text-red-400 p-1" title="Remove">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 text-brand-light text-xs font-medium hover:text-white"
      >
        <Plus size={14} /> Add
      </button>
    </Field>
  )
}

// ---------------------------------------------------------------------------
// File / image upload with preview
// ---------------------------------------------------------------------------
export function FileUpload({ label, hint, value, onChange, folder = 'uploads', accept = 'image/*', preview = true }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handle = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const url = await uploadFile(file, folder)
      onChange(url)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const isImageUrl = value && /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(value)
  const fileName = value ? decodeURIComponent(value.split('/').pop().split('?')[0]) : ''

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-start gap-4">
        {preview && value && isImageUrl && (
          <img src={value} alt="preview" className="w-20 h-20 rounded-lg object-cover border border-brand-border flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-border text-white/70 text-sm font-medium hover:border-brand-accent hover:text-white cursor-pointer">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {busy ? 'Uploading…' : 'Upload file'}
              <input type="file" accept={accept} onChange={handle} className="hidden" disabled={busy} />
            </label>
            <span className="text-white/55 text-xs">or paste a link below</span>
          </div>

          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…  (upload a file or paste a URL)"
            className={inputClass}
          />

          {value && (
            <div className="flex items-center justify-between gap-2">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-light text-xs hover:text-white truncate"
                title={value}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                Live file: <span className="truncate">{fileName}</span> ↗
              </a>
              <button type="button" onClick={() => onChange('')} className="text-red-400/60 hover:text-red-400 p-1 flex-shrink-0" title="Remove file">
                <Trash2 size={15} />
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      </div>
    </Field>
  )
}

// ---------------------------------------------------------------------------
// Card wrapper for list items
// ---------------------------------------------------------------------------
export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl bg-brand-mid border border-brand-border p-5 ${className}`}>
      {children}
    </div>
  )
}

export { Plus, Trash2 }
