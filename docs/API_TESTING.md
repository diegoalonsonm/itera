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

## Habit Endpoints

All habit endpoints require authentication (Bearer token).

### 1. Get All Habits
Retrieves all habits for the current user.

```bash
curl http://localhost:3000/api/habits \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**
- `status` (optional): Filter by status (`activo` or `inactivo`). Default: `activo`
- `category` (optional): Filter by category (`obligatorio` or `ideal`)

**Examples:**
```bash
# Get all active habits (default)
curl http://localhost:3000/api/habits \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get only obligatorio habits
curl "http://localhost:3000/api/habits?category=obligatorio" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get inactive habits
curl "http://localhost:3000/api/habits?status=inactivo" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "Morning Exercise",
        "description": "30 minutes workout",
        "category": "obligatorio",
        "frequency_type": "daily",
        "frequency_target": 1,
        "frequency_days": null,
        "icon": "dumbbell",
        "color": "#10b981",
        "display_order": 0,
        "current_habit_streak": 5,
        "best_habit_streak": 10,
        "total_completions": 25,
        "status": "activo",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 1
  }
}
```

### 2. Get Single Habit
Retrieves a specific habit by ID.

```bash
curl http://localhost:3000/api/habits/HABIT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Create Habit
Creates a new habit.

```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Read for 30 minutes",
    "description": "Read non-fiction books",
    "category": "ideal",
    "frequency_type": "daily",
    "icon": "book",
    "color": "#3b82f6"
  }'
```

**Required fields:**
- `name` (string, max 100 chars)
- `category` (`"obligatorio"` or `"ideal"`)

**Optional fields:**
- `description` (string, max 500 chars)
- `frequency_type` (`"daily"`, `"weekly"`, or `"custom"`) - default: `"daily"`
- `frequency_target` (number 1-7, required for weekly habits)
- `frequency_days` (array of days like `["mon", "wed", "fri"]`, required for custom)
- `icon` (string, max 50 chars) - default: `"check"`
- `color` (hex color like `"#10b981"`) - default: `"#10b981"`
- `display_order` (number >= 0) - auto-assigned if not provided

**Examples:**

Daily habit:
```json
{
  "name": "Meditate",
  "category": "ideal",
  "frequency_type": "daily"
}
```

Weekly habit (3 times per week):
```json
{
  "name": "Gym",
  "category": "obligatorio",
  "frequency_type": "weekly",
  "frequency_target": 3
}
```

Custom habit (specific days):
```json
{
  "name": "Team Meeting",
  "category": "obligatorio",
  "frequency_type": "custom",
  "frequency_days": ["mon", "wed", "fri"]
}
```

### 4. Update Habit
Updates an existing habit.

```bash
curl -X PATCH http://localhost:3000/api/habits/HABIT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "color": "#ef4444"
  }'
```

All fields are optional. Only include the fields you want to update.

### 5. Deactivate Habit
Soft deletes a habit (sets status to `inactivo`).

```bash
curl -X DELETE http://localhost:3000/api/habits/HABIT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Reactivate Habit
Reactivates an inactive habit.

```bash
curl -X PATCH http://localhost:3000/api/habits/HABIT_ID/activate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Reorder Habits
Updates the display order of multiple habits at once.

```bash
curl -X POST http://localhost:3000/api/habits/reorder \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "habits": [
      { "id": "habit-1-uuid", "display_order": 0 },
      { "id": "habit-2-uuid", "display_order": 1 },
      { "id": "habit-3-uuid", "display_order": 2 }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Habits reordered successfully",
    "updated": 3
  }
}
```

## Log Endpoints

All log endpoints require authentication (Bearer token).

### 1. Get Today's Habits
Retrieves all active habits with their completion status for today.

```bash
curl http://localhost:3000/api/logs/today \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "habits": [
      {
        "id": "uuid",
        "name": "Morning Exercise",
        "category": "obligatorio",
        "frequency_type": "daily",
        "icon": "dumbbell",
        "color": "#10b981",
        "display_order": 0,
        "completed_today": true,
        "log_id": "log-uuid",
        "notes": null,
        "completed_at": "2024-01-15T08:30:00Z"
      },
      {
        "id": "uuid2",
        "name": "Read 30 minutes",
        "category": "ideal",
        "frequency_type": "daily",
        "icon": "book",
        "color": "#3b82f6",
        "display_order": 1,
        "completed_today": false,
        "log_id": null,
        "notes": null,
        "completed_at": null
      }
    ],
    "summary": {
      "total_habits": 2,
      "completed": 1,
      "obligatorios_total": 1,
      "obligatorios_completed": 1,
      "ideales_total": 1,
      "ideales_completed": 0
    }
  }
}
```

### 2. Toggle Habit Completion
Marks a habit as completed or uncompleted for today.

```bash
curl -X POST http://localhost:3000/api/logs/HABIT_ID/toggle \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true,
    "notes": "Felt great today!"
  }'
```

**Request body:**
- `completed` (boolean, required): Whether the habit is completed
- `notes` (string, optional, max 500 chars): Optional notes about the completion

**Response:**
```json
{
  "success": true,
  "data": {
    "log": {
      "id": "log-uuid",
      "habit_id": "habit-uuid",
      "user_id": "user-uuid",
      "log_date": "2024-01-15",
      "completed": true,
      "notes": "Felt great today!",
      "completed_at": "2024-01-15T14:30:00Z",
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    },
    "habit": {
      "id": "habit-uuid",
      "name": "Read 30 minutes",
      "category": "ideal"
    },
    "points_earned": 1,
    "completed_today": true
  }
}
```

**Points Logic:**
- **Completing an "ideal" habit**: Earns +1 point (configurable via `points_per_ideal`)
- **Uncompleting an "ideal" habit**: Removes the point that was earned
- **"Obligatorio" habits**: Do not earn points directly (but affect streak)

**Examples:**

Mark habit as completed:
```bash
curl -X POST http://localhost:3000/api/logs/HABIT_ID/toggle \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

Mark habit as uncompleted:
```bash
curl -X POST http://localhost:3000/api/logs/HABIT_ID/toggle \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": false}'
```

With notes:
```bash
curl -X POST http://localhost:3000/api/logs/HABIT_ID/toggle \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true, "notes": "Great session today!"}'
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
