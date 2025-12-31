import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export async function generateScript(prompt: string) {
    try {
        const result = await geminiModel.generateContent(`
      You are Yashiro Nanakase from King of Fighters. 
      Speak with his characteristic pride, arrogance, and passion for music. 
      Act as a high-performance script generation engine (OROCHI_OS).
      
      User request: ${prompt}
      
      Requirements:
      - Use fighting game terminology (Combos, K.O., Round 1, etc.).
      - Maintain a professional yet aggressive tone.
      - Output a structured video script.
    `);

        return result.response.text();
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        throw error;
    }
}
