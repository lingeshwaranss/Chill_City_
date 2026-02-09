import { GoogleGenAI } from "@google/genai";

export const analyzeIssueImage = async (base64Image: string, locationContext?: string): Promise<{ type: string; description: string; isFraud?: boolean; fraudReason?: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Analyze this image for a civic issue report app in Chennai.
            
            Location Context: ${locationContext || "Unknown Location"}
            
            First, perform a FRAUD CHECK:
            1. Is this a photo of a computer screen, mobile screen, or printed photo?
            2. Is the image extremely blurry, black/blank, or completely dark?
            3. Is this obviously not a civic issue (e.g. selfie, food, indoors personal item)?
            4. Does the image content contradict the provided location context (e.g., snow in Chennai)?
            
            If Fraud is detected, set "isFraud" to true and "fraudReason".
            
            If valid:
            Identify the main issue type (e.g., Pothole, Garbage Dump, Streetlight Failure, Water Leakage, Traffic, Broken Footpath).
            Provide a short, professional description of the problem.
            
            Return ONLY a valid JSON object with keys: "type", "description", "isFraud" (boolean), "fraudReason" (string, optional). 
            Do not wrap in markdown code blocks.`,
          },
        ],
      },
    });

    const text = response.text || "{}";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      type: "Unknown Issue",
      description: "Could not analyze image automatically. Please describe the issue."
    };
  }
};