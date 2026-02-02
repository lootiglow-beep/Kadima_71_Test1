import { GoogleGenAI } from "@google/genai";

export const generateSmartDescription = async (title: string, type: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found for Gemini.");
    return "תיאור אוטומטי לא זמין (חסר מפתח API)";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, professional Hebrew description (max 10 words) for a resource titled "${title}" of type "${type}". Return only the text.`,
    });
    return response.text?.trim() || "תיאור לא זמין";
  } catch (error) {
    console.error("Error generating description:", error);
    return "תיאור כללי למשאב חדש";
  }
};