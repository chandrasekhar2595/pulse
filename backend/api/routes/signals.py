"""
Passive Signal Ingestion & Isolation Score Engine

Ingests anonymized phone usage signals and computes an isolation score (0-1).
All processing happens on-device; only the score is sent to the server.

Signal types:
- screen_time_delta: spike in passive scrolling vs baseline
- outgoing_messages: drop in messages sent
- social_app_opens_no_interaction: opened Instagram but didn't post/reply
- late_night_activity: activity between 11pm-4am
- days_since_last_call: how long since a voice/video call
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import math

router = APIRouter()

class SignalPayload(BaseModel):
    user_id: str
    timestamp: datetime
    # All values are normalized 0-1 relative to user's personal baseline
    screen_time_delta: float = 0.0         # 1.0 = 2x normal screen time
    outgoing_message_drop: float = 0.0     # 1.0 = no messages sent today
    passive_social_ratio: float = 0.0      # 1.0 = only scrolling, no interaction
    late_night_activity: float = 0.0       # 1.0 = active 11pm-4am
    days_since_last_call: Optional[float] = None  # normalized, 1.0 = 14+ days

class IsolationScore(BaseModel):
    user_id: str
    score: float           # 0-1
    severity: str          # "low", "moderate", "high"
    top_signal: str        # Which signal is driving the score
    nudge_recommended: bool
    timestamp: datetime

def compute_isolation_score(payload: SignalPayload) -> IsolationScore:
    """
    Weighted combination of passive signals → isolation score.
    Weights tuned from loneliness research literature.
    """
    weights = {
        "screen_time_delta":       0.20,
        "outgoing_message_drop":   0.30,
        "passive_social_ratio":    0.25,
        "late_night_activity":     0.15,
        "days_since_last_call":    0.10,
    }

    signals = {
        "screen_time_delta":       payload.screen_time_delta,
        "outgoing_message_drop":   payload.outgoing_message_drop,
        "passive_social_ratio":    payload.passive_social_ratio,
        "late_night_activity":     payload.late_night_activity,
        "days_since_last_call":    payload.days_since_last_call or 0.0,
    }

    score = sum(signals[k] * weights[k] for k in weights)
    score = min(1.0, max(0.0, score))  # clamp 0-1

    # Sigmoid smoothing for more natural distribution
    score = 1 / (1 + math.exp(-10 * (score - 0.5)))
    score = round(score, 3)

    top_signal = max(signals, key=lambda k: signals[k] * weights[k])

    severity = "low" if score < 0.4 else "moderate" if score < 0.7 else "high"

    return IsolationScore(
        user_id=payload.user_id,
        score=score,
        severity=severity,
        top_signal=top_signal,
        nudge_recommended=score > 0.55,
        timestamp=payload.timestamp
    )

@router.post("/ingest", response_model=IsolationScore)
async def ingest_signals(payload: SignalPayload):
    score = compute_isolation_score(payload)
    # TODO: persist to Firebase/Postgres for trend analysis
    return score

@router.get("/history/{user_id}")
async def get_signal_history(user_id: str, days: int = 7):
    # TODO: fetch from DB
    return {"user_id": user_id, "days": days, "scores": []}
