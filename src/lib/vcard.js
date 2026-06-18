// Build and download a vCard (.vcf) from contact fields.

// vCard values must escape commas, semicolons, and newlines.
const esc = (s = '') => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

// Full display name from first/last (falls back to legacy fullName).
export function fullName(v = {}) {
  return [v.firstName, v.lastName].filter(Boolean).join(' ') || v.fullName || ''
}

export function buildVCard(v = {}) {
  const name = fullName(v)
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  if (name) {
    // N: Family;Given;Additional;Prefix;Suffix
    lines.push(`N:${esc(v.lastName || '')};${esc(v.firstName || '')};;;`)
    lines.push(`FN:${esc(name)}`)
  }
  if (v.company || v.title) lines.push(`ORG:${esc(v.company || '')}`)
  if (v.title) lines.push(`TITLE:${esc(v.title)}`)
  if (v.phone) lines.push(`TEL;TYPE=CELL:${esc(v.phone)}`)
  if (v.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(v.email)}`)
  if (v.website) lines.push(`URL:${esc(v.website)}`)
  if (v.linkedin) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${esc(v.linkedin)}`)
    lines.push(`item1.URL:${esc(v.linkedin)}`)
    lines.push('item1.X-ABLabel:LinkedIn')
  }
  if (v.photo) lines.push(`PHOTO;VALUE=URI:${esc(v.photo)}`)
  if (v.address) lines.push(`ADR;TYPE=WORK:;;${esc(v.address)};;;;`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

export function downloadVCard(v = {}) {
  const blob = new Blob([buildVCard(v)], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(fullName(v) || 'contact').replace(/\s+/g, '-')}.vcf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// True if there's enough info to be worth offering a download.
export function hasVCard(v = {}) {
  return Boolean(fullName(v) && (v.phone || v.email))
}
