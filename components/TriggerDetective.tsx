import React, { useEffect, useState } from 'react';
import { generateTriggerChallenge } from '../services/gemini';
import { TriggerChallenge, FeedbackStatus } from '../types';
import { Button } from './Button';
import { Loader2, Search, Lightbulb, ArrowRight, BookOpen } from 'lucide-react';

// Concept Card Data
const CONCEPTS = [
  {
    title: "Dos Mundos",
    icon: "🌍 vs 💭",
    content: "El español tiene dos modos principales. El <b>Indicativo</b> es para el mundo real (hechos, certezas). El <b>Subjuntivo</b> es para el mundo subjetivo (deseos, dudas, emociones).",
    color: "bg-blue-500"
  },
  {
    title: "W.E.I.R.D.O",
    icon: "👽",
    content: "Usa subjuntivo para: <br/><b>W</b>ishes (Deseos)<br/><b>E</b>motions (Emociones)<br/><b>I</b>mpersonal expressions (Es bueno que...)<br/><b>R</b>ecommendations (Consejos)<br/><b>D</b>oubt (Duda)<br/><b>O</b>jalá",
    color: "bg-purple-500"
  },
  {
    title: "El Interruptor",
    icon: "🔌",
    content: "Imagina un interruptor. Si la primera parte de la frase expresa <i>Control/Certeza</i> → Indicativo. Si expresa <i>Influencia/Sentimiento</i> → Subjuntivo.",
    color: "bg-amber-500"
  }
];

export const TriggerDetective: React.FC<{ addPoints: (p: number) => void }> = ({ addPoints }) => {
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [conceptIndex, setConceptIndex] = useState(0);

  // Practice State
  const [challenge, setChallenge] = useState<TriggerChallenge | null>(null);
  const [status, setStatus] = useState<FeedbackStatus>('loading');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  const loadChallenge = async () => {
    setStatus('loading');
    setSelectedOptionIndex(null);
    const data = await generateTriggerChallenge();
    setChallenge(data);
    setStatus('idle');
  };

  useEffect(() => {
    if (mode === 'practice') {
      loadChallenge();
    }
  }, [mode]);

  const handleSelect = (index: number) => {
    if (status !== 'idle') return;
    setSelectedOptionIndex(index);
    
    if (challenge?.options[index].isCorrect) {
      setStatus('correct');
      addPoints(15);
    } else {
      setStatus('incorrect');
    }
  };

  // RENDER LEARNING MODE
  if (mode === 'learn') {
    const concept = CONCEPTS[conceptIndex];
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="text-center mb-6">
           <h2 className="text-3xl font-extrabold text-gray-800">La Teoría Visual</h2>
           <p className="text-gray-500">Entiende el concepto antes de practicar</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative min-h-[400px] flex flex-col">
           <div className={`${concept.color} p-8 text-white text-center transition-colors duration-500`}>
              <div className="text-6xl mb-4">{concept.icon}</div>
              <h3 className="text-3xl font-bold">{concept.title}</h3>
           </div>
           
           <div className="p-8 flex-1 flex items-center justify-center">
              <p className="text-xl text-gray-700 text-center leading-relaxed" dangerouslySetInnerHTML={{__html: concept.content}}></p>
           </div>

           <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div className="flex space-x-2">
                {CONCEPTS.map((_, i) => (
                  <div key={i} className={`h-2 w-2 rounded-full ${i === conceptIndex ? 'bg-gray-800' : 'bg-gray-300'}`} />
                ))}
              </div>
              
              {conceptIndex < CONCEPTS.length - 1 ? (
                <Button onClick={() => setConceptIndex(prev => prev + 1)} variant="primary">
                  Siguiente <ArrowRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={() => setMode('practice')} variant="secondary">
                  ¡A Practicar! <Search size={18} className="ml-2" />
                </Button>
              )}
           </div>
        </div>
      </div>
    );
  }

  // RENDER PRACTICE MODE
  if (status === 'loading' && !challenge) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto fade-in">
       
       <div className="flex justify-between items-center mb-4">
          <button onClick={() => setMode('learn')} className="text-indigo-600 font-bold flex items-center hover:underline">
             <BookOpen size={20} className="mr-2"/> Repasar Teoría
          </button>
       </div>

       <div className="bg-white rounded-3xl shadow-xl p-8 relative border-t-8 border-indigo-500">
          
          <div className="flex items-center justify-center space-x-3 mb-8">
             <Search className="text-indigo-500" size={28} />
             <h2 className="text-2xl font-bold text-gray-800">Detective de Disparadores</h2>
          </div>

          {/* The Sentence Context */}
          <div className="bg-indigo-50 rounded-2xl p-8 text-center mb-8">
            <p className="text-indigo-400 uppercase text-xs font-bold tracking-widest mb-2">Pista: {challenge?.triggerType}</p>
            <p className="text-3xl text-gray-800 font-medium leading-relaxed">
              {challenge?.sentenceStart.replace('___', '_____')}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {challenge?.options.map((opt, idx) => {
              let btnClass = "border-2 border-gray-200 bg-white hover:bg-gray-50";
              if (status !== 'idle' && idx === selectedOptionIndex) {
                 btnClass = opt.isCorrect 
                  ? "bg-teal-100 border-teal-500 text-teal-900" 
                  : "bg-rose-100 border-rose-500 text-rose-900";
              } else if (status !== 'idle' && opt.isCorrect) {
                 // Show correct answer if user missed
                 btnClass = "bg-teal-50 border-teal-300 text-teal-700 border-dashed";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={status !== 'idle'}
                  className={`p-6 rounded-xl text-xl font-bold transition-all duration-200 ${btnClass}`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {status !== 'idle' && selectedOptionIndex !== null && challenge && (
            <div className="animate-fadeIn bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-start space-x-3">
                 <div className="bg-indigo-100 p-2 rounded-full">
                    <Lightbulb size={20} className="text-indigo-600" />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-800 mb-1">Análisis del Profesor</h4>
                    <p className="text-gray-600" dangerouslySetInnerHTML={{ 
                      __html: challenge.options[selectedOptionIndex].explanation 
                    }} />
                 </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={loadChallenge} variant="primary">
                  Siguiente Caso
                </Button>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};