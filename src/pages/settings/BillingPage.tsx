import React from 'react';
import { CreditCard, Check, ArrowRight, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PRICING_PLANS } from '../../types/saas';
import toast from 'react-hot-toast';

const BillingPage: React.FC = () => {
  const { subscription, organization } = useAuth();
  const currentPlan = subscription?.plan || 'free';
  const plan = PRICING_PLANS.find(p => p.id === currentPlan) || PRICING_PLANS[0];

  const handleUpgrade = (planId: string) => {
    toast.success(`Upgrade to ${planId} plan initiated! (Demo mode)`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-angelina-500 to-angelina-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-angelina-100 text-sm">Current Plan</p>
            <h2 className="text-2xl font-bold mt-1">{plan.name}</h2>
            <p className="text-angelina-100 mt-1">${plan.price}/month</p>
          </div>
          <CreditCard className="w-12 h-12 text-angelina-200" />
        </div>
        {subscription && (
          <div className="mt-4 pt-4 border-t border-angelina-400/30 flex gap-8 text-sm">
            <div><span className="text-angelina-200">Next billing:</span> <span className="font-medium">{new Date(subscription.current_period_end).toLocaleDateString()}</span></div>
            <div><span className="text-angelina-200">Status:</span> <span className="font-medium capitalize">{subscription.status}</span></div>
          </div>
        )}
      </div>

      {/* Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Usage
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Projects</span>
              <span className="font-medium">{subscription?.projects_used || 0} / {plan.limits.projects === 999999 ? '∞' : plan.limits.projects}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-angelina-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((subscription?.projects_used || 0) / plan.limits.projects) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">AI Extractions</span>
              <span className="font-medium">{subscription?.ai_extractions_used || 0} / {plan.limits.ai_extraction ? '∞' : '0'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-angelina-500 h-2 rounded-full" style={{ width: plan.limits.ai_extraction ? '25%' : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-3 gap-6">
        {PRICING_PLANS.map(p => (
          <div key={p.id} className={`bg-white rounded-xl p-6 border-2 ${p.id === currentPlan ? 'border-angelina-500' : 'border-gray-200'}`}>
            {p.id === currentPlan && <span className="text-xs font-medium text-angelina-600 bg-angelina-50 px-2 py-1 rounded-full">Current</span>}
            <h3 className="text-lg font-bold text-gray-900 mt-2">{p.name}</h3>
            <div className="mt-2 mb-4"><span className="text-3xl font-bold">${p.price}</span>{p.price > 0 && <span className="text-gray-500">/mo</span>}</div>
            <ul className="space-y-2 mb-6">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-angelina-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            {p.id !== currentPlan ? (
              <button onClick={() => handleUpgrade(p.id)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-angelina-500 text-angelina-600 rounded-lg font-medium hover:bg-angelina-50 transition-colors">
                {PRICING_PLANS.indexOf(p) > PRICING_PLANS.findIndex(x => x.id === currentPlan) ? 'Upgrade' : 'Downgrade'} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-full py-2.5 text-center text-gray-400 text-sm">Current plan</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingPage;
