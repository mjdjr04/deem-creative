import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { DeemCreativeMark } from './DeemCreativeMark'

function CardMedia({ project }) {
  if (project.mediaType === 'video' && project.mediaUrl) {
    return (
      <div className="relative w-full overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={project.mediaUrl}
          title={project.title}
          allow="autoplay"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
        <div className="absolute bottom-3 left-3 pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-full bg-brand-dark/60 text-brand-light text-xs font-medium backdrop-blur-sm border border-brand-border/50">
            {project.category}
          </span>
        </div>
      </div>
    )
  }

  if (project.mediaType === 'image' && project.mediaUrl) {
    return (
      <div className="relative w-full aspect-video overflow-hidden">
        <img
          src={project.mediaUrl}
          alt={project.mediaAlt || project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-brand-dark/60 text-brand-light text-xs font-medium backdrop-blur-sm border border-brand-border/50">
            {project.category}
          </span>
        </div>
      </div>
    )
  }

  // Gradient placeholder
  return (
    <div
      className="relative w-full aspect-video flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${project.accentColor || '#112040'} 0%, #1A2E4A 100%)` }}
    >
      <DeemCreativeMark className="w-16 h-auto opacity-10 group-hover:opacity-15 transition-opacity" />
      <div className="absolute bottom-3 left-3">
        <span className="px-2.5 py-1 rounded-full bg-brand-dark/60 text-brand-light text-xs font-medium backdrop-blur-sm border border-brand-border/50">
          {project.category}
        </span>
      </div>
    </div>
  )
}

export default function ProjectCard({ project, onClick }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(project)}
      className="card-glow cursor-pointer rounded-2xl bg-card-gradient border border-brand-border overflow-hidden hover:border-brand-accent group flex flex-col h-full"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${project.title}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick(project)}
    >
      <CardMedia project={project} />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-base leading-snug group-hover:text-brand-light transition-colors">
            {project.title}
          </h3>
          <ExternalLink
            size={14}
            className="text-brand-border group-hover:text-brand-light transition-colors flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.brief}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-brand-light/70 text-xs font-medium">{project.client}</p>
          <p className="text-white/55 text-xs">{project.year}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-brand-surface/60 border border-brand-border/50 text-white/60 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
