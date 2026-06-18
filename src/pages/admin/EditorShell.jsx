import { useState, useEffect, useRef } from 'react'
import { Save, Loader2, Check } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

const clone = (v) => JSON.parse(JSON.stringify(v))

/**
 * Manages local editing state for one section's draft.
 * Returns the working value, a setter, and save plumbing.
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook + shell belong together
export function useSectionDraft(section) {
  const { drafts, saveSection } = useAdmin()
  const [value, setValue] = useState(() => clone(drafts[section]))
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState(null)

  // Re-sync if the underlying draft changes (e.g. after publish/reload).
  const sectionRef = useRef(section)
  useEffect(() => {
    if (sectionRef.current !== section) {
      sectionRef.current = section
      setValue(clone(drafts[section]))
    }
  }, [section, drafts])

  // Clear the "Saved" confirmation after a moment.
  useEffect(() => {
    if (!justSaved) return
    const t = setTimeout(() => setJustSaved(false), 2500)
    return () => clearTimeout(t)
  }, [justSaved])

  const dirtyLocal = JSON.stringify(value) !== JSON.stringify(drafts[section])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await saveSection(section, value)
      setJustSaved(true)
    } catch (e) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return { value, setValue, save, saving, justSaved, dirtyLocal, error }
}

/**
 * Standard editor page header: title, optional description, and a Save button
 * that reflects saving / saved / dirty state.
 */
export function EditorShell({ title, description, draft, children }) {
  const { save, saving, justSaved, dirtyLocal, error } = draft
  const showSaved = justSaved && !dirtyLocal

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && <p className="text-white/50 text-sm mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {error && <span className="text-red-400 text-xs">{error}</span>}
          <button
            onClick={save}
            disabled={saving || !dirtyLocal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy border border-brand-accent text-white text-sm font-semibold hover:bg-brand-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : showSaved ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}
            {saving ? 'Saving…' : showSaved ? 'Saved' : 'Save draft'}
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}
