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
- Keep all original facts, dates, companies, and roles exactly as-is
- Only improve phrasing and add missing keywords naturally
- Return the result as valid JSON with this exact structure (no markdown, no commentary):
{{
  "name": "<full name>",
  "title": "<professional title>",
  "contact": ["<email>", "<phone>", "<location>"],
  "summary": "<rewritten summary with keywords>",
  "experience": [
    {{
      "role": "<job title>",
      "org": "<company>",
      "dates": "<date range>",
      "bullets": ["<bullet 1>", "<bullet 2>"]
    }}
  ],
  "skills": ["<skill1>", "<skill2>"],
  "education": "<degree, institution>"
}}

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{jd_text}
"""


async def _generate(prompt: str) -> str:
    """Try each model in order, retrying once on transient 429s."""
    last_err: Exception = RuntimeError("No models available.")
    for model_name in _MODELS:
        model = genai.GenerativeModel(model_name)
        for attempt in range(2):          # 1 retry per model
            try:
                response = model.generate_content(prompt)
                return response.text.strip()
            except ResourceExhausted as e:
                last_err = e
                if attempt == 0:
                    # Back off briefly before the single retry
                    await asyncio.sleep(5)
                else:
                    # Quota truly exhausted for this model — try the next one
                    break
            except Exception as e:
                raise e                   # Hard error — don't swallow it
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
