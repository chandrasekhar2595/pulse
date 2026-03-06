"""
Pulse — Ambient Loneliness Detector & Micro-Connection Engine
Backend: FastAPI + Claude AI + Firebase
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.routes import chat, nudges, signals, events
import uvicorn

app = FastAPI(
    title="Pulse API",
    description="AI-powered mental wellness & micro-connection engine",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(chat.router,    prefix="/api/chat",    tags=["AI Companion"])
app.include_router(nudges.router,  prefix="/api/nudges",  tags=["Nudge Engine"])
app.include_router(signals.router, prefix="/api/signals", tags=["Signal Ingestion"])
app.include_router(events.router,  prefix="/api/events",  tags=["Micro Events"])

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
