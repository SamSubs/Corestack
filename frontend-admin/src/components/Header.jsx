import React, { useState, useEffect } from 'react';
import { Menu, X, Layers } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Serviços', href: '#services' },
    { name: 'Portfólio', href: '#portfolio' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-[#0070f3] flex items-center justify-center transition-all group-hover:scale-110">
            <Layers className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white font-mono">
            CORE<span className="text-[#0070f3]">STACK</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks?.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          )) || null}
          <a
            href="#contact"
            className="px-5 py-2.5 bg-[#0070f3] hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all"
          >
            Entre em contato
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0A0A0A] border-b border-white/10 py-8 px-4">
          <nav className="flex flex-col gap-6 items-center">
            {navLinks?.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            )) || null}
            <a
              href="#contact"
              className="w-full text-center py-4 bg-[#0070f3] text-white font-bold rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            >
              Entre em contato
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
