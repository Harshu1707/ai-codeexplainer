# AI Code Explainer (Python + Gemini + Animated Step-by-Step UI)

This project is a beginner-first **AI code explainer** written in **Python**.

It uses the **Gemini API** to turn source code into an easy, structured explanation for people who do not know programming.

## Features

- Python backend with Flask (`/api/explain`)
- Gemini-powered structured JSON explanation output
- Animated frontend (typing effect + staggered step reveal)
- Beginner-friendly wording, analogies, and glossary

## Tech Stack

- Python + Flask
- Vanilla HTML/CSS/JS frontend
- Gemini Generative Language API

## Setup

1. Create virtual environment and activate it:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
GEMINI_API_KEY=your_real_key
GEMINI_MODEL=gemini-2.0-flash
PORT=3000
```

4. Run app:

```bash
python app.py
```

5. Open:

- http://localhost:3000

## How it works

1. Paste code and click **Explain Step-by-Step**.
2. Frontend sends code to `POST /api/explain`.
3. Flask backend prompts Gemini for strict JSON.
4. Frontend renders animated beginner-friendly steps.
