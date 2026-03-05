// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, FileText, Zap, Sliders, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { BOQService } from '../services/boqService';

const MEP_SERVICES = [
  {
    key: 'hvac', label: 'HVAC', description: 'Heating, Ventilation & Air Conditioning',
    items: [
      { description: 'Split AC units (1.5 TR)', unit: 'No.', qty: 10, rate: 1800 },
      { description: 'Ducting & distribution (GI)', unit: 'Sqm', qty: 250, rate: 120 },
      { description: 'Fresh air handling unit (AHU)', unit: 'No.', qty: 2, rate: 12000 },
      { description: 'Grilles, diffusers & registers', unit: 'No.', qty: 40, rate: 85 },
      { description: 'Controls & thermostats', unit: 'No.', qty: 10, rate: 450 },
    ],
  },
  {
    key: 'fire', label: 'Fire Fighting', description: 'Fire suppression & detection system',
    items: [
      { description: 'Sprinkler heads (pendant type)', unit: 'No.', qty: 80, rate: 45 },
      { description: 'Fire alarm panel (addressable)', unit: 'No.', qty: 1, rate: 6500 },
      { description: 'Smoke detectors', unit: 'No.', qty: 40, rate: 95 },
      { description: 'Manual call points', unit: 'No.', qty: 12, rate: 120 },
      { description: 'Fire hose reels & cabinets', unit: 'No.', qty: 6, rate: 850 },
      { description: 'GI pipes, fittings & supports', unit: 'Lm', qty: 300, rate: 65 },
    ],
  },
  {
    key: 'plumbing', label: 'Plumbing & Drainage', description: 'Water supply & drainage works',
    items: [
      { description: 'PPR water supply pipes', unit: 'Lm', qty: 200, rate: 35 },
      { description: 'UPVC drainage pipes', unit: 'Lm', qty: 150, rate: 28 },
      { description: 'Sanitary fixtures (WC, basin)', unit: 'No.', qty: 10, rate: 650 },
      { description: 'Water storage tank (3000L)', unit: 'No.', qty: 1, rate: 3200 },
      { description: 'Booster pump set', unit: 'No.', qty: 1, rate: 4800 },
    ],
  },
  {
    key: 'electrical', label: 'Electrical LV', description: 'Low voltage electrical installation',
    items: [
      { description: 'Main LV distribution board', unit: 'No.', qty: 1, rate: 8500 },
      { description: 'Sub-distribution boards (SDB)', unit: 'No.', qty: 4, rate: 2200 },
      { description: 'Cables (various sizes, Cu XLPE)', unit: 'Lm', qty: 1500, rate: 12 },
      { description: 'Cable trays & trunking', unit: 'Lm', qty: 400, rate: 28 },
      { description: 'Light fittings (LED panel)', unit: 'No.', qty: 80, rate: 120 },
      { description: 'Socket outlets (13A)', unit: 'No.', qty: 60, rate: 55 },
    ],
  },
  {
    key: 'elv', label: 'Low Current / ELV', description: 'CCTV, access control, structured cabling',
    items: [
      { description: 'CCTV cameras (IP 4MP)', unit: 'No.', qty: 20, rate: 450 },
      { description: 'NVR (16 channel)', unit: 'No.', qty: 2, rate: 1800 },
      { description: 'Access control (biometric)', unit: 'No.', qty: 6, rate: 1200 },
      { description: 'Structured cabling (Cat6)', unit: 'Lm', qty: 800, rate: 8 },
      { description: 'Network switches (24 port)', unit: 'No.', qty: 3, rate: 1500 },
      { description: 'PA system & speakers', unit: 'No.', qty: 15, rate: 320 },
    ],
  },
  {
    key: 'bms', label: 'BMS', description: 'Building Management System',
    items: [
      { description: 'BMS central controller', unit: 'No.', qty: 1, rate: 18000 },
      { description: 'Field devices & sensors', unit: 'No.', qty: 30, rate: 380 },
      { description: 'BMS software license', unit: 'No.', qty: 1, rate: 8000 },
      { description: 'Integration & commissioning', unit: 'Lot', qty: 1, rate: 12000 },
    ],
  },
];

