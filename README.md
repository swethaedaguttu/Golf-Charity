# ⛳ Par & Purpose — Golf Charity Subscription Platform

This project is a sample full-stack application demonstrating subscription systems, score tracking, and draw-based rewards.

> Full-Stack Developer Assignment Project  
> Stack: React + Vite · Node.js/Express · MongoDB · JWT Auth

---

## 📁 Project Structure

```
golf-charity-mvp/
├── backend/
│   ├── models/
│   │   ├── User.js          ← User schema with rolling-5 score logic
│   │   └── Draw.js          ← Draw + winner schema
│   ├── routes/
│   │   ├── auth.js          ← POST /register, POST /login
│   │   ├── user.js          ← Profile, subscribe, scores, charity, draw results
│   │   └── admin.js         ← Users list, run draw, mark payout
│   ├── middleware/
│   │   └── auth.js          ← JWT protect, requireSubscription, requireAdmin
│   ├── server.js            ← Express entry point
│   ├── seed.js              ← Creates admin user in DB (run once)
│   ├── render.yaml          ← Render.com deployment config
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx   ← Global auth state (JWT + localStorage)
    │   ├── components/
    │   │   ├── Navbar.jsx         ← Responsive top nav
    │   │   └── ProtectedRoute.jsx ← Auth & admin route guards
    │   ├── pages/
    │   │   ├── Home.jsx           ← Landing page
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Subscribe.jsx      ← Plan selection (monthly/yearly)
    │   │   ├── Dashboard.jsx      ← User dashboard (scores, charity, draws)
    │   │   ├── Admin.jsx          ← Admin panel (users, run draw, payouts)
    │   │   └── Charities.jsx      ← Charity listing + selection
    │   ├── data/
    │   │   └── charities.js       ← Static list of 5 charities
    │   ├── api.js                 ← Axios instance with JWT interceptor
    │   ├── App.jsx                ← Router + layout
    │   └── index.css              ← Tailwind + design tokens
    ├── vercel.json                ← SPA rewrite rules
    └── .env.example
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas free cluster (or local MongoDB)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd golf-charity-mvp

# Backend
cd backend
npm install
cp .env.example .env    # Fill in your values
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/golf-charity
JWT_SECRET=some_long_random_secret_string
ADMIN_EMAIL=admin@golfcharity.com
ADMIN_PASSWORD=Admin@1234
FRONTEND_URL=http://localhost:5173
```

```bash
# Frontend
cd ../frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

### 2. Seed Admin User

```bash
cd backend
node seed.js
# ✅ Admin created: admin@golfcharity.com / Admin@1234
```

### 3. Start Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev     # Starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev     # Starts on http://localhost:5173
```

---

## 🔑 Test Credentials

| Role  | Email                      | Password    |
|-------|----------------------------|-------------|
| Admin | admin@golfcharity.com      | Admin@1234  |
| User  | Register via /register     | Your choice |

---

## 🌐 Deployment

### Backend → Render.com (Free tier)

1. Push backend to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo, set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables (from `.env`)
5. Deploy — note your live URL (e.g. `https://golf-charity-api.onrender.com`)
   - Live URL: `https://golf-charity-ib6t.onrender.com/`
6. After deploy: open Render shell and run `node seed.js`

### Frontend → Vercel (Free tier)

1. Push frontend to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repo, set:
   - **Framework:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
5. Deploy
   - Live URL: `https://golf-charity-5r8pqdid2-swethaedagottu4-1644s-projects.vercel.app/`

---

## 📡 API Reference

### Auth
| Method | Endpoint            | Auth | Description       |
|--------|---------------------|------|-------------------|
| POST   | /api/auth/register  | ✗    | Create account    |
| POST   | /api/auth/login     | ✗    | Login, get JWT    |

### User (requires Bearer token)
| Method | Endpoint                | Sub required | Description               |
|--------|-------------------------|:------------:|---------------------------|
| GET    | /api/user/profile       | ✗            | Get full profile          |
| POST   | /api/user/subscribe     | ✗            | Activate subscription     |
| POST   | /api/user/scores        | ✓            | Add score (rolling 5)     |
| GET    | /api/user/scores        | ✓            | Get scores list           |
| PUT    | /api/user/charity       | ✗            | Update charity selection  |
| GET    | /api/user/draw-results  | ✓            | Personal draw history     |

### Admin (requires admin role)
| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | /api/admin/stats                  | Platform stats          |
| GET    | /api/admin/users                  | All users               |
| POST   | /api/admin/draw                   | Run monthly draw        |
| GET    | /api/admin/draws                  | All draw history        |
| PATCH  | /api/admin/draws/:id/payout       | Mark winner as paid     |

---

## ⚙️ Key Logic Details

### Rolling 5-Score System
- User model `addScore()` method sorts by date, pops oldest when length ≥ 5
- Scores always returned newest-first

### Draw Algorithm
1. Generate 5 unique random integers in range [1, 45]
2. Fetch all active subscribers with ≥ 1 score
3. For each user: intersect their score values with drawn numbers
4. ≥ 3 matches → create winner record with tier (small/medium/jackpot)
5. If no 5-match winner → jackpotRolledOver = true

### Prize Pool Distribution
| Tier    | Matches | Pool Share | Rollover |
|---------|---------|-----------|----------|
| Small   | 3       | 25%       | No       |
| Medium  | 4       | 35%       | No       |
| Jackpot | 5       | 40%       | Yes      |

---

## ✅ Feature Checklist

- [x] User signup & login (JWT)
- [x] Subscription flow (monthly/yearly, no real payment)
- [x] Score entry — rolling 5-score logic
- [x] Draw system (random 1-45, 3/4/5 match tiers)
- [x] Charity selection & display
- [x] User dashboard — all modules
- [x] Admin panel — users, draw, payouts
- [x] Protected & admin-only routes
- [x] Responsive design (mobile + desktop)
- [x] Error handling throughout

---

Built by Swethaedagottu
