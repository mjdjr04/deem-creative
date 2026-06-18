import { useState } from 'react'
import { ChevronDown, GripVertical, Plus, Trash2, DownloadCloud } from 'lucide-react'
import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, TextArea, Select, Toggle, StringListEditor, FileUpload, Card, Button } from '../../../components/admin/ui'
import { defaultContent } from '../../../data/defaults'

const newProject = () => ({
  id: 'project-' + Date.now(),
  title: '',
  client: '',
  category: '',
  featured: false,
  tags: [],
  year: '',
  role: '',
  brief: '',
  description: '',
  outcomes: [],
  tools: [],
  mediaType: 'image',
  mediaUrl: null,
  mediaAlt: '',
  mediaCaption: '',
  attachment: '',
  attachmentLabel: '',
  accentColor: '#2B5BA8',
  socialLinks: [],
})

function SocialLinksEditor({ links, onChange }) {
  const list = links || []
  const update = (i, key, v) => onChange(list.map((l, j) => (j === i ? { ...l, [key]: v } : l)))
  return (
    <Field label="Social / external links">
      <div className="space-y-2">
        {list.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput value={link.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Label (e.g. Instagram)" />
            <TextInput value={link.url} onChange={(e) => update(i, 'url', e.target.value)} placeholder="https://…" />
            <button onClick={() => onChange(list.filter((_, j) => j !== i))} className="text-red-400/60 hover:text-red-400 p-1">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...list, { label: '', url: '' }])} className="mt-2 inline-flex items-center gap-1.5 text-brand-light text-xs font-medium hover:text-white">
        <Plus size={14} /> Add link
      </button>
    </Field>
  )
}

function ProjectItem({ project, categories, onChange, onRemove, onMove }) {
  const [open, setOpen] = useState(false)
  const set = (key, v) => onChange({ ...project, [key]: v })
  const catOptions = categories.filter((c) => c !== 'All')

  return (
    <Card>
      <div className="flex items-center gap-2">
        <GripVertical size={16} className="text-white/20" />
        <button onClick={() => setOpen((v) => !v)} className="flex-1 flex items-center justify-between text-left">
          <span>
            <span className="text-white font-medium">{project.title || 'Untitled project'}</span>
            {project.featured && <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-300 border border-amber-300/40 rounded px-1.5 py-0.5">Featured</span>}
          </span>
          <ChevronDown size={18} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={() => onMove(-1)} className="text-white/30 hover:text-white text-xs px-1">↑</button>
        <button onClick={() => onMove(1)} className="text-white/30 hover:text-white text-xs px-1">↓</button>
        <button onClick={onRemove} className="text-red-400/60 hover:text-red-400 p-1" title="Delete project">
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-brand-border">
          <div className="mb-4">
            <Toggle checked={!!project.featured} onChange={(v) => set('featured', v)} label="Show in homepage Featured Work" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title"><TextInput value={project.title} onChange={(e) => set('title', e.target.value)} /></Field>
            <Field label="Client"><TextInput value={project.client || ''} onChange={(e) => set('client', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Category">
              <Select value={project.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">— Select —</option>
                {catOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Year" hint="e.g. 2025–Present"><TextInput value={project.year || ''} onChange={(e) => set('year', e.target.value)} /></Field>
            <Field label="Role"><TextInput value={project.role || ''} onChange={(e) => set('role', e.target.value)} /></Field>
          </div>
          <Field label="Brief (shown on the project preview card)" hint="Short one-liner that appears on the card before opening the project."><TextArea value={project.brief || ''} onChange={(e) => set('brief', e.target.value)} rows={2} /></Field>
          <Field label="Description"><TextArea value={project.description || ''} onChange={(e) => set('description', e.target.value)} rows={4} /></Field>
          <StringListEditor label="Outcomes" items={project.outcomes} onChange={(v) => set('outcomes', v)} placeholder="A result or deliverable…" />
          <div className="grid grid-cols-2 gap-4">
            <StringListEditor label="Tags" items={project.tags} onChange={(v) => set('tags', v)} placeholder="e.g. Video" />
            <StringListEditor label="Tools" items={project.tools} onChange={(v) => set('tools', v)} placeholder="e.g. Premiere Pro" />
          </div>

          {/* Media */}
          <div className="mt-2 p-4 rounded-lg bg-brand-dark/40 border border-brand-border">
            <Field label="Media type">
              <Select value={project.mediaType} onChange={(e) => set('mediaType', e.target.value)}>
                <option value="image">Image</option>
                <option value="video">Video (embed)</option>
                <option value="attachment">Attachment (PDF)</option>
              </Select>
            </Field>
            {project.mediaType === 'video' && (
              <>
                <FileUpload
                  label="Video"
                  hint="Upload a video file, or paste an embed link (e.g. https://www.youtube.com/embed/VIDEO_ID)."
                  value={project.mediaUrl || ''}
                  onChange={(v) => set('mediaUrl', v || null)}
                  folder="projects"
                  accept="video/*"
                  preview={false}
                />
                <Field label="Caption"><TextInput value={project.mediaCaption || ''} onChange={(e) => set('mediaCaption', e.target.value)} /></Field>
              </>
            )}
            {project.mediaType === 'image' && (
              <>
                <FileUpload
                  label="Image"
                  hint="Upload an image, or paste an image URL."
                  value={project.mediaUrl || ''}
                  onChange={(v) => set('mediaUrl', v || null)}
                  folder="projects"
                />
                <Field label="Image alt text"><TextInput value={project.mediaAlt || ''} onChange={(e) => set('mediaAlt', e.target.value)} /></Field>
              </>
            )}
            {project.mediaType === 'attachment' && (
              <>
                <FileUpload label="PDF attachment" value={project.attachment || ''} onChange={(v) => set('attachment', v)} folder="projects" accept="application/pdf" preview={false} />
                <Field label="Attachment label"><TextInput value={project.attachmentLabel || ''} onChange={(e) => set('attachmentLabel', e.target.value)} /></Field>
              </>
            )}
          </div>

          <div className="mt-4">
            <SocialLinksEditor links={project.socialLinks} onChange={(v) => set('socialLinks', v)} />
          </div>

          <Field label="Accent color">
            <div className="flex items-center gap-2">
              <input type="color" value={project.accentColor || '#2B5BA8'} onChange={(e) => set('accentColor', e.target.value)} className="w-10 h-9 rounded border border-brand-border bg-transparent" />
              <TextInput value={project.accentColor || ''} onChange={(e) => set('accentColor', e.target.value)} />
            </div>
          </Field>
        </div>
      )}
    </Card>
  )
}

export default function ProjectsEditor() {
  const draft = useSectionDraft('projects')
  const { value, setValue } = draft
  const items = value.items || []
  const categories = value.categories || ['All']

  const setItems = (it) => setValue({ ...value, items: it })

  // Append any projects defined in the site's code defaults that aren't already
  // here (matched by id). Lets newly-added default projects reach the database.
  const defaultItems = defaultContent.projects.items
  const existingIds = new Set(items.map((p) => p.id))
  const missing = defaultItems.filter((p) => !existingIds.has(p.id))
  const loadNew = () => {
    if (missing.length) setItems([...items, ...missing])
  }

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
    <EditorShell title="Projects" description="Your portfolio work. Toggle 'Featured' to show on the homepage." draft={draft}>
      {missing.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-brand-accent/40 bg-brand-navy/30 px-5 py-4">
          <p className="text-sm text-white/80">
            <strong className="text-white">{missing.length} new project{missing.length > 1 ? 's' : ''}</strong> {missing.length > 1 ? 'are' : 'is'} available to add from the site. Click to load {missing.length > 1 ? 'them' : 'it'} in, then Save draft and Publish.
          </p>
          <Button onClick={loadNew} className="flex-shrink-0">
            <DownloadCloud size={15} /> Load new
          </Button>
        </div>
      )}

      <Card className="mb-6">
        <StringListEditor
          label="Categories"
          hint="Used for the portfolio filter tabs. Keep 'All' first."
          items={categories}
          onChange={(v) => setValue({ ...value, categories: v })}
          placeholder="e.g. Video Production"
        />
      </Card>

      <div className="space-y-4">
        {items.map((project, i) => (
          <ProjectItem
            key={project.id || i}
            project={project}
            categories={categories}
            onChange={(next) => update(i, next)}
            onRemove={() => remove(i)}
            onMove={(dir) => move(i, dir)}
          />
        ))}
      </div>

      <Button variant="ghost" onClick={() => setItems([...items, newProject()])} className="mt-4">
        <Plus size={15} /> Add project
      </Button>
    </EditorShell>
  )
}
