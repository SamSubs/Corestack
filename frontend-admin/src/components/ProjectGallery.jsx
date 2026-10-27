import React from 'react';
import { ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const GitHub = LucideIcons.Github || LucideIcons.GitHub || LucideIcons.Code;

const projectsList = [
  {
    title: 'TradingView Auto-Analyzer',
    description: 'Agente automatizado via n8n para captura e análise técnica de gráficos financeiros em tempo real.',
    tech: ['n8n', 'Node.js', 'API', 'Automação'],
    image: 'https://images.unsplash.com/photo-1611974717482-4828c3ea210d?auto=format&fit=crop&q=80&w=800',
    link: '#',
  },
  {
    title: 'Android System Sync',
    description: 'Solução de integração cross-platform para acesso a sistemas de arquivos distribuídos via dispositivos mobile.',
    tech: ['Android', 'Java', 'Sistemas Distribuídos', 'Cloud'],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
    link: '#',
  },
  {
    title: 'Hub de Análise Financeira',
    description: 'Dashboard complexo para monitoramento de ativos da B3 e Cripto com alertas em tempo real.',
    tech: ['React', 'WebSocket', 'Prisma', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    link: '#',
  },
];

const ProjectGallery = ({ projects = projectsList }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects?.map((project, index) => (
        <div 
          key={index}
          className="group relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-all hover:border-[#0070f3]/30"
        >
          <div className="aspect-video overflow-hidden">
            <img 
              src={project.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800'} 
              alt={project.title || project.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
              loading="lazy"
            />
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#0070f3] transition-colors">
              {project.title || project.name}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech?.map(t => (
                <span key={t} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 rounded-md">
                  {t}
                </span>
              )) || project.techStack?.map(t => (
                <span key={t} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 rounded-md">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a href={project.link || '#'} className="flex items-center gap-2 text-sm font-bold text-[#0070f3] hover:text-blue-400 transition-colors">
                <ExternalLink className="w-4 h-4" />
                Estudo de Caso
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <GitHub className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )) || <p className="text-center text-gray-500 py-12 col-span-full">Carregando projetos...</p>}
    </div>
  );
};

export default ProjectGallery;
