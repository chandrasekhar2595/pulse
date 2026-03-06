# 🫀 Pulse — React Native App

> Built with Expo · TypeScript · Ready for iOS & Android

---

## 📱 Screens

| Screen | What it does |
|---|---|
| **Onboarding** | 4-step first-time experience, asks for name |
| **Home** | Isolation score, today's nudge, quick actions, activity feed |
| **Chat** | AI companion powered by Claude API |
| **Nudges** | Today's micro-connection suggestions with mark-as-done |
| **Events** | Nearby low-pressure events with vibe filter |
| **Insights** | 7-day isolation trend chart + signal breakdown |

---

## 🚀 How to Run (5 minutes)

### Prerequisites
- Node.js installed ([nodejs.org](https://nodejs.org))
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npx expo start

# 3. Scan the QR code with your phone camera (iOS)
#    or with the Expo Go app (Android)
```

That's it — the app runs on your real phone instantly. No simulator needed.

---

## 🔑 Connect to Backend (Optional)

To enable the live AI chat:

1. Start the backend: `cd ../backend && python main.py`
2. Open `src/services/api.ts`
3. Change `BASE_URL` to your local IP:
   ```
   const BASE_URL = 'http://YOUR_LOCAL_IP:8000';
   ```
4. Find your local IP: run `ipconfig` (Windows) or `ifconfig` (Mac)

The app works without the backend — Chat will show a friendly error, all other screens use demo data.

---

## 📁 Project Structure

```
src/
├── screens/
│   ├── OnboardingScreen.tsx   ← First-time flow
│   ├── HomeScreen.tsx         ← Dashboard + isolation score
│   ├── ChatScreen.tsx         ← AI companion
│   ├── NudgesScreen.tsx       ← Daily nudges
│   ├── EventsScreen.tsx       ← Nearby events
│   └── InsightsScreen.tsx     ← 7-day trends
├── services/
│   ├── api.ts                 ← Backend API calls
│   ├── storage.ts             ← Local storage (AsyncStorage)
│   └── signals.ts             ← On-device isolation score engine
└── assets/
```

---

## 🎥 YC Demo Tips

For your 1-minute YC video, show these screens in order:
1. **Onboarding** — "zero effort setup"
2. **Home** — isolation score animating in
3. **Nudges** — tap "React to her story" and mark done
4. **Chat** — type one message, show AI response
5. **Events** — swipe through nearby events

Total: ~60 seconds, covers every core feature.

---

*Pulse · Built by Chandra Sura · M.S. Computer Science, UCM*