const SABIEstimate = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [selectedServices, setSelectedServices] = useState(['hvac','electrical']);
  const [serviceItems, setServiceItems] = useState({});
  const [marginPct, setMarginPct] = useState(50);
  const [showProposal, setShowProposal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [projectLocation, setProjectLocation] = useState('Dubai, UAE');

  useEffect(() => {
    if (id) BOQService.getProject(id).then(p => {
      setProject(p);
      setClientName(p?.client || '');
    }).catch(() => {});
    // Init service items from defaults
    const init = {};
    MEP_SERVICES.forEach(s => {
      init[s.key] = s.items.map((it, i) => ({ ...it, id: `${s.key}-${i}`, amount: it.qty * it.rate }));
    });
    setServiceItems(init);
  }, [id]);

  const toggleService = (key) => setSelectedServices(p =>
    p.includes(key) ? p.filter(k => k !== key) : [...p, key]);

  const updateItem = (svcKey, itemId, field, value) => {
    setServiceItems(prev => ({
      ...prev,
      [svcKey]: prev[svcKey].map(it => {
        if (it.id !== itemId) return it;
        const updated = { ...it, [field]: field === 'description' ? value : parseFloat(value) || 0 };
        updated.amount = updated.qty * updated.rate;
        return updated;
      })
    }));
  };

  const addItem = (svcKey) => {
    setServiceItems(prev => ({
      ...prev,
      [svcKey]: [...(prev[svcKey]||[]), { id: `${svcKey}-${Date.now()}`, description: 'New Item', unit: 'No.', qty: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (svcKey, itemId) => {
    setServiceItems(prev => ({ ...prev, [svcKey]: prev[svcKey].filter(it => it.id !== itemId) }));
  };

  const getServiceTotal = (key) => (serviceItems[key]||[]).reduce((s, it) => s + (it.amount||0), 0);
  const costPrice = selectedServices.reduce((s, k) => s + getServiceTotal(k), 0);
  const marginAmt = costPrice * (marginPct / 100);
  const clientPrice = costPrice + marginAmt;

  const printProposal = () => window.print();

  const today = new Date().toLocaleDateString('en-AE', { day:'2-digit', month:'long', year:'numeric' });
  const validUntil = new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-AE', { day:'2-digit', month:'long', year:'numeric' });
  const refNo = `SABI-${Date.now().toString().slice(-6)}`;

  return (
    <div>
      <style>{`@media print {
        .no-print { display: none !important; }
        body { font-family: Arial, sans-serif; font-size: 11pt; }
        .print-only { display: block !important; }
        .page-break { page-break-before: always; }
      }`}</style>

      <div className="no-print">
        <Link to={`/app/project/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4"/> Back to Project
        </Link>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500"/> SABI MEP Estimate
            </h2>
            <p className="text-gray-500 text-sm mt-1">AI-Powered MEP Estimation — estimation@sabi.ae</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowProposal(!showProposal)}
              className="flex items-center gap-1.5 px-3 py-2 border border-angelina-300 text-angelina-700 rounded-lg text-sm hover:bg-angelina-50">
              <FileText className="w-4 h-4"/> {showProposal ? 'Hide' : 'Generate'} Proposal
            </button>
            <button onClick={printProposal} className="flex items-center gap-1.5 px-3 py-2 bg-angelina-600 text-white rounded-lg text-sm hover:bg-angelina-700">
              <Download className="w-4 h-4"/> Download PDF
            </button>
          </div>
        </div>

        {/* Project info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Client Name</label>
            <input value={clientName} onChange={e => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-angelina-400"/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Project Location</label>
            <input value={projectLocation} onChange={e => setProjectLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-angelina-400"/>
          </div>
        </div>

        {/* Service Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-angelina-600"/> Select MEP Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MEP_SERVICES.map(svc => {
              const active = selectedServices.includes(svc.key);
              return (
                <button key={svc.key} onClick={() => toggleService(svc.key)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all ${
                    active ? 'border-angelina-500 bg-angelina-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  {active ? <CheckSquare className="w-4 h-4 text-angelina-600 shrink-0"/> : <Square className="w-4 h-4 text-gray-400 shrink-0"/>}
                  <div>
                    <div className={`text-sm font-medium ${active ? 'text-angelina-700' : 'text-gray-700'}`}>{svc.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {active ? `AED ${getServiceTotal(svc.key).toLocaleString()}` : svc.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Line Items per service */}
        {MEP_SERVICES.filter(s => selectedServices.includes(s.key)).map(svc => (
          <div key={svc.key} className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{svc.label}</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-angelina-700">AED {getServiceTotal(svc.key).toLocaleString()}</span>
                <button onClick={() => addItem(svc.key)}
                  className="flex items-center gap-1 text-xs text-angelina-600 hover:text-angelina-700 border border-angelina-300 px-2 py-1 rounded">
                  <Plus className="w-3 h-3"/> Add
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Description','Unit','Qty','Rate (AED)','Amount (AED)',''].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(serviceItems[svc.key]||[]).map(item => (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="py-1.5 px-3">
                        <input value={item.description} onChange={e => updateItem(svc.key, item.id, 'description', e.target.value)}
                          className="w-full text-sm focus:outline-none border-b border-transparent hover:border-gray-200 focus:border-angelina-400 bg-transparent"/>
                      </td>
                      <td className="py-1.5 px-3 text-gray-500 text-xs">{item.unit}</td>
                      <td className="py-1.5 px-3">
                        <input type="number" value={item.qty} onChange={e => updateItem(svc.key, item.id, 'qty', e.target.value)}
                          className="w-16 text-right text-sm focus:outline-none border-b border-transparent hover:border-gray-200 focus:border-angelina-400 bg-transparent"/>
                      </td>
                      <td className="py-1.5 px-3">
                        <input type="number" value={item.rate} onChange={e => updateItem(svc.key, item.id, 'rate', e.target.value)}
                          className="w-24 text-right text-sm focus:outline-none border-b border-transparent hover:border-gray-200 focus:border-angelina-400 bg-transparent"/>
                      </td>
                      <td className="py-1.5 px-3 text-right font-medium text-gray-900">{(item.amount||0).toLocaleString()}</td>
                      <td className="py-1.5 px-3">
                        <button onClick={() => removeItem(svc.key, item.id)} className="text-red-300 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Margin + Totals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-angelina-600"/> Margin & Pricing
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 block mb-2">Margin: {marginPct}%</label>
              <input type="range" min="0" max="70" value={marginPct} onChange={e => setMarginPct(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-angelina-600"/>
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>35%</span><span>70%</span></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Cost Price', value: costPrice, sub: 'Your cost', color: 'bg-gray-50 border-gray-200' },
              { label: `Margin (${marginPct}%)`, value: marginAmt, sub: 'Bettroi margin', color: 'bg-yellow-50 border-yellow-200' },
              { label: 'Client Price', value: clientPrice, sub: 'Quote to client', color: 'bg-angelina-50 border-angelina-200' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className={`${color} border rounded-lg p-4 text-center`}>
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="text-xl font-bold text-gray-900">AED {value.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
                <div className="text-xs text-gray-400 mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROPOSAL LETTER (visible when showProposal or printing) */}
      {(showProposal) && (
        <div className="bg-white rounded-xl border-2 border-angelina-200 p-8 mb-6 proposal-print">
          {/* Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-angelina-600 pb-4 mb-6">
            <div>
              <div className="text-2xl font-black text-angelina-700 tracking-tight">SABI</div>
              <div className="text-xs text-gray-500 mt-0.5">AI-Powered MEP Estimation</div>
              <div className="text-xs text-gray-400">estimation@sabi.ae | sabi.ae</div>
            </div>
            <div className="text-right text-xs text-gray-600">
              <div className="font-semibold">MEP COST ESTIMATE</div>
              <div>Ref: {refNo}</div>
              <div>Date: {today}</div>
              <div>Valid Until: {validUntil}</div>
            </div>
          </div>

          <div className="mb-5 text-sm">
            <div className="font-semibold text-gray-700">Attention:</div>
            <div className="text-gray-900 font-medium">{clientName || 'Client Name'}</div>
            <div className="text-gray-600">Project: {project?.name || 'Project Name'}</div>
            <div className="text-gray-600">Location: {projectLocation}</div>
          </div>

          <div className="text-sm text-gray-700 mb-6">
            We are pleased to submit our MEP cost estimate for the above-referenced project.
            This estimate covers the following mechanical, electrical, and plumbing services as agreed.
          </div>

          {/* Service Tables */}
          {MEP_SERVICES.filter(s => selectedServices.includes(s.key)).map((svc, si) => (
            <div key={svc.key} className="mb-5">
              <div className="bg-angelina-600 text-white px-4 py-2 text-sm font-semibold rounded-t-lg">
                Section {si+1}: {svc.label}
              </div>
              <table className="w-full text-xs border border-t-0 rounded-b-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-6">Sr</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Description</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600 w-14">Unit</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600 w-14">Qty</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600 w-24">Rate (AED)</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600 w-24">Amount (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  {(serviceItems[svc.key]||[]).map((item, i) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="py-1.5 px-3 text-gray-400">{i+1}</td>
                      <td className="py-1.5 px-3 text-gray-800">{item.description}</td>
                      <td className="py-1.5 px-3 text-center text-gray-500">{item.unit}</td>
                      <td className="py-1.5 px-3 text-right">{item.qty}</td>
                      <td className="py-1.5 px-3 text-right">{item.rate.toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-right font-medium">{(item.amount||0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td colSpan={5} className="py-2 px-3 text-xs font-bold text-gray-700">Section Total</td>
                    <td className="py-2 px-3 text-right font-bold text-angelina-700">AED {getServiceTotal(svc.key).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {/* Grand Summary */}
          <table className="w-full text-sm mt-4 border rounded-lg overflow-hidden">
            <tbody>
              <tr className="border-b"><td className="py-2 px-4 text-gray-600">Total Cost Price</td><td className="py-2 px-4 text-right">AED {costPrice.toLocaleString()}</td></tr>
              <tr className="border-b"><td className="py-2 px-4 text-gray-600">Margin ({marginPct}%)</td><td className="py-2 px-4 text-right">AED {marginAmt.toLocaleString()}</td></tr>
              <tr className="bg-angelina-600 text-white">
                <td className="py-3 px-4 font-bold text-base">TOTAL ESTIMATE (CLIENT PRICE)</td>
                <td className="py-3 px-4 text-right font-bold text-xl">AED {clientPrice.toLocaleString(undefined,{minimumFractionDigits:0})}</td>
              </tr>
            </tbody>
          </table>

          {/* Terms */}
          <div className="mt-6 text-xs text-gray-500 border-t pt-4">
            <div className="font-semibold text-gray-700 mb-2">Terms & Conditions</div>
            <ul className="list-disc list-inside space-y-1">
              <li>This estimate is valid for 30 days from the date above.</li>
              <li>Payment terms: 50% advance, 40% on progress, 10% on completion.</li>
              <li>Rates are inclusive of supply, installation, testing & commissioning.</li>
              <li>Any variations/additional works will be quoted separately.</li>
              <li>This estimate excludes civil works, builder's work, and authority approvals.</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t text-center text-xs text-gray-300">drmhope.com | A Bettroi Product — Generated by CRE8BOQ / SABI Estimator</div>
        </div>
      )}

      <div className="no-print mt-4 text-center text-xs text-gray-300">drmhope.com | A Bettroi Product</div>
    </div>
  );
};

export default SABIEstimate;
