# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Itera** is a habit tracking application with a streak system and points mechanism. The project consists of:

- **Backend API** (`itera-api/`): Node.js + Express + TypeScript
- **Mobile App** (`itera-mobile/`): React Native + Expo (not yet implemented)
- **Database**: PostgreSQL via Supabase with schema in `docs/schema.sql`

## Architecture

### Backend Structure (itera-api/)

The API follows a layered architecture:

```
src/
├── config/         # Environment validation and Supabase client
├── middleware/     # Auth, validation (Zod), error handling, logging
├── routes/         # Express routes (health, auth, habits, logs, stats, users)
├── services/       # Business logic (habits, points, streaks)
├── types/          # TypeScript types and database interfaces
└── utils/          # Helper functions
```

**Key architectural decisions:**
- ES Modules (`"type": "module"` in package.json)
- TypeScript with strict mode and `NodeNext` module resolution
- Zod for runtime validation
- JWT authentication via Supabase Auth
- Row Level Security (RLS) enforced at database level

### Database Schema

The database uses denormalization for performance:

- **users**: Stores current_streak, best_streak, total_points (denormalized from transactions)
- **habits**: Tracks current_habit_streak, best_habit_streak, total_completions
- **daily_summaries**: One row per user per day with aggregated stats
- **habit_logs**: One row per habit per day (UNIQUE constraint on habit_id + log_date)

**Important relationships:**
- Each habit log creates a point transaction if the habit is "ideal" category
- Daily summaries are computed at end-of-day via cron job
- Streak saving uses points and is controlled by `auto_save_enabled` user setting

**Enums to remember:**
- `habit_category`: 'obligatorio' | 'ideal'
- `frequency_type`: 'daily' | 'weekly' | 'custom'
- `day_status`: 'pending' | 'complete' | 'saved' | 'failed'
- `point_transaction_type`: 'ideal_completed' | 'period_bonus' | 'streak_milestone' | 'streak_save' | 'manual_adjustment'

### Frontend Structure (itera-mobile/ - planned)

Uses Expo Router (file-based routing) with:
- **Zustand**: Auth state only (tokens, user)
- **TanStack Query**: All server state (habits, logs, stats)
- **expo-secure-store**: Token storage (NOT AsyncStorage)
- **Axios**: HTTP client with refresh token interceptor

## Development Commands

### Backend (itera-api/)

```bash
# Development with hot reload
npm run dev

# Type checking (no emit)
npm run typecheck

# Build TypeScript to dist/
npm run build

# Production
npm start
```

### Frontend (itera-mobile/ - when implemented)

```bash
# Start dev server
npx expo start

# Clear cache and start
npx expo start -c

# Type checking
npm run typecheck
```

### Database

Apply schema and trigger (in order):
```bash
# 1. In Supabase SQL Editor, run:
docs/schema.sql

# 2. Then run the trigger to auto-create user records:
docs/trigger-create-user.sql

# 3. Optionally, run seed data:
docs/seed.sql
```

**Important:** The trigger must be set up before testing auth endpoints, otherwise user records won't be created automatically.

## Environment Variables

### Backend (.env)

Required variables:
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEVER expose to frontend
PORT=3000
CORS_ORIGIN=http://localhost:8081
```

### Frontend (.env - when implemented)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
# For physical device testing, use your local IP:
# EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000/api
```

## Implemented API Endpoints

### Health
- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database connectivity check

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in existing user
- `POST /api/auth/signout` - Sign out (requires auth)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile (requires auth)

See `docs/API_TESTING.md` for detailed testing examples.

## Key Implementation Details

### Authentication Flow

1. User signs up/in via `/api/auth/signup` or `/api/auth/signin`
2. API validates with Supabase Auth, returns `accessToken` and `refreshToken`
3. Database trigger automatically creates user record in `public.users`
4. Frontend stores tokens in expo-secure-store (mobile) or httpOnly cookies (web)
5. All protected routes use `auth.middleware.ts` to verify JWT
6. On 401, frontend attempts refresh via `/api/auth/refresh`

### Habit Completion Flow

1. User toggles habit → POST `/api/logs/:habitId/toggle`
2. Backend creates/updates `habit_logs` for today
3. If habit is "ideal": create `point_transaction` (+1 point)
4. Update `daily_summaries` for today
5. If weekly habit reaches target: create period_completion and bonus points
6. Return updated habit state with points earned

### Streak System

- **current_streak**: Increments when all "obligatorio" habits completed
- **Streak save**: At end of day, if obligatorios incomplete but `auto_save_enabled` and `total_points >= streak_save_cost`, deduct points and mark day as "saved"
- **Streak reset**: If no save possible/enabled, streak resets to 0
- **Milestones**: 7, 14, 30, 60, 90, 180, 365 days grant bonus points

End-of-day processing requires a cron job (not yet implemented) to:
1. Evaluate each user's `daily_summaries` for the day
2. Update streaks based on obligatorio completion
3. Apply auto-save if configured
4. Create next day's summary

## Common Patterns

### API Response Format

All API responses use this structure (defined in `types/common.types.ts`):

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Error Handling

- Middleware `errorHandler.ts` catches all errors
- Custom `AppError` class for controlled errors
- Zod validation errors return 400 with field details
- Auth errors return 401
- Not found returns 404

### Validation with Zod

All request bodies/params are validated with Zod schemas. Use `validate.middleware.ts`:

```typescript
router.post('/habits',
  authenticate,
  validate(createHabitSchema),
  habitController.create
);
```

## Testing

### Backend Testing

Test endpoints with curl or Postman:

```bash
# Health check
curl http://localhost:3000/api/health

# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678"}'

# Get user (requires token)
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing (when implemented)

- Use Expo Go for quick iteration
- Use development builds for native features (notifications)
- Test on both iOS and Android
- Test offline/online transitions
- Test token refresh flow

## Security Considerations

- **NEVER** use `SUPABASE_SERVICE_ROLE_KEY` in frontend
- All database access is protected by Row Level Security (RLS)
- Each user can only read/write their own data
- JWT tokens expire and must be refreshed
- Rate limiting configured via `express-rate-limit`
- Helmet middleware for security headers
- CORS restricted to specific origins

## Documentation References

- Full development guide: `docs/GUIA_COMPLETA.md`
- Mobile structure: `docs/ESTRUCTURA_MOBILE.md`
- Database schema details: `docs/SCHEMA_DOCS.md`
- Database schema SQL: `docs/schema.sql`
- Seed data: `docs/seed.sql`
