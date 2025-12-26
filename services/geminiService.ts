
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a professional AI writing assistant specializing in Urdu and Roman Urdu to English translation.

Rules:
1. Convert user text (Urdu script or Roman Urdu) into clear, professional, and grammatically correct English.
2. Translate meaning accurately without adding extra ideas or fluff.
3. If input is Roman Urdu, convert it to natural, fluent English (avoid word-by-word literal translation).
4. Improve grammar, clarity, and sentence structure significantly.
5. Tone: Fluent, professional, and sophisticated.
6. Output: PROVIDE ONLY THE CORRECTED ENGLISH TEXT. Do not include labels like "Translated Text:", do not include explanations, and do not include conversational fillers.`;

export const translateUrduToEnglish = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0, // Maximum deterministic output for professional accuracy
      },
    });

    const result = (response.text || "").trim();
    
    // Safety strip for any labels the model might mistakenly include
    return result
      .replace(/^Translated Text:\s*/i, '')
      .replace(/^"(.*)"$/, '$1') 
      .trim();
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw new Error("The translation service encountered an error. Please try again.");
  }
};
