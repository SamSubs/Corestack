import React, { Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesGrid from './components/ServicesGrid';
import TechStack from './components/TechStack';
import ContactForm from './components/ContactForm';

const ProjectGallery = lazy(() => import('./components/ProjectGallery'));

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-blue-500/30">
      <Header />
      
      <main>
        <section id="home">
          <Hero />
        </section>

        <section id="services" className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Our <span className="text-blue-500">Services</span>
            </h2>
            <ServicesGrid />
          </div>
        </section>

        <section id="tech-stack" className="py-20 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Tech <span className="text-blue-500">Expertise</span>
            </h2>
            <TechStack />
          </div>
        </section>

        <section id="portfolio" className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Featured <span className="text-blue-500">Projects</span>
            </h2>
            <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-500">Loading gallery...</div>}>
              <ProjectGallery />
            </Suspense>
          </div>
        </section>

        <section id="contact" className="py-20 bg-[#0A0A0A]">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Get in <span className="text-blue-500">Touch</span>
            </h2>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Professional Portfolio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
