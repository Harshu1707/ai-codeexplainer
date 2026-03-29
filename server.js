import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

app.post("/api/explain", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error:
        "GEMINI_API_KEY is missing. Create a .env file and add your Gemini API key."
    });
  }

  const { code, language, audience } = req.body;

  if (!code || !String(code).trim()) {
    return res.status(400).json({ error: "Code input is required." });
  }

  const prompt = `You are a patient programming teacher.
Explain the provided ${language || "code"} for a complete beginner (${audience || "someone with no coding background"}).

Return STRICT JSON with this schema:
{
  "title": "Short beginner-friendly title",
  "overallSummary": "2-3 sentence easy summary",
  "steps": [
    {
      "heading": "Step heading",
      "whatItDoes": "Simple explanation",
      "whyItMatters": "Why this step exists",
      "realWorldAnalogy": "Analogy a non-technical person can understand"
    }
  ],
  "finalTakeaway": "Key idea in one sentence",
  "glossary": [
    {"term": "...", "meaning": "..."}
  ]
}

Keep steps concise and in execution order.
Create between 4 and 10 steps.
Use plain language and avoid jargon.
If jargon is necessary, add it to glossary.

Code:\n\n${code}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Gemini API error: ${errText}`
      });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(502).json({
        error: "No explanation returned from Gemini."
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        title: "Code explanation",
        overallSummary: rawText,
        steps: [],
        finalTakeaway: "",
        glossary: []
      };
    }

    return res.json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: `Server error while calling Gemini: ${error.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Code Explainer running at http://localhost:${PORT}`);
});
