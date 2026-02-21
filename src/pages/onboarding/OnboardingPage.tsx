import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FolderPlus, Upload, Sparkles, ArrowRight, ArrowLeft, SkipForward, Check } from 'lucide-react';

const STEPS = [
  { icon: Building2, title: 'Company Details', desc: 'Tell us about your business' },
  { icon: FolderPlus, title: 'First Project', desc: 'Create your first BOQ project' },
  { icon: Upload, title: 'Upload Document', desc: 'Upload a design or try our demo' },
  { icon: Sparkles, title: 'See Results', desc: 'AI generates your BOQ' },
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectClient, setProjectClient] = useState('');

  const next = () => { if (step < 3) setStep(s => s + 1); else navigate('/app'); };
  const prev = () => { if (step > 0) setStep(s => s - 1); };
  const skip = () => navigate('/app');

  return (
    <div className="min-h-screen bg-gradient-to-br from-angelina-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= step ? 'bg-angelina-500 text-white' : 'bg-gray-200 text-gray-400'} transition-colors`}>
                  {i < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i <= step ? 'text-angelina-600 font-medium' : 'text-gray-400'}`}>{s.title}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-angelina-500' : 'bg-gray-200'} transition-colors`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{STEPS[step].title}</h2>
          <p className="text-gray-500 mb-6">{STEPS[step].desc}</p>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" placeholder="Your Design Studio" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" placeholder="City, Country" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" placeholder="My First Project" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input value={projectClient} onChange={e => setProjectClient(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" placeholder="Client Name" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-angelina-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Drag & drop a design file here</p>
              <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
              <button className="mt-4 px-4 py-2 bg-angelina-100 text-angelina-600 rounded-lg text-sm font-medium hover:bg-angelina-200">
                Or try with demo data
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">You're all set! 🎉</h3>
              <p className="text-gray-500">Your workspace is ready. Start creating professional BOQ estimates with AI.</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <div>
              {step > 0 && (
                <button onClick={prev} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={skip} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                <SkipForward className="w-4 h-4" /> Skip
              </button>
              <button onClick={next} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-angelina-500 to-angelina-700 text-white rounded-lg font-medium hover:from-angelina-600 hover:to-angelina-800 transition-all">
                {step === 3 ? 'Go to Dashboard' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
