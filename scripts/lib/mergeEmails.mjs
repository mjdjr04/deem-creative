// Patch only the consultation-related booking email fields in the stored
// `emails` draft. A field is rewritten only when it still equals the OLD
// default; if an admin edited it to anything else it is left alone and
// reported in `skipped`.

export const EMAIL_KEYS = ['confirmation', 'reminderDayBefore', 'reminderDayOf']
export const EMAIL_FIELDS = ['subject', 'intro']

// Wording shipped before the "Creative Consult" rename (commit 6fa11dd~1).
export const OLD_EMAIL_DEFAULTS = {
  confirmation: {
    subject: "You're booked — Deem Creative Consultation",
    intro: 'Thanks for scheduling a consultation with Deem Creative. Here are the details:',
  },
  reminderDayBefore: {
    subject: 'Reminder: your Deem Creative consultation is tomorrow',
    intro: 'A friendly reminder that your consultation with Deem Creative is tomorrow:',
  },
  reminderDayOf: {
    subject: 'Reminder: your Deem Creative consultation is today',
    intro: 'A friendly reminder that your consultation with Deem Creative is today:',
  },
}

export function mergeEmails(existing, oldDefaults, newDefaults) {
  const value = JSON.parse(JSON.stringify(existing ?? {}))
  const changed = []
  const skipped = []

  for (const key of EMAIL_KEYS) {
    for (const field of EMAIL_FIELDS) {
      const path = `${key}.${field}`
      const current = value[key]?.[field]
      const from = oldDefaults[key]?.[field]
      const to = newDefaults[key]?.[field]
      if (current === undefined || current === to) continue // nothing stored, or already new
      if (current === from) {
        value[key][field] = to
        changed.push({ path, from, to })
      } else {
        skipped.push({ path, value: current })
      }
    }
  }
  return { value, changed, skipped }
}
