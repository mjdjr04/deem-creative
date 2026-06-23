import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, TextArea, Card } from '../../../components/admin/ui'

function EmailBlock({ title, data, onChange }) {
  const set = (key, v) => onChange({ ...data, [key]: v })
  return (
    <Card className="mb-6">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      <Field label="Subject line">
        <TextInput value={data.subject || ''} onChange={(e) => set('subject', e.target.value)} />
      </Field>
      <Field label="Heading" hint="The big line at the top of the email.">
        <TextInput value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} />
      </Field>
      <Field label="Intro" hint="The sentence before the meeting details (when / duration / format are added automatically below it).">
        <TextArea value={data.intro || ''} onChange={(e) => set('intro', e.target.value)} rows={2} />
      </Field>
    </Card>
  )
}

export default function EmailsEditor() {
  const draft = useSectionDraft('emails')
  const { value, setValue } = draft
  const set = (key, v) => setValue({ ...value, [key]: v })

  const recruiter = value.recruiter || {}
  const setRec = (key, v) => set('recruiter', { ...recruiter, [key]: v })

  return (
    <EditorShell
      title="Booking Emails"
      description="The confirmation and reminder emails sent when someone books a consultation or a hiring call."
      draft={draft}
    >
      <div className="mb-6 rounded-xl border border-brand-accent/40 bg-brand-navy/30 px-5 py-4 text-sm text-white/70">
        These power your Google Calendar booking emails. After editing, click <strong className="text-white">Save draft</strong> then
        <strong className="text-white"> Publish All Changes</strong> — the booking system reads the published version.
      </div>

      <h2 className="text-white font-bold text-lg mb-3">Consultation emails</h2>
      <EmailBlock title="Confirmation email (sent right after booking)" data={value.confirmation || {}} onChange={(v) => set('confirmation', v)} />
      <EmailBlock title="Reminder — day before" data={value.reminderDayBefore || {}} onChange={(v) => set('reminderDayBefore', v)} />
      <EmailBlock title="Reminder — day of" data={value.reminderDayOf || {}} onChange={(v) => set('reminderDayOf', v)} />

      <Card className="mb-10">
        <h3 className="text-white font-semibold mb-4">Shared lines (consultation emails)</h3>
        <Field label="Zoom note" hint="Shown when the client chose a Zoom meeting.">
          <TextArea value={value.zoomLine || ''} onChange={(e) => set('zoomLine', e.target.value)} rows={2} />
        </Field>
        <Field label="In-person note" hint="Shown when the client chose an in-person meeting.">
          <TextArea value={value.inPersonLine || ''} onChange={(e) => set('inPersonLine', e.target.value)} rows={2} />
        </Field>
        <Field label="Reschedule line">
          <TextInput value={value.rescheduleLine || ''} onChange={(e) => set('rescheduleLine', e.target.value)} />
        </Field>
        <Field label="Sign-off">
          <TextInput value={value.signoff || ''} onChange={(e) => set('signoff', e.target.value)} />
        </Field>
      </Card>

      <h2 className="text-white font-bold text-lg mb-3">Recruiter / hiring-call emails</h2>
      <EmailBlock title="Confirmation email (sent right after booking)" data={recruiter.confirmation || {}} onChange={(v) => setRec('confirmation', v)} />
      <EmailBlock title="Reminder — day before" data={recruiter.reminderDayBefore || {}} onChange={(v) => setRec('reminderDayBefore', v)} />
      <EmailBlock title="Reminder — day of" data={recruiter.reminderDayOf || {}} onChange={(v) => setRec('reminderDayOf', v)} />

      <Card>
        <h3 className="text-white font-semibold mb-4">Shared lines (recruiter emails)</h3>
        <Field label="Zoom note" hint="Shown when they chose a Zoom call.">
          <TextArea value={recruiter.zoomLine || ''} onChange={(e) => setRec('zoomLine', e.target.value)} rows={2} />
        </Field>
        <Field label="Phone note" hint="Shown when they chose a phone call.">
          <TextArea value={recruiter.phoneLine || ''} onChange={(e) => setRec('phoneLine', e.target.value)} rows={2} />
        </Field>
        <p className="text-white/55 text-xs">Reschedule line and sign-off are shared with the consultation emails above.</p>
      </Card>
    </EditorShell>
  )
}
