# API Testing Guide

## Base URL
```
http://localhost:3000/api
```

## Health Endpoints

### Basic Health Check
```bash
curl http://localhost:3000/api/health
```

### Database Health Check
```bash
curl http://localhost:3000/api/health/db
```

## Authentication Endpoints

### 1. Sign Up
Creates a new user account.

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### 2. Sign In
Authenticates an existing user.

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### 3. Get Current User
Retrieves the authenticated user's profile.

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "name": "Test User",
      "current_streak": 0,
      "total_points": 0,
      ...
    }
  }
}
```

### 4. Refresh Token
Gets a new access token using a refresh token.

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### 5. Sign Out
Invalidates the current session.

```bash
curl -X POST http://localhost:3000/api/auth/signout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Signed out successfully"
  }
}
```

## User Endpoints

All user endpoints require authentication (Bearer token).

### 1. Get Current User Profile
Retrieves the full user profile including all settings.

```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "name": "Test User",
      "avatar_url": null,
      "timezone": "America/Costa_Rica",
      "subscription_tier": "free",
      "current_streak": 0,
      "best_streak": 0,
      "total_points": 0,
      "lifetime_points": 0,
      "saves_used": 0,
      "streak_save_cost": 5,
      "points_per_ideal": 1,
      "points_per_period": 2,
      "auto_save_enabled": true,
      "notifications_enabled": true,
      "morning_reminder_time": "08:00:00",
      "evening_reminder_time": "19:00:00",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 2. Update User Profile
Updates user profile and/or settings.

```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "timezone": "America/New_York",
    "auto_save_enabled": false,
    "notifications_enabled": true,
    "morning_reminder_time": "07:00:00"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

**Updateable fields:**
- Profile: `name`, `avatar_url`, `timezone`
- Notifications: `notifications_enabled`, `morning_reminder_time`, `evening_reminder_time`
- Settings: `auto_save_enabled`
- Points config: `streak_save_cost`, `points_per_ideal`, `points_per_period`

### 3. Get User Statistics
Retrieves just the statistics (streaks and points).

```bash
curl http://localhost:3000/api/users/me/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "current_streak": 5,
      "best_streak": 10,
      "total_points": 25,
      "lifetime_points": 100,
      "saves_used": 2
    }
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }  // Only in development
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Missing or invalid token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource already exists
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_SERVER_ERROR` (500) - Server error

## Testing Workflow

### 1. Complete Auth Flow
```bash
# Step 1: Sign up
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}')

# Extract access token (requires jq)
TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')

# Step 2: Use token to get user info
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Step 3: Sign out
curl -X POST http://localhost:3000/api/auth/signout \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Sign In Existing User
```bash
# Sign in
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

# Extract and use token
TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### "Email address is invalid" Error

If you get this error when signing up:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Unable to create account. Please check your Supabase email confirmation settings."
  }
}
```

**Solution:** Disable email confirmation in Supabase (for development):

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. **Uncheck "Confirm email"**
4. Click **Save**

This allows users to sign up without email verification.

**For Production:** Configure SMTP settings in **Project Settings** → **Auth** → **SMTP Settings**

### "Email already in use" Error

The email is already registered. Either:
- Use a different email
- Sign in instead of signing up
- Delete the user from Supabase Dashboard (Authentication → Users)

### Database Trigger Not Working

If users are created in `auth.users` but not in `public.users`:

1. Verify the trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Re-run `docs/trigger-create-user.sql` in Supabase SQL Editor

3. Check function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

## Setup Requirements

Before testing auth endpoints, make sure you've:

1. ✅ Run `docs/schema.sql` in Supabase SQL Editor
2. ✅ Run `docs/trigger-create-user.sql` in Supabase SQL Editor
3. ✅ **Disable email confirmation** in Supabase (see Troubleshooting above)
4. ✅ Set up `.env` file in `itera-api/` with Supabase credentials
5. ✅ Started the server with `npm run dev`

## Next Endpoints to Implement

- [ ] User routes (GET/PATCH profile)
- [ ] Habit routes (CRUD operations)
- [ ] Log routes (toggle habit completion)
- [ ] Stats routes (get statistics)
