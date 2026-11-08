import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero'
import { getWhitepaper } from '../data/whitepaper'

const P = ({ children }) => <p className="text-white/75 text-lg leading-relaxed mb-5">{children}</p>

function Section({ s }) {
  return (
    <section id={s.id} className="scroll-mt-24 mb-14">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-5 leading-snug">{s.heading}</h2>
      {(s.paragraphs || []).map((p, i) => <P key={i}>{p}</P>)}
      {s.bullets && (
        <ul className="mb-5 space-y-3">
          {s.bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-white/75 text-lg leading-relaxed">
              <span aria-hidden="true" className="mt-3 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-light" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {s.numbered && (
        <ol className="mb-5 space-y-3 list-decimal pl-6 marker:text-brand-light marker:font-semibold">
          {s.numbered.map((b, i) => (
            <li key={i} className="text-white/75 text-lg leading-relaxed pl-1">{b}</li>
          ))}
        </ol>
      )}
      {s.table && (
        <div className="overflow-x-auto rounded-xl border border-brand-border mb-5">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-mid">
              <tr>
                {s.table.columns.map((c) => (
                  <th key={c} scope="col" className="px-4 py-3 text-white font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((row) => (
                <tr key={row[0]} className="border-t border-brand-border align-top">
                  <th scope="row" className="px-4 py-3 text-brand-light font-semibold whitespace-nowrap">{row[0]}</th>
                  {row.slice(1).map((cell, i) => (
                    <td key={i} className="px-4 py-3 text-white/70 leading-relaxed min-w-[12rem]">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(s.after || []).map((p, i) => <P key={i}>{p}</P>)}
    </section>
  )
}

export default function WhitepaperPage() {
  const { slug } = useParams()
  const paper = getWhitepaper(slug)

  useEffect(() => {
    if (paper) document.title = `${paper.title} | Michael Deem Jr.`
  }, [paper])

  if (!paper) return <Navigate to="/" replace />

  return (
    <>
      <PageHero eyebrow="Whitepaper" title={paper.title}>
        {paper.subtitle}
      </PageHero>

      <article className="bg-brand-dark py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white/55 text-sm mb-10">
            {paper.byline} · {paper.date}
          </p>

          <div className="rounded-2xl bg-brand-mid border border-brand-border p-6 md:p-8 mb-14">
            <h2 className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">Summary</h2>
            {paper.summary.map((p, i) => (
              <p key={i} className="text-white/80 text-lg leading-relaxed mb-4 last:mb-0">{p}</p>
            ))}
          </div>

          {paper.sections.map((s) => <Section key={s.id} s={s} />)}

          <div className="border-t border-brand-border pt-10">
            <h2 className="text-white font-semibold text-lg mb-3">About the author</h2>
            <P>{paper.about}</P>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                to="/contact#message"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-brand-dark font-semibold text-sm hover:bg-brand-light hover:text-white transition-colors"
              >
                Let’s talk about your event <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/work/bgccc-gala"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-brand-accent text-white font-semibold text-sm hover:bg-brand-navy transition-colors"
              >
                See the gala case study <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
