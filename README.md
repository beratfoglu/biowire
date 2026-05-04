# Biowire — Personal Health Companion

> *Understand your symptoms. Find the right care. Stay informed.*

A full-stack personal health platform combining a custom **5-layer Mamdani Fuzzy Logic Engine**, **Groq LLM** clinical reasoning, real-time environmental data, and a comprehensive health management dashboard — built to help users navigate the healthcare system with confidence.

---

## Screenshots

### 🏠 Landing Page
![Landing Page](screenshots/biowire_main_page.png)

---

### 🔐 Authentication
| Login | Register — Step 1 | Register — Step 2 |
|-------|-------------------|-------------------|
| ![Login](screenshots/biowire_login.png) | ![Register Step 1](screenshots/biowire_register_step_one.png) | ![Register Step 2](screenshots/biowire_register_step_two.png) |

---

### 📊 Dashboard
![Overview](screenshots/overview_page.png)

---

### 🩺 BioChat
![BioChat](screenshots/biochat_page.png)

---

### 📰 Health Feed
| Feed | Saved Articles |
|------|---------------|
| ![Health Feed](screenshots/health_feed_page.png) | ![Saved](screenshots/health_feed_saved_page.png) |

---

### 📚 Health Library
| Library | Saved Conditions |
|---------|-----------------|
| ![Library](screenshots/health_library_page.png) | ![Saved](screenshots/health_library_saved_page.png) |

---

### 💊 Medications
| Medications | Add Medication |
|-------------|---------------|
| ![Medications](screenshots/medications_page.png) | ![Add](screenshots/add_medications_page.png) |

---

### ❤️ Vitals
| Blood Pressure | Heart Rate | Blood Sugar | Add Reading |
|---------------|------------|-------------|-------------|
| ![Blood](screenshots/vitals_blood_page.png) | ![Heart](screenshots/vitals_heart_page.png) | ![Sugar](screenshots/vitals_sugar_page.png) | ![Add](screenshots/vitals_add_page.png) |

---

### 📋 Medical Records
| Records | Upload |
|---------|--------|
| ![Records](screenshots/medical_records_page.png) | ![Upload](screenshots/medical_records_upload_page.png) |

---

### 📓 Symptom Log
| Log | Add Symptom |
|-----|-------------|
| ![Symptoms](screenshots/symptom_log_page.png) | ![Add](screenshots/symptom_log_add_page.png) |

---

### 🧠 Mental Health
| Overview | Exercises | Log Mood | Support |
|----------|-----------|----------|---------|
| ![Mental Health](screenshots/mental_health_page.png) | ![Exercises](screenshots/mental_health_exercises_page.png) | ![Log Mood](screenshots/mental_health_log_mood_page.png) | ![Support](screenshots/mental_health_support_page.png) |

---

