import React from 'react';
import { Layout, Smartphone, Database, Zap, Shield, Search, Cloud, Layers, Terminal } from 'lucide-react';

const services = [
  {
    title: 'Web Application Development',
    description: 'Custom, high-performance SPAs built with React and modern tech stacks.',
    icon: Layout,
  },
  {
    title: 'Mobile App Engineering',
    description: 'Native and hybrid mobile solutions for Android and iOS using Java/Kotlin.',
    icon: Smartphone,
  },
  {
    title: 'Backend & APIs',
    description: 'Robust server-side logic and database architecture using Node.js and Prisma.',
    icon: Database,
  },
  {
    title: 'Workflow Automation',
    description: 'Custom automations with n8n and Node.js to streamline business processes.',
    icon: Zap,
  },
  {
    title: 'Security & Optimization',
    description: 'Ensuring your systems are secure, fast, and ready for production scale.',
    icon: Shield,
  },
  {
    title: 'SEO & Performance',
    description: 'Optimizing web presence for speed and search engine visibility.',
    icon: Search,
  },
  {
    title: 'Cloud Infrastructure',
    description: 'Scalable cloud deployment and DevOps practices for reliability.',
    icon: Cloud,
  },
  {
    title: 'System Integration',
    description: 'Connecting disparate services into a cohesive digital ecosystem.',
    icon: Layers,
  },
  {
    title: 'Technical Consulting',
    description: 'Expert guidance on architecture, tech stack selection, and strategy.',
    icon: Terminal,
  },
];

const ServicesGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <div
          key={index}
          className="group p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
            <service.icon className="w-7 h-7 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
            {service.title}
          </h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            {service.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ServicesGrid;
