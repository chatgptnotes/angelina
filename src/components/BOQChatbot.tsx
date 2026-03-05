import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import supabase from '../services/supabase';
import type { BOQProject, BOQRoom, BOQItem, BOQCategory } from '../types/boq';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedItems?: SuggestedItem[];
  timestamp: Date;
}

interface SuggestedItem {
  category: BOQCategory;
  description: string;
  specification?: string;
  unit: string;
  quantity: number;
  rate: number;
  room_name?: string;
}

interface Props {
  project: BOQProject;
  rooms: BOQRoom[];
  items: BOQItem[];
  onItemsAdded: () => void;
}

const SYSTEM_PROMPT = `You are a proactive professional Quantity Surveyor (QS) assistant for the Cre8 BOQ platform.

PROACTIVE BEHAVIOR (critical):
- Don't wait for the user to ask. Analyze the project context and IMMEDIATELY flag:
  1. Missing item categories (e.g. "I see no MEP items — typical projects include electrical, plumbing, HVAC")
  2. BOQ assumptions you are making (e.g. "Assuming standard UAE finishes. Is this luxury or budget tier?")
  3. Gaps in room coverage (e.g. "You have Living Room but no Bathrooms — shall I add typical bathroom items?")
  4. Rate anomalies (e.g. "Your marble rate of 50/sqft seems low — typical is 120-180/sqft")
  5. Missing preliminary items (Mobilization, Site Protection, Cleaning, etc.)
  6. Commonly forgotten items for the room type

- Ask clarifying questions to refine: finishing grade (basic/standard/luxury/ultra-luxury), location (UAE/India/KSA), client type (residential/commercial/hospitality)
- State your assumptions explicitly: "I am assuming standard residential grade. Tell me if different."
- After every analysis, end with: "Shall I add these to your project?"

Valid categories: civil, flooring, wall_finish, ceiling, furniture, fixtures, electrical, plumbing, doors_windows, kitchen, decorative, hvac, fire_fighting, low_current, drainage, external_works, preliminaries, miscellaneous
Valid units: sqft, sqm, rft, nos, set, lot, kg, ltr, cum, bag, mtr

When suggesting BOQ items to add, ALWAYS include this JSON block at the end:
\`\`\`json
{"items":[{"room_name":"Reception","category":"flooring","description":"Porcelain tiles 800x800mm polished","specification":"Rectified anti-slip R10 Grade A","unit":"sqm","quantity":46,"rate":250}]}
\`\`\`
If no items to add, omit the JSON block. Be direct and specific — not generic.`;

