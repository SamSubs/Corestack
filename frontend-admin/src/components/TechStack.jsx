import React from 'react';
import { Smartphone, Cpu, Zap, Globe, Code, Database } from 'lucide-react';

const technologiesList = [
  { name: 'Android (Java/Kotlin)', icon: Smartphone, level: 'Expert', color: 'text-green-500' },
  { name: 'Computação de Alta Performance', icon: Cpu, level: 'Avançado', color: 'text-purple-500' },
  { name: 'Automação (n8n/Node.js)', icon: Zap, level: 'Expert', color: 'text-yellow-500' },
  { name: 'Fullstack React', icon: Globe, level: 'Expert', color: 'text-[#0070f3]' },
  { name: 'Prisma ORM', icon: Database, level: 'Expert', color: 'text-cyan-500' },
  { name: 'Arquitetura Limpa', icon: Code, level: 'Avançado', color: 'text-gray-400' },
];

const TechStack = ({ technologies = technologiesList }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {technologies?.map((tech, index) => (
        <div 
          key={index}
          className="flex items-center gap-4 p-6 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-[#0070f3]/20 transition-all group"
        >
          <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {tech.icon ? <tech.icon className={`w-6 h-6 ${tech.color}`} /> : <Code className={`w-6 h-6 ${tech.color}`} />}
          </div>
          <div>
            <h4 className="font-bold text-white group-hover:text-[#0070f3] transition-colors">{tech.name}</h4>
            <span className="text-xs text-gray-500 uppercase tracking-tighter">{tech.level}</span>
          </div>
        </div>
      )) || <p className="text-center text-gray-500 py-12 col-span-full">Carregando stack...</p>}
    </div>
  );
};

export default TechStack;
