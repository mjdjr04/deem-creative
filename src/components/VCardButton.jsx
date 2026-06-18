import { Contact as ContactIcon } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { downloadVCard, hasVCard } from '../lib/vcard'

// Downloads the site owner's contact card (.vcf). Renders nothing until the
// vCard has at least a name + phone/email filled in (in admin → Settings).
export default function VCardButton({
  className = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-mid border border-brand-border text-white/60 hover:text-white hover:border-brand-accent transition-colors text-xs font-medium',
  label = 'Save Contact',
}) {
  const { settings, about } = useContent()
  // Enrich the card with the headshot (photo) and LinkedIn from the About data.
  const v = { ...settings.vcard, photo: about.headshot, linkedin: about.linkedinUrl }
  if (!hasVCard(v)) return null
  return (
    <button type="button" onClick={() => downloadVCard(v)} className={className} aria-label="Download contact card">
      <ContactIcon size={14} aria-hidden="true" />
      {label}
    </button>
  )
}
