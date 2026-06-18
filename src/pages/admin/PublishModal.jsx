import { useState } from 'react'
import { UploadCloud, X, Loader2, CheckCircle2 } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { Button } from '../../components/admin/ui'

export default function PublishModal({ onClose }) {
  const { publishAll } = useAdmin()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await publishAll()
      setDone(true)
      setTimeout(onClose, 1200)
    } catch (e) {
      setError(e.message || 'Publish failed')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-brand-mid border border-brand-border p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={42} className="text-green-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white">Published!</h2>
            <p className="text-white/50 text-sm mt-1">Your changes are now live.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-600/20 border border-green-500/40 flex items-center justify-center">
                  <UploadCloud size={20} className="text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Publish all changes?</h2>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white" disabled={busy}>
                <X size={20} />
              </button>
            </div>

            <p className="text-white/60 text-sm leading-relaxed mb-6">
              This will make all of your saved edits <strong className="text-white">live on
              deemcreative.com</strong> for everyone to see, right away. Are you sure you want to
              continue?
            </p>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <Button variant="success" onClick={confirm} disabled={busy}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                {busy ? 'Publishing…' : 'Yes, publish'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
