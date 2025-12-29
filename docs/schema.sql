-- ============================================
-- HABIT TRACKER - DATABASE SCHEMA
-- Stack: Supabase (PostgreSQL)
-- ============================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TIPOS ENUMERADOS
-- ============================================

-- Categoría de hábito
CREATE TYPE habit_category AS ENUM ('obligatorio', 'ideal');

-- Tipo de frecuencia
CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'custom');

-- Tipo de transacción de puntos
CREATE TYPE point_transaction_type AS ENUM (
  'ideal_completed',      -- Completó un hábito ideal
  'period_bonus',         -- Completó un período (ej: 3/3 gym semanal)
  'streak_milestone',     -- Alcanzó milestone de racha (7, 14, 30 días...)
  'streak_save',          -- Usó puntos para salvar racha
  'manual_adjustment'     -- Ajuste manual (admin)
);

-- Estado del día
CREATE TYPE day_status AS ENUM ('pending', 'complete', 'saved', 'failed');

-- Tier de suscripción
CREATE TYPE subscription_tier AS ENUM ('free', 'premium');

-- Estado de entidades (soft delete)
CREATE TYPE entity_status AS ENUM ('activo', 'inactivo');

-- ============================================
-- TABLA: users
-- Extiende la tabla auth.users de Supabase
-- ============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Costa_Rica',
  subscription_tier subscription_tier DEFAULT 'free',
  
  -- Estado actual del usuario (denormalizado para rápido acceso)
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  total_points INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,  -- Histórico, nunca se resta
  saves_used INT DEFAULT 0,       -- Total de salvadas usadas
  
  -- Configuración del sistema de puntos
  streak_save_cost INT DEFAULT 5,
  points_per_ideal INT DEFAULT 1,
  points_per_period INT DEFAULT 2,
  auto_save_enabled BOOLEAN DEFAULT true,
  
  -- Configuración de notificaciones
  notifications_enabled BOOLEAN DEFAULT true,
  morning_reminder_time TIME DEFAULT '08:00:00',
  evening_reminder_time TIME DEFAULT '19:00:00',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: habits
-- Definición de cada hábito
-- ============================================

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Información básica
  name TEXT NOT NULL,
  description TEXT,
  category habit_category NOT NULL,
  
  -- Frecuencia
  frequency_type frequency_type NOT NULL DEFAULT 'daily',
  frequency_target INT DEFAULT 1,  -- Para weekly: cuántas veces por semana
  frequency_days TEXT[],           -- Para custom: ['mon', 'wed', 'fri']
  
  -- UI/UX
  icon TEXT DEFAULT 'check',
  color TEXT DEFAULT '#10b981',
  display_order INT DEFAULT 0,
  
  -- Stats del hábito individual
  current_habit_streak INT DEFAULT 0,
  best_habit_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  
  -- Estado (soft delete)
  status entity_status NOT NULL DEFAULT 'activo',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT valid_frequency_target CHECK (frequency_target > 0)
);

-- Índice para búsquedas frecuentes
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habits_user_active ON public.habits(user_id) WHERE status = 'activo';

-- ============================================
-- TABLA: habit_logs
-- Registro diario de completación de hábitos
-- ============================================

CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Fecha del log (solo fecha, sin hora)
  log_date DATE NOT NULL,
  
  -- Estado
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,  -- Para días que no aplica el hábito
  
  -- Metadata
  notes TEXT,
  completed_at TIMESTAMPTZ,  -- Hora exacta de completación
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un solo log por hábito por día
  CONSTRAINT unique_habit_log_per_day UNIQUE (habit_id, log_date)
);

-- Índices para consultas frecuentes
CREATE INDEX idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, log_date);
CREATE INDEX idx_habit_logs_date ON public.habit_logs(log_date);

-- ============================================
-- TABLA: daily_summaries
-- Resumen diario del usuario
-- ============================================

CREATE TABLE public.daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Fecha del resumen
  summary_date DATE NOT NULL,
  
  -- Conteos del día
  obligatorios_completed INT DEFAULT 0,
  obligatorios_total INT DEFAULT 0,
  ideales_completed INT DEFAULT 0,
  ideales_total INT DEFAULT 0,
  
  -- Estado del día
  day_status day_status DEFAULT 'pending',
  streak_saved BOOLEAN DEFAULT false,
  
  -- Puntos del día
  points_earned INT DEFAULT 0,
  points_spent INT DEFAULT 0,
  
  -- Snapshot de racha al final del día
  streak_at_end INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un solo resumen por usuario por día
  CONSTRAINT unique_daily_summary UNIQUE (user_id, summary_date)
);

-- Índices
CREATE INDEX idx_daily_summaries_user_date ON public.daily_summaries(user_id, summary_date);

-- ============================================
-- TABLA: period_completions
-- Registro de períodos completados (para hábitos semanales)
-- ============================================

