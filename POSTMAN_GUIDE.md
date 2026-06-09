# FitTrack Postman Testing Guide

## ✅ API Status
- API: http://localhost:8089 ✓
- MongoDB: Connected ✓
- Web: http://localhost:3000 ✓

---

## 📋 Password Requirements
All passwords MUST have:
- ✅ Minimum 8 characters
- ✅ At least 1 UPPERCASE letter
- ✅ At least 1 lowercase letter  
- ✅ At least 1 number
- ✅ At least 1 special character (!@#$%^&*)

**Valid Example**: `Secure@Pass123`

---

## 🚀 Quick Postman Setup

### Step 1: Download Postman
- Visit: https://www.postman.com/downloads/
- Install and open Postman

### Step 2: Import Collection
1. Click **Import** (top-left)
2. Select file: `FitTrack-Api/postman/FitTrack-Auth.postman_collection.json`
3. Click **Import**

### Step 3: Import Environment
1. Click **Import** again
2. Select file: `FitTrack-Api/postman/FitTrack-Environment.json`
3. Click **Import**

### Step 4: Select Environment
- Top-right dropdown (currently shows "No Environment")
- Select **"FitTrack Local"**

---

## 📝 Postman Requests

### Request 1: Register User

**Method:** POST  
**URL:** `http://localhost:8089/api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "username": "janesmith",
  "password": "Secure@Pass123"
}
```

**Expected Response:**
```json
{
  "status": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "username": "janesmith",
      "role": "user"
    },
    "token": "eyJhbGc..."
  }
}
```

---

### Request 2: Login User

**Method:** POST  
**URL:** `http://localhost:8089/api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "jane@example.com",
  "password": "Secure@Pass123"
}
```

**Expected Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "username": "janesmith",
      "role": "user"
    },
    "token": "eyJhbGc..."
  }
}
```

---

### Request 3: Health Check

**Method:** GET  
**URL:** `http://localhost:8089/api/v1/health`

**Expected Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "FitTrack API is running",
  "data": {
    "status": "ok"
  }
}
```

---

## 🔑 Using Tokens in Postman

After login, the token is automatically saved to the `{{token}}` variable.

To use it in other requests:
1. Go to **Authorization** tab
2. Select **Bearer Token** from dropdown
3. Enter: `{{token}}`

Or manually in Headers:
```
Authorization: Bearer {{token}}
```

---

## ❌ Common Issues

| Issue | Solution |
|-------|----------|
| 400 "Password must contain..." | Use valid password: `Secure@Pass123` |
| 400 "Email already registered" | Use different email |
| 400 "Username taken" | Use different username |
| 500 "Internal server error" | Ensure MongoDB is running |
| Cannot connect to localhost:8089 | Verify API is running: `npm run dev` |

---

## ✅ Test Checklist
- [ ] Environment selected ("FitTrack Local")
- [ ] Register request returns 201 status
- [ ] Login request returns 200 status
- [ ] Token received and saved
- [ ] Can access protected routes with token

---

**Ready?** Open Postman and start testing!
