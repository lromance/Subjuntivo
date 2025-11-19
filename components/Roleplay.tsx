import React, { useState, useEffect, useRef } from 'react';
import { generateRoleplayStart, chatWithTutor } from '../services/gemini';
import { Button } from './Button';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const Roleplay: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep track of history for API
  const historyRef = useRef<any[]>([]);

  const initScenario = async () => {
    setLoading(true);
    const start = await generateRoleplayStart();
    setScenario(start.scenario);
    const initialMsg = { sender: 'ai' as const, text: start.teacherPrompt };
    setMessages([initialMsg]);
    historyRef.current = [
      { role: 'user', parts: [{ text: `Vamos a hacer un roleplay. Escenario: ${start.scenario}. Tú empieza.` }] },
      { role: 'model', parts: [{ text: start.teacherPrompt }] }
    ];
    setLoading(false);
  };

  useEffect(() => {
    initScenario();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await chatWithTutor(historyRef.current, input);
      // Update history
      historyRef.current.push({ role: 'user', parts: [{ text: input }] });
      historyRef.current.push({ role: 'model', parts: [{ text: responseText || '' }] });
      
      setMessages(prev => [...prev, { sender: 'ai', text: responseText || '...' }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto fade-in h-[600px] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-teal-500 p-4 text-white flex justify-between items-center">
        <div className="font-bold text-lg flex items-center gap-2">
           <Bot size={20}/> Roleplay
        </div>
        <span 
          className="text-teal-100 text-sm bg-teal-600 px-2 py-1 rounded-lg"
          dangerouslySetInnerHTML={{ __html: scenario || 'Cargando...' }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-teal-500 text-white'}`}>
                 {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
               </div>
               <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'}`}
                    dangerouslySetInnerHTML={{__html: msg.text}}
               >
               </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl p-3 rounded-bl-none flex space-x-1">
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu respuesta..."
          className="flex-1 bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 transition-all"
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !input} variant="secondary" className="rounded-xl px-4">
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
};