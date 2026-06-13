import json
import asyncio
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Ordered list of models to try — falls through on quota exhaustion.
_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
]

MATCH_PROMPT = """
You are a resume analyst. Compare the resume and job description below.
Return ONLY valid JSON with exactly these keys (no markdown, no explanation):
{{
  "score": <integer 0-100>,
  "matched_keywords": [<list of strings>],
  "missing_keywords": [<list of strings>],
  "recommendation": "<one sentence string>"
}}

RESUME:
{resume_text}

JOB DESCRIPTION:
{jd_text}
"""

REWRITE_PROMPT = """
You are a professional resume writer. Rewrite the resume summary below so it
is tailored to the job description. Use keywords from the JD naturally.
Keep it to 3 sentences. Return ONLY the rewritten summary text, no extra commentary.

RESUME SUMMARY:
{resume_summary}

JOB DESCRIPTION:
{jd_text}
"""

REWRITE_FULL_PROMPT = """
You are a professional resume writer. Rewrite the ENTIRE resume below to be tailored
to the job description. Naturally weave in ALL of these missing keywords: {missing_keywords}.

Rules:
- Keep all original facts, dates, companies, roles, and projects exactly as-is
- Only improve phrasing and add missing keywords naturally
- If the original resume has no summary section, set "summary" to an empty string — do NOT invent one
- If the original resume has a summary, rewrite it to max 2-3 sentences using keywords from the JD
- Include ALL projects from the original resume in the "projects" array
- Group skills into categories exactly as shown below
- Return the result as valid JSON with this exact structure (no markdown, no commentary):
{{
  "name": "<full name>",
  "title": "<professional title>",
  "contact": ["<email>", "<phone>", "<city, country>"],
  "summary": "<2-3 sentence rewritten summary, or empty string if original had none>",
  "experience": [
    {{
      "role": "<job title>",
      "org": "<company name>",
      "location": "<city, country>",
      "dates": "<date range>",
      "bullets": ["<bullet 1>", "<bullet 2>"]
    }}
  ],
  "projects": [
    {{
      "name": "<project name>",
      "tech": "<comma-separated tech stack>",
      "link": "<url or empty string>",
      "bullets": ["<bullet 1>", "<bullet 2>"]
    }}
  ],
  "skills": [
    "Languages: <comma-separated list>",
    "Frontend: <comma-separated list>",
    "Backend: <comma-separated list>",
    "Databases: <comma-separated list>",
    "Testing: <comma-separated list>",
    "Cloud & DevOps: <comma-separated list>",
    "Tools & Practices: <comma-separated list>"
  ],
  "education": "<degree, institution, location, dates. Coursework: ...>"
}}

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{jd_text}
"""


async def _generate(prompt: str) -> str:
    """Try each model in order, retrying once on transient 429s.
    generate_content() is synchronous — run it in a thread to avoid blocking the event loop.
    """
    last_err: Exception = RuntimeError("No models available.")
    for model_name in _MODELS:
        model = genai.GenerativeModel(model_name)
        for attempt in range(2):          # 1 retry per model
            try:
                response = await asyncio.to_thread(model.generate_content, prompt)
                return response.text.strip()
            except ResourceExhausted as e:
                last_err = e
                if attempt == 0:
                    await asyncio.sleep(5)
                else:
                    break
            except Exception as e:
                raise e
    raise last_err


async def analyze_match(resume_text: str, jd_text: str) -> dict:
    prompt = MATCH_PROMPT.format(resume_text=resume_text, jd_text=jd_text)
    raw = await _generate(prompt)

    # Strip markdown fences if the model ignored instructions
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "recommendation": "Could not parse AI response. Please try again.",
        }


async def rewrite_summary(resume_summary: str, jd_text: str) -> str:
    prompt = REWRITE_PROMPT.format(resume_summary=resume_summary, jd_text=jd_text)
    return await _generate(prompt)


async def rewrite_full_resume(resume_text: str, jd_text: str, missing_keywords: list[str]) -> dict:
    keywords_str = ", ".join(missing_keywords) if missing_keywords else "none specified"
    prompt = REWRITE_FULL_PROMPT.format(
        resume_text=resume_text,
        jd_text=jd_text,
        missing_keywords=keywords_str,
    )
    raw = await _generate(prompt)

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": "Could not parse AI response. Please try again."}
