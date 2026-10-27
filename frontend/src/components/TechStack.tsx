import React from 'react';
import { Smartphone, Cpu, Zap, Globe, Code2, Database } from 'lucide-react';

const technologies = [
  { name: 'Android (Java/Kotlin)', icon: Smartphone, level: 'Expert', color: 'text-green-500' },
  { name: 'Performance Computing', icon: Cpu, level: 'Advanced', color: 'text-purple-500' },
  { name: 'Automation (n8n/Node.js)', icon: Zap, level: 'Expert', color: 'text-yellow-500' },
  { name: 'Fullstack React', icon: Globe, level: 'Expert', color: 'text-blue-500' },
  { name: 'Prisma ORM', icon: Database, level: 'Expert', color: 'text-cyan-500' },
  { name: 'Clean Architecture', icon: Code2, level: 'Advanced', color: 'text-gray-400' },
];

const TechStack: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {technologies.map((tech, index) => (
        <div 
          key={index}
          className="flex items-center gap-4 p-6 rounded-xl bg-black border border-white/5 hover:border-blue-500/20 transition-all group"
        >
          <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <tech.icon className={`w-6 h-6 ${tech.color}`} />
          </div>
          <div>
            <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{tech.name}</h4>
            <span className="text-xs text-gray-500 uppercase tracking-tighter">{tech.level}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechStack;
