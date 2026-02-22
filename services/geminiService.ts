
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutPlan } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key non configurata. Verifica le impostazioni.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWorkoutWithAI = async (prompt: string): Promise<Partial<WorkoutPlan>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera una scheda di allenamento professionale basata su questa richiesta: "${prompt}". 
               La risposta deve essere in formato JSON e includere un titolo, l'obiettivo principale, 
               la frequenza settimanale consigliata e un array di giorni (days), 
               ognuno con un nome e una lista di esercizi. 
               Ogni esercizio deve avere: name, sets (numero), reps (stringa), rest (stringa) e notes (stringa).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          goal: { type: Type.STRING },
          frequency: { type: Type.NUMBER },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayName: { type: Type.STRING },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      sets: { type: Type.NUMBER },
                      reps: { type: Type.STRING },
                      rest: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    },
                    required: ["name", "sets", "reps", "rest"]
                  }
                }
              },
              required: ["dayName", "exercises"]
            }
          }
        },
        required: ["title", "goal", "frequency", "days"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Errore nel parsing della risposta AI", e);
    throw new Error("Impossibile generare la scheda. Riprova con un prompt diverso.");
  }
};
