import * as FileSystem from "expo-file-system/legacy";
import { GEMINI_API_KEY, GEMINI_API_URL } from "../../config/env.config";


let sessions: any[] = [];

export const classificationService = {
  classify: async (imageUri: string) => {
    try {
      // ✅ Convert image to Base64 (fixed encoding)
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });

      // ✅ Send image + prompt to Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "gemini-2.5-flash",
            generationConfig: { // <-- THIS IS THE REQUIRED FIX
                temperature: 0.05,
        responseMimeType: "application/json", 
        responseSchema: {
            type: "OBJECT",
            properties: {
                classification: {
                    type: "STRING",
                    enum: ["Biodegradable", "Non-biodegradable"]
                },
                confidence: {
                        type: "NUMBER", 
                        description: "Confidence score from 0.0 to 1.0",
                    }
            }
        }
    },
          contents: [
            {
              parts: [
                {
                        text: "You are a waste classification expert for residential sorting systems. Your primary goal is to determine the correct disposal method based on *local recycling programs*, NOT scientific biodegradability. For this application, all conventional plastic, metal, and glass is 'Non-biodegradable'. Only food scraps, yard waste, and paper that is explicitly stated as compostable are 'Biodegradable'. Do not use any other context.Be Strict!!!",
                },
                {
                  text: "All papers and books are biodegradable. Classify this image as biodegradable or non-biodegradable. Respond only with one word: 'Biodegradable' or 'Non-biodegradable'.",
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      console.log(" response:", data);

      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const isBio = !output?.toLowerCase().includes("non");

      // ✅ Build result object for your existing ResultScreen
      const result = {
        imageUri,
        confidence: 0.95,
        category: {
          id: isBio ? "bio" : "non-bio",
          name: isBio ? "Biodegradable" : "Non-Biodegradable",
          icon: isBio ? "🌿" : "🪨",
          binType: {
            name: isBio ? "Green Bin" : "Blue Bin",
            color: isBio ? "#4CAF50" : "#2196F3",
            description: isBio
              ? "Dispose biodegradable waste here. Includes food, paper, and organic material."
              : "Dispose non-biodegradable waste here. Includes plastics, metals, and glass.",
          },
        },
        pointsEarned: isBio ? 10 : 5,
        instructions: isBio
          ? ["Compost if possible", "Avoid mixing with plastic waste"]
          : ["Recycle or dispose responsibly", "Avoid littering"],
      };

      return result;
    } catch (error) {
      console.error(" classification failed:", error);
      throw error;
    }
  },

  // Optional local session tracking
  addSession: (result: any) => {
    sessions.push(result);
  },

  getSessions: () => sessions,
};
