import React, { useState } from 'react';
import { HelpCircle, Send, ChevronDown, Keyboard, Sparkles, Book } from 'lucide-react';
import toast from 'react-hot-toast';

const HelpPage: React.FC = () => {
  const [tab, setTab] = useState<'faq' | 'contact' | 'shortcuts' | 'changelog'>('faq');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const tabs = [
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
    { id: 'contact' as const, label: 'Contact', icon: Send },
    { id: 'shortcuts' as const, label: 'Shortcuts', icon: Keyboard },
    { id: 'changelog' as const, label: "What's New", icon: Sparkles },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Book className="w-6 h-6 text-angelina-500" /> Help & Support
      </h1>

      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-angelina-500 text-angelina-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'faq' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[
            { q: 'How do I create a new project?', a: 'Click the "New Project" button on the dashboard. Enter project details like name, client, and area. You can then add rooms and items.' },
            { q: 'How does AI extraction work?', a: 'Upload a 2D/3D design file to your project. Our AI will analyze it and automatically extract materials, quantities, and specifications.' },
            { q: 'Can I export my BOQ?', a: 'Yes! Pro and Enterprise plans support PDF and Excel export. Go to your project and click the Export button.' },
            { q: 'How do I share a project with a client?', a: 'Open your project, click "Share", and generate a shareable link. Clients can view the BOQ without logging in.' },
            { q: 'Can I add custom rates?', a: 'Yes. Go to the Rates page to manage your material rate database. Custom rates auto-apply to new projects.' },
            { q: 'How do I invite team members?', a: 'Go to Settings > Team and enter their email address. They\'ll receive an invitation to join your organization.' },
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium text-gray-900 hover:bg-gray-50">
                {faq.q}
                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-500">{faq.a}</p>
            </details>
          ))}
        </div>
      )}

      {tab === 'contact' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h2>
          <form onSubmit={handleContact} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} required rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent resize-none" />
            </div>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      )}

      {tab === 'shortcuts' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h2>
          <div className="space-y-3">
            {[
              { keys: ['Ctrl', 'N'], action: 'New Project' },
              { keys: ['Ctrl', 'S'], action: 'Save' },
              { keys: ['Ctrl', 'E'], action: 'Export BOQ' },
              { keys: ['Ctrl', 'K'], action: 'Global Search' },
              { keys: ['Ctrl', '/'], action: 'Show Shortcuts' },
              { keys: ['Esc'], action: 'Close Modal' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{s.action}</span>
                <div className="flex gap-1">
                  {s.keys.map((k, j) => (
                    <kbd key={j} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600">{k}</kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'changelog' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">What's New</h2>
          {[
            { version: 'v2.0', date: 'Feb 2025', changes: ['Full SaaS platform with auth & teams', 'Organization & billing management', 'Activity log & audit trail', 'In-app notifications', 'Landing page & onboarding flow', 'Global search & advanced filters'] },
            { version: 'v1.0', date: 'Jan 2025', changes: ['AI-powered BOQ extraction', 'Smart templates', 'PDF & Excel export', 'Rate database management', 'Project comparison'] },
          ].map((v, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 bg-angelina-100 text-angelina-700 text-xs font-medium rounded">{v.version}</span>
                <span className="text-sm text-gray-400">{v.date}</span>
              </div>
              <ul className="space-y-1 ml-4">
                {v.changes.map((c, j) => <li key={j} className="text-sm text-gray-600 list-disc">{c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpPage;
