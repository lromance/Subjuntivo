
import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import { HomeView } from './components/HomeView';
import { ConjugationDojo } from './components/ConjugationDojo';
import { TriggerDetective } from './components/TriggerDetective';
import { SentenceBuilder } from './components/SentenceBuilder';
import { SintaxisPuzzle } from './components/SintaxisPuzzle';
import { ErrorHunter } from './components/ErrorHunter';
import { Roleplay } from './components/Roleplay';
import { ArrowLeft, Star } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('subjuntivo_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('subjuntivo_score', score.toString());
  }, [score]);

  const addPoints = (points: number) => {
    setScore(prev => prev + points);
  };

  // Level Calculation Logic
  const getLevelInfo = (points: number) => {
    if (points < 100) return { level: 1, title: "Novato", next: 100 };
    if (points < 300) return { level: 2, title: "Aprendiz", next: 300 };
    if (points < 600) return { level: 3, title: "Practicante", next: 600 };
    if (points < 1000) return { level: 4, title: "Experto", next: 1000 };
    return { level: 5, title: "Maestro Subjuntivo", next: 2000 };
  };

  const levelInfo = getLevelInfo(score);
  const progressPercent = Math.min(100, (score / levelInfo.next) * 100);

  const renderContent = () => {
    switch (mode) {
      case AppMode.CONJUGATION_DOJO:
        return <ConjugationDojo addPoints={addPoints} />;
      case AppMode.TRIGGER_DETECTIVE:
        return <TriggerDetective addPoints={addPoints} />;
      case AppMode.SENTENCE_BUILDER:
        return <SentenceBuilder addPoints={addPoints} />;
      case AppMode.SYNTAX_PUZZLE:
        return <SintaxisPuzzle addPoints={addPoints} />;
      case AppMode.ERROR_HUNTER:
        return <ErrorHunter addPoints={addPoints} />;
      case AppMode.ROLEPLAY_SCENARIO:
        return <Roleplay />;
      case AppMode.HOME:
      default:
        return <HomeView setMode={setMode} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              {mode !== AppMode.HOME && (
                <button 
                  onClick={() => setMode(AppMode.HOME)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <span className="hidden sm:block font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
                Subjuntivo Mágico
              </span>
            </div>
            
            {/* Gamification Status */}
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end mr-2 hidden sm:flex">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nivel {levelInfo.level}</span>
                  <span className="text-sm font-bold text-indigo-900">{levelInfo.title}</span>
               </div>
               
               <div className="relative w-32 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
               </div>

               <div className="flex items-center bg-amber-100 px-4 py-2 rounded-full shadow-sm border border-amber-200">
                  <Star className="text-amber-500 fill-amber-500 mr-2" size={20} />
                  <span className="font-bold text-amber-800">{score}</span>
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-400 text-sm">
        <p>Diseñado para estudiantes de B1 ❤️ Practica cada día.</p>
      </footer>
    </div>
  );
}
