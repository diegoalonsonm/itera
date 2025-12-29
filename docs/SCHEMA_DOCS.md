# Habit Tracker - Database Schema

## Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   auth.users                                     │
│                              (Manejado por Supabase)                            │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │
                                      │ 1:1 (trigger automático)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    users                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, FK → auth.users)                                                        │
│ email, name, avatar_url, timezone                                               │
│ subscription_tier (free/premium)                                                │
│ ─────────────────────────────────────                                           │
│ STATS (denormalizados):                                                         │
│ current_streak, best_streak, total_points, lifetime_points, saves_used          │
│ ─────────────────────────────────────                                           │
│ CONFIG:                                                                         │
│ streak_save_cost, points_per_ideal, points_per_period, auto_save_enabled       │
│ notifications_enabled, morning_reminder_time, evening_reminder_time            │
└───────┬─────────────────┬─────────────────┬─────────────────┬──────────────────┘
        │                 │                 │                 │
        │ 1:N             │ 1:N             │ 1:N             │ 1:1
        ▼                 │                 │                 ▼
┌───────────────────┐     │                 │     ┌───────────────────────────────┐
│      habits       │     │                 │     │        user_settings          │
├───────────────────┤     │                 │     ├───────────────────────────────┤
│ id (PK)           │     │                 │     │ id (PK)                       │
│ user_id (FK)      │     │                 │     │ user_id (FK, UNIQUE)          │
│ name, description │     │                 │     │ theme, accent_color           │
│ category          │     │                 │     │ streak_milestones (JSONB)     │
│ (obligatorio/     │     │                 │     │ onboarding_completed          │
│  ideal)           │     │                 │     └───────────────────────────────┘
│ frequency_type    │     │                 │
│ frequency_target  │     │                 │
│ frequency_days[]  │     │                 │
│ icon, color       │     │                 │
│ display_order     │     │                 │
│ current_habit_    │     │                 │
│   streak          │     │                 │
│ best_habit_streak │     │                 │
│ total_completions │     │                 │
│ status (activo/   │     │                 │
│   inactivo)       │     │                 │
└───────┬───────────┘     │                 │
        │                 │                 │
        │ 1:N             │                 │
        ▼                 │                 │
┌───────────────────┐     │                 │
│    habit_logs     │     │                 │
├───────────────────┤     │                 │
│ id (PK)           │     │                 │
│ habit_id (FK)     │     │                 │
│ user_id (FK)      │     │                 │
│ log_date          │     │                 │
│ completed         │     │                 │
│ skipped           │     │                 │
│ notes             │     │                 │
│ completed_at      │     │                 │
│ ─────────────────│     │                 │
│ UNIQUE(habit_id, │     │                 │
│        log_date)  │     │                 │
└───────────────────┘     │                 │
                          │                 │
        ┌─────────────────┘                 │
        │                                   │
        ▼                                   ▼
┌───────────────────┐           ┌───────────────────────────────┐
│ daily_summaries   │           │     point_transactions        │
├───────────────────┤           ├───────────────────────────────┤
│ id (PK)           │           │ id (PK)                       │
│ user_id (FK)      │           │ user_id (FK)                  │
│ summary_date      │           │ transaction_date              │
│ obligatorios_     │           │ amount (+/-)                  │
│   completed       │           │ transaction_type              │
│ obligatorios_     │           │ description                   │
│   total           │           │ habit_id (FK, nullable)       │
│ ideales_completed │           │ period_completion_id          │
│ ideales_total     │           │   (FK, nullable)              │
│ day_status        │           │ balance_after                 │
│ streak_saved      │           └───────────────────────────────┘
│ points_earned     │
│ points_spent      │
│ streak_at_end     │
│ ─────────────────│
│ UNIQUE(user_id,  │
│    summary_date)  │
└───────────────────┘

┌───────────────────┐           ┌───────────────────────────────┐
│period_completions │           │      streak_milestones        │
├───────────────────┤           ├───────────────────────────────┤
│ id (PK)           │           │ id (PK)                       │
│ habit_id (FK)     │           │ user_id (FK)                  │
│ user_id (FK)      │           │ milestone_days (7,14,30...)   │
│ period_start      │           │ bonus_points                  │
│ period_end        │           │ achieved_at                   │
│ target            │           │ ─────────────────────────     │
│ achieved          │           │ UNIQUE(user_id,               │
│ completed         │           │        milestone_days)        │
│ bonus_points_     │           └───────────────────────────────┘
│   awarded         │
│ ─────────────────│
│ UNIQUE(habit_id, │
│   period_start)   │
└───────────────────┘
```

## Enums

| Enum | Valores |
|------|---------|
| `habit_category` | `obligatorio`, `ideal` |
| `frequency_type` | `daily`, `weekly`, `custom` |
| `day_status` | `pending`, `complete`, `saved`, `failed` |
| `point_transaction_type` | `ideal_completed`, `period_bonus`, `streak_milestone`, `streak_save`, `manual_adjustment` |
| `subscription_tier` | `free`, `premium` |
| `entity_status` | `activo`, `inactivo` |

## Flujo de Datos

### Cuando el usuario marca un hábito como completado:

1. **INSERT/UPDATE** en `habit_logs` (log_date = hoy)
2. Si es hábito **ideal**: 
   - **INSERT** en `point_transactions` (+1 punto)
   - **UPDATE** `users.total_points` 
3. Si es hábito **weekly**:
   - **UPDATE** `period_completions.achieved`
   - Si `achieved >= target`: **INSERT** `point_transactions` (bonus)
4. **UPDATE** `daily_summaries` del día
5. **UPDATE** `habits.total_completions`

### Al final del día (job/cron):

1. Evaluar `daily_summaries`:
   - Si todos obligatorios completados → `day_status = 'complete'`, `streak++`
   - Si no y tiene puntos suficientes y `auto_save_enabled` → `day_status = 'saved'`, `points -= save_cost`
   - Si no → `day_status = 'failed'`, `streak = 0`
2. Verificar milestones de racha
3. Crear `daily_summary` para el nuevo día

## Índices Clave

| Tabla | Índice | Propósito |
|-------|--------|-----------|
| `habits` | `(user_id) WHERE status = 'activo'` | Listar hábitos activos |
| `habit_logs` | `(user_id, log_date)` | Obtener logs del día |
| `habit_logs` | `(habit_id, log_date)` | Verificar si hábito completado |
| `daily_summaries` | `(user_id, summary_date DESC)` | Historial de días |
| `point_transactions` | `(user_id, transaction_date)` | Historial de puntos |

## Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Cada usuario solo puede:
- **SELECT** sus propios datos
- **INSERT** datos con su `user_id`
- **UPDATE** sus propios datos
- **DELETE** sus propios datos (donde aplica)
