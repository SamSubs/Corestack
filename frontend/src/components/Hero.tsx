import React from 'react';
import { ArrowRight, Code2, Cpu, Globe } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-fade-in">
          <Globe className="w-4 h-4" />
          <span>Available for Global Projects</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8">
          <span className="block text-white">Engineering &</span>
          <span className="block bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent">
            Digital Solutions
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12 leading-relaxed">
          Building high-performance applications, custom automations, and scalable digital ecosystems 
          with precision and technical excellence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#services"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            Explore Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            Get a Quote
          </a>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
          <div className="flex flex-col items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-400" />
            <span className="text-xs uppercase tracking-widest">Clean Architecture</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-400" />
            <span className="text-xs uppercase tracking-widest">Performance First</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            <span className="text-xs uppercase tracking-widest">Scalable Systems</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="w-6 h-6 text-blue-400" />
            <span className="text-xs uppercase tracking-widest">Future Proof</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
