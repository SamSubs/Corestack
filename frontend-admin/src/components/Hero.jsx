import React from 'react';
import { ArrowRight, Code, Cpu, Globe, ShieldCheck } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-black">
      {/* Engineering Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#0070f3 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0070f3]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#0070f3]/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070f3]/10 border border-[#0070f3]/20 text-[#0070f3] text-sm font-medium mb-8">
          <ShieldCheck className="w-4 h-4" />
          <span>Protegendo Dados & Automatizando o Crescimento</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8">
          <span className="block text-white">Engenharia de Sistemas &</span>
          <span className="block bg-gradient-to-r from-[#0070f3] to-blue-400 bg-clip-text text-transparent">
            Automação Inteligente
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-gray-400 text-lg md:text-xl mb-12 leading-relaxed">
          Construindo a fundação para a próxima geração de soluções digitais. 
          Foco em arquiteturas de alta performance, engenharia nativa e automação inteligente de processos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#services"
            className="w-full sm:w-auto px-8 py-4 bg-[#0070f3] hover:bg-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            Ver Serviços
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#portfolio"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            Ver projetos
          </a>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
          <div className="flex flex-col items-center gap-2">
            <Code className="w-6 h-6 text-[#0070f3]" />
            <span className="text-xs uppercase tracking-widest text-white font-mono">Infraestrutura</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Cpu className="w-6 h-6 text-[#0070f3]" />
            <span className="text-xs uppercase tracking-widest text-white font-mono">Performance</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Globe className="w-6 h-6 text-[#0070f3]" />
            <span className="text-xs uppercase tracking-widest text-white font-mono">Integração</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#0070f3]" />
            <span className="text-xs uppercase tracking-widest text-white font-mono">Segurança</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
