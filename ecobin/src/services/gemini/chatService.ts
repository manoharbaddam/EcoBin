import { GEMINI_API_KEY, GEMINI_API_URL } from "../../config/env.config";

// let conversation: { role: string; text: string }[] = [];

// export const chatService = {
//   sendMessage: async (message: string) => {
//     conversation.push({ role: "user", text: message });

//     try {
//       const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: conversation.map((m) => ({
//             role: m.role,
//             parts: [{ text: m.text }],
//           })),
//         }),
//       });

//       const data = await response.json();
//       const reply =
//         data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//         "Sorry, I couldn’t understand that.";

//       conversation.push({ role: "model", text: reply });
//       return reply;
//     } catch (error) {
//       console.error("Chatbot error:", error);
//       return "Something went wrong. Please try again.";
//     }
//   },
// };

export const chatService = {
  sendMessage: async (message: string) => {
    try {
    //   console.log("📤 Sending to Gemini:", message);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message + " short and crisp"}],
            },
          ],
        }),
      });

      const data = await response.json();

      console.log("📥 Gemini RAW Response:", data);

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ I couldn't understand that.";

      return reply;
    } catch (err) {
      console.log("❌ Gemini error:", err);
      return "❌ Error contacting AI. Check your API key or model.";
    }
  },
};
