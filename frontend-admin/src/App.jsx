import React, { Suspense, lazy, Component } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesGrid from './components/ServicesGrid';
import TechStack from './components/TechStack';
import ContactForm from './components/ContactForm';

// Simple Error Boundary for Fallback
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-900/20 rounded-xl border border-red-500/30 m-4">
          <h2 className="text-xl font-bold text-red-500">Erro ao Carregar Componente</h2>
          <p className="text-gray-400">Ocorreu um problema ao renderizar esta seção.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProjectGallery = lazy(() => import('./components/ProjectGallery'));

const App = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0070f3]/30">
      <Header />
      
      <main>
        <ErrorBoundary>
          <section id="home">
            <Hero />
          </section>
        </ErrorBoundary>

        <ErrorBoundary>
          <section id="services" className="py-24 px-4 sm:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">
                Serviços <span className="text-[#0070f3]">Especializados</span>
              </h2>
              <ServicesGrid />
            </div>
          </section>
        </ErrorBoundary>

        <ErrorBoundary>
          <section id="tech-stack" className="py-24 bg-[#0A0A0A]">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">
                Stack <span className="text-[#0070f3]">Técnica</span>
              </h2>
              <TechStack />
            </div>
          </section>
        </ErrorBoundary>

        <ErrorBoundary>
          <section id="portfolio" className="py-24 px-4 sm:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">
                Engenharia de <span className="text-[#0070f3]">Destaque</span>
              </h2>
              <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-500">Carregando portfólio...</div>}>
                <ProjectGallery />
              </Suspense>
            </div>
          </section>
        </ErrorBoundary>

        <ErrorBoundary>
          <section id="contact" className="py-24 bg-[#0A0A0A]">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">
                Iniciar uma <span className="text-[#0070f3]">Colaboração</span>
              </h2>
              <ContactForm />
            </div>
          </section>
        </ErrorBoundary>
      </main>

      <footer className="py-16 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Core Stack Professional Engineering. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
