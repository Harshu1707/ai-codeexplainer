# AI Code Explainer (Gemini + Animated Step-by-Step UI)

This project is a beginner-first **AI code explainer**.

It uses the **Gemini API** to convert raw source code into an easy, structured explanation that includes:
- Clear summary
- Step-by-step breakdown in execution order
- “Why this matters” for each step
- Real-world analogies
- Small glossary for non-technical readers

The UI is animated so people with zero coding background can follow each step progressively.

---

## Features

- ✨ Gemini-powered explanations (`/api/explain`)
- 🎬 Animated UI (typing effect + staggered reveal cards + floating gradient background)
- 🧠 Beginner-friendly explanation format
- 🔒 API key stays on server side (client calls only your local backend)

---

## Tech Stack

- Node.js + Express
- Vanilla HTML/CSS/JS frontend
- Gemini Generative Language API

---

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Put your Gemini key in `.env`:

```env
GEMINI_API_KEY=your_real_key
GEMINI_MODEL=gemini-2.0-flash
PORT=3000
```

4. Start app:

```bash
npm start
```

5. Open:

- http://localhost:3000

---

## How it works

1. User pastes code and optional language/audience details.
2. Frontend sends POST request to `/api/explain`.
3. Backend builds a strict JSON prompt for Gemini.
4. Gemini returns structured explanation JSON.
5. Frontend animates title, summary, and step cards for easy comprehension.

---

## Notes

- If explanation fails, ensure your API key is valid.
- You can switch models using `GEMINI_MODEL` in `.env`.
