<div align="center">

# 🤝 SevaSync

### *AI-Powered Smart Resource Allocation for Community Crisis Response*

[![Google Solution Challenge](https://img.shields.io/badge/Google-Solution%20Challenge%202025-4285F4?style=for-the-badge&logo=google)](https://developers.google.com/community/gdsc-solution-challenge)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Gemini API](https://img.shields.io/badge/AI-Gemini%20API-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

</div>

---

## 🎯 The Problem

Every day, NGOs in Pune and across India collect critical community data through paper surveys — waterlogging reports, medical shortages, food insecurity. But during a crisis, this data is **scattered, unstructured, and slow to act on**. Volunteers have the time and the will. NGOs have the data. But during a crisis, **they are disconnected by paper surveys and slow communication. Lives are lost in the logistical gap.**

## 💡 The Solution

**SevaSync** is a smart, AI-driven allocation platform that turns scattered field notes into instant, verified action. It provides:

- 📋 **AI-powered field data parsing** — Paste raw survey text; Gemini structures it instantly
- 🗺️ **Real-time geographic heatmap** — Live Leaflet map of community crises, colour-coded by urgency
- 🚨 **Emergency SOS broadcast** — Global alert system that notifies all volunteers in real time
- 📸 **On-device camera verification** — AI validates task completion with a live photo before awarding impact points
- 🌐 **Multilingual support** — Tasks translated into Hindi and Marathi for broader volunteer reach
- 🏆 **Gamified impact tracking** — Leaderboard, SDG badges, and downloadable impact certificates

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                   React UI (Vite)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ NGO Flow │  │  Vol Flow│  │ Community Map     │    │
│  │ Upload / │  │ Dashboard│  │ (Leaflet + Google)│    │
│  │ Survey   │  │ Camera   │  │                   │    │
│  └────┬─────┘  └────┬─────┘  └───────┬──────────┘    │
│       │              │                │               │
│       └──────────────┴────────────────┘               │
│                      │ REST API (axios/fetch)          │
└──────────────────────┼───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              Node.js + Express Backend                 │
│                                                        │
│  /api/auth     → JWT auth, Role-based access control  │
│  /api/issues   → Task CRUD, accept, complete, SOS     │
│  /api/volunteer → Dashboard, leaderboard, stats       │
│  /api/ngo      → NGO dashboard, analysis              │
│  /api/survey   → Bulk CSV/text upload                 │
│  /api/gemini   → AI parsing, matching, translation    │
│                       │                               │
└──────────────────────┬┴──────────────────────────────┘
              ┌─────────┴──────────┐
              │                    │
┌─────────────▼──────┐  ┌─────────▼──────────────────┐
│  MongoDB (Atlas)    │  │  Gemini API (Google AI)     │
│                     │  │  via Google AI Studio       │
│  Users (JWT auth)   │  │                             │
│  Issues (tasks)     │  │  /analyze  → NLP parse      │
│  acceptedTasks[]    │  │  /translate → Hindi/Marathi │
│  impactScore        │  │  /match → Volunteer scoring │
│  isEmergency flag   │  │  /generate-story → AI bio   │
└─────────────────────┘  └─────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA with fast HMR |
| **Styling** | Tailwind CSS + Framer Motion | Premium glassmorphism UI + animations |
| **Maps** | Leaflet.js + react-leaflet | Real-time geographic heatmap |
| **Camera** | react-webcam | On-device photo verification (hardware integration) |
| **Backend** | Node.js + Express | REST API + business logic |
| **Auth** | JWT + bcryptjs | Role-based access (NGO / Volunteer) |
| **Database** | MongoDB + Mongoose | Issue, User, and task lifecycle management |
| **AI** | **Gemini API via Google AI Studio** | NLP parsing, multilingual translation, volunteer matching, impact storytelling |
| **Certificates** | html2canvas | Client-side PNG certificate generation |

---

## 🔑 Key AI Features (Gemini API)

All AI features are powered by the **Gemini API via Google AI Studio**:

1. **`POST /api/gemini/analyze`** — Parses unstructured field notes using natural language understanding to extract `category`, `urgency`, `requiredSkills`, and an executive summary.
2. **`POST /api/gemini/translate`** — Translates task titles and descriptions into Hindi (`hi`) or Marathi (`mr`) for local accessibility.
3. **`POST /api/gemini/match/:issueId`** — Scores and ranks volunteers based on proximity, task history, and impact score.
4. **`POST /api/gemini/generate-story`** — Generates a personalized impact narrative for each volunteer's portfolio.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- A Google AI Studio API key (`GEMINI_API_KEY`)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/sevasync.git
cd sevasync

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**`backend/.env`**
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sevasync
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_ai_studio_key
PORT=5000
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This populates MongoDB with hyper-realistic Pune demo data including:
- NGO account: `ngo@demo.com` / `demo123`
- Volunteer: `volunteer@demo.com` / `demo123`
- 7 real crisis scenarios across Kothrud, Viman Nagar, FC Road, Koregaon Park, Baner, Wagholi, Hinjewadi

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm start

# Terminal 2 — Frontend
cd frontend && npm run dev -- --host
```

Open `http://localhost:5173`

---

## 🎬 Demo Flow

| Act | Role | Action | Feature Showcased |
|---|---|---|---|
| 1 | NGO | Paste raw survey text | AI Auto-Detection (Gemini NLP) |
| 2 | NGO | View Community Map | Live Leaflet Heatmap |
| 2 | NGO | Trigger SOS | Global EmergencyBroadcast banner |
| 3 | Volunteer | Accept task | Real-time task allocation |
| 3 | Volunteer | Toggle language | Multilingual support |
| 4 | Volunteer | Camera capture | On-device hardware verification |
| 4 | Volunteer | Download certificate | SDG gamification loop |

---

## 📁 Project Structure

```
sevasync/
├── backend/
│   ├── models/          # Mongoose schemas (User, Issue)
│   ├── routes/          # auth, issues, ngo, volunteer, gemini, survey
│   ├── middleware/       # JWT auth middleware
│   ├── seed.js          # Realistic Pune demo data seeder
│   └── server.js        # Express entry point
├── frontend/
│   └── src/
│       ├── components/  # EmergencyBroadcast, TaskMap, ChatWidget, etc.
│       ├── pages/       # NGODashboard, VolunteerDashboard, TaskDetail, Impact, etc.
│       ├── api.js       # Centralized API client
│       └── App.jsx      # Router + PrivateRoute guards
```

---

## 🌍 UN SDG Alignment

| SDG | Goal | Contribution |
|---|---|---|
| **SDG 3** | Good Health & Well-Being | Medical camp allocation, blood donation coordination |
| **SDG 4** | Quality Education | School flood recovery, educational resource distribution |
| **SDG 11** | Sustainable Cities | Flood response, infrastructure repair task routing |
| **SDG 2** | Zero Hunger | Food distribution coordination across shelters |
| **SDG 17** | Partnerships | NGO–Volunteer collaboration at scale |

---

## 👥 Team

Built with ❤️ for the **Google Solution Challenge 2025** by Team SevaSync.

---

<div align="center">
  <sub>Powered by Gemini API · Built on MERN · Made in India 🇮🇳</sub>
</div>
