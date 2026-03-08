from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import os

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

PULSE_SYSTEM_PROMPT = """You are Pulse AI — a warm, empathetic companion built into the Pulse app, 
an ambient loneliness detector that nudges people toward real human connection.

Your personality:
- Warm, calm, and genuinely caring — like a wise friend, not a therapist
- You notice patterns and gently reflect them back
- You always nudge toward REAL human connection, never toward more app usage
- You are a bridge, not a destination
- You speak in short, human sentences — no bullet points, no clinical language
- You never diagnose or give medical advice
- You ask one thoughtful question at a time

Your north star: "We win when people put us down because they're talking to their friends."

If someone seems in crisis, gently encourage them to reach out to a trusted person or 
call/text 988 (Suicide & Crisis Lifeline).

Keep responses short — 2-4 sentences max unless the person clearly wants more.
Always end with either a warm statement or a single gentle question."""


class Message(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    isolation_score: Optional[float] = None  # 0.0 to 1.0


class ChatResponse(BaseModel):
    message: str
    nudge: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Build context from isolation score if available
        system = PULSE_SYSTEM_PROMPT
        if request.isolation_score is not None:
            score_pct = int(request.isolation_score * 100)
            if request.isolation_score > 0.65:
                system += f"\n\nContext: This user's isolation score is {score_pct}% — they are showing signs of significant isolation. Be extra warm and gently encourage them to reach out to someone specific."
            elif request.isolation_score > 0.4:
                system += f"\n\nContext: This user's isolation score is {score_pct}% — they are drifting a little. A gentle nudge toward connection would help."
            else:
                system += f"\n\nContext: This user's isolation score is {score_pct}% — they are fairly connected. Reinforce positive patterns."

        # Convert messages to Anthropic format
        anthropic_messages = [
            {"role": msg.role if msg.role == "user" else "assistant", "content": msg.content}
            for msg in request.messages
        ]

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            system=system,
            messages=anthropic_messages,
        )

        reply = response.content[0].text

        # Generate a nudge if isolation score is elevated
        nudge = None
        if request.isolation_score and request.isolation_score > 0.4:
            nudge = await generate_nudge(request.isolation_score)

        return ChatResponse(message=reply, nudge=nudge)

    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid API key")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def generate_nudge(isolation_score: float) -> str:
    """Generate a personalized micro-nudge based on isolation score."""
    try:
        prompt = f"""The user has an isolation score of {int(isolation_score * 100)}%.
Generate ONE very short, specific, warm micro-nudge to encourage real human connection.
Examples: "Text someone you haven't spoken to in a while — even just 'thinking of you' counts."
Keep it under 20 words. Make it feel personal, not generic."""

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=60,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text.strip()
    except Exception:
        return None