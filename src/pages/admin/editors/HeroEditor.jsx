import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, TextArea, StringListEditor, Card } from '../../../components/admin/ui'

export default function HeroEditor() {
  const draft = useSectionDraft('hero')
  const { value, setValue } = draft
  const set = (key, v) => setValue({ ...value, [key]: v })

  return (
    <EditorShell
      title="Hero"
      description="The first thing visitors read on the Home page: your positioning line, your one-sentence summary, and the work-area tags."
      draft={draft}
    >
      <Card>
        <Field label="Headline" hint="The plain white start of your positioning line.">
          <TextInput value={value.headline || ''} onChange={(e) => set('headline', e.target.value)} />
        </Field>
        <Field label="Headline accent" hint="The rest of the line, shown in the blue gradient. Leave empty for a one-color headline.">
          <TextInput value={value.headlineAccent || ''} onChange={(e) => set('headlineAccent', e.target.value)} />
        </Field>
        <Field label="Subheadline" hint="Your one-sentence summary, plus a line on who you are.">
          <TextArea rows={4} value={value.subheadline || ''} onChange={(e) => set('subheadline', e.target.value)} />
        </Field>
        <StringListEditor
          label="Work-area tags"
          hint="The small row of tags under the buttons."
          items={value.chips || []}
          onChange={(v) => set('chips', v)}
          placeholder="e.g. Story Films"
        />
      </Card>
    </EditorShell>
  )
}