CREATE TABLE public.period_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Período
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Progreso
  target INT NOT NULL,
  achieved INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  
  -- Puntos otorgados
  bonus_points_awarded INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un solo registro por hábito por período
  CONSTRAINT unique_period_completion UNIQUE (habit_id, period_start)
);

-- Índices
CREATE INDEX idx_period_completions_habit ON public.period_completions(habit_id);
CREATE INDEX idx_period_completions_user ON public.period_completions(user_id);

-- ============================================
-- TABLA: point_transactions
-- Historial de transacciones de puntos
-- ============================================

CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Fecha de la transacción
  transaction_date DATE NOT NULL,
  
  -- Detalles
  amount INT NOT NULL,  -- Positivo = ganado, Negativo = gastado
  transaction_type point_transaction_type NOT NULL,
  description TEXT,
  
  -- Referencias opcionales
  habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
  period_completion_id UUID REFERENCES public.period_completions(id) ON DELETE SET NULL,
  
  -- Balance después de la transacción
  balance_after INT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_point_transactions_user ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_user_date ON public.point_transactions(user_id, transaction_date);

-- ============================================
-- TABLA: streak_milestones
-- Registro de milestones alcanzados
-- ============================================

CREATE TABLE public.streak_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Milestone
  milestone_days INT NOT NULL,  -- 7, 14, 30, 60, 90, 180, 365
  bonus_points INT NOT NULL,
  
  -- Cuándo se alcanzó
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Evitar duplicados
  CONSTRAINT unique_user_milestone UNIQUE (user_id, milestone_days)
);

-- Índice
CREATE INDEX idx_streak_milestones_user ON public.streak_milestones(user_id);

-- ============================================
-- TABLA: user_settings
-- Configuraciones adicionales del usuario
-- (separado para no sobrecargar la tabla users)
-- ============================================

CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Apariencia
  theme TEXT DEFAULT 'dark',
  accent_color TEXT DEFAULT '#10b981',
  
  -- Configuración de milestones de racha
  streak_milestones JSONB DEFAULT '{
    "7": 3,
    "14": 5,
    "30": 10,
    "60": 20,
    "90": 35,
    "180": 75,
    "365": 200
  }'::jsonb,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_logs_updated_at
  BEFORE UPDATE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at
  BEFORE UPDATE ON public.daily_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_period_completions_updated_at
  BEFORE UPDATE ON public.period_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Crear usuario después de signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear registro en public.users
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  -- Crear settings por defecto
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para habits
CREATE POLICY "Users can view own habits" ON public.habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own habits" ON public.habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON public.habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON public.habits
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para habit_logs
CREATE POLICY "Users can view own habit logs" ON public.habit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own habit logs" ON public.habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs" ON public.habit_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs" ON public.habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para daily_summaries
CREATE POLICY "Users can view own daily summaries" ON public.daily_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily summaries" ON public.daily_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries" ON public.daily_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para period_completions
CREATE POLICY "Users can view own period completions" ON public.period_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own period completions" ON public.period_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own period completions" ON public.period_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para point_transactions
CREATE POLICY "Users can view own point transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own point transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para streak_milestones
CREATE POLICY "Users can view own streak milestones" ON public.streak_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own streak milestones" ON public.streak_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Hábitos activos del usuario con stats
CREATE OR REPLACE VIEW public.v_active_habits AS
SELECT 
  h.*,
  COALESCE(
    (SELECT COUNT(*) FROM public.habit_logs hl 
     WHERE hl.habit_id = h.id AND hl.completed = true),
    0
  ) AS completion_count,
  (SELECT hl.completed FROM public.habit_logs hl 
   WHERE hl.habit_id = h.id AND hl.log_date = CURRENT_DATE
   LIMIT 1) AS completed_today
FROM public.habits h
WHERE h.status = 'activo';

-- Vista: Resumen del día actual
CREATE OR REPLACE VIEW public.v_today_summary AS
SELECT 
  u.id AS user_id,
  u.current_streak,
  u.total_points,
  COALESCE(ds.obligatorios_completed, 0) AS obligatorios_completed,
  COALESCE(ds.obligatorios_total, 0) AS obligatorios_total,
  COALESCE(ds.ideales_completed, 0) AS ideales_completed,
  COALESCE(ds.ideales_total, 0) AS ideales_total,
  COALESCE(ds.day_status, 'pending') AS day_status
FROM public.users u
LEFT JOIN public.daily_summaries ds 
  ON ds.user_id = u.id AND ds.summary_date = CURRENT_DATE;

-- ============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

-- Índice para búsqueda de logs por rango de fechas
CREATE INDEX idx_habit_logs_date_range 
  ON public.habit_logs(user_id, log_date DESC);

-- Índice para daily_summaries ordenados
CREATE INDEX idx_daily_summaries_date_desc 
  ON public.daily_summaries(user_id, summary_date DESC);

-- Índice parcial para hábitos activos
CREATE INDEX idx_habits_active 
  ON public.habits(user_id, display_order) 
  WHERE status = 'activo';
