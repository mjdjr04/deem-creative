import { useState } from 'react'
import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react'
import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, TextArea, FileUpload, Card, Button } from '../../../components/admin/ui'

// Today's date as YYYY-MM-DD for new-post defaults.
const today = () => new Date().toISOString().slice(0, 10)

const newPost = () => ({
  id: 'post-' + Date.now(),
  title: '',
  caption: '',
  photos: [],
  date: today(),
})

function PhotosEditor({ photos, onChange, folder }) {
  const list = photos || []
  return (
    <Field label="Photos">
      <div className="space-y-3">
        {list.map((url, i) => (
          <FileUpload
            key={i}
            value={url}
            onChange={(v) => {
              if (!v) onChange(list.filter((_, j) => j !== i))
              else onChange(list.map((u, j) => (j === i ? v : u)))
            }}
            folder={folder}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...list, ''])}
        className="mt-2 inline-flex items-center gap-1.5 text-brand-light text-xs font-medium hover:text-white"
      >
        <Plus size={14} /> Add photo
      </button>
    </Field>
  )
}

function PostItem({ post, onChange, onRemove, onMove }) {
  const [open, setOpen] = useState(false)
  const set = (key, v) => onChange({ ...post, [key]: v })
  return (
    <Card>
      <div className="flex items-center gap-2">
        <GripVertical size={16} className="text-white/20" />
        <button onClick={() => setOpen((v) => !v)} className="flex-1 flex items-center justify-between text-left">
          <span>
            <span className="text-white font-medium">{post.title || post.caption?.slice(0, 40) || 'Untitled post'}</span>
            {post.date && <span className="text-white/40 text-sm ml-2">{post.date}</span>}
          </span>
          <ChevronDown size={18} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={() => onMove(-1)} className="text-white/30 hover:text-white text-xs px-1">↑</button>
        <button onClick={() => onMove(1)} className="text-white/30 hover:text-white text-xs px-1">↓</button>
        <button onClick={onRemove} className="text-red-400/60 hover:text-red-400 p-1" title="Delete post">
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-brand-border">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title (optional)"><TextInput value={post.title || ''} onChange={(e) => set('title', e.target.value)} /></Field>
            <Field label="Publish date"><TextInput type="date" value={post.date || ''} onChange={(e) => set('date', e.target.value)} /></Field>
          </div>
          <Field label="Caption"><TextArea value={post.caption || ''} onChange={(e) => set('caption', e.target.value)} rows={3} /></Field>
          <PhotosEditor photos={post.photos} onChange={(v) => set('photos', v)} folder="feed" />
        </div>
      )}
    </Card>
  )
}

export default function FeedEditor() {
  const draft = useSectionDraft('feed')
  const { value, setValue } = draft
  const items = value.items || []
  const setItems = (it) => setValue({ ...value, items: it })

  const update = (i, next) => setItems(items.map((p, j) => (j === i ? next : p)))
  const remove = (i) => setItems(items.filter((_, j) => j !== i))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  return (
    <EditorShell
      title="Feed"
      description="Photo posts with a publish date, shown on your portfolio page (newest first by list order)."
      draft={draft}
    >
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-white/40 text-sm">No posts yet. Add your first one below.</p>
        )}
        {items.map((post, i) => (
          <PostItem
            key={post.id || i}
            post={post}
            onChange={(next) => update(i, next)}
            onRemove={() => remove(i)}
            onMove={(dir) => move(i, dir)}
          />
        ))}
      </div>

      <Button variant="ghost" onClick={() => setItems([newPost(), ...items])} className="mt-4">
        <Plus size={15} /> Add post
      </Button>
    </EditorShell>
  )
}
