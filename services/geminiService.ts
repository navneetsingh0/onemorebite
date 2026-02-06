
import { GoogleGenAI } from "@google/genai";
import { Mood, Place, Budget, BuddyResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are "One More Bite", a friendly Indian hostel senior. 
Your goal is to suggest exactly ONE realistic, healthier swap for whatever the user is planning to eat.

CRITICAL RULES:
- If the user's plan is unhealthy (e.g., just Maggi, chips, soda), you MUST suggest a healthy addition or a better alternative that is EASY to make in a hostel.
- Focus on "Micro-Upgrades": Add an egg, a handful of sprouts, a piece of fruit, or swap refined flour for whole grain.
- Ease of Prep: Swaps should be low-effort (kettle-friendly, 5-min prep, or raw).
- Budget: Keep it realistic for students.

HEALTH FOCUS:
- Explain the specific HEALTH RISK of their current plan briefly.
- Explain the specific HEALTH BENEFIT of your swap briefly.

LOCAL GROUNDING:
- Use Google Maps to find ONE real nearby place where they can get a healthy version or ingredients.

RESPONSE FORMAT:
You MUST respond ONLY with a raw JSON object string.
{
  "nudge": "Short, catchy advice (max 2 lines).",
  "suggestedFood": "Short name of the new meal.",
  "originalPrice": number,
  "suggestedPrice": number,
  "healthRisk": "Concise risk.",
  "healthBenefits": "Concise benefit.",
  "imagePrompt": "Minimalistic food photo description.",
  "nearbySpotName": "Place name",
  "nearbySpotLink": "Maps link"
}
`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getSuggestion(
    userInput: string, 
    context: { mood: Mood; place: Place; budget: Budget; lat?: number; lng?: number }
  ): Promise<BuddyResponse> {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const prompt = `
      Planned Meal: "${userInput}"
      Current Mood: ${context.mood}
      Location Category: ${context.place}
      Budget: ${context.budget}
      User Lat/Lng: ${context.lat}, ${context.lng}
    `;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleMaps: {} }],
        toolConfig: context.lat && context.lng ? {
          retrievalConfig: {
            latLng: {
              latitude: context.lat,
              longitude: context.lng
            }
          }
        } : undefined
      },
    });

    const text = response.text || '';
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const jsonStr = text.substring(start, end + 1);
        return JSON.parse(jsonStr);
      }
      throw new Error("No JSON found");
    } catch (e) {
      console.error("Parse failed", text);
      return {
        nudge: "Keep it simple! Add a boiled egg to your meal for better focus.",
        suggestedFood: "Protein-boosted " + userInput,
        originalPrice: 40,
        suggestedPrice: 50,
        healthRisk: "Lacks protein, might lead to a mid-day crash.",
        healthBenefits: "Sustained energy and muscle repair.",
        imagePrompt: "Vibrant healthy version of " + userInput,
      };
    }
  }

  async generateMealImage(prompt: string): Promise<string> {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality, minimal top-down photo: ${prompt}. Clean white aesthetic.` }]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  }
}

export const geminiService = new GeminiService();
