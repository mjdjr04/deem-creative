import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useContent } from '../context/ContentContext'
import { useConsent } from '../context/ConsentContext'

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function Section({ title, children }) {
  return (
    <motion.section variants={reveal} className="mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-white/65 text-sm sm:text-base leading-relaxed">{children}</div>
    </motion.section>
  )
}

export default function PrivacyPage() {
  const settings = useContent().settings
  const email = settings.email || 'michael@deemcreative.com'
  const { consent, analyticsAllowed, openBanner } = useConsent()

  useEffect(() => {
    document.title = 'Privacy & Cookie Policy — Deem Creative'
  }, [])

  const updated = 'June 2026'

  return (
    <div className="bg-brand-dark min-h-screen pt-28 pb-24">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.p variants={reveal} className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
          Legal
        </motion.p>
        <motion.h1 variants={reveal} className="text-3xl md:text-4xl font-bold text-white mb-2">
          Privacy &amp; Cookie Policy
        </motion.h1>
        <motion.p variants={reveal} className="text-white/55 text-sm mb-12">Last updated: {updated}</motion.p>

        <Section title="Overview">
          <p>
            This policy explains what information Deem Creative (“we,” “us”) collects when you visit
            this website, how we use it, and the choices you have. We aim to comply with U.S. privacy
            laws, including the California Consumer Privacy Act (CCPA/CPRA) and the California Online
            Privacy Protection Act (CalOPPA).
          </p>
        </Section>

        <Section title="Information we collect">
          <p>We only collect what we need to operate the site and respond to you:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-white/80">Information you provide</strong> — when you submit the contact form, book a call, or chat with the assistant, we receive details such as your name, email, phone, organization, and message.</li>
            <li><strong className="text-white/80">Analytics data (optional)</strong> — if you accept analytics cookies, we collect anonymous usage data such as pages viewed, referring site, device and browser type, and approximate location. This helps us understand how the site is used.</li>
            <li><strong className="text-white/80">Essential storage</strong> — we store your cookie choice and, for the site owner only, a secure login session.</li>
          </ul>
        </Section>

        <Section title="Cookies & analytics">
          <p>
            Essential cookies/storage are always active because the site needs them to function (for
            example, remembering your consent choice). With your permission, we also use these
            analytics services:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-white/80">Deem Creative analytics</strong> — our own first-party, privacy-respecting measurement.</li>
            <li><strong className="text-white/80">Google Analytics 4</strong> — provided by Google; may set cookies and process data per Google’s policies.</li>
            <li><strong className="text-white/80">Cloudflare Web Analytics</strong> — cookieless traffic measurement.</li>
          </ul>
          <p>
            None of these run until you choose “Accept all.” You can change your mind at any time:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={openBanner}
              className="px-4 py-2 rounded-lg border border-brand-accent text-white text-sm font-semibold hover:bg-brand-navy transition-colors"
            >
              Cookie settings
            </button>
            <span className="text-white/55 text-sm">
              Current choice:{' '}
              <span className="text-white">
                {consent === null ? 'Not set' : analyticsAllowed ? 'Analytics accepted' : 'Non-essential declined'}
              </span>
            </span>
          </div>
        </Section>

        <Section title="How we use your information">
          <p>We use the information to respond to inquiries, schedule and confirm calls, send booking confirmations and reminders, improve the site, and keep it secure. We do not sell your personal information.</p>
        </Section>

        <Section title="Sharing">
          <p>
            We share data only with the service providers that run this site on our behalf — such as
            Supabase (database and form/booking storage), Google (Calendar, email delivery, and
            Analytics if enabled), and Cloudflare (analytics if enabled). They process data solely to
            provide their services.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Depending on where you live, you may have the right to access, correct, or delete your
            personal information, and to opt out of analytics. To make a request, email us at{' '}
            <a href={`mailto:${email}`} className="text-brand-light underline hover:text-white">{email}</a>.
            You can opt out of analytics here at any time using “Cookie settings” above.
          </p>
        </Section>

        <Section title="Data retention & security">
          <p>We keep information only as long as needed for the purposes above, and we take reasonable measures to protect it. No method of transmission or storage is 100% secure.</p>
        </Section>

        <Section title="Children’s privacy">
          <p>This site is not directed to children under 13, and we do not knowingly collect their personal information.</p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Email{' '}
            <a href={`mailto:${email}`} className="text-brand-light underline hover:text-white">{email}</a>.
          </p>
        </Section>
      </motion.div>
    </div>
  )
}
