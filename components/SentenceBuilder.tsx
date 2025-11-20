import React, { useState, useEffect } from 'react';
import { generateSentenceScenario, evaluateSentence } from '../services/gemini';
import { SentenceChallenge } from '../types';
import { Button } from './Button';
import { Loader2, Send, ArrowRight, Check, Type, XCircle } from 'lucide-react';

export const SentenceBuilder: React.FC<{ addPoints: (p: number) => void }> = ({ addPoints }) => {
  const [step, setStep] = useState<'loading' | 'choose_verb' | 'construct' | 'feedback'>('loading');
  const [challenge, setChallenge] = useState<SentenceChallenge | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);
  const [userSentencePart, setUserSentencePart] = useState("");
  const [feedback, setFeedback] = useState<{isCorrect: boolean, feedback: string, correction: string} | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChallenge = async () => {
    setStep('loading');
    setError(null);
    setChallenge(null);
    setSelectedVerb(null);
    setUserSentencePart("");
    setFeedback(null);
    
    try {
      const data = await generateSentenceScenario();
      setChallenge(data);
      setStep('choose_verb');
    } catch (e: any) {
      console.error(e);
      setError(`Error al cargar el escenario: ${e.message}`);
      setStep('feedback'); // go to a state where error can be shown
    }
  };

  useEffect(() => {
    loadChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerbSelect = (verb: string) => {
    if (verb === challenge?.correctVerbInfinitive) {
      setSelectedVerb(verb);
      setStep('construct');
    } else {
      // Simple immediate shake or error (simplified here)
      alert("Ese verbo no encaja bien en este contexto. ¡Prueba otro!");
    }
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    setEvaluating(true);
    setError(null);
    
    try {
      const result = await evaluateSentence(challenge.context, challenge.trigger, userSentencePart);
      setFeedback(result);
      if (result.isCorrect) addPoints(25);
    } catch (e: any) {
      console.error(e);
      setError(`Error al evaluar la respuesta: ${e.message}`);
    } finally {
      setStep('feedback');
      setEvaluating(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-amber-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p>Diseñando una situación...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl p-8">
        <XCircle className="mb-4" size={48} />
        <h3 className="text-xl font-bold mb-2">Error de Conexión</h3>
        <p className="text-center mb-4">{error}</p>
        <Button onClick={loadChallenge} variant="outline">
          Intentar de Nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      {/* Header Progress */}
      <div className="flex items-center justify-center mb-8 space-x-2">
        <div className={`h-2 w-1/3 rounded-full transition-all ${step === 'choose_verb' ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
        <div className={`h-2 w-1/3 rounded-full transition-all ${step === 'construct' ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
        <div className={`h-2 w-1/3 rounded-full transition-all ${step === 'feedback' ? 'bg-teal-500' : 'bg-amber-200'}`}></div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border-b-8 border-amber-100">
        
        {/* Context Section */}
        <div className="bg-amber-50 rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-amber-200 text-amber-800 text-xs font-bold px-3 py-1 rounded-br-lg uppercase">
            Contexto
          </div>
          <p className="text-xl text-gray-800 mt-2 font-medium">
            {challenge?.context}
          </p>
          <p className="text-sm text-gray-500 mt-2 italic">
            Idea: "{challenge?.targetTranslation}"
          </p>
        </div>

        {/* Step 1: Choose Verb */}
        {step === 'choose_verb' && (
          <div className="fade-in">
            <h3 className="text-center text-gray-600 mb-4 font-bold">Paso 1: Elige el verbo lógico</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {challenge?.verbOptions.map((verb) => (
                <button
                  key={verb}
                  onClick={() => handleVerbSelect(verb)}
                  className="py-4 px-2 bg-white border-2 border-gray-100 hover:border-amber-400 hover:bg-amber-50 rounded-xl font-bold text-lg text-gray-700 transition-all transform hover:-translate-y-1 shadow-sm"
                >
                  {verb}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Construct Sentence */}
        {(step === 'construct' || step === 'feedback') && (
          <div className="fade-in">
             <h3 className="text-center text-gray-600 mb-4 font-bold">
               Paso 2: Conjuga <i>{selectedVerb}</i> y completa
             </h3>
             
             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex flex-wrap items-baseline gap-2 text-xl sm:text-2xl">
                  <span className="font-bold text-amber-600">{challenge?.trigger}</span>
                  {step === 'construct' ? (
                    <input
                      type="text"
                      value={userSentencePart}
                      onChange={(e) => setUserSentencePart(e.target.value)}
                      className="flex-1 bg-transparent border-b-2 border-gray-300 focus:border-amber-500 outline-none py-1 px-1 font-medium text-gray-800 placeholder-gray-400 min-w-[200px]"
                      placeholder={`... (usa ${selectedVerb})`}
                      autoFocus
                      disabled={evaluating}
                    />
                  ) : (
                    <span className={`font-medium ${feedback?.isCorrect ? 'text-teal-700' : 'text-rose-700'}`}>
                      {userSentencePart}
                    </span>
                  )}
                </div>
             </div>

             {step === 'construct' && (
               <div className="mt-6 flex justify-end">
                 <Button 
                    onClick={handleSubmit} 
                    disabled={!userSentencePart.trim() || evaluating} 
                    variant="accent"
                 >
                   {evaluating ? <Loader2 className="animate-spin" /> : <span className="flex items-center">Comprobar <Check className="ml-2" size={20}/></span>}
                 </Button>
               </div>
             )}
          </div>
        )}

        {/* Step 3: Feedback */}
        {step === 'feedback' && feedback && (
           <div className="mt-6 animate-fadeIn">
              <div className={`p-6 rounded-2xl mb-6 ${feedback.isCorrect ? 'bg-teal-50 border border-teal-100' : 'bg-rose-50 border border-rose-100'}`}>
                  <div className="flex items-start gap-3 mb-3">
                     {feedback.isCorrect ? (
                       <div className="bg-teal-100 p-2 rounded-full text-teal-600"><Check size={24} /></div>
                     ) : (
                       <div className="bg-rose-100 p-2 rounded-full text-rose-600"><Type size={24} /></div>
                     )}
                     <div>
                        <h4 className={`font-bold text-lg ${feedback.isCorrect ? 'text-teal-800' : 'text-rose-800'}`}>
                           {feedback.isCorrect ? '¡Perfecto!' : 'Casi, pero no.'}
                        </h4>
                        <div className="text-gray-700 mt-1 leading-relaxed" dangerouslySetInnerHTML={{__html: feedback.feedback}} />
                     </div>
                  </div>

                  {!feedback.isCorrect && (
                    <div className="mt-4 bg-white/60 p-4 rounded-xl text-center">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Respuesta sugerida</span>
                       <p className="text-lg text-gray-800 font-bold mt-1">{feedback.correction}</p>
                    </div>
                  )}
              </div>
              
              <Button onClick={loadChallenge} variant="outline" fullWidth>
                Siguiente Reto <ArrowRight className="ml-2" size={18} />
              </Button>
           </div>
        )}

      </div>
    </div>
  );
};