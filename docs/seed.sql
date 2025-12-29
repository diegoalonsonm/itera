-- ============================================
-- HABIT TRACKER - SEED DATA
-- Datos de prueba para desarrollo
-- ============================================

-- NOTA: Este archivo asume que ya existe un usuario en auth.users
-- Para testing local, primero creá un usuario via Supabase Auth
-- y luego reemplazá 'YOUR_USER_ID' con el UUID real

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Reemplazar con el UUID de un usuario real de auth.users
-- DO $$
-- DECLARE
--   test_user_id UUID := 'YOUR_USER_ID';
-- BEGIN

-- Para facilitar el testing, usamos una función que inserta datos
-- después de que se crea un usuario

CREATE OR REPLACE FUNCTION public.seed_demo_habits(p_user_id UUID)
RETURNS void AS $$
DECLARE
  habit_meditar UUID;
  habit_leer UUID;
  habit_gym UUID;
  habit_agua UUID;
  habit_rrss UUID;
  habit_dormir UUID;
BEGIN
  -- ============================================
  -- INSERTAR HÁBITOS DE EJEMPLO
  -- ============================================
  
  -- Hábito 1: Meditar (Obligatorio, Diario)
  INSERT INTO public.habits (user_id, name, description, category, frequency_type, icon, color, display_order, status)
  VALUES (p_user_id, 'Meditar 10min', 'Meditación matutina para empezar el día con calma', 'obligatorio', 'daily', 'brain', '#8b5cf6', 1, 'activo')
  RETURNING id INTO habit_meditar;
  
  -- Hábito 2: Leer (Obligatorio, Diario)
  INSERT INTO public.habits (user_id, name, description, category, frequency_type, icon, color, display_order, status)
  VALUES (p_user_id, 'Leer 30min', 'Lectura de libros de desarrollo personal o técnicos', 'obligatorio', 'daily', 'book', '#3b82f6', 2, 'activo')
  RETURNING id INTO habit_leer;
  
  -- Hábito 3: Gym (Obligatorio, Semanal 3x)
  INSERT INTO public.habits (user_id, name, description, category, frequency_type, frequency_target, icon, color, display_order, status)
  VALUES (p_user_id, 'Ir al gym', 'Entrenamiento de fuerza o cardio', 'obligatorio', 'weekly', 3, 'dumbbell', '#ef4444', 3, 'activo')
  RETURNING id INTO habit_gym;
  
  -- Hábito 4: Tomar agua (Ideal, Diario)
  INSERT INTO public.habits (user_id, name, description, category, frequency_type, icon, color, display_order, status)
  VALUES (p_user_id, 'Tomar 2L agua', 'Mantenerse hidratado durante el día', 'ideal', 'daily', 'droplets', '#06b6d4', 4, 'activo')
  RETURNING id INTO habit_agua;
  
  -- Hábito 5: No redes sociales (Ideal, Diario)
  INSERT INTO public.habits (user_id, name, description, category, frequency_type, icon, color, display_order, status)
  VALUES (p_user_id, 'No redes sociales', 'Evitar scrolling innecesario en redes', 'ideal', 'daily', 'smartphone', '#f59e0b', 5, 'activo')
  RETURNING id INTO habit_rrss;
  
  -- Hábito 6: Dormir temprano (Ideal, Diario)
  INSERT INTO public.habits (user_id, name, description, category, frequency_type, icon, color, display_order, status)
  VALUES (p_user_id, 'Dormir antes de 11pm', 'Mantener un horario de sueño saludable', 'ideal', 'daily', 'moon', '#6366f1', 6, 'activo')
  RETURNING id INTO habit_dormir;

  -- ============================================
  -- INSERTAR LOGS DE EJEMPLO (últimos 7 días)
  -- ============================================
  
  -- Día -6 (hace 6 días) - Día completo
  INSERT INTO public.habit_logs (habit_id, user_id, log_date, completed, completed_at)
  VALUES 
    (habit_meditar, p_user_id, CURRENT_DATE - 6, true, NOW() - INTERVAL '6 days'),
    (habit_leer, p_user_id, CURRENT_DATE - 6, true, NOW() - INTERVAL '6 days'),
    (habit_gym, p_user_id, CURRENT_DATE - 6, true, NOW() - INTERVAL '6 days'),
    (habit_agua, p_user_id, CURRENT_DATE - 6, true, NOW() - INTERVAL '6 days'),
    (habit_rrss, p_user_id, CURRENT_DATE - 6, true, NOW() - INTERVAL '6 days'),
    (habit_dormir, p_user_id, CURRENT_DATE - 6, false, NULL);

  -- Día -5 - Día completo
  INSERT INTO public.habit_logs (habit_id, user_id, log_date, completed, completed_at)
  VALUES 
    (habit_meditar, p_user_id, CURRENT_DATE - 5, true, NOW() - INTERVAL '5 days'),
    (habit_leer, p_user_id, CURRENT_DATE - 5, true, NOW() - INTERVAL '5 days'),
    (habit_agua, p_user_id, CURRENT_DATE - 5, true, NOW() - INTERVAL '5 days'),
    (habit_rrss, p_user_id, CURRENT_DATE - 5, false, NULL),
    (habit_dormir, p_user_id, CURRENT_DATE - 5, true, NOW() - INTERVAL '5 days');

  -- Día -4 - Día con fallo (salvado)
  INSERT INTO public.habit_logs (habit_id, user_id, log_date, completed, completed_at)
  VALUES 
    (habit_meditar, p_user_id, CURRENT_DATE - 4, true, NOW() - INTERVAL '4 days'),
    (habit_leer, p_user_id, CURRENT_DATE - 4, false, NULL),  -- FALLÓ
    (habit_gym, p_user_id, CURRENT_DATE - 4, true, NOW() - INTERVAL '4 days'),
    (habit_agua, p_user_id, CURRENT_DATE - 4, true, NOW() - INTERVAL '4 days'),
    (habit_rrss, p_user_id, CURRENT_DATE - 4, false, NULL),
    (habit_dormir, p_user_id, CURRENT_DATE - 4, false, NULL);

  -- Día -3 - Día completo
  INSERT INTO public.habit_logs (habit_id, user_id, log_date, completed, completed_at)
  VALUES 
    (habit_meditar, p_user_id, CURRENT_DATE - 3, true, NOW() - INTERVAL '3 days'),
    (habit_leer, p_user_id, CURRENT_DATE - 3, true, NOW() - INTERVAL '3 days'),
    (habit_agua, p_user_id, CURRENT_DATE - 3, true, NOW() - INTERVAL '3 days'),
    (habit_rrss, p_user_id, CURRENT_DATE - 3, true, NOW() - INTERVAL '3 days'),
    (habit_dormir, p_user_id, CURRENT_DATE - 3, true, NOW() - INTERVAL '3 days');

  -- Día -2 - Día completo
  INSERT INTO public.habit_logs (habit_id, user_id, log_date, completed, completed_at)
  VALUES 
    (habit_meditar, p_user_id, CURRENT_DATE - 2, true, NOW() - INTERVAL '2 days'),
    (habit_leer, p_user_id, CURRENT_DATE - 2, true, NOW() - INTERVAL '2 days'),
    (habit_gym, p_user_id, CURRENT_DATE - 2, true, NOW() - INTERVAL '2 days'),
    (habit_agua, p_user_id, CURRENT_DATE - 2, false, NULL),
    (habit_rrss, p_user_id, CURRENT_DATE - 2, true, NOW() - INTERVAL '2 days'),
    (habit_dormir, p_user_id, CURRENT_DATE - 2, false, NULL);

  -- Día -1 (ayer) - Día completo
  INSERT INTO public.habit_logs (habit_id, user_id, log_date, completed, completed_at)
  VALUES 
    (habit_meditar, p_user_id, CURRENT_DATE - 1, true, NOW() - INTERVAL '1 day'),
    (habit_leer, p_user_id, CURRENT_DATE - 1, true, NOW() - INTERVAL '1 day'),
    (habit_agua, p_user_id, CURRENT_DATE - 1, true, NOW() - INTERVAL '1 day'),
    (habit_rrss, p_user_id, CURRENT_DATE - 1, true, NOW() - INTERVAL '1 day'),
    (habit_dormir, p_user_id, CURRENT_DATE - 1, true, NOW() - INTERVAL '1 day');

  -- ============================================
  -- INSERTAR DAILY SUMMARIES
  -- ============================================
  
  INSERT INTO public.daily_summaries (user_id, summary_date, obligatorios_completed, obligatorios_total, ideales_completed, ideales_total, day_status, points_earned, streak_at_end)
  VALUES 
    (p_user_id, CURRENT_DATE - 6, 3, 3, 2, 3, 'complete', 2, 7),
    (p_user_id, CURRENT_DATE - 5, 2, 2, 2, 3, 'complete', 2, 8),
    (p_user_id, CURRENT_DATE - 4, 2, 3, 1, 3, 'saved', -4, 9),  -- Salvado
    (p_user_id, CURRENT_DATE - 3, 2, 2, 3, 3, 'complete', 3, 10),
    (p_user_id, CURRENT_DATE - 2, 3, 3, 1, 3, 'complete', 1, 11),
    (p_user_id, CURRENT_DATE - 1, 2, 2, 3, 3, 'complete', 3, 12);

  -- ============================================
  -- INSERTAR TRANSACCIONES DE PUNTOS
  -- ============================================
  
  INSERT INTO public.point_transactions (user_id, transaction_date, amount, transaction_type, description, habit_id, balance_after)
  VALUES 
    (p_user_id, CURRENT_DATE - 6, 1, 'ideal_completed', 'Completó: Tomar 2L agua', habit_agua, 28),
    (p_user_id, CURRENT_DATE - 6, 1, 'ideal_completed', 'Completó: No redes sociales', habit_rrss, 29),
    (p_user_id, CURRENT_DATE - 5, 1, 'ideal_completed', 'Completó: Tomar 2L agua', habit_agua, 30),
    (p_user_id, CURRENT_DATE - 5, 1, 'ideal_completed', 'Completó: Dormir antes de 11pm', habit_dormir, 31),
    (p_user_id, CURRENT_DATE - 4, 1, 'ideal_completed', 'Completó: Tomar 2L agua', habit_agua, 32),
    (p_user_id, CURRENT_DATE - 4, -5, 'streak_save', 'Salvada de racha usada', NULL, 27),
    (p_user_id, CURRENT_DATE - 3, 1, 'ideal_completed', 'Completó: Tomar 2L agua', habit_agua, 28),
    (p_user_id, CURRENT_DATE - 3, 1, 'ideal_completed', 'Completó: No redes sociales', habit_rrss, 29),
    (p_user_id, CURRENT_DATE - 3, 1, 'ideal_completed', 'Completó: Dormir antes de 11pm', habit_dormir, 30),
    (p_user_id, CURRENT_DATE - 2, 1, 'ideal_completed', 'Completó: No redes sociales', habit_rrss, 31),
    (p_user_id, CURRENT_DATE - 1, 1, 'ideal_completed', 'Completó: Tomar 2L agua', habit_agua, 32),
    (p_user_id, CURRENT_DATE - 1, 1, 'ideal_completed', 'Completó: No redes sociales', habit_rrss, 33),
    (p_user_id, CURRENT_DATE - 1, 1, 'ideal_completed', 'Completó: Dormir antes de 11pm', habit_dormir, 34);

  -- ============================================
  -- ACTUALIZAR STATS DEL USUARIO
  -- ============================================
  
  UPDATE public.users 
  SET 
    current_streak = 12,
    best_streak = 28,
    total_points = 34,
    lifetime_points = 156,
    saves_used = 3
  WHERE id = p_user_id;

  -- ============================================
  -- INSERTAR MILESTONES ALCANZADOS
  -- ============================================
  
  INSERT INTO public.streak_milestones (user_id, milestone_days, bonus_points, achieved_at)
  VALUES 
    (p_user_id, 7, 3, NOW() - INTERVAL '5 days');

END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================

-- Para poblar datos de demo después de crear un usuario:
-- SELECT public.seed_demo_habits('your-user-uuid-here');

-- Para limpiar datos de un usuario (útil para testing):
CREATE OR REPLACE FUNCTION public.clear_user_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM public.point_transactions WHERE user_id = p_user_id;
  DELETE FROM public.streak_milestones WHERE user_id = p_user_id;
  DELETE FROM public.period_completions WHERE user_id = p_user_id;
  DELETE FROM public.daily_summaries WHERE user_id = p_user_id;
  DELETE FROM public.habit_logs WHERE user_id = p_user_id;
  DELETE FROM public.habits WHERE user_id = p_user_id;
  
  UPDATE public.users 
  SET 
    current_streak = 0,
    best_streak = 0,
    total_points = 0,
    lifetime_points = 0,
    saves_used = 0
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
