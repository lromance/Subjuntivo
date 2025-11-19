
export enum AppMode {
  HOME = 'HOME',
  CONJUGATION_DOJO = 'CONJUGATION_DOJO',
  TRIGGER_DETECTIVE = 'TRIGGER_DETECTIVE', // Indicative vs Subjunctive
  SENTENCE_BUILDER = 'SENTENCE_BUILDER',
  SYNTAX_PUZZLE = 'SYNTAX_PUZZLE', // Order words
  ERROR_HUNTER = 'ERROR_HUNTER', // Identify correct sentence
  ROLEPLAY_SCENARIO = 'ROLEPLAY_SCENARIO'
}

export interface ConjugationChallenge {
  verb: string;
  mood: string;
  person: string; // e.g., "Yo", "Nosotros"
  tense: string; // "Presente", "Imperfecto"
  correctForm: string;
  hint: string; // Translation or rule hint
}

export interface TriggerChallenge {
  sentenceStart: string;
  triggerType: string; // e.g., "Emotion", "Doubt", "Wish"
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface SentenceChallenge {
  context: string;
  trigger: string; // e.g., "Es importante que..."
  verbOptions: string[]; // e.g. ["ir", "comer", "hablar"] - 3 infinitives
  correctVerbInfinitive: string; 
  targetTranslation: string; // English hint
}

export interface PuzzleChallenge {
  originalSentence: string;
  scrambledWords: string[];
  translation: string;
}

export interface ErrorChallenge {
  context: string;
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface UserState {
  points: number;
  streak: number;
  level: number; // 1 to 5
}

export type FeedbackStatus = 'idle' | 'loading' | 'correct' | 'incorrect';
