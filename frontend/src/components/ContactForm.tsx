import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
          <input
            type="text"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
          <input
            type="email"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
        <input
          type="text"
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Project Inquiry"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
        <textarea
          rows={5}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
          placeholder="Tell me about your project..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          status === 'loading' 
            ? 'bg-blue-600/50 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {status === 'loading' ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Message
          </>
        )}
      </button>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-4 rounded-xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Message sent successfully! I will get back to you soon.</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          <span>Something went wrong. Please try again or contact me directly.</span>
        </div>
      )}
    </form>
  );
};

export default ContactForm;
