import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Chrome } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { signIn, signInWithGoogle, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  const fillDemo = () => {
    setEmail('cmd@hopehospital.com');
    setPassword('Chindwada@1');
    setMode('password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email);
        toast.success('Magic link sent! Check your email.');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
        navigate('/app');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-angelina-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-angelina-500 to-angelina-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Cre8</span>
          </Link>
          <p className="mt-2 text-gray-500">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Demo Login Button */}
          <button
            onClick={fillDemo}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 font-medium hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Try Demo - Auto-fill credentials
          </button>

          <button onClick={async () => { try { await signInWithGoogle(); } catch (e: any) { toast.error(e.message || 'Google login failed'); } }} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-4">
            <Chrome className="w-5 h-5" /> Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400">or</span></div>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode('password')} className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${mode === 'password' ? 'bg-angelina-100 text-angelina-700' : 'text-gray-500 hover:bg-gray-100'}`}>Password</button>
            <button onClick={() => setMode('magic')} className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${mode === 'magic' ? 'bg-angelina-100 text-angelina-700' : 'text-gray-500 hover:bg-gray-100'}`}>Magic Link</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" placeholder="you@company.com" />
              </div>
            </div>

            {mode === 'password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" placeholder="••••••••" />
                </div>
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-sm text-angelina-600 hover:text-angelina-700">Forgot password?</Link>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-angelina-500 to-angelina-700 text-white rounded-lg font-medium hover:from-angelina-600 hover:to-angelina-800 transition-all disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'magic' ? 'Send Magic Link' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <Link to="/signup" className="text-angelina-600 font-medium hover:text-angelina-700">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
