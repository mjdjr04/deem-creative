import { useState } from 'react'
import { ChevronDown, GripVertical } from 'lucide-react'
import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, TextArea, Select, StringListEditor, FileUpload, Card, Button, Trash2, Plus } from '../../../components/admin/ui'

const newExp = () => ({
  id: 'exp-' + Date.now(),
  role: '',
  organization: '',
  orgType: '',
  location: '',
  startDate: '',
  endDate: '',
  type: 'past',
  description: '',
  highlights: [],
  website: '',
  websiteLabel: '',
  photo: null,
  photoAlt: '',
})

const newFeatured = () => ({
  id: 'feat-' + Date.now(),
  title: '',
  organization: '',
  period: '',
  description: '',
  outcome: '',
  link: '',
  linkLabel: '',
})

function CollapsibleItem({ title, subtitle, onRemove, onMove, children }) {
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <div className="flex items-center gap-2">
        <GripVertical size={16} className="text-white/20" />
        <button onClick={() => setOpen((v) => !v)} className="flex-1 flex items-center justify-between text-left">
          <span>
            <span className="text-white font-medium">{title || 'Untitled'}</span>
            {subtitle && <span className="text-white/40 text-sm ml-2">{subtitle}</span>}
          </span>
          <ChevronDown size={18} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={() => onMove(-1)} className="text-white/30 hover:text-white text-xs px-1">↑</button>
        <button onClick={() => onMove(1)} className="text-white/30 hover:text-white text-xs px-1">↓</button>
        <button onClick={onRemove} className="text-red-400/60 hover:text-red-400 p-1" title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
      {open && <div className="mt-4 pt-4 border-t border-brand-border">{children}</div>}
    </Card>
  )
}

export default function ExperienceEditor() {
  const draft = useSectionDraft('experience')
  const { value, setValue } = draft
  const items = value.items || []
  const featured = value.featuredProjects || []

  const setItems = (it) => setValue({ ...value, items: it })
  const setFeatured = (f) => setValue({ ...value, featuredProjects: f })

  const reorder = (arr, i, dir, setter) => {
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    const next = [...arr]
    ;[next[i], next[j]] = [next[j], next[i]]
    setter(next)
  }

  return (
    <EditorShell
      title="Experience"
      description="Your timeline of roles plus the featured project highlights."
      draft={draft}
    >
      <h3 className="text-white font-semibold mb-3">Timeline Entries</h3>
      <div className="space-y-4">
        {items.map((exp, i) => {
          const set = (key, v) => setItems(items.map((x, j) => (j === i ? { ...x, [key]: v } : x)))
          return (
            <CollapsibleItem
              key={exp.id || i}
              title={exp.role}
              subtitle={exp.organization}
              onRemove={() => setItems(items.filter((_, j) => j !== i))}
              onMove={(dir) => reorder(items, i, dir, setItems)}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Role"><TextInput value={exp.role} onChange={(e) => set('role', e.target.value)} /></Field>
                <Field label="Organization"><TextInput value={exp.organization} onChange={(e) => set('organization', e.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Type">
                  <Select value={exp.type} onChange={(e) => set('type', e.target.value)}>
                    <option value="current">Current</option>
                    <option value="past">Past</option>
                    <option value="education">Education</option>
                  </Select>
                </Field>
                <Field label="Org type" hint="e.g. Internship"><TextInput value={exp.orgType} onChange={(e) => set('orgType', e.target.value)} /></Field>
                <Field label="Location"><TextInput value={exp.location} onChange={(e) => set('location', e.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start date" hint="e.g. May 2026"><TextInput value={exp.startDate} onChange={(e) => set('startDate', e.target.value)} /></Field>
                <Field label="End date" hint="e.g. Present"><TextInput value={exp.endDate} onChange={(e) => set('endDate', e.target.value)} /></Field>
              </div>
              <Field label="Description" hint="Plain intro line — shown without a bullet.">
                <TextArea value={exp.description} onChange={(e) => set('description', e.target.value)} />
              </Field>
              <StringListEditor label="Bullet Points" hint="Each item shows as a bulleted line." items={exp.highlights} onChange={(v) => set('highlights', v)} placeholder="A bullet point…" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Website URL"><TextInput value={exp.website || ''} onChange={(e) => set('website', e.target.value)} /></Field>
                <Field label="Website label"><TextInput value={exp.websiteLabel || ''} onChange={(e) => set('websiteLabel', e.target.value)} /></Field>
              </div>
              <FileUpload label="Photo" value={exp.photo || ''} onChange={(v) => set('photo', v || null)} folder="experience" />
              <Field label="Photo alt text"><TextInput value={exp.photoAlt || ''} onChange={(e) => set('photoAlt', e.target.value)} /></Field>
            </CollapsibleItem>
          )
        })}
      </div>
      <Button variant="ghost" onClick={() => setItems([...items, newExp()])} className="mt-4 mb-10">
        <Plus size={15} /> Add experience
      </Button>

      <h3 className="text-white font-semibold mb-3">Featured Project Highlights</h3>
      <div className="space-y-4">
        {featured.map((proj, i) => {
          const set = (key, v) => setFeatured(featured.map((x, j) => (j === i ? { ...x, [key]: v } : x)))
          return (
            <CollapsibleItem
              key={proj.id || i}
              title={proj.title}
              subtitle={proj.organization}
              onRemove={() => setFeatured(featured.filter((_, j) => j !== i))}
              onMove={(dir) => reorder(featured, i, dir, setFeatured)}
            >
              <Field label="Title"><TextInput value={proj.title} onChange={(e) => set('title', e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Organization"><TextInput value={proj.organization} onChange={(e) => set('organization', e.target.value)} /></Field>
                <Field label="Period" hint="e.g. May 2025 – Jul 2025"><TextInput value={proj.period} onChange={(e) => set('period', e.target.value)} /></Field>
              </div>
              <Field label="Description"><TextArea value={proj.description} onChange={(e) => set('description', e.target.value)} /></Field>
              <Field label="Outcome"><TextArea value={proj.outcome} onChange={(e) => set('outcome', e.target.value)} rows={2} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Link URL"><TextInput value={proj.link || ''} onChange={(e) => set('link', e.target.value)} /></Field>
                <Field label="Link label"><TextInput value={proj.linkLabel || ''} onChange={(e) => set('linkLabel', e.target.value)} /></Field>
              </div>
            </CollapsibleItem>
          )
        })}
      </div>
      <Button variant="ghost" onClick={() => setFeatured([...featured, newFeatured()])} className="mt-4">
        <Plus size={15} /> Add featured project
      </Button>
    </EditorShell>
  )
}
