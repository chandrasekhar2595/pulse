import axios from 'axios';

// ── Change this to your backend URL when deployed ──
const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Send message to AI companion
export async function sendMessage(
  message: string,
  history: { role: string; content: string }[],
  userName: string
): Promise<string> {
  const res = await api.post('/api/chat', { message, history, user_name: userName });
  return res.data.response;
}

// Get nudges
export async function getNudges(isolationScore: number): Promise<any[]> {
  const res = await api.post('/api/nudges/generate', { isolation_score: isolationScore });
  return res.data.nudges || [];
}

// Get nearby events
export async function getEvents(lat: number, lng: number, vibe?: string): Promise<any[]> {
  const res = await api.post('/api/events/nearby', { lat, lng, vibe });
  return res.data.events || [];
}
