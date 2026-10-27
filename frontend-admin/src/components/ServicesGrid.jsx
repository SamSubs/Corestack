import React from 'react';
import { Smartphone, Cpu, Zap, Shield, Search, Cloud, Layers, Terminal, Layout } from 'lucide-react';

const servicesList = [
  {
    title: 'Automação de Processos (n8n & Node.js)',
    description: 'Automações de workflow customizadas e de alta escala para otimizar fluxos de dados e lógica de negócios complexa.',
    icon: Zap,
  },
  {
    title: 'Desenvolvimento Mobile Nativo (Android/Java)',
    description: 'Engenharia mobile de alta performance focada em otimização de baixo nível e sinergia com o hardware.',
    icon: Smartphone,
  },
  {
    title: 'Sistemas de Análise Financeira (B3/Cripto)',
    description: 'Agentes e dashboards customizados para monitoramento em tempo real de dados do mercado de capitais e criptoativos.',
    icon: Layers,
  },
  {
    title: 'Sistemas de Backend & APIs',
    description: 'Arquiteturas de servidor robustas e seguras construídas para alta concorrência e integridade de dados.',
    icon: Cpu,
  },
  {
    title: 'Hardening de Infraestrutura',
    description: 'Implementações de segurança de ponta a ponta para proteger sistemas contra ameaças digitais modernas.',
    icon: Shield,
  },
  {
    title: 'Escalabilidade em Nuvem',
    description: 'Design de ecossistemas resilientes em nuvem que crescem perfeitamente com sua base de usuários.',
    icon: Cloud,
  },
];

const ServicesGrid = ({ services = servicesList }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services?.map((service, index) => (
        <div
          key={index}
          className="group p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#0070f3]/30 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="w-14 h-14 rounded-xl bg-[#0070f3]/10 flex items-center justify-center mb-6 group-hover:bg-[#0070f3]/20 transition-colors">
            {service.icon ? <service.icon className="w-7 h-7 text-[#0070f3]" /> : <Zap className="w-7 h-7 text-[#0070f3]" />}
          </div>
          <h3 className="text-xl font-bold mb-4 text-white group-hover:text-[#0070f3] transition-colors">
            {service.title || service.name}
          </h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            {service.description}
          </p>
        </div>
      )) || <p className="text-center text-gray-500 py-12 col-span-full">Carregando serviços...</p>}
    </div>
  );
};

export default ServicesGrid;
