"""
Micro Events Engine
Finds and recommends low-pressure local events for isolated users.
Focuses on vibe matching, not interest matching.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class EventRequest(BaseModel):
    user_id: str
    lat: float
    lng: float
    vibe: Optional[str] = "calm"   # calm, social, active, creative

class MicroEvent(BaseModel):
    id: str
    title: str
    description: str
    location: str
    distance_km: float
    vibe: str
    attendees_range: str    # e.g. "5–15 people" — small = less intimidating
    free: bool
    time: str

@router.post("/nearby", response_model=List[MicroEvent])
async def get_nearby_events(req: EventRequest):
    # TODO: integrate with Meetup API, Eventbrite, or local scrapers
    # Returning mock data for scaffold
    return [
        MicroEvent(
            id="evt_001",
            title="Sunday Morning Coffee Walk",
            description="A slow, no-agenda walk around the park. Coffee provided. Phones welcome.",
            location="Central Park, South Entrance",
            distance_km=1.2,
            vibe="calm",
            attendees_range="5–12 people",
            free=True,
            time="Sun 9:00 AM"
        ),
        MicroEvent(
            id="evt_002",
            title="Quiet Reading Hour @ Local Library",
            description="Sit with strangers and just read. No talking required. Surprisingly nice.",
            location="Public Library, Reading Room",
            distance_km=0.8,
            vibe="calm",
            attendees_range="8–20 people",
            free=True,
            time="Sat 11:00 AM"
        )
    ]
