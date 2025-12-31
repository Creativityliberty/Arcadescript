import { GoogleGenerativeAI } from "@google/generative-ai";
import { SubtitleSegment } from "../types";

// Using the latest model as requested by the user
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Corrected model ID based on docs
});

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            if (!result) return reject("Failed to read blob");
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export async function generateSubtitlesFromAudio(mediaBlob: Blob): Promise<SubtitleSegment[]> {
    try {
        console.log("Preparing data for Gemini 2.5 Flash...");
        const base64Media = await blobToBase64(mediaBlob);

        const systemInstruction = `
      You are the OROCHI_SCRIPT_ENGINE, a specialized vocal analyst for ArcadeScript Video.
      Your mission is to analyze the provided audio and generate fighting-game style captions.
      
      CRITICAL INSTRUCTIONS:
      1. Transcribe EXACTLY what is said. Do not omit words.
      2. Analyze the emotional VIBE of each segment.
      3. Output ONLY a valid JSON array of objects.
      
      JSON Structure:
      [
        {
          "start": <number_in_seconds>,
          "end": <number_in_seconds>,
          "text": "<TRANSCRIPT_IN_CAPS>",
          "emotion": "anger" | "joy" | "hype" | "neutral"
        }
      ]
      
      EMOTION RULES:
      - "anger": Loud, aggressive, shouting, or intense words.
      - "hype": Energetic, fast, excited, "let's go" vibes.
      - "joy": Happy, laughing, positive.
      - "neutral": Calm, normal speaking.
      
      Keep segments short (max 2 seconds per segment) to keep the flow fast like a combo!
    `;

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mediaBlob.type || "video/webm",
                    data: base64Media
                }
            },
            { text: systemInstruction }
        ]);

        const responseText = result.response.text();
        console.log("Gemini Response received.");

        // Extract JSON from potential markdown tags
        const jsonStr = responseText.includes("```json")
            ? responseText.split("```json")[1].split("```")[0].trim()
            : responseText.includes("[")
                ? responseText.substring(responseText.indexOf("["), responseText.lastIndexOf("]") + 1)
                : responseText;

        const subtitles = JSON.parse(jsonStr) as SubtitleSegment[];

        if (!Array.isArray(subtitles)) throw new Error("Invalid format from AI");

        return subtitles.filter(c => c.text.trim().length > 0);
    } catch (err) {
        console.error("Gemini Transcription Failed", err);
        return [];
    }
}

export async function generateScriptHelp(prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `
        You are YASHIRO NANAKASE, a fighter from King of Fighters.
        You are coaching a rookie on how to make a viral video script.
        
        Your tone: Aggressive, Hype, Arcade-style, slang.
        
        The user will give you a rough idea. You must:
        1. Rewrite it to be punchy and viral.
        2. Keep it short (under 60s).
        3. Add stage directions in [brackets].
        4. Use CAPS for emphasis.
        
        Output ONLY the improved script text. No intro/outro fluff.
        `
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
}
