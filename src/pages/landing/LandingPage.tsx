import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Brain, Users, Shield, ArrowRight, Check, Star, ChevronDown } from 'lucide-react';
import { PRICING_PLANS } from '../../types/saas';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-angelina-500 to-angelina-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Angelina BOQ</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">Pricing</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">FAQ</a>
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Log in</Link>
            <Link to="/signup" className="px-4 py-2 bg-gradient-to-r from-angelina-500 to-angelina-700 text-white text-sm font-medium rounded-lg hover:from-angelina-600 hover:to-angelina-800 transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-32 px-4 bg-gradient-to-b from-angelina-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-angelina-100 text-angelina-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> AI-Powered Interior Design Estimation
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create Accurate <span className="text-transparent bg-clip-text bg-gradient-to-r from-angelina-500 to-angelina-700">BOQ Estimates</span> in Minutes
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Upload your design documents and let AI extract every material, fixture, and finish — generating professional Bill of Quantities instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-angelina-500 to-angelina-700 text-white text-lg font-medium rounded-xl hover:from-angelina-600 hover:to-angelina-800 transition-all shadow-lg shadow-angelina-500/25">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 text-lg font-medium rounded-xl hover:border-angelina-300 hover:bg-angelina-50 transition-all">
              See How It Works
            </a>
          </div>
          <div className="mt-16 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-angelina-50 to-purple-50 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-3 text-angelina-300" />
                <p className="text-sm">Product Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need for BOQ management</h2>
            <p className="text-lg text-gray-500">Powerful features designed for interior designers, architects, and contractors.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI Extraction', desc: 'Upload 2D/3D designs and get instant material breakdowns with quantities and rates.' },
              { icon: FileText, title: 'Professional Exports', desc: 'Generate beautiful PDF and Excel reports with your company branding.' },
              { icon: Users, title: 'Team Collaboration', desc: 'Invite your team, share projects with clients, and track approvals.' },
              { icon: Shield, title: 'Smart Templates', desc: 'Start with pre-built templates for different interior styles and room types.' },
              { icon: Star, title: 'Rate Database', desc: 'Maintain your material rates library and auto-apply to new projects.' },
              { icon: Sparkles, title: 'Project Comparison', desc: 'Compare multiple BOQs side by side to optimize costs and materials.' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-200 hover:border-angelina-200 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-angelina-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-angelina-200 transition-colors">
                  <f.icon className="w-6 h-6 text-angelina-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map(plan => (
              <div key={plan.id} className={`bg-white rounded-2xl p-8 border-2 ${plan.id === 'pro' ? 'border-angelina-500 shadow-xl relative' : 'border-gray-200'}`}>
                {plan.id === 'pro' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-angelina-500 text-white text-xs font-medium rounded-full">Most Popular</div>}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-500">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-angelina-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`block text-center py-3 rounded-lg font-medium transition-all ${plan.id === 'pro' ? 'bg-gradient-to-r from-angelina-500 to-angelina-700 text-white hover:from-angelina-600 hover:to-angelina-800' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {plan.price === 0 ? 'Get Started' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">Trusted by design professionals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya Sharma', role: 'Interior Designer, Mumbai', text: 'Angelina BOQ has cut my estimation time by 80%. The AI extraction is incredibly accurate.' },
              { name: 'Rajesh Kumar', role: 'Contractor, Delhi', text: 'Finally a BOQ tool that understands Indian materials and rates. The export feature is fantastic.' },
              { name: 'Anita Desai', role: 'Architect, Bangalore', text: 'The team collaboration features make it easy to work with clients and subcontractors.' },
            ].map((t, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-gray-600 mb-4">"{t.text}"</p>
                <div><p className="font-medium text-gray-900">{t.name}</p><p className="text-sm text-gray-500">{t.role}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">Frequently Asked Questions</h2>
          {[
            { q: 'What is a BOQ?', a: 'A Bill of Quantities (BOQ) is a detailed document listing all materials, labor, and costs required for an interior design or construction project.' },
            { q: 'How does the AI extraction work?', a: 'Upload your 2D/3D design files, floor plans, or mood boards. Our AI analyzes them to extract materials, quantities, and specifications automatically.' },
            { q: 'Can I customize rates?', a: 'Yes! You can maintain your own rate database with local material prices and labor costs. These are auto-applied to new projects.' },
            { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade encryption and your data is stored securely on Supabase infrastructure.' },
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel or downgrade your plan at any time. No long-term contracts.' },
          ].map((faq, i) => (
            <details key={i} className="group border-b border-gray-200 py-4">
              <summary className="flex items-center justify-between cursor-pointer text-lg font-medium text-gray-900">
                {faq.q}
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-gray-500">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to streamline your BOQ process?</h2>
          <p className="text-lg text-gray-500 mb-8">Join thousands of design professionals using Angelina BOQ.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-angelina-500 to-angelina-700 text-white text-lg font-medium rounded-xl hover:from-angelina-600 hover:to-angelina-800 transition-all shadow-lg shadow-angelina-500/25">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-angelina-500 to-angelina-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Angelina BOQ</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 Angelina BOQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
