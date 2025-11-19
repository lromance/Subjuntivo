
import React, { useState, useEffect } from 'react';
import { generatePuzzleChallenge } from '../services/gemini';
import { PuzzleChallenge, FeedbackStatus } from '../types';
import { Button } from './Button';
import { Loader2, Puzzle, Undo, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export const SintaxisPuzzle: React.FC<{ addPoints: (p: number) => void }> = ({ addPoints }) => {
  const [challenge, setChallenge] = useState<PuzzleChallenge | null>(null);
  const [availableWords, setAvailableWords] = useState<{id: number, text: string}[]>([]);
  const [selectedWords, setSelectedWords] = useState<{id: number, text: string}[]>([]);
  const [status, setStatus] = useState<FeedbackStatus>('loading');

  const loadChallenge = async () => {
    setStatus('loading');
    setChallenge(null);
    setSelectedWords([]);
    setAvailableWords([]);
    
    const data = await generatePuzzleChallenge();
    setChallenge(data);
    setAvailableWords(data.scrambledWords.map((w, i) => ({ id: i, text: w })));
    setStatus('idle');
  };

  useEffect(() => {
    loadChallenge();
  }, []);

  const handleWordClick = (word: {id: number, text: string}, from: 'available' | 'selected') => {
    if (status !== 'idle' && status !== 'incorrect') return;

    if (from === 'available') {
      setAvailableWords(prev => prev.filter(w => w.id !== word.id));
      setSelectedWords(prev => [...prev, word]);
    } else {
      setSelectedWords(prev => prev.filter(w => w.id !== word.id));
      setAvailableWords(prev => [...prev, word]);
    }
    if (status === 'incorrect') setStatus('idle');
  };

  const checkAnswer = () => {
    if (!challenge) return;
    const userSentence = selectedWords.map(w => w.text).join(' ');
    const normalize = (s: string) => s.replace(/[.,!¡?¿]/g, '').trim().toLowerCase();
    
    if (userSentence === challenge.originalSentence || normalize(userSentence) === normalize(challenge.originalSentence)) {
      setStatus('correct');
      addPoints(20);
    } else {
      setStatus('incorrect');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-violet-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p>Desordenando una frase...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="bg-white rounded-3xl shadow-xl p-8 border-b-8 border-violet-200">
        
        <div className="text-center mb-6">
           <div className="inline-flex items-center gap-2 text-violet-600 font-bold bg-violet-50 px-4 py-2 rounded-full mb-4">
             <Puzzle size={20} /> Puzzle de Sintaxis
           </div>
           <p className="text-gray-500 text-lg italic">
             "{challenge?.translation}"
           </p>
        </div>

        <div className={`min-h-[100px] bg-gray-100 rounded-2xl p-4 mb-6 flex flex-wrap gap-2 items-center justify-center transition-all ${status === 'correct' ? 'bg-teal-50 border-2 border-teal-200' : 'border-2 border-dashed border-gray-300'}`}>
           {selectedWords.length === 0 && (
             <span className="text-gray-400 select-none">Toca las palabras abajo para construir la frase</span>
           )}
           {selectedWords.map(word => (
             <button
               key={word.id}
               onClick={() => handleWordClick(word, 'selected')}
               className="bg-white text-violet-900 font-bold py-2 px-4 rounded-xl shadow-sm border-b-2 border-violet-100 hover:-translate-y-0.5 transition-all animate-fadeIn"
             >
               {word.text}
             </button>
           ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
           {availableWords.map(word => (
             <button
               key={word.id}
               onClick={() => handleWordClick(word, 'available')}
               className="bg-violet-500 text-white font-bold py-3 px-5 rounded-xl shadow-md border-b-4 border-violet-700 active:border-b-0 active:translate-y-1 transition-all"
             >
               {word.text}
             </button>
           ))}
        </div>

        {status === 'incorrect' && (
           <div className="flex items-center justify-center text-rose-600 mb-4 animate-fadeIn">
             <AlertTriangle className="mr-2" /> Algo no encaja. ¡Inténtalo de nuevo!
           </div>
        )}

        {status === 'correct' ? (
          <div className="bg-teal-100 text-teal-800 p-4 rounded-xl text-center mb-4 animate-fadeIn">
            <p className="font-bold text-xl flex items-center justify-center gap-2">
               <CheckCircle /> ¡Perfecto!
            </p>
            <p className="mt-2 text-lg">{challenge?.originalSentence}</p>
          </div>
        ) : null}

        <div className="flex gap-4">
          <Button 
            onClick={() => {
               setAvailableWords([...availableWords, ...selectedWords].sort((a,b) => a.id - b.id));
               setSelectedWords([]);
               setStatus('idle');
            }} 
            variant="outline"
            className="flex-1"
            disabled={selectedWords.length === 0}
          >
            <Undo size={20} className="mx-auto" />
          </Button>
          
          {status === 'correct' ? (
             <Button onClick={loadChallenge} variant="primary" className="flex-[3] bg-teal-500 hover:bg-teal-600">
               Siguiente Puzzle <ArrowRight className="inline ml-2" size={20}/>
             </Button>
          ) : (
             <Button onClick={checkAnswer} variant="primary" className="flex-[3] bg-violet-600 hover:bg-violet-700" disabled={availableWords.length > 0}>
               Comprobar
             </Button>
          )}
        </div>

      </div>
    </div>
  );
};
