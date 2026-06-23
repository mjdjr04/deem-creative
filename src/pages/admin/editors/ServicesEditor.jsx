import { useState } from 'react'
import { ChevronDown, GripVertical } from 'lucide-react'
import * as Icons from 'lucide-react'
import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, TextArea, StringListEditor, Card, Button, Trash2, Plus } from '../../../components/admin/ui'

// Curated, relevant icon suggestions (autocomplete). Any Lucide name still works.
const ICON_SUGGESTIONS = [
  'TrendingUp', 'Video', 'PenTool', 'Monitor', 'Layers', 'Compass', 'Camera',
  'Film', 'Clapperboard', 'Megaphone', 'Share2', 'Instagram', 'Users', 'Calendar',
  'Mail', 'FileText', 'Briefcase', 'Star', 'Sparkles', 'Palette', 'Mic', 'Music',
  'Edit', 'Globe', 'BarChart3', 'Target', 'Lightbulb', 'Heart', 'MessageCircle',
  'Image', 'Rocket', 'Zap', 'Settings', 'BookOpen', 'Award', 'Newspaper', 'Play',
  'Headphones', 'Tv', 'Wand2', 'Brush', 'LayoutGrid', 'Presentation',
]

const makeId = (title) =>
  (title || 'service')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'service-' + Date.now()

const blank = () => ({
  id: 'service-' + Date.now(),
  title: '',
  iconName: 'Star',
  description: '',
  bestFor: '',
  deliverables: [],
  ctaUrl: '',
})

function IconPreview({ name }) {
  const Icon = Icons[name]
  if (Icon) return <Icon size={20} className="text-brand-light" />
  // Unknown / empty name — show a muted placeholder.
  return <Icons.HelpCircle size={20} className="text-white/25" />
}

function ServiceItem({ service, onChange, onRemove, onMove }) {
  const [open, setOpen] = useState(false)
  const set = (key, v) => onChange({ ...service, [key]: v })
  return (
    <Card>
      <div className="flex items-center gap-2">
        <GripVertical size={16} className="text-white/20" />
        <button onClick={() => setOpen((v) => !v)} className="flex-1 flex items-center justify-between text-left">
          <span className="text-white font-medium">{service.title || 'Untitled service'}</span>
          <ChevronDown size={18} className={`text-white/55 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={() => onMove(-1)} className="text-white/55 hover:text-white text-xs px-1">↑</button>
        <button onClick={() => onMove(1)} className="text-white/55 hover:text-white text-xs px-1">↓</button>
        <button onClick={onRemove} className="text-red-400/60 hover:text-red-400 p-1" title="Delete service">
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-brand-border">
          <Field label="Title">
            <TextInput value={service.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Icon name" hint="Start typing for suggestions. The box on the left previews the live icon.">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-navy border border-brand-accent/30 flex items-center justify-center flex-shrink-0">
                <IconPreview name={service.iconName} />
              </div>
              <TextInput
                list="lucide-icon-suggestions"
                value={service.iconName}
                onChange={(e) => set('iconName', e.target.value)}
                placeholder="e.g. Video"
              />
            </div>
          </Field>
          <Field label="Description">
            <TextArea value={service.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <Field label="Best for">
            <TextArea value={service.bestFor} onChange={(e) => set('bestFor', e.target.value)} rows={2} />
          </Field>
          <StringListEditor
            label="Deliverables / What's possible"
            items={service.deliverables}
            onChange={(v) => set('deliverables', v)}
            placeholder="e.g. Monthly content calendars"
          />
          <Field label="CTA button URL" hint="Where the 'Book a Consultation' button points.">
            <TextInput value={service.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} />
          </Field>
        </div>
      )}
    </Card>
  )
}

export default function ServicesEditor() {
  const draft = useSectionDraft('services')
  const { value, setValue } = draft
  const items = value.items || []
  const setItems = (it) => setValue({ ...value, items: it })

  const update = (i, next) => {
    // Keep id in sync with title if it was auto/empty, but never clobber a real id.
    setItems(items.map((s, j) => (j === i ? { ...next, id: next.id || makeId(next.title) } : s)))
  }
  const remove = (i) => setItems(items.filter((_, j) => j !== i))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }
  const add = () => setItems([...items, blank()])

  return (
    <EditorShell title="Services" description="The service offerings shown on your site." draft={draft}>
      {/* Shared autocomplete suggestions for every icon-name input below. */}
      <datalist id="lucide-icon-suggestions">
        {ICON_SUGGESTIONS.map((n) => <option key={n} value={n} />)}
      </datalist>
      <div className="space-y-4">
        {items.map((service, i) => (
          <ServiceItem
            key={service.id || i}
            service={service}
            onChange={(next) => update(i, next)}
            onRemove={() => remove(i)}
            onMove={(dir) => move(i, dir)}
          />
        ))}
      </div>
      <Button variant="ghost" onClick={add} className="mt-4">
        <Plus size={15} /> Add service
      </Button>
    </EditorShell>
  )
}
