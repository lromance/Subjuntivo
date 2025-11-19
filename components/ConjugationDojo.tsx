import React, { useEffect, useState } from 'react';
import { generateConjugationChallenge } from '../services/gemini';
import { ConjugationChallenge, FeedbackStatus } from '../types';
import { Button } from './Button';
import { Loader2, CheckCircle, XCircle, HelpCircle, RefreshCw } from 'lucide-react';

export const ConjugationDojo: React.FC<{ addPoints: (p: number) => void }> = ({ addPoints }) => {
  const [challenge, setChallenge] = useState<ConjugationChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<FeedbackStatus>('loading');
  const [showHint, setShowHint] = useState(false);

  const loadNewChallenge = async () => {
    setStatus('loading');
    setUserAnswer('');
    setShowHint(false);
    const newChallenge = await generateConjugationChallenge();
    setChallenge(newChallenge);
    setStatus('idle');
  };

  useEffect(() => {
    loadNewChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAnswer = () => {
    if (!challenge) return;
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = challenge.correctForm.trim().toLowerCase();

    if (normalizedUser === normalizedCorrect) {
      setStatus('correct');
      addPoints(10);
    } else {
      setStatus('incorrect');
    }
  };

  if (status === 'loading' && !challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin text-rose-500" size={48} />
        <p className="text-rose-800 font-medium">Buscando un verbo irregular...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="bg-white rounded-3xl shadow-xl p-8 border-b-8 border-rose-100 relative overflow-hidden">
        
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold tracking-wide uppercase mb-4 shadow-sm">
             <RefreshCw size={14} />
             {challenge?.tense}
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-4 border border-gray-100">
            <h2 className="text-5xl font-extrabold text-gray-800 mb-2 capitalize tracking-tight">
              {challenge?.verb}
            </h2>
            <p className="text-gray-500 text-xl">
               Yo quiero que... <strong className="text-rose-500">{challenge?.person}</strong> ___
            </p>
          </div>
        </div>

        <div className="relative max-w-sm mx-auto mb-8 z-10">
           <input
             type="text"
             value={userAnswer}
             onChange={(e) => setUserAnswer(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && status !== 'correct' && checkAnswer()}
             className={`w-full text-center text-3xl font-bold outline-none py-4 rounded-2xl transition-all border-2 
               ${status === 'incorrect' ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-gray-200 focus:border-rose-400 text-gray-800'}
             `}
             placeholder="escribe aquí"
             disabled={status === 'correct'}
             autoComplete="off"
             autoFocus
           />
           
           {status === 'idle' && (
             <button 
                onClick={() => setShowHint(!showHint)}
                className="absolute -right-12 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-400 transition-colors"
                title="Ver pista"
             >
               <HelpCircle size={28} />
             </button>
           )}
        </div>

        {showHint && status === 'idle' && (
           <div className="text-center mb-6 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm mx-auto max-w-xs animate-fadeIn">
             <span dangerouslySetInnerHTML={{__html: challenge?.hint || ''}} />
           </div>
        )}

        {status === 'idle' || status === 'loading' ? (
          <Button 
            onClick={checkAnswer} 
            fullWidth 
            className="bg-rose-500 hover:bg-rose-600"
            disabled={!userAnswer || status === 'loading'}
          >
            Comprobar Conjugación
          </Button>
        ) : (
          <div className={`p-6 rounded-2xl mb-6 ${status === 'correct' ? 'bg-teal-50 border border-teal-100' : 'bg-rose-50 border border-rose-100'} animate-fadeIn`}>
            <div className="flex items-center justify-center space-x-3 mb-4">
              {status === 'correct' ? (
                <CheckCircle className="text-teal-500" size={32} />
              ) : (
                <XCircle className="text-rose-500" size={32} />
              )}
              <span className={`text-xl font-bold ${status === 'correct' ? 'text-teal-700' : 'text-rose-700'}`}>
                {status === 'correct' ? '¡Excelente!' : 'Ups, la forma correcta es:'}
              </span>
            </div>
            
            {status === 'incorrect' && (
              <div className="text-center mb-6">
                <p className="text-4xl font-extrabold text-rose-600">{challenge?.correctForm}</p>
              </div>
            )}

            <Button 
              onClick={loadNewChallenge} 
              variant={status === 'correct' ? 'secondary' : 'outline'}
              fullWidth
            >
              Siguiente Verbo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};