
import React, { useState, useEffect } from 'react';
import { generateErrorChallenge } from '../services/gemini';
import { ErrorChallenge, FeedbackStatus } from '../types';
import { Button } from './Button';
import { Loader2, Eye, Check, X, ArrowRight } from 'lucide-react';

export const ErrorHunter: React.FC<{ addPoints: (p: number) => void }> = ({ addPoints }) => {
  const [challenge, setChallenge] = useState<ErrorChallenge | null>(null);
  const [status, setStatus] = useState<FeedbackStatus>('loading');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadChallenge = async () => {
    setStatus('loading');
    setChallenge(null);
    setSelectedId(null);
    const data = await generateErrorChallenge();
    setChallenge(data);
    setStatus('idle');
  };

  useEffect(() => {
    loadChallenge();
  }, []);

  const handleSelection = (id: number, isCorrect: boolean) => {
    if (status !== 'idle') return;
    setSelectedId(id);
    if (isCorrect) {
      setStatus('correct');
      addPoints(15);
    } else {
      setStatus('incorrect');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-emerald-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p>Buscando errores comunes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-emerald-500 relative">
        
        <div className="text-center mb-8">
           <h2 className="text-2xl font-extrabold text-gray-800 flex items-center justify-center gap-3">
             <Eye className="text-emerald-500" size={32}/> Cazador de Errores
           </h2>
           <div className="bg-emerald-50 inline-block px-6 py-2 rounded-lg mt-4 text-emerald-800 font-medium">
              Contexto: {challenge?.context}
           </div>
           <p className="text-gray-500 mt-2">¿Cuál de estas frases es correcta?</p>
        </div>

        <div className="space-y-4 mb-8">
           {challenge?.options.map((opt) => {
             let cardStyle = "border-2 border-gray-200 hover:border-emerald-300 hover:shadow-md cursor-pointer";
             let icon = null;

             if (status !== 'idle') {
                cardStyle = "cursor-default ";
                if (opt.id === selectedId) {
                   if (opt.isCorrect) {
                      cardStyle += "bg-teal-100 border-teal-500 text-teal-900";
                      icon = <Check className="text-teal-600" />;
                   } else {
                      cardStyle += "bg-rose-100 border-rose-500 text-rose-900";
                      icon = <X className="text-rose-600" />;
                   }
                } else if (opt.isCorrect) {
                   cardStyle += "bg-teal-50 border-teal-200 border-dashed opacity-70";
                   icon = <Check className="text-teal-400" />;
                } else {
                   cardStyle += "opacity-50 bg-gray-50 border-gray-100";
                }
             }

             return (
               <div 
                 key={opt.id}
                 onClick={() => handleSelection(opt.id, opt.isCorrect)}
                 className={`p-6 rounded-2xl transition-all duration-200 flex items-center justify-between ${cardStyle}`}
               >
                 <span className="text-lg font-semibold">{opt.text}</span>
                 {icon}
               </div>
             );
           })}
        </div>

        {status !== 'idle' && (
          <div className="animate-fadeIn bg-gray-50 p-6 rounded-2xl mb-4">
             <h4 className="font-bold text-gray-800 mb-2">Explicación:</h4>
             <p className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{__html: challenge?.explanation || ''}} />
          </div>
        )}

        {status !== 'idle' && (
           <Button onClick={loadChallenge} fullWidth className="bg-emerald-500 hover:bg-emerald-600">
             Siguiente Desafío <ArrowRight className="ml-2 inline" size={20} />
           </Button>
        )}

      </div>
    </div>
  );
};
