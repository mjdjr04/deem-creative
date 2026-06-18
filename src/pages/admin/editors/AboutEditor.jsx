import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, TextArea, FileUpload } from '../../../components/admin/ui'

export default function AboutEditor() {
  const draft = useSectionDraft('about')
  const { value, setValue } = draft
  const set = (key, v) => setValue({ ...value, [key]: v })

  return (
    <EditorShell
      title="About Section"
      description="The intro, founder card, and headshot on your homepage."
      draft={draft}
    >
      <Field label="Eyebrow (small label above heading)">
        <TextInput value={value.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
      </Field>

      <Field label="Heading">
        <TextInput value={value.heading} onChange={(e) => set('heading', e.target.value)} />
      </Field>

      <Field label="Paragraphs" hint="Separate paragraphs with a blank line between them.">
        <TextArea
          rows={8}
          value={(value.paragraphs || []).join('\n\n')}
          onChange={(e) => set('paragraphs', e.target.value.split(/\n\s*\n/))}
          placeholder="Write your intro here…"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Founder name">
          <TextInput value={value.founderName} onChange={(e) => set('founderName', e.target.value)} />
        </Field>
        <Field label="Founder title">
          <TextInput value={value.founderTitle} onChange={(e) => set('founderTitle', e.target.value)} />
        </Field>
      </div>

      <Field label="LinkedIn URL">
        <TextInput value={value.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} />
      </Field>

      <FileUpload
        label="Headshot"
        hint="Leave empty to use the default bundled photo."
        value={value.headshot}
        onChange={(v) => set('headshot', v)}
        folder="about"
        accept="image/*"
      />
    </EditorShell>
  )
}
