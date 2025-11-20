
import { GoogleGenAI, Type } from "@google/genai";
import { ConjugationChallenge, TriggerChallenge, SentenceChallenge, PuzzleChallenge, ErrorChallenge } from "../types";

// Access the global constant defined in vite.config.ts
declare const __API_KEY__: string;
const apiKey = typeof __API_KEY__ !== 'undefined' ? __API_KEY__ : '';

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
Eres un profesor experto de ELE (Español como Lengua Extranjera) especializado en enseñar el subjuntivo a estudiantes de nivel B1 que hablan lenguas no románicas.
Tu tono es alentador, claro, colorido y divertido.
IMPORTANTE: NUNCA uses Markdown. Usa SOLAMENTE etiquetas HTML simples (<b>, <i>, <br>, <span class="text-indigo-600">) para formatear el texto.
Tus explicaciones deben ayudar a entender el concepto de "Mundo Real (Indicativo)" vs "Mundo Subjetivo/No Real (Subjuntivo)".
`;

const modelId = "gemini-2.5-flash";

// Helper to remove markdown code blocks if the model hallucinates them
const cleanText = (text: string): string => {
  return text
    .replace(/```json/g, '')
    .replace(/```html/g, '')
    .replace(/```/g, '')
    .trim();
};

// 1. Conjugation Generator
export const generateConjugationChallenge = async (): Promise<ConjugationChallenge> => {
  try {
    // Add a random element to the prompt to avoid caching and encourage variety
    const randomSeed = Math.random();
    const prompt = `Genera un nuevo y aleatorio ejercicio de conjugación de subjuntivo para nivel B1 (seed: ${randomSeed}). Prioriza verbos irregulares comunes (ser, ir, tener, saber) o cambios de raíz (querer, pedir).`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verb: { type: Type.STRING },
            mood: { type: Type.STRING, description: "Subjuntivo" },
            person: { type: Type.STRING },
            tense: { type: Type.STRING, description: "Presente o Imperfecto" },
            correctForm: { type: Type.STRING },
            hint: { type: Type.STRING, description: "Una pista breve en HTML." }
          },
          required: ["verb", "mood", "person", "tense", "correctForm", "hint"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanText(response.text)) as ConjugationChallenge;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error generating conjugation:", error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};

// 2. Trigger Detective (Indicative vs Subjunctive)
export const generateTriggerChallenge = async (): Promise<TriggerChallenge> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Genera una frase incompleta donde el estudiante debe elegir entre Indicativo o Subjuntivo. Céntrate en contrastes claros: 'Creo que...' vs 'No creo que...', 'Es verdad que...' vs 'Es posible que...'.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentenceStart: { type: Type.STRING, description: "La frase con un hueco '___'." },
            triggerType: { type: Type.STRING, description: "El tipo de disparador (Duda, Emoción, Certeza, etc)." },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING, description: "Explicación breve en HTML." }
                },
                required: ["text", "isCorrect", "explanation"]
              }
            }
          },
          required: ["sentenceStart", "triggerType", "options"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanText(response.text)) as TriggerChallenge;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 3. Sentence Builder Generator
export const generateSentenceScenario = async (): Promise<SentenceChallenge> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Genera un escenario para construir una frase en subjuntivo. Da 3 opciones de verbos en infinitivo, solo uno tiene sentido lógico en el contexto.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            context: { type: Type.STRING, description: "Situación breve (ej. Tu amigo está enfermo)." },
            trigger: { type: Type.STRING, description: "Inicio de la frase (ej. Espero que...)" },
            verbOptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 verbos infinitivos distintos." },
            correctVerbInfinitive: { type: Type.STRING, description: "El verbo infinitivo correcto de las opciones." },
            targetTranslation: { type: Type.STRING, description: "Traducción aproximada de la idea en inglés." }
          },
          required: ["context", "trigger", "verbOptions", "correctVerbInfinitive", "targetTranslation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanText(response.text)) as SentenceChallenge;
    }
    throw new Error("No response");
  } catch (e) {
    console.error("Error generating sentence scenario:", e);
    throw e;
  }
};

