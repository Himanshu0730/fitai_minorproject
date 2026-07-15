# FitAI: Fitness Buddy — Project Progress Tracker

This living document captures the current state of the application, design decisions, completed migration phases, and future recommendations.

## Overall Completion

`[██••••••••] 20% -> [██████████] 100%`

The application has been successfully migrated from an Express-based full-stack architecture with local storage persistence to a **clean, production-ready, client-side Vite Single Page Application (SPA)** fully integrated with **Supabase Auth, Supabase PostgreSQL, and Supabase Edge Functions**.

---

## Migration Accomplishments

### 1. Unified Supabase Integration Layer (`/src/lib/supabase.ts`)
- Created a robust, fault-tolerant persistence wrapper.
- Implements:
  - **Supabase Auth** (`signUp`, `signIn`, `signOut`, session recovery).
  - **Supabase PostgreSQL** CRUD tables (`profiles`, `weight_logs`, `meal_logs`, `chat_history`).
- **Offline-First Fallback:** Includes a seamless fallback to `localStorage` simulation if the environment variables are not yet configured. The app remains 100% stable and fully interactive under all conditions.

### 2. Move Gemini AI Communication to Supabase Edge Functions (`/src/lib/gemini.ts`)
- Migrated all model prompt formatting, output schemas, and API calls to a secure, isolated client-side/Edge-Function service wrapper.
- Implements:
  - Direct Edge Function invocation (`analyze-meal` and `coach-chat`).
  - Seamless direct client-side `@google/genai` fallback (if local developer API key is configured).
  - Robust local simulations for both the **Macro Scanner** and **AI Coach** if zero keys are present.

### 3. Removed Obsolete Express Architecture
- Updated `/package.json` to define a standard Vite SPA setup.
- Deleted `/server.ts` completely as requested.
- Bind the dev server directly to port `3000` on host `0.0.0.0` (Vite host configuration) to comply with network constraints.
- Cleaned up obsolete dependencies like `express` and `@types/express`.

---

## Folder Organization

```
/
├── dist/                     # Production build artifacts (compiled static files)
├── src/
│   ├── components/           # Presentation UI components (Dashboard, Scanner, AICoach, Profile, Landing)
│   ├── lib/
│   │   ├── gemini.ts         # Unified Gemini API and Edge Function wrapper
│   │   └── supabase.ts       # Unified Supabase Auth and database synchronization
│   ├── App.tsx               # Gated core layout, session management, and synchronized states
│   ├── index.css             # Tailwind directive entry point
│   ├── main.tsx              # React mounting root
│   └── types.ts              # System-wide type contracts (UserProfile, WeightLog, MealLog, Message)
├── index.html                # Vite HTML mounting frame
├── package.json              # Client dependencies and SPA build scripts
├── tsconfig.json             # TypeScript compiler settings (Vite types configured)
└── vite.config.ts            # Vite compile and local dev settings
```

---

## Database Schema Reference (PostgreSQL / Supabase)

To prepare your Supabase PostgreSQL instance, create the following tables in the Supabase SQL Editor:

### 1. `profiles` Table
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  current_weight numeric default 172.4,
  target_weight numeric default 160.0,
  height_cm numeric default 178,
  gender text default 'male',
  age integer default 28,
  activity_level text default 'moderate',
  calorie_goal integer default 2050,
  protein_goal integer default 145,
  carbs_goal integer default 215,
  fat_goal integer default 68,
  weight_unit text default 'lbs',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Allow owners to read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Allow owners to update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow owners to insert their own profile" on public.profiles for insert with check (auth.uid() = id);
```

### 2. `weight_logs` Table
```sql
create table public.weight_logs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  weight numeric not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.weight_logs enable row level security;
create policy "Allow users to read own weight logs" on public.weight_logs for select using (auth.uid() = user_id);
create policy "Allow users to insert own weight logs" on public.weight_logs for insert with check (auth.uid() = user_id);
create policy "Allow users to update own weight logs" on public.weight_logs for update using (auth.uid() = user_id);
create policy "Allow users to delete own weight logs" on public.weight_logs for delete using (auth.uid() = user_id);
```

### 3. `meal_logs` Table
```sql
create table public.meal_logs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  timestamp text not null,
  calories integer not null,
  protein integer not null,
  carbs integer not null,
  fat integer not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.meal_logs enable row level security;
create policy "Allow users to read own meal logs" on public.meal_logs for select using (auth.uid() = user_id);
create policy "Allow users to insert own meal logs" on public.meal_logs for insert with check (auth.uid() = user_id);
create policy "Allow users to delete own meal logs" on public.meal_logs for delete using (auth.uid() = user_id);
```

### 4. `chat_history` Table
```sql
create table public.chat_history (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  sender text not null,
  text text not null,
  timestamp text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_history enable row level security;
create policy "Allow users to read own chats" on public.chat_history for select using (auth.uid() = user_id);
create policy "Allow users to insert own chats" on public.chat_history for insert with check (auth.uid() = user_id);
create policy "Allow users to delete own chats" on public.chat_history for delete using (auth.uid() = user_id);
```

---

## Production Readiness Checks

- **TypeScript compilation (`npm run lint` / `tsc --noEmit`):** `[PASS]` Clean, zero type errors.
- **Production Build compilation (`npm run build`):** `[PASS]` Successfully generates static bundle in `/dist`.
- **Express Removed:** `[PASS]` Obsolete back-end removed; codebase size optimized.
- **Port and Host compliance:** `[PASS]` Vite dev server configured to host `0.0.0.0` and port `3000`.
- **UI/UX preservation:** `[PASS]` Identical visuals, interactions, animations, and flows retained.
