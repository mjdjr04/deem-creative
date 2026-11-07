// Dry-run / write / publish flow for syncing project records and the booking
// email wording into Supabase drafts. The Supabase client is injected as
// `store` so the flow is testable without a network:
//   store.readSections(sections) -> { [section]: { draft_data, updated_at } }
//   store.updateDraft(section, data, expectedUpdatedAt)
//   store.publishAll()

import { mergeProjects } from './mergeProjects.mjs'
import { mergeEmails } from './mergeEmails.mjs'

export class StaleWriteError extends Error {
  constructor(section, expected, actual) {
    super(
      `site_content.${section} changed since it was read (updated_at ${expected} -> ${actual}). ` +
        'Nothing was written. Re-run the dry run and try again.',
    )
    this.name = 'StaleWriteError'
    this.section = section
  }
}

const SECTIONS = ['projects', 'emails']
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function diffKeys(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].filter((k) => !same(a[k], b[k]))
}

function plan(rows, { projectDefaults, ids, emailsOld, emailsNew }) {
  for (const s of SECTIONS) {
    if (!rows[s] || rows[s].draft_data == null) throw new Error(`site_content row "${s}" has no draft_data; refusing to continue.`)
  }
  const projectsDraft = rows.projects.draft_data
  const items = projectsDraft.items ?? []
  const merged = mergeProjects(items, projectDefaults, ids)

  const perId = ids.map((id) => {
    const before = items.find((p) => p.id === id)
    const after = merged.find((p) => p.id === id)
    if (!after) return { id, action: 'missing-in-defaults' }
    if (!before) return { id, action: 'insert' }
    const fields = diffKeys(before, after)
    return { id, action: fields.length ? 'replace' : 'unchanged', fields }
  })
  const projectsChanged = !same(items, merged)

  const emails = mergeEmails(rows.emails.draft_data, emailsOld, emailsNew)
  const emailsChanged = emails.changed.length > 0

  return {
    projects: { changed: projectsChanged, perId, next: { ...projectsDraft, items: merged }, updatedAt: rows.projects.updated_at },
    emails: { changed: emailsChanged, changes: emails.changed, skipped: emails.skipped, next: emails.value, updatedAt: rows.emails.updated_at },
  }
}

function report(p, log) {
  log('projects (draft_data.items)')
  for (const r of p.projects.perId) {
    const detail = r.action === 'replace' ? ` (changed: ${r.fields.join(', ')})` : r.action === 'insert' ? ' (after boys-girls-clubs)' : ''
    log(`  ${r.action.padEnd(10)} ${r.id}${detail}`)
  }
  log('emails (draft_data, consultation wording only)')
  if (p.emails.changes.length === 0) log('  no changes')
  for (const c of p.emails.changes) log(`  update     ${c.path}\n             - ${c.from}\n             + ${c.to}`)
  for (const s of p.emails.skipped) log(`  LEFT ALONE ${s.path} (admin-edited, differs from old and new default): ${s.value}`)
}

export async function runSync({ store, projectDefaults, ids, emailsOld, emailsNew, write = false, publish = false, log = console.log }) {
  if (publish && !write) throw new Error('--publish requires --write.')

  const rows = await store.readSections(SECTIONS)
  const p = plan(rows, { projectDefaults, ids, emailsOld, emailsNew })
  report(p, log)

  if (!write) {
    log('\nDry run only. Re-run with --write to update the drafts (and --publish to go live).')
    return p
  }

  const todo = SECTIONS.filter((s) => p[s].changed)
  if (todo.length) {
    // Re-check just before writing: abort if anyone saved in the meantime.
    const fresh = await store.readSections(SECTIONS)
    for (const s of todo) {
      if (fresh[s]?.updated_at !== p[s].updatedAt) throw new StaleWriteError(s, p[s].updatedAt, fresh[s]?.updated_at)
    }
    for (const s of todo) {
      await store.updateDraft(s, p[s].next, p[s].updatedAt)
      log(`wrote draft_data for ${s}`)
    }
  } else {
    log('Nothing to write.')
  }

  if (publish) {
    await store.publishAll()
    log('published (publish_all)')
  }
  return p
}
