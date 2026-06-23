import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, TextArea, FileUpload, Card } from '../../../components/admin/ui'

export default function SettingsEditor() {
  const draft = useSectionDraft('settings')
  const { value, setValue } = draft
  const set = (key, v) => setValue({ ...value, [key]: v })

  return (
    <EditorShell
      title="Settings & Résumé"
      description="Contact details, links, and your downloadable résumé."
      draft={draft}
    >
      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-4">Branding</h3>
        <FileUpload
          label="Logo"
          hint="Shown in the navbar and footer. PNG or SVG with a transparent background works best. Leave empty to use the default logo."
          value={value.logo}
          onChange={(v) => set('logo', v)}
          folder="branding"
          accept="image/*"
        />
      </Card>

      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-4">Contact & Links</h3>
        <Field label="Contact email">
          <TextInput value={value.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Instagram URL">
            <TextInput value={value.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} />
          </Field>
          <Field label="LinkedIn URL">
            <TextInput value={value.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} />
          </Field>
        </div>
        <Field label="Booking / consultation URL">
          <TextInput value={value.bookingUrl} onChange={(e) => set('bookingUrl', e.target.value)} />
        </Field>
        <Field label="Footer tagline">
          <TextArea value={value.tagline} onChange={(e) => set('tagline', e.target.value)} rows={2} />
        </Field>
      </Card>

      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-1">Contact Form</h3>
        <p className="text-white/55 text-xs mb-4">The message form on your Contact page. Submissions appear under “Messages.”</p>
        {(() => {
          const c = value.contact || {}
          const setC = (key, v) => set('contact', { ...c, [key]: v })
          return (
            <>
              <Field label="Form heading"><TextInput value={c.heading || ''} onChange={(e) => setC('heading', e.target.value)} /></Field>
              <Field label="Form subtext"><TextArea value={c.subtext || ''} onChange={(e) => setC('subtext', e.target.value)} rows={2} /></Field>
              <Field label="Formspree endpoint" hint="Paste your Formspree form URL to also get submissions emailed to you. Leave empty to use the Messages inbox only.">
                <TextInput value={c.formspreeEndpoint || ''} onChange={(e) => setC('formspreeEndpoint', e.target.value)} placeholder="https://formspree.io/f/xxxxxxx" />
              </Field>
            </>
          )
        })()}
      </Card>

      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-1">Contact Card (vCard)</h3>
        <p className="text-white/55 text-xs mb-4">Powers the “Save Contact” button. Fill in at least a name and a phone or email.</p>
        {(() => {
          const vc = value.vcard || {}
          const setVc = (key, v) => set('vcard', { ...vc, [key]: v })
          return (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name"><TextInput value={vc.firstName || ''} onChange={(e) => setVc('firstName', e.target.value)} /></Field>
                <Field label="Last name"><TextInput value={vc.lastName || ''} onChange={(e) => setVc('lastName', e.target.value)} /></Field>
              </div>
              <Field label="Title"><TextInput value={vc.title || ''} onChange={(e) => setVc('title', e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Company"><TextInput value={vc.company || ''} onChange={(e) => setVc('company', e.target.value)} /></Field>
                <Field label="Phone"><TextInput value={vc.phone || ''} onChange={(e) => setVc('phone', e.target.value)} placeholder="(555) 123-4567" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email"><TextInput value={vc.email || ''} onChange={(e) => setVc('email', e.target.value)} /></Field>
                <Field label="Website"><TextInput value={vc.website || ''} onChange={(e) => setVc('website', e.target.value)} /></Field>
              </div>
              <Field label="Address"><TextInput value={vc.address || ''} onChange={(e) => setVc('address', e.target.value)} /></Field>
            </>
          )
        })()}
      </Card>

      <Card>
        <h3 className="text-white font-semibold mb-4">Resume</h3>
        <FileUpload
          label="Resume file (PDF)"
          hint="Uploads a downloadable resume. A Resume button appears in your site footer when set."
          value={value.resumeUrl}
          onChange={(v) => set('resumeUrl', v)}
          folder="resume"
          accept="application/pdf"
          preview={false}
        />
        <Field label="Resume button label">
          <TextInput value={value.resumeLabel} onChange={(e) => set('resumeLabel', e.target.value)} />
        </Field>
      </Card>
    </EditorShell>
  )
}
