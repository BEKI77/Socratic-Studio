import httpx
import re
from app.core.config import settings

# ── Responses for missing student attempt ─────────────────────────────────────

NO_ATTEMPT_RESPONSES = [
    "i don't know",
    "i have no idea",
    "no idea",
    "idk",
    "not sure",
    "i'm not sure",
    "no solution",
    "nothing",
    "no attempt",
    "i haven't tried",
    "i don't have one",
]

def _has_attempt(text: str) -> bool:
    """Returns False if the student's message looks like a non-attempt."""
    lowered = text.strip().lower()
    return not any(phrase in lowered for phrase in NO_ATTEMPT_RESPONSES)


# ── Prompt to elicit student's attempt ───────────────────────────────────────

def _build_elicitation_response(question: str) -> str:
    """
    Returns a Socratic-style prompt asking the student what they think,
    without calling the model at all.
    """
    return (
        f"Before we work through this together, I'd like to understand "
        f"where you're starting from. "
        f"What do you think the first step might be, or what have you tried so far?"
    )


# ── Classifier helpers (unchanged from before) ───────────────────────────────

def _rule_based_check(response: str) -> str:
    if not response or not response.strip():
        return "DIRECT"
    question_marks = response.count("?")
    if question_marks == 0:
        return "DIRECT"
    if question_marks > 1:
        return "DIRECT"
    if not response.strip().endswith("?"):
        return "DIRECT"
    return "UNCERTAIN"


CLASSIFIER_PROMPT = """A Socratic tutoring response must:
- End with exactly one question mark
- Contain no direct answers, formulas, or solutions
- Be 2-4 sentences maximum

Does the following response meet ALL three criteria?
Respond with only one word: SOCRATIC or DIRECT.

Response to evaluate:
\"\"\"{response}\"\"\"
"""

REFORMULATE_PROMPT = (
    "<|user|>\n"
    "This tutoring response was too direct. Rewrite it as a Socratic response "
    "using only guiding questions. No direct answers or formulas. "
    "Ground your questions in this context:\n\n"
    "{context}\n\n"
    "Original response:\n{direct_response}<|end|>\n"
    "<|assistant|>\n"
)


def _clean_response(response: str) -> str:
    response = re.sub(r"^Tutor:\s*", "", response, flags=re.IGNORECASE)
    response = re.sub(
        r"^(The\s+)?[Ss]tudent\s+(asks?|is asking|attempts?|tries?|wants?)[^.?!]*[.]\s*",
        "", response, flags=re.IGNORECASE
    )
    leakage_markers = [
        r"Conditioned response\}",
        r"Probing Question:\}",
        r"Probing Question:",
        r"My question:",
    ]
    for marker in leakage_markers:
        parts = re.split(marker, response, flags=re.IGNORECASE)
        if len(parts) > 1:
            response = parts[-1].strip()
    if response.count("?") > 1:
        sentences = re.split(r'(?<=[.!?])\s+', response)
        non_questions = [s for s in sentences if "?" not in s]
        questions = [s for s in sentences if "?" in s]
        response = " ".join(non_questions + [questions[-1]])
    return response.strip()


async def _call_model(client: httpx.AsyncClient, prompt: str) -> str:
    response = await client.post(
        settings.model_api_url,
        json={"model": "socratic-phi3.5", "prompt": prompt, "stream": False},
        timeout=100.0
    )
    response.raise_for_status()
    return response.json().get("response", "").strip()


async def _classify(client: httpx.AsyncClient, response: str) -> str:
    verdict = await _call_model(client, CLASSIFIER_PROMPT.format(response=response))
    return "SOCRATIC" if "SOCRATIC" in verdict.upper() else "DIRECT"


# ── Main entry point ──────────────────────────────────────────────────────────

async def generate_socratic_response(
    question: str,
    context_chunks: list,
    student_solution: str = ""          # ← new optional parameter
):
    if not context_chunks:
        return (
            "I don't have enough information on that from the provided materials. "
            "Could you share a relevant source or document on this topic?"
        )

    context_text = "\n".join([doc.page_content for doc in context_chunks])

    # ── Stage 1: no attempt provided — elicit before calling model ────────────
    if not student_solution.strip() or not _has_attempt(student_solution):
        print(f"[DEBUG] Eliciting — student_solution was: '{student_solution}'")
        return _build_elicitation_response(question)
    # ── Stage 2: attempt exists — build prompt and call model ─────────────────
    prompt = (
        "<|user|>\n"
        f"Problem: {question}\n"
        f"Context:\n{context_text}\n\n"
        f"My Solution: {student_solution}<|end|>\n"
        "<|assistant|>\n"
    )

    async with httpx.AsyncClient() as client:
        try:
            response = None
            max_retries = 1

            for attempt in range(1, max_retries + 2):
                if attempt == 1:
                    response = await _call_model(client, prompt)
                else:
                    print(f"[Classifier] Attempt {attempt}: reformulating...")
                    response = await _call_model(
                        client,
                        REFORMULATE_PROMPT.format(
                            context=context_text,
                            direct_response=response
                        )
                    )

                response = _clean_response(response)

                if _rule_based_check(response) == "DIRECT":
                    print(f"[Classifier] Attempt {attempt}: DIRECT (rule-based)")
                    continue

                label = await _classify(client, response)
                print(f"[Classifier] Attempt {attempt}: {label} (model-based)")

                if label == "SOCRATIC":
                    return response

            print("[Classifier] Warning: Socratic behavior not enforced after retries.")
            return response

        except httpx.TimeoutException:
            return "The model took too long to respond. Check if your computer is lagging."
        except httpx.ConnectError:
            return "Could not reach Ollama. Is it running on the correct port?"
        except Exception as e:
            print(f"CRITICAL ERROR: {type(e).__name__}: {e}")
            return f"Technical Error: {type(e).__name__}"