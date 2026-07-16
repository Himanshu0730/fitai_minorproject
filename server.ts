import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables for local development
dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set body limit higher to support image base64 uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API endpoints FIRST
  app.post("/api/gemini/coach-chat", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({ error: "Gemini API client not initialized. GEMINI_API_KEY may be missing." });
      }

      const { messages, userProfile } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages body" });
      }

      const systemInstruction = `You are a high-performance wellness, fitness, and nutrition coach.
The user is tracking their weight, calories, and goals.
Be encouraging, professional, and science-backed. Avoid generic advice; give actionable steps.
The user's current profile details:
- Name: ${userProfile?.fullName || "Jamie"}
- Weight Goal: ${userProfile?.targetWeight || "N/A"} ${userProfile?.weightUnit || "lbs"} (Current: ${userProfile?.currentWeight || "N/A"} ${userProfile?.weightUnit || "lbs"})
- Height: ${userProfile?.height || "N/A"} cm
- Calorie Intake Limit: ${userProfile?.calorieGoal || "2000"} kcal
- Protein Target: ${userProfile?.proteinGoal || "120"}g
- Carbs Target: ${userProfile?.carbsGoal || "200"}g
- Fat Target: ${userProfile?.fatGoal || "65"}g

Format your responses using clean Markdown. Feel free to use bolding, bullet points, and small tables to present food/workout breakdowns elegantly. Keep your response under 300 words for readability.`;

      const contents = messages.map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return res.json({ text: response.text });
      } else {
        return res.status(500).json({ error: "Empty response from Gemini API" });
      }
    } catch (error: any) {
      console.error("Error in server-side coach-chat:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch chat response" });
    }
  });

  app.post("/api/gemini/scan-meal", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({ error: "Gemini API client not initialized. GEMINI_API_KEY may be missing." });
      }

      const { imageBase64, mimeType, foodHint } = req.body;
      const contents: any[] = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanBase64,
          },
        });
      }

      contents.push({
        text: `Analyze this meal photo${foodHint ? ` (User hint: "${foodHint}")` : ""}. 
Estimate the calories, macronutrients (protein, carbs, fat in grams), health score (from 1 to 100, where 100 is highly nutritious and minimally processed, and 1 is heavily processed junk food), and provide a brief friendly nutritional summary.
Be realistic but helpful. If you cannot see food, analyze the user's hint text: "${foodHint || "unknown meal"}".`,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodName: { type: Type.STRING },
              calories: { type: Type.INTEGER },
              protein: { type: Type.INTEGER },
              carbs: { type: Type.INTEGER },
              fat: { type: Type.INTEGER },
              healthScore: { type: Type.INTEGER },
              summary: { type: Type.STRING },
              dietaryTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["foodName", "calories", "protein", "carbs", "fat", "healthScore", "summary", "dietaryTags"],
          },
        },
      });

      const rawText = response.text;
      if (rawText) {
        return res.json(JSON.parse(rawText));
      } else {
        return res.status(500).json({ error: "Empty response from Gemini API" });
      }
    } catch (error: any) {
      console.error("Error in server-side scan-meal:", error);
      return res.status(500).json({ error: error.message || "Failed to scan meal" });
    }
  });

  // Vite middleware for development or serving built files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: "spa",
      define: {
        "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || ""),
        "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ""),
        "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(process.env.VITE_GEMINI_API_KEY || ""),
      }
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
