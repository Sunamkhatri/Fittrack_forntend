# FitTrack

Full-stack fitness tracking platform — Sprint 2: authentication (register & login).

## Stack

| Project | Tech |
|---------|------|
| **FitTrack-Api** | Express 5 · TypeScript · MongoDB · JWT · Zod |
| **FitTrack-Next** | Next.js 16 · React 19 · Tailwind v4 · react-hook-form |

## Quick start

### 1. MongoDB

```powershell
npm run mongo
```

Or double-click `scripts/start-mongodb.ps1`. Uses `.mongo-data/` (no admin rights required).

### 2. API

```powershell
cd FitTrack-Api
cp .env.example .env   # already configured for local dev
npm install
npm run dev
```

API runs at **http://localhost:8089**

### 3. Frontend

```powershell
cd FitTrack-Next
cp .env.local.example .env.local
npm install
npm run dev
```

App runs at **http://localhost:3000**

### One-command dev (API + frontend)

From the repo root (with MongoDB already running):

```powershell
npm install
npm run dev
```

### Start everything (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-all.ps1
```

## Routes

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Protected — requires auth cookie |

## API endpoints

| Method | Path | Body |
|--------|------|------|
| `GET` | `/api/v1/health` | — |
| `POST` | `/api/v1/auth/register` | `{ firstName, lastName, email, username, password }` |
| `POST` | `/api/v1/auth/login` | `{ email, password }` |

Import **FitTrack-Api/postman/FitTrack-Auth.postman_collection.json** into Postman.

## Environment

**FitTrack-Api/.env**
```
PORT=8089
MONGODB_URL=mongodb://localhost:27017/fittrack
SECRET_KEY=your_jwt_secret
```

**FitTrack-Next/.env.local**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8089
```
