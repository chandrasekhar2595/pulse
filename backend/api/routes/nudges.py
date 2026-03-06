"""
Nudge Engine
Generates warm, specific micro-connection suggestions based on isolation signals.
Never generic ("call a friend") — always specific and low-pressure.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
import anthropic
import os

router = APIRouter()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class NudgeType(str, Enum):
    REACH_OUT   = "reach_out"      # Suggest contacting someone specific
    MICRO_EVENT = "micro_event"    # Suggest a local low-pressure event
    TINY_ACTION = "tiny_action"    # Ultra-small action (send a meme, react to a story)
    SELF_ANCHOR = "self_anchor"    # Grounding action (go outside, make tea)

class NudgeRequest(BaseModel):
    user_id: str
    isolation_score: float
    top_signal: str
    contacts: Optional[List[str]] = []   # Names of people in user's life
    last_activities: Optional[List[str]] = []

class Nudge(BaseModel):
    type: NudgeType
    message: str           # The warm nudge message shown to user
    action_label: str      # Button text e.g. "Send a message"
    action_data: Optional[dict] = None
    priority: int          # 1-3, 1 = highest

@router.post("/generate", response_model=List[Nudge])
async def generate_nudges(req: NudgeRequest):
    nudges = []

    # Rule-based fast nudges (no AI needed)
    if req.top_signal == "outgoing_message_drop" and req.contacts:
        contact = req.contacts[0]
        nudges.append(Nudge(
            type=NudgeType.TINY_ACTION,
            message=f"You haven't messaged {contact} in a while. No pressure — even just reacting to their story counts.",
            action_label=f"Message {contact}",
            action_data={"contact": contact},
            priority=1
        ))

    if req.top_signal == "late_night_activity":
        nudges.append(Nudge(
            type=NudgeType.SELF_ANCHOR,
            message="Late nights can feel heavy. A small thing: make something warm to drink, and sit somewhere comfortable.",
            action_label="I'll try that",
            priority=2
        ))

    if req.isolation_score > 0.7:
        nudges.append(Nudge(
            type=NudgeType.MICRO_EVENT,
            message="There's something freeing about being around people with no agenda. A coffee shop, a park — just being near life.",
            action_label="Find something nearby",
            action_data={"action": "open_events"},
            priority=2
        ))

    # AI-generated personalized nudge for high isolation
    if req.isolation_score > 0.65:
        prompt = f"""
Generate ONE warm, specific micro-connection nudge for someone who is feeling isolated.

Context:
- Isolation score: {req.isolation_score:.2f}/1.0
- Main signal: {req.top_signal}
- People in their life: {', '.join(req.contacts) if req.contacts else 'unknown'}

Rules:
- Must be specific, not generic
- Must be LOW pressure (tiny action)
- Warm tone, like a caring friend
- Max 2 sentences
- Do NOT mention mental health, therapy, or isolation directly
- Output ONLY the nudge message, nothing else
"""
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[{"role": "user", "content": prompt}]
        )
        ai_nudge_text = response.content[0].text.strip()
        nudges.append(Nudge(
            type=NudgeType.REACH_OUT,
            message=ai_nudge_text,
            action_label="Do this",
            priority=1
        ))

    return sorted(nudges, key=lambda n: n.priority)
