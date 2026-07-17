# FitAI 🏋️‍♂️🤖

**FitAI** is an AI-powered personal fitness assistant that combines meal photo analysis, a conversational fitness coach, and progress tracking in a single platform — built to give users personalized, goal-based guidance without the cost of a personal trainer or nutritionist.

🔗 **Live Demo:** [fitai-minorproject.vercel.app](https://fitai-minorproject.vercel.app/)
📦 **Repository:** [github.com/Himanshu0730/fitai_minorproject](https://github.com/Himanshu0730/fitai_minorproject)

---

## 🚀 Features

- **🍽️ AI Macro Scanner** — Upload a meal photo (drag-and-drop, file picker, or live camera capture) and get an instant AI-generated breakdown: calories, protein, carbs, fat, a 1–100 health score, and dietary tags — powered by Google Gemini's structured JSON output.
- **💬 AI Fitness Coach** — A conversational coach that's context-aware of your live profile (current/target weight, calorie and macro goals) and responds with formatted workout plans, diet guidance, and coaching tips.
- **📊 Progress Dashboard** — Real-time BMI calculation, weight-trend charts, daily calorie/macro progress, and a workout/logging streak — all computed client-side from your logged data.
- **🔐 Authentication & Onboarding** — Email/password signup and login via Supabase Auth, with email verification and a guided onboarding flow that unlocks the rest of the app once your profile is complete.
- **📴 Offline-Resilient by Design** — Every feature degrades gracefully: data caches to local storage as a fallback, and both AI features fall back to a local simulated response if the backend is unreachable, so the app never shows a broken screen.
- **📱 Responsive UI** — A single component tree adapts between a desktop top-nav and a mobile bottom tab bar using Tailwind CSS, with animated transitions via Framer Motion.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript, bundled with Vite 6
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion (`motion/react`)
- **Charts:** Recharts
- **Icons:** lucide-react
- **State Management:** Local component state (`useState`/`useMemo`) lifted to the root `App` component — no external state library

### Backend
- **Server:** Express 5 (`server.ts`), running as a single Node process that serves the Vite dev middleware in development and the static production build in production
- **AI:** Google Gemini (`@google/genai`), model `gemini-3.5-flash`, called **only from the server** — the API key is never exposed to the client
  - `POST /api/gemini/coach-chat` — conversational coaching, profile-aware system prompt
  - `POST /api/gemini/scan-meal` — multimodal meal-photo analysis with a strict JSON response schema

### Database & Auth
- **Supabase** (PostgreSQL + Auth) — handles authentication, email verification, and persistence for user profiles, weight logs, meal logs, and chat history

### Build & Deployment
- `vite build` bundles the client; `esbuild` separately bundles `server.ts` into a CommonJS server bundle
- Single Node process (`node dist/server.cjs`) serves both the static frontend and the API in production

---

## 📂 Project Structure

```text
├── public/                    # Static assets (favicon, etc.)
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx    # Public marketing/landing screen
│   │   ├── Signup.tsx         # Registration form
│   │   ├── Login.tsx          # Sign-in form + email verification resend
│   │   ├── Dashboard.tsx      # BMI, weight chart, calorie progress, streaks
│   │   ├── MacroScanner.tsx   # Meal photo upload/camera + AI analysis
│   │   ├── AICoach.tsx        # Chat interface with the AI coach
│   │   └── Profile.tsx        # Onboarding form + account settings
│   ├── lib/
│   │   ├── supabase.ts        # Auth + all database service functions (profiles, logs, chat)
│   │   └── gemini.ts          # Client-side AI call wrappers with fallback chain
│   ├── types.ts                # Shared TypeScript interfaces (UserProfile, WeightLog, MealLog, Message)
│   ├── App.tsx                  # Root component — screen routing, top-level state, navigation
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styles
├── server.ts                    # Express server — Vite middleware (dev), static serving (prod), Gemini API routes
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# Supabase (required for auth/database — app falls back to a local simulation mode if omitted)
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""

# Gemini API key — server-side only, never exposed to the client
GEMINI_API_KEY=""
```

> **Note:** `VITE_`-prefixed variables are inlined into the client bundle at build time by Vite's convention. `GEMINI_API_KEY` intentionally has **no** `VITE_` prefix so it stays server-only and is never shipped to the browser.

---

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Run in development (Express + Vite middleware, hot reload)
npm run dev

# Build for production (client + server bundles)
npm run build

# Run the production server
npm start
```

The app runs on **port 3000**.

---

## 🧠 How the AI Features Work

Both AI-powered features follow a three-tier fallback chain to stay reliable even with partial backend availability:

1. **Supabase Edge Function** (if configured)
2. **Server-side Gemini proxy** (`/api/gemini/*` routes on the Express server)
3. **Local simulated response** — a deterministic, keyword-matched mock response, so the UI never breaks even fully offline

The Macro Scanner uses Gemini's `responseSchema` feature to force a typed, guaranteed-parseable JSON response (food name, calories, macros, health score, dietary tags) rather than parsing free-form text.

---

## 🔒 Security Notes

- The Gemini API key is read only via `process.env.GEMINI_API_KEY` on the server — it is never bundled into client-side JavaScript.
- Supabase's public anon key is safe to expose client-side by design; per-user data access should be enforced with Supabase Row-Level Security policies configured on the `profiles`, `weight_logs`, `meal_logs`, and `chat_history` tables.

---

## 🗺️ Roadmap

- [ ] Formalize Row-Level Security policies and version them as SQL migrations
- [ ] Add authentication middleware to the `/api/gemini/*` routes
- [ ] Persist scanned meal images (`imageUrl` field currently unused)
- [ ] Add automated tests and CI
- [ ] Route-based code splitting

---

## 👤 Author

**Himanshu Uikey**
Minor Project — Internship

## 📄 License

This project is for educational/portfolio purposes as part of a minor project submission.
