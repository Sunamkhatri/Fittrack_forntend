# FitTrack

Full-stack fitness tracking platform — authentication, profiles, trainers, payments and admin.

## Stack

| Project | Tech |
|---------|------|
| **backend** | Express 5 · TypeScript · MongoDB · JWT · Zod |
| **frontend** | Next.js 15 · React 19 · Tailwind v4 · react-hook-form · Zustand |

## Quick start

### 1. MongoDB

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-mongodb.ps1
```

Uses `.mongo-data/` (no admin rights required).

### 2. API

```powershell
cd backend
npm install
npm run dev
```

API runs at **http://localhost:8089**

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**

### Start everything (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-all.ps1
```

Launches MongoDB, the API and the frontend in separate windows.

## Routes

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Request a password reset email |
| `/reset-password/[token]` | Set a new password |
| `/dashboard` | Protected — requires auth cookie |
| `/profile` · `/progress` · `/workouts` · `/nutrition` · `/settings` | Protected user pages |
| `/trainers` · `/clients` | Trainer browsing & client list |
| `/admin` | Admin only |

## API endpoints

Auth — mounted at `/api/v1/auth` (and `/api/auth` as a compatibility alias for the Flutter client):

| Method | Path | Body |
|--------|------|------|
| `GET` | `/api/v1/health` | — |
| `POST` | `/register` (alias `/signup`) | `{ firstName, lastName, email, username, password, age, gender, weight }` |
| `POST` | `/login` | `{ email, password }` |
| `POST` | `/forgot-password` | `{ email }` |
| `PUT` | `/reset-password/:token` | `{ password }` |
| `GET` | `/me` · `/whoami` | protected |
| `PUT` | `/update` · `/update-password` | protected |
| `PATCH` | `/profile-image` | protected, multipart `image` |

Users — mounted at `/api/v1/users`, all protected:

| Method | Path |
|--------|------|
| `GET` · `PUT` | `/profile` |
| `PUT` | `/change-password` |
| `POST` · `DELETE` | `/profile-image` (multipart `profileImage`) |
| `GET` | `/trainers` · `/clients` |

Payments — `/api/v1/payments`, protected: `POST /initiate`, `POST /verify` (Khalti).

Admin — `/api/v1/admin/users`, admin role required: full CRUD plus `GET /revenue/all`.

Import **backend/postman/FitTrack-Auth.postman_collection.json** into Postman.

## Tests

```powershell
cd backend
npm test
```

Runs the API integration suite against a live MongoDB.

## Environment

**backend/.env**

```
PORT=8089
MONGODB_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=change_me

FRONTEND_ORIGIN=http://localhost:3000

KHALTI_SECRET_KEY=your_khalti_sandbox_key
KHALTI_BASE_URL=https://dev.khalti.com/api/v2

EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

`FRONTEND_ORIGIN` builds password-reset links and Khalti return URLs, so it must match the
origin the frontend is actually served from. `KHALTI_SECRET_KEY` has no default — payment
routes return a 500 until it is set.

**frontend/.env.local**

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8089
```
