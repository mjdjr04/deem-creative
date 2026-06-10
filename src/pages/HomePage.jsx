import Hero from '../components/Hero'
import About from '../components/About'
import FeaturedWork from '../components/FeaturedWork'
import Experience from '../components/Experience'
import Skills from '../components/Skills'
import ConsultCTA from '../components/ConsultCTA'

export default function HomePage({ onProjectSelect }) {
  return (
    <>
      <section id="home">
        <Hero />
      </section>
      <section id="about">
        <About />
      </section>
      <FeaturedWork onProjectSelect={onProjectSelect} />
      <Experience />
      <Skills />
      <ConsultCTA />
    </>
  )
}
