import json
import os

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

load_dotenv()

app = Flask(__name__, static_folder="public", static_url_path="")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
PORT = int(os.getenv("PORT", "3000"))


@app.get("/")
def index():
    return send_from_directory("public", "index.html")


@app.post("/api/explain")
def explain_code():
    if not GEMINI_API_KEY:
        return (
            jsonify(
                {
                    "error": "GEMINI_API_KEY is missing. Create a .env file and add your Gemini API key."
                }
            ),
            500,
        )

    payload = request.get_json(silent=True) or {}
    code = (payload.get("code") or "").strip()
    language = (payload.get("language") or "code").strip()
    audience = (
        (payload.get("audience") or "someone with no coding background").strip()
    )

    if not code:
        return jsonify({"error": "Code input is required."}), 400

    prompt = f"""You are a patient programming teacher.
Explain the provided {language} for a complete beginner ({audience}).

Return STRICT JSON with this schema:
{{
  "title": "Short beginner-friendly title",
  "overallSummary": "2-3 sentence easy summary",
  "steps": [
    {{
      "heading": "Step heading",
      "whatItDoes": "Simple explanation",
      "whyItMatters": "Why this step exists",
      "realWorldAnalogy": "Analogy a non-technical person can understand"
    }}
  ],
  "finalTakeaway": "Key idea in one sentence",
  "glossary": [
    {{"term": "...", "meaning": "..."}}
  ]
}}

Keep steps concise and in execution order.
Create between 4 and 10 steps.
Use plain language and avoid jargon.
If jargon is necessary, add it to glossary.

Code:\n\n{code}
"""

    gemini_url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )

    try:
        response = requests.post(
            gemini_url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.5,
                    "responseMimeType": "application/json",
                },
            },
            timeout=45,
        )

        if response.status_code >= 400:
            return (
                jsonify({"error": f"Gemini API error: {response.text}"}),
                response.status_code,
            )

        data = response.json()
        raw_text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text")
        )

        if not raw_text:
            return jsonify({"error": "No explanation returned from Gemini."}), 502

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            parsed = {
                "title": "Code explanation",
                "overallSummary": raw_text,
                "steps": [],
                "finalTakeaway": "",
                "glossary": [],
            }

        return jsonify(parsed)
    except requests.RequestException as exc:
        return jsonify({"error": f"Server error while calling Gemini: {exc}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
