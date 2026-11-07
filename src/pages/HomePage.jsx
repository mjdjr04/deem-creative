import Hero from '../components/Hero'
import VideoShowcase from '../components/VideoShowcase'
import BuiltForBGCCC from '../components/BuiltForBGCCC'
import About from '../components/About'
import ExperienceHighlights from '../components/ExperienceHighlights'
import Skills from '../components/Skills'
import { SHOWCASE } from '../data/showcase'

export default function HomePage({ onProjectSelect }) {
  return (
    <>
      <section id="home">
        <Hero />
      </section>
      <VideoShowcase items={SHOWCASE} onProjectSelect={onProjectSelect} />
      <BuiltForBGCCC onProjectSelect={onProjectSelect} />
      <section id="about">
        <About />
      </section>
      <ExperienceHighlights />
      <Skills />
    </>
  )
}