### 🌸 Women's Health
| Cycle Tracker | Pregnancy Guide | Conditions |
|--------------|-----------------|------------|
| ![Women's Health](screenshots/womens_health_page.png) | ![Pregnancy](screenshots/womens_health_pregnancy_page.png) | ![Conditions](screenshots/womens_health_conditions_page.png) |

---

### 👤 Profile
![Profile](screenshots/profile_page.png)

---

## Features

Biowire bundles **11 health modules** into a single, cohesive platform.

### 🩺 BioChat — AI Symptom Analyzer
The core of Biowire. Users describe symptoms in plain language and receive specialist routing, urgency assessment, and clinical guidance.

- **5-layer Mamdani Fuzzy Inference System** — processes severity, duration, symptom count, body region, gender, and clinical patterns
- **21 combination rules** — detects critical clinical patterns: STEMI, Pulmonary Embolism, Aortic Dissection, Subarachnoid Hemorrhage, Stroke (FAST), Meningitis, Appendicitis, Ectopic Pregnancy, Testicular Torsion, Cauda Equina, and more
- **Urgency scoring** — outputs a 0–100 score with 4 levels: LOW / MEDIUM / HIGH / CRITICAL
- **Specialist routing** — maps symptoms to 20+ specialist types including emergency branches
- **Red flag detection** — overrides standard routing when life-threatening patterns are identified
- **Cancer screening alerts** — triggers based on symptom duration thresholds per body region
- **Calibration questions** — generates region-specific clinical questions to refine the assessment
- **Groq LLM integration** — LLaMA 3.3 70B generates empathetic, context-aware clinical responses
- **Gender-aware logic** — applies AHA/NICE sex-specific risk modifiers
- **Duration paradox** — handles cases where longer duration reduces urgency (chronic) or increases it (acute window)
- Bilingual support (English / Turkish)

### 📊 Health Dashboard
Overview of all health data in one place.

- Active medication count and adherence tracking
- Recent symptom logs with severity indicators
- Latest mood entry
- Quick action shortcuts to all major modules

### 📓 Symptom Log
Daily symptom tracking with clinical detail.

- Multi-symptom selection from 15 common symptoms + custom input
- Severity slider (1–10) with visual feedback
- Body region classification (14 regions)
- Severe symptom filtering (≥7)
- Full history with timestamps

### 💊 Medications
Medication management with daily adherence tracking.

- Add medications with dosage, frequency, start/end dates
- Daily checklist — tap to mark as taken
- Adherence percentage calculation
- Active / inactive filtering
- 6 frequency options

### ❤️ Vitals
Blood pressure, heart rate, and blood sugar monitoring.

- Mini sparkline chart per vital type
- Trend detection (up / stable / down)
- Normal range display per vital type
- Full measurement history with timestamps

### 📋 Medical Records
Secure health document storage.

- File upload (PDF, JPG, PNG) to private Supabase Storage bucket
- 5 document types: Lab Results, Imaging, Report, Prescription, Other
- Tag system for easy search
- Doctor and hospital metadata
- Deletion with storage cleanup

### 📚 Health Library
Clinical condition reference with 32 conditions across 12 specialties.

- Cardiology, Neurology, Respiratory, Endocrine, Immunity, Musculoskeletal, Ophthalmology, Mental Health, Gastroenterology, Dermatology, Oncology
- Per-condition: overview, symptoms, causes, risk factors, diagnosis, treatment, when to seek help, prevention, related conditions
- **Wikipedia integration** — live summary fetch with in-memory cache
- ICD-10 codes, prevalence data, severity classification
- Bookmark system (saved to Supabase)
- Full-text search across name, overview, symptoms, category

### 📰 Health Feed
Real-time health news aggregated from 4 trusted sources.

- **WHO** — RSS feed (global health news)
- **CDC** — RSS feed (public health)
- **PubMed** — eUtils API (research articles)
- **NewsAPI** — top health headlines
- Parallel async fetch with `asyncio.gather`
- Category filtering, bookmarks, search
- Article modal with source link

### 🧠 Mental Health
Mood tracking and mindfulness exercises.

- 5-point mood scale (Great / Good / Okay / Bad / Terrible)
- 7-day mood chart with mini bar visualization
- 6 evidence-based exercises: 4-7-8 Breathing, Body Scan Meditation, 5-4-3-2-1 Grounding, Gratitude Journaling, Box Breathing, Self-Compassion Break
- Step-by-step exercise modal with progress tracking
- Crisis resources (international helplines)

### 🌸 Women's Health
Three modules in one page.

- **Cycle Tracker** — period logging with flow intensity and symptom tracking, phase detection (Menstrual / Follicular / Ovulation / Luteal), average cycle length, next period prediction
- **Pregnancy Guide** — week-by-week development guide (weeks 4–36), baby size, mother symptoms, tips, and warning signs per week
- **Conditions Library** — PCOS, Endometriosis, Uterine Fibroids, Ectopic Pregnancy with full clinical detail

### 👤 Profile
Full personal health profile with inline editing.

- Personal info: name, email, date of birth, gender
- Health metrics: height, weight, blood type
- BMI calculation with category label
- Allergen and chronic condition tag system
- Password change
- Auto-save on every field edit

---

## 🧠 Fuzzy Logic Engine — Deep Dive

The heart of BioChat is a custom **Mamdani-type Fuzzy Inference System** implemented in Python with `scikit-fuzzy`. It runs on every message and produces the urgency score that drives specialist routing.

### Architecture

```
Raw Input
  ├── severity (float, 0–10)
  ├── duration_days (int)
  ├── symptoms (List[str])
  ├── regions (List[str])
  ├── gender (str)
  └── message (str)
          ↓
Layer 1 — Base Fuzzy Inference
  ├── Antecedents: severity, duration (normalized), symptom count
  ├── Membership functions: 5 severity levels, 3 duration levels, 3 count levels
  ├── Consequent: urgency (0–100)
  ├── 15 Mamdani rules (e.g. critical severity + acute → critical urgency)
  └── New ControlSystemSimulation per request (concurrency-safe)
          ↓
Layer 2 — Region Weight
  ├── chest/heart: ×2.0
  ├── head: ×1.8
  ├── abdomen: ×1.5
  ├── pelvis: ×1.4
  ├── back/throat/arms/legs/eyes: ×1.2–1.3
  └── hands/feet/ears/skin: ×0.8–1.0
          ↓
Layer 3 — Gender Factor
  ├── Female: chest ×1.3, abdomen ×1.4, pelvis ×1.5 (AHA/NICE)
  └── Male: chest ×1.2, arms ×1.3, pelvis ×1.8
          ↓
Layer 4 — Duration Paradox
  ├── Acute window (<1 day, chest/heart/head): score ×1.4
  ├── Chronic normalize (>14 days chest, >7 days heart): score ×0.75–0.85
  ├── Chronic escalate (>21 days back, >42 days skin): score ×1.2–1.3
  └── Cancer screening thresholds per region (21–42 day windows)
          ↓
Layer 5 — Combination Rules (21 patterns)
  ├── STEMI_PATTERN: chest + arm + jaw + sweat → emergency_cardiology (min 92)
  ├── PULMONARY_EMBOLISM: chest + leg swelling + breath → emergency_pulmonology (min 90)
  ├── AORTIC_DISSECTION: tearing chest/back pain → emergency_vascular (min 95)
  ├── SUBARACHNOID_HEMORRHAGE: worst headache of life → emergency_neurology (min 93)
  ├── STROKE_FAST: face droop + arm + speech → emergency_neurology (min 95)
  ├── MENINGITIS: headache + fever + neck stiffness → emergency_neurology (min 93)
  ├── APPENDICITIS: RLQ pain + fever + nausea → emergency_surgery (min 82)
  ├── ECTOPIC_PREGNANCY: missed period + pelvic pain + shoulder tip (female only, min 94)
  ├── TESTICULAR_TORSION: sudden testicular pain (male only, min 92)
  ├── EPIGLOTTITIS: drooling + stridor + fever → emergency_ent (min 95)
  ├── MENINGOCOCCAL_RASH: petechial rash + fever → emergency (min 96)
  ├── CAUDA_EQUINA: back + bilateral weakness + bladder → emergency_neurosurgery (min 91)
  ├── DVT_PE_RISK, CHOLANGITIS, NECROTIZING_FASCIITIS, PERITONITIS,
  │   ACUTE_GLAUCOMA, GIANT_CELL_ARTERITIS (min 78–93)
  ├── Cancer patterns: LUNG, GI, OVARIAN (min 65–70, non-emergency routing)
  └── Final score: max(duration_adjusted_score, combination_score)
          ↓
Output
  ├── urgency_score (0–100)
  ├── urgency_level (LOW / MEDIUM / HIGH / CRITICAL)
  ├── specialist (primary)
  ├── secondary_specialist
  ├── red_flag (bool) + red_flag_reason
  ├── cancer_warning (bool) + cancer_warning_reason
  ├── combination_triggered + combination_name
  ├── calibration_questions (region-specific, deduplicated)
  └── explanation (full layer-by-layer trace)
```

### Keyword Matching

All combination rule keywords use **regex word boundary matching** (`\b`) to prevent false positives:

```python
# "arm" does not match "warm" or "charm"
re.search(rf"\b{re.escape(keyword)}\b", text)
```

### Concurrency Safety

Each request creates a new `ControlSystemSimulation` instance rather than sharing a singleton — preventing state leakage between concurrent requests:

```python
sim = ctrl.ControlSystemSimulation(self.urgency_ctrl)
sim.input['severity'] = severity
sim.compute()
```

---

## AI Pipeline

```
User message + symptom parameters
          ↓
BiowireFuzzyEngine.evaluate()
  └── Returns FuzzyResult (score, level, specialist, red flags, cancer alerts, combos)
          ↓
_build_system_prompt(fuzzy, gender, regions, language)
  ├── Urgency instruction (CRITICAL → call 112 / LOW → monitor)
  ├── Red flag section (if triggered)
  ├── Cancer screening alert (if triggered)
  └── Combination pattern context (if triggered)
          ↓
Groq API — LLaMA 3.3 70B
  ├── System prompt: clinical triage assistant
  ├── Conversation history (in-memory session)
  └── max_tokens: 1024, temperature: 0.6
          ↓
Response + full fuzzy metadata returned to frontend
```

---

## Data Flow

```mermaid
flowchart TD
    USER(["👤 USER"])

    subgraph FRONTEND ["Next.js 16 — App Router"]
        LP["Landing Page\nEnvironment Bento + News Feed"]
        AUTH["Auth\nLogin / Register"]
        DASH["Dashboard\n11 health modules"]
        BC["BioChat\nSymptom Profiler + Chat"]
    end

    subgraph BACKEND ["FastAPI — Python 3.11"]
        FUZZY["Fuzzy Engine v2.1\nMamdani · scikit-fuzzy"]
        GROQ["Groq LLM\nLLaMA 3.3 70B"]
        FEED["Feed Aggregator\nWHO · CDC · PubMed · NewsAPI"]
        HEALTH["Health Router\nCRUD endpoints"]
    end

    subgraph SUPABASE ["Supabase"]
        AUTH_SB["Auth\nJWT · Email/Password"]
        DB["PostgreSQL\n12 tables · RLS"]
        STORAGE["Storage\nmedical-records bucket"]
    end

    subgraph EXTERNAL ["External APIs"]
        WEATHER["Open-Meteo\nWeather + AQI + Pollen"]
        WIKI["Wikipedia\nCondition summaries"]
        NEWS["WHO RSS · CDC RSS\nPubMed · NewsAPI"]
    end

    USER --> LP
    USER --> AUTH
    AUTH --> AUTH_SB
    AUTH_SB --> DASH
    DASH --> BC
    BC --> FUZZY
    FUZZY --> GROQ
    GROQ --> USER
    DASH --> HEALTH
    HEALTH --> DB
    DASH --> FEED
    FEED --> NEWS
    LP --> WEATHER
    DASH --> WIKI
    DB --> STORAGE

    style USER fill:#0891B2,color:#fff,stroke:#0891B2
    style FRONTEND fill:#0f172a,color:#06b6d4,stroke:#06b6d4,stroke-width:2px
    style BACKEND fill:#0f172a,color:#db2777,stroke:#db2777,stroke-width:2px
    style SUPABASE fill:#0f172a,color:#22c55e,stroke:#22c55e,stroke-width:2px
    style EXTERNAL fill:#0f172a,color:#f59e0b,stroke:#f59e0b,stroke-width:2px
```

---

## Architecture

```
biowire/
├── backend/
│   ├── api/
│   │   └── main.py                  # FastAPI app, CORS, router registration
│   ├── core/
│   │   ├── config.py                # Pydantic Settings (env vars)
│   │   ├── database.py              # Supabase client factory
│   │   └── exceptions.py            # Custom HTTP exceptions
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── router.py            # POST /auth/register, /auth/login
│   │   │   ├── schemas.py           # UserRegister, UserLogin, TokenResponse
│   │   │   └── service.py           # Supabase Auth + JWT creation
│   │   ├── biochat/
│   │   │   ├── fuzzy_engine.py      # 5-layer Mamdani Fuzzy Engine v2.1
│   │   │   ├── router.py            # POST /biochat/sessions, /biochat/message
│   │   │   ├── schemas.py           # ChatSessionCreate, MessageSend
│   │   │   └── service.py           # Groq integration + session management
│   │   ├── feed/
│   │   │   ├── sources/
│   │   │   │   ├── who.py           # WHO RSS parser
│   │   │   │   ├── cdc.py           # CDC RSS parser
│   │   │   │   ├── pubmed.py        # PubMed eUtils API
│   │   │   │   └── newsapi.py       # NewsAPI health headlines
│   │   │   ├── router.py            # GET /feed/
│   │   │   ├── schemas.py           # NewsArticle, FeedResponse
│   │   │   └── service.py           # asyncio.gather parallel fetch
│   │   └── health/
│   │       ├── router.py            # /health/profile, /vitals, /symptoms...
│   │       ├── schemas.py           # VitalSign, SymptomLog, Medication...
│   │       └── service.py           # Supabase CRUD for all health data
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx     # Supabase Auth login + forgot password
│   │   │   │   └── register/
│   │   │   │       └── page.tsx     # 2-step registration with health profile
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx       # Collapsible sidebar navigation
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx     # Overview stats + quick actions
│   │   │   │   ├── biochat/
│   │   │   │   │   └── page.tsx     # Symptom profiler + chat interface
│   │   │   │   ├── feed/
│   │   │   │   │   └── page.tsx     # Health news feed
│   │   │   │   ├── library/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ConditionCard.tsx
│   │   │   │   │   │   └── DetailModal.tsx
│   │   │   │   │   ├── data/
│   │   │   │   │   │   ├── categories.ts    # 12 specialty categories
│   │   │   │   │   │   └── conditions.ts    # 32 conditions, full clinical data
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useWikipedia.ts  # Wikipedia API + in-memory cache
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── medications/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── mental-health/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── records/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── symptoms/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── vitals/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── womens-health/
│   │   │   │       └── page.tsx
│   │   │   ├── globals.css          # Design system tokens (landing + dashboard)
│   │   │   ├── layout.tsx           # Root layout + font imports
│   │   │   └── page.tsx             # Landing page
│   │   └── lib/
│   │       └── supabase.ts          # Supabase JS client
│   ├── .env.local
│   ├── .gitignore
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
├── screenshots/
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Database Schema

12 tables, all protected with **Row Level Security (RLS)**. Every user sees only their own data.

| Table | Description | Key Fields |
|-------|-------------|------------|
| `profiles` | User health profile | `id`, `full_name`, `birth_date`, `gender`, `height`, `weight`, `blood_type`, `allergens[]`, `chronic_conditions[]` |
| `vital_signs` | Blood pressure, heart rate, blood sugar | `type`, `value`, `unit`, `measured_at` |
| `symptom_logs` | Daily symptom entries | `symptoms[]`, `severity` (1–10), `body_region`, `logged_at` |
| `medications` | Medication tracker | `name`, `dosage`, `frequency`, `start_date`, `active` |
| `mood_logs` | Mental health mood tracking | `mood` (great/good/okay/bad/terrible), `logged_at` |
| `medical_records` | Uploaded health documents | `name`, `type`, `file_url`, `tags[]`, `doctor` |
| `library_bookmarks` | Saved health library conditions | `condition_id` |
| `cycle_logs` | Menstrual cycle tracking | `start_date`, `end_date`, `flow`, `symptoms[]` |
| `doctor_visits` | Doctor visit history | `doctor_name`, `specialty`, `visit_date`, `diagnosis` |
| `vaccine_records` | Vaccination history | `vaccine_name`, `administered_date`, `next_due_date` |
| `sleep_logs` | Sleep tracking | `sleep_time`, `wake_time`, `quality` (1–5) |
| `exercise_logs` | Exercise tracking | `activity_type`, `duration_minutes`, `intensity` |

A trigger on `auth.users` automatically creates a `profiles` row on registration using data from `user_metadata`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register + create profile |
| `POST` | `/auth/login` | Login + return JWT |
| `POST` | `/biochat/sessions` | Create chat session |
| `GET` | `/biochat/sessions` | List user sessions |
| `GET` | `/biochat/sessions/{id}/messages` | Get session messages |
| `POST` | `/biochat/message` | Send message → Fuzzy + Groq |
| `GET` | `/feed/` | Aggregated health news |
| `GET` | `/health/profile` | Get user profile |
| `PUT` | `/health/profile` | Update user profile |
| `POST` | `/health/vitals` | Add vital reading |
| `GET` | `/health/vitals` | Get vital history |
| `POST` | `/health/symptoms` | Log symptom entry |
| `GET` | `/health/symptoms` | Get symptom history |
| `POST` | `/health/medications` | Add medication |
| `GET` | `/health/medications` | Get medications |
| `POST` | `/health/vaccines` | Add vaccine record |
| `GET` | `/health/vaccines` | Get vaccine records |
| `POST` | `/health/doctor-visits` | Add doctor visit |
| `GET` | `/health/doctor-visits` | Get visit history |
| `POST` | `/health/sleep` | Log sleep |
| `POST` | `/health/exercise` | Log exercise |

Interactive API docs: `http://localhost:8000/docs`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Animation | Framer Motion |
| Fonts | Clash Display, Plus Jakarta Sans |
| Backend | FastAPI, Python 3.11, Uvicorn |
| Fuzzy Logic | scikit-fuzzy (Mamdani inference) |
| LLM | Groq API — LLaMA 3.3 70B |
| Auth | Supabase Auth (Email/Password + JWT) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (private bucket) |
| HTTP Client | httpx (async) |
| News Sources | WHO RSS, CDC RSS, PubMed eUtils, NewsAPI |
| Weather | Open-Meteo (weather + AQI + pollen) |
| Geocoding | Nominatim (OpenStreetMap) |
| Knowledge | Wikipedia REST API |
| Containerization | Docker, Docker Compose |

---

## Installation & Setup

### 🐳 Option A — Docker (Recommended)

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

#### 1. Clone the repository

```bash
git clone https://github.com/beratfettahoglu/biowire.git
cd biowire
```

#### 2. Configure environment variables

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
GROQ_API_KEY=your_groq_api_key
NEWSAPI_KEY=your_newsapi_key
SECRET_KEY=any_random_secret_string
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 3. Set up the database

Run `biowire_migration.sql` in **Supabase Dashboard → SQL Editor**.

Also create a **Storage bucket** named `medical-records` (private) in Supabase Dashboard.

#### 4. Start all services

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

```bash
docker-compose down       # Stop
docker-compose up         # Start without rebuild
```

---

### 🔧 Option B — Manual Setup

#### Prerequisites
- Node.js 20+
- Python 3.11+
- Supabase account
- Groq API key

#### 1. Clone

```bash
git clone https://github.com/beratfettahoglu/biowire.git
cd biowire
```

#### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env` with the variables listed above, then:

```bash
uvicorn api.main:app --reload
```

#### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` with the variables listed above, then:

```bash
npm run dev
```

Open `http://localhost:3000`

---

## API Keys

| Key | Where to get | Used for |
|-----|-------------|---------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | Database + Auth |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Frontend client |
| `SUPABASE_SERVICE_KEY` | Supabase Dashboard → Settings → API | Backend admin operations |
| `SUPABASE_JWT_SECRET` | Supabase Dashboard → Settings → API | JWT verification |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — free | BioChat LLM |
| `NEWSAPI_KEY` | [newsapi.org](https://newsapi.org) — free tier | Health Feed |
| `SECRET_KEY` | Any random string | JWT signing |

---

## Security

- **Row Level Security**: all Supabase tables enforce per-user isolation — no cross-user data access is possible at the database level
- **JWT authentication**: all backend endpoints require a valid JWT; `demo-token` bypass exists only for local development
- **Private storage**: medical documents are stored in a private Supabase bucket — no public URLs
- **Environment variables**: no API keys or secrets are hardcoded; all loaded from `.env` files excluded from version control
- **No server-side session persistence**: BioChat sessions are in-memory only — messages are not stored in the database

---

## Known Issues & Limitations

- BioChat sessions are stored in-memory — restarting the backend clears all conversation history
- NewsAPI free tier is limited to 100 requests/day; feed falls back to WHO + CDC + PubMed if key is absent
- `demo-token` bypass in BioChat router is for local development only — must be removed before production deployment
- Medical Imaging AI module (DenseNet-121 + EfficientNet-B0) is planned but not yet implemented

---

## Roadmap

- [ ] Medical Imaging AI — Chest X-Ray analysis (DenseNet-121) and Brain MRI tumor classification (EfficientNet-B0) with Grad-CAM explainability
- [ ] Persistent BioChat sessions — store conversation history in Supabase
- [ ] Real NewsAPI integration with full key
- [ ] Health score algorithm — composite score from vitals, symptoms, medications, and mood
- [ ] Family profiles — manage health data for multiple members from one account
- [ ] Mobile responsive improvements

---

## ⚕️ Disclaimer

Biowire is an educational and informational tool. It does **not** provide medical diagnoses and is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions. The BioChat urgency scores and specialist recommendations are triage guidance only.

---

## Author

**Berat Fettahoğlu** — Computer Engineering Student  
Portfolio: [beratfoglu.github.io](https://beratfoglu.github.io)  
GitHub: [@beratfoglu](https://github.com/beratfoglu)

---

*Biowire — Understand your symptoms. Find the right care. Stay informed.*