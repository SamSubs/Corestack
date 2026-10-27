import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    title: 'E-commerce Ecosystem',
    description: 'High-scale marketplace with real-time order tracking and secure payments.',
    tech: ['React', 'Node.js', 'Prisma', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800',
    link: '#',
  },
  {
    title: 'Kiosk Self-Service System',
    description: 'Interactive touch interface for restaurants with real-time attendant sync.',
    tech: ['Android', 'Java', 'WebSocket', 'Tailwind'],
    image: 'https://images.unsplash.com/photo-1556742049-04ff56f71517?auto=format&fit=crop&q=80&w=800',
    link: '#',
  },
  {
    title: 'Workflow Automation Engine',
    description: 'Custom n8n nodes and Node.js microservices for business process automation.',
    tech: ['n8n', 'Node.js', 'Docker', 'API'],
    image: 'https://images.unsplash.com/photo-1518433278988-2b2f197c7952?auto=format&fit=crop&q=80&w=800',
    link: '#',
  },
];

const ProjectGallery: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <div 
          key={index}
          className="group relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-all hover:border-blue-500/30"
        >
          <div className="aspect-video overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
              loading="lazy"
            />
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech.map(t => (
                <span key={t} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 rounded-md">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a href={project.link} className="flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors">
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectGallery;