export default function BOQChatbot({ project, rooms, items, onItemsAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1', role: 'assistant', timestamp: new Date(),
    content: `Analyzing your project...`,
  }]);
  const [initialized, setInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingItems, setAddingItems] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Proactive analysis when chat opens for first time
  useEffect(() => {
    if (open && !initialized) {
      setInitialized(true);
      triggerProactiveAnalysis();
    }
  }, [open]);

  const triggerProactiveAnalysis = async () => {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!apiKey) {
      setMessages([{
        id: '1', role: 'assistant', timestamp: new Date(),
        content: `Hi! I am your QS assistant for **${project.name}**. I can help you add missing items, suggest specifications, review rates, or calculate quantities. (AI API key not configured yet.)`,
      }]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_AI_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: `${SYSTEM_PROMPT}\n\nContext:\n${buildContext()}`,
          messages: [{
            role: 'user',
            content: 'Analyze my current BOQ project. Tell me what is missing, what assumptions you are making, and what I should add next. Be specific and proactive.',
          }],
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const content = data.content[0]?.text || '';
      const suggestedItems = parseItems(content);
      const display = content.replace(/\`\`\`json[\s\S]*?\`\`\`/g, '').trim();
      setMessages([{ id: '1', role: 'assistant', content: display, suggestedItems, timestamp: new Date() }]);
    } catch (err: any) {
      setMessages([{ id: '1', role: 'assistant', timestamp: new Date(), content: `Hi! I am your QS assistant for **${project.name}**. Ask me anything about your BOQ.` }]);
    } finally {
      setLoading(false);
    }
  };

  const buildContext = () => {
    const roomSummary = rooms.map(r => {
      const rItems = items.filter(i => i.room_id === r.id);
      return `- ${r.name} (${r.area_sqft || '?'} sqft, ${rItems.length} items)`;
    }).join('\n');
    return `Project: ${project.name} | Client: ${project.client || 'N/A'} | Style: ${project.style || 'N/A'} | Area: ${project.total_area_sqft || '?'} sqft\nRooms:\n${roomSummary || 'None yet'}\nTotal items: ${items.length}`;
  };

  const parseItems = (content: string): SuggestedItem[] => {
    const match = content.match(/```json\s*([\s\S]*?)```/);
    if (!match) return [];
    try { return JSON.parse(match[1]).items || []; } catch { return []; }
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    const apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', timestamp: new Date(), content: 'AI API key not configured. Please add VITE_AI_API_KEY to environment.' }]);
      setLoading(false);
      return;
    }

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_AI_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: `${SYSTEM_PROMPT}\n\nContext:\n${buildContext()}`,
          messages: [...history, { role: 'user', content: msg }],
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const content = data.content[0]?.text || '';
      const suggestedItems = parseItems(content);
      const display = content.replace(/```json[\s\S]*?```/g, '').trim();
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: display, suggestedItems, timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const addItems = async (suggested: SuggestedItem[], msgId: string) => {
    setAddingItems(msgId);
    let added = 0;
    for (const item of suggested) {
      let roomId = rooms[0]?.id;
      if (item.room_name) {
        const match = rooms.find(r => r.name.toLowerCase().includes(item.room_name!.toLowerCase()));
        if (match) roomId = match.id;
      }
      if (!roomId) continue;
      await supabase.from('boq_items').insert({
        project_id: project.id, room_id: roomId,
        category: item.category, description: item.description,
        specification: item.specification || null,
        unit: item.unit, quantity: item.quantity, rate: item.rate,
        amount: item.quantity * item.rate, source: 'ai_extracted', confidence: 80,
      });
      added++;
    }
    toast.success(`Added ${added} item(s) to project`);
    onItemsAdded();
    setAddingItems(null);
  };

  const fmt = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  const quickPrompts = ['Suggest missing items', 'Check my rates', 'Add MEP items', 'What am I missing?'];

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-angelina-600 text-white rounded-full shadow-xl hover:bg-angelina-700 flex items-center justify-center hover:scale-110 transition-all"
          title="QS AI Assistant">
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col" style={{ height: 560 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-angelina-600 to-angelina-700 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <div>
                <p className="text-sm font-semibold text-white">QS AI Assistant</p>
                <p className="text-xs text-angelina-200 truncate max-w-[200px]">{project.name}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-angelina-200 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-angelina-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <div dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
                  {m.suggestedItems && m.suggestedItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-1">{m.suggestedItems.length} item(s) ready:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto mb-2">
                        {m.suggestedItems.map((item, i) => (
                          <div key={i} className="text-xs bg-white rounded px-2 py-1 border border-gray-200">
                            <span className="font-medium">{item.description}</span>
                            <span className="text-gray-400 ml-1">{item.quantity} {item.unit} @ {item.rate}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addItems(m.suggestedItems!, m.id)} disabled={addingItems === m.id}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-angelina-600 text-white rounded-lg text-xs font-medium hover:bg-angelina-700 disabled:opacity-50">
                        {addingItems === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        {addingItems === m.id ? 'Adding...' : 'Add All to Project'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl px-4 py-3"><Loader2 className="w-4 h-4 animate-spin text-angelina-500" /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto border-t border-gray-50">
            {quickPrompts.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-xs whitespace-nowrap px-2.5 py-1 bg-angelina-50 text-angelina-700 rounded-full hover:bg-angelina-100 flex-shrink-0">
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about your BOQ..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="p-2 bg-angelina-600 text-white rounded-lg hover:bg-angelina-700 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
