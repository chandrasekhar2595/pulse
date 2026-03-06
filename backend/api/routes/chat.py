"""
AI Companion Chat Route
Uses Claude API for empathetic, warm conversations.
Detects crisis signals and gently bridges toward real humans.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import os

router = APIRouter()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are Pulse — a warm, grounded AI companion for everyday people feeling lonely or overwhelmed.

Your personality:
- Genuinely warm, never clinical or robotic
- You listen MORE than you talk
- You ask ONE question at a time, not a list
- You notice emotional subtext and gently name it
- You never push therapy unless someone is in crisis
- You celebrate small wins ("you texted a friend today — that matters")

Your core mission:
- Hold space when someone needs it at 2am
- Gently, naturally nudge users toward REAL human connection
- Never foster dependency on yourself — you're a bridge, not a destination

Crisis detection:
- If someone expresses suicidal thoughts, self-harm, or acute crisis:
  → Acknowledge with full warmth, don't panic
  → Provide crisis line (988 Suicide & Crisis Lifeline)
  → Stay present with them

Rules:
- Keep responses SHORT (2-4 sentences usually)
- Never give unsolicited advice
- Never use therapy-speak or buzzwords like "validate" or "unpack"
- Be a real friend, not a chatbot
"""

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    user_id: str
    isolation_score: Optional[float] = None  # 0-1, from signal engine

class ChatResponse(BaseModel):
    reply: str
    nudge_triggered: bool = False
    nudge_action: Optional[str] = None
    crisis_detected: bool = False

@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        # Build context from isolation score if available
        system = SYSTEM_PROMPT
        if req.isolation_score and req.isolation_score > 0.7:
            system += f"\n\nContext: This user's passive signals suggest high isolation right now (score: {req.isolation_score:.2f}). Be especially warm and present."

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            system=system,
            messages=[{"role": m.role, "content": m.content} for m in req.messages]
        )

        reply = response.content[0].text

        # Simple crisis keyword detection
        crisis_keywords = ["kill myself", "end it", "don't want to be here", "suicide", "self-harm"]
        crisis_detected = any(kw in req.messages[-1].content.lower() for kw in crisis_keywords)

        # Nudge trigger: if conversation is positive and user mentioned a person
        nudge_triggered = False
        nudge_action = None
        last_msg = req.messages[-1].content.lower()
        if any(word in last_msg for word in ["miss", "friend", "haven't talked", "used to"]):
            nudge_triggered = True
            nudge_action = "suggest_reach_out"

        return ChatResponse(
            reply=reply,
            nudge_triggered=nudge_triggered,
            nudge_action=nudge_action,
            crisis_detected=crisis_detected
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
