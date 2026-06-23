import { EditorShell, useSectionDraft } from '../EditorShell'
import {
  Field,
  TextInput,
  TextArea,
  FileUpload,
  StringListEditor,
  Card,
  Button,
  Trash2,
  Plus,
} from '../../../components/admin/ui'

export default function AboutEditor() {
  const draft = useSectionDraft('about')
  const { value, setValue } = draft
  const set = (key, v) => setValue({ ...value, [key]: v })

  // --- Profile-page intro (nested under about.profile) ---------------------
  const profile = value.profile || {}
  const setProfile = (key, v) => set('profile', { ...profile, [key]: v })

  const stats = profile.stats || []
  const setStats = (s) => setProfile('stats', s)
  const updateStat = (i, next) => setStats(stats.map((s, j) => (j === i ? next : s)))
  const removeStat = (i) => setStats(stats.filter((_, j) => j !== i))
  const addStat = () => setStats([...stats, { value: '', label: '' }])

  const cta = profile.cta || {}
  const setCta = (key, v) => setProfile('cta', { ...cta, [key]: v })

  return (
    <EditorShell
      title="About Section"
      description="The homepage intro plus the full profile-page bio."
      draft={draft}
    >
      {/* Homepage About ------------------------------------------------------ */}
      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-4">Homepage About</h3>

        <Field label="Eyebrow (small label above heading)">
          <TextInput value={value.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
        </Field>

        <Field label="Heading">
          <TextInput value={value.heading} onChange={(e) => set('heading', e.target.value)} />
        </Field>

        <Field label="Paragraphs" hint="Separate paragraphs with a blank line between them.">
          <TextArea
            rows={6}
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
      </Card>

      {/* Profile-page bio ---------------------------------------------------- */}
      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-1">Profile Page — Bio</h3>
        <p className="text-white/55 text-xs mb-4">
          The hiring-manager intro shown on your shareable profile page (/#/profile). Separate from the homepage About above.
        </p>

        <Field label="Eyebrow">
          <TextInput value={profile.eyebrow || ''} onChange={(e) => setProfile('eyebrow', e.target.value)} />
        </Field>

        <Field label="Heading">
          <TextInput value={profile.heading || ''} onChange={(e) => setProfile('heading', e.target.value)} />
        </Field>

        <Field label="Paragraphs" hint="Separate paragraphs with a blank line between them.">
          <TextArea
            rows={8}
            value={(profile.paragraphs || []).join('\n\n')}
            onChange={(e) => setProfile('paragraphs', e.target.value.split(/\n\s*\n/))}
            placeholder="Write your profile bio here…"
          />
        </Field>

        <StringListEditor
          label="Quick facts"
          hint="Short chips shown under the bio (e.g. location, availability)."
          items={profile.quickFacts}
          onChange={(v) => setProfile('quickFacts', v)}
          placeholder="e.g. Based in the NJ / Philadelphia area"
        />
      </Card>

      {/* Profile stat cards -------------------------------------------------- */}
      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-1">Profile Page — Stat Cards</h3>
        <p className="text-white/55 text-xs mb-4">
          The metric cards beside your bio. Use a short value and a one-line label.
        </p>

        <div className="space-y-3">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-28 flex-shrink-0">
                <Field label="Value">
                  <TextInput
                    value={stat.value || ''}
                    onChange={(e) => updateStat(i, { ...stat, value: e.target.value })}
                    placeholder="462%"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Label">
                  <TextInput
                    value={stat.label || ''}
                    onChange={(e) => updateStat(i, { ...stat, label: e.target.value })}
                    placeholder="Instagram view growth at the NJ Chamber"
                  />
                </Field>
              </div>
              <button
                onClick={() => removeStat(i)}
                className="text-red-400/60 hover:text-red-400 p-2 mt-7"
                title="Remove stat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <Button variant="ghost" onClick={addStat} className="mt-3">
          <Plus size={15} /> Add stat
        </Button>
      </Card>

      {/* Profile CTA --------------------------------------------------------- */}
      <Card>
        <h3 className="text-white font-semibold mb-1">Profile Page — Call to Action</h3>
        <p className="text-white/55 text-xs mb-4">
          The closing section at the bottom of the profile page. The action buttons use your contact details, résumé, and booking link from Settings.
        </p>

        <Field label="CTA heading">
          <TextInput value={cta.heading || ''} onChange={(e) => setCta('heading', e.target.value)} />
        </Field>

        <Field label="CTA subtext">
          <TextArea
            rows={3}
            value={cta.subtext || ''}
            onChange={(e) => setCta('subtext', e.target.value)}
            placeholder="A short line inviting recruiters to reach out…"
          />
        </Field>
      </Card>
    </EditorShell>
  )
}
