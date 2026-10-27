import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  subject: z.string().min(2, 'Assunto muito curto'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(500, 'Mensagem muito longa'),
});

const ContactForm = () => {
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach(issue => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
          <input
            type="text"
            required
            className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0070f3] transition-colors`}
            placeholder="Seu nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">E-mail</label>
          <input
            type="email"
            required
            className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0070f3] transition-colors`}
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Assunto</label>
        <input
          type="text"
          required
          className={`w-full bg-white/5 border ${errors.subject ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0070f3] transition-colors`}
          placeholder="Ex: Proposta de Projeto"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Mensagem</label>
        <textarea
          rows={5}
          required
          className={`w-full bg-white/5 border ${errors.message ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0070f3] transition-colors resize-none`}
          placeholder="Descreva brevemente sua necessidade..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        ></textarea>
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status === 'loading'
            ? 'bg-[#0070f3]/50 cursor-not-allowed'
            : 'bg-[#0070f3] hover:bg-blue-600 text-white'
          }`}
      >
        {status === 'loading' ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Enviar Mensagem
          </>
        )}
      </button>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-4 rounded-xl">
          <CheckCircle2 className="w-5 h-5" />
          <span>Mensagem enviada com sucesso! Entraremos em contato em breve.</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl">
          <AlertCircle className="w-5 h-5" />
          <span>Erro ao enviar mensagem. Por favor, tente novamente.</span>
        </div>
      )}
    </form>
  );
};

export default ContactForm;
