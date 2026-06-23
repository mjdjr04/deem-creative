import { Paperclip } from 'lucide-react'

// Renders a project's media inline (image, embedded or uploaded video, or a
// PDF attachment link). Shared by the profile page's expandable project cards.
export default function ProjectMediaInline({ project }) {
  const { mediaType, mediaUrl, mediaAlt, mediaCaption, attachment, attachmentLabel, title } = project

  if (mediaType === 'video' && mediaUrl) {
    const isFileVideo = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(mediaUrl)
    return (
      <figure>
        <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ paddingTop: '56.25%' }}>
          {isFileVideo ? (
            <video src={mediaUrl} controls className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            <iframe
              src={mediaUrl}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          )}
        </div>
        {mediaCaption && <figcaption className="text-white/55 text-xs mt-2">{mediaCaption}</figcaption>}
      </figure>
    )
  }

  if (mediaType === 'image' && mediaUrl) {
    return (
      <figure>
        <img src={mediaUrl} alt={mediaAlt || title} className="w-full rounded-lg border border-brand-border object-cover" />
        {mediaCaption && <figcaption className="text-white/55 text-xs mt-2">{mediaCaption}</figcaption>}
      </figure>
    )
  }

  if (mediaType === 'attachment' && attachment) {
    return (
      <a
        href={attachment}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-brand-border text-brand-light text-sm hover:border-brand-accent hover:text-white transition-colors"
      >
        <Paperclip size={15} /> {attachmentLabel || 'View attachment (PDF)'}
      </a>
    )
  }

  return null
}
