
import React from 'react';
import { AppMode } from '../types';
import { Dumbbell, Brain, MessageSquare, PartyPopper, Puzzle, Eye } from 'lucide-react';

interface HomeViewProps {
  setMode: (mode: AppMode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setMode }) => {
  const modules = [
    {
      mode: AppMode.CONJUGATION_DOJO,
      title: "Dojo de Conjugación",
      description: "Entrena tus músculos gramaticales. Regular e Irregular.",
      icon: <Dumbbell size={32} className="text-white" />,
      color: "bg-rose-500"
    },
    {
      mode: AppMode.TRIGGER_DETECTIVE,
      title: "Detective de Disparadores",
      description: "¿Indicativo o Subjuntivo? Encuentra la pista.",
      icon: <Brain size={32} className="text-white" />,
      color: "bg-indigo-500"
    },
    {
      mode: AppMode.SENTENCE_BUILDER,
      title: "Constructor de Frases",
      description: "Crea oraciones complejas con guía paso a paso.",
      icon: <PartyPopper size={32} className="text-white" />,
      color: "bg-amber-500"
    },
    {
      mode: AppMode.SYNTAX_PUZZLE,
      title: "Puzzle de Sintaxis",
      description: "Ordena las palabras para formar frases lógicas.",
      icon: <Puzzle size={32} className="text-white" />,
      color: "bg-violet-600"
    },
    {
      mode: AppMode.ERROR_HUNTER,
      title: "Cazador de Errores",
      description: "Afina tu oído. Encuentra la frase incorrecta.",
      icon: <Eye size={32} className="text-white" />,
      color: "bg-emerald-500"
    },
    {
      mode: AppMode.ROLEPLAY_SCENARIO,
      title: "Roleplay Situacional",
      description: "Conversa con la IA en situaciones de la vida real.",
      icon: <MessageSquare size={32} className="text-white" />,
      color: "bg-teal-500"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          ¡Hola! 👋 ¿Qué vamos a practicar hoy?
        </h1>
        <p className="text-xl text-gray-600">
          Domina el subjuntivo paso a paso con estos minijuegos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {modules.map((mod) => (
          <button
            key={mod.mode}
            onClick={() => setMode(mod.mode)}
            className="group relative overflow-hidden rounded-3xl p-8 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 text-left border-2 border-gray-100 hover:border-gray-300 hover:-translate-y-2 flex flex-col h-full"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full ${mod.color} opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
            
            <div className="flex items-start space-x-5">
              <div className={`p-5 rounded-2xl ${mod.color} shadow-md flex-shrink-0 transition-transform group-hover:rotate-6`}>
                {mod.icon}
              </div>
              <div className="flex-1 z-10 pt-2">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{mod.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed">{mod.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