// 3b. Sentence Builder Evaluator
export const evaluateSentence = async (context: string, trigger: string, userSentence: string): Promise<{isCorrect: boolean, feedback: string, correction: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Contexto: "${context}". Frase completa intentada: "${trigger} ${userSentence}". Evalúa si el verbo está bien conjugado en subjuntivo y si la frase tiene sentido.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING, description: "Explicación pedagógica en HTML." },
            correction: { type: Type.STRING, description: "La frase completa correcta." }
          },
          required: ["isCorrect", "feedback", "correction"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanText(response.text));
    }
    throw new Error("No response");
  } catch (error) {
    console.error("Error evaluating sentence:", error);
    throw error;
  }
};

// 4. Generate Roleplay Scenario
export const generateRoleplayStart = async (): Promise<{scenario: string, teacherPrompt: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Genera un escenario corto de rol (roleplay) para practicar el subjuntivo (ej. aconsejar a un amigo, planear una fiesta sorpresa, expresar deseos para el futuro). Da una primera frase para iniciar la conversación.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            teacherPrompt: { type: Type.STRING }
          },
          required: ["scenario", "teacherPrompt"]
        }
      }
    });
     if (response.text) return JSON.parse(cleanText(response.text));
     throw new Error("No response text from Gemini");
  } catch (e) {
    console.error("Error generating roleplay start:", e);
    throw e;
  }
}

export const chatWithTutor = async (history: {role: string, parts: [{text: string}]}[], message: string) => {
  const chat = ai.chats.create({
    model: modelId,
    config: { systemInstruction: SYSTEM_INSTRUCTION },
    history: history
  });
  
  const result = await chat.sendMessage({ message });
  // Use cleanText here too just in case, though strictly it's for JSON
  return cleanText(result.text || '');
}

// 5. Generate Syntax Puzzle
export const generatePuzzleChallenge = async (): Promise<PuzzleChallenge> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Genera una oración interesante usando subjuntivo (nivel B1). Devuelve la oración completa y una lista de sus palabras desordenadas.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalSentence: { type: Type.STRING, description: "La frase correcta completa." },
            scrambledWords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "La lista de palabras de la frase en orden aleatorio."
            },
            translation: { type: Type.STRING, description: "Traducción al inglés." }
          },
          required: ["originalSentence", "scrambledWords", "translation"]
        }
      }
    });

    if (response.text) return JSON.parse(cleanText(response.text));
    throw new Error("No data from Gemini");
  } catch (e) {
    console.error("Error generating puzzle challenge:", e);
    throw e;
  }
};

// 6. Generate Error Hunter
export const generateErrorChallenge = async (): Promise<ErrorChallenge> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Genera un ejercicio de 'Encuentra el error'. Da dos frases muy parecidas sobre un mismo contexto: una correcta (usando subjuntivo/indicativo apropiadamente) y otra con un error gramatical común de estudiantes B1.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            context: { type: Type.STRING, description: "Breve contexto de la situación." },
            options: {
              type: Type.ARRAY,
              items: {
                 type: Type.OBJECT,
                 properties: {
                    id: { type: Type.INTEGER },
                    text: { type: Type.STRING },
                    isCorrect: { type: Type.BOOLEAN }
                 },
                 required: ["id", "text", "isCorrect"]
              }
            },
            explanation: { type: Type.STRING, description: "Explicación pedagógica de por qué una es correcta y la otra no (HTML)." }
          },
          required: ["context", "options", "explanation"]
        }
      }
    });
    if (response.text) return JSON.parse(cleanText(response.text));
    throw new Error("No data from Gemini");
  } catch (e) {
    console.error("Error generating error challenge:", e);
    throw e;
  }
};
