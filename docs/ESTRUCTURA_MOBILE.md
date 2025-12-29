# Itera App - Estructura Mobile

## Stack
- **Framework**: Expo SDK 52+
- **Lenguaje**: TypeScript
- **Navegación**: Expo Router (file-based routing)
- **Estado global**: Zustand
- **Data fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Storage seguro**: expo-secure-store
- **UI Components**: Custom + Expo Vector Icons
- **Animaciones**: React Native Reanimated

---

## Estructura de carpetas

```
itera-app/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   ├── _layout.tsx           # Layout para auth (sin tab bar)
│   │   ├── login.tsx             # Pantalla de login
│   │   ├── register.tsx          # Pantalla de registro
│   │   └── forgot-password.tsx   # Recuperar contraseña
│   │
│   ├── (tabs)/                   # Grupo de rutas principales (con tab bar)
│   │   ├── _layout.tsx           # Layout con Tab Navigator
│   │   ├── index.tsx             # Tab: Hoy (home)
│   │   ├── calendar.tsx          # Tab: Calendario
│   │   └── stats.tsx             # Tab: Estadísticas
│   │
│   ├── habit/                    # Rutas de hábitos (stack)
│   │   ├── [id].tsx              # Detalle de hábito
│   │   ├── create.tsx            # Crear hábito
│   │   └── edit/[id].tsx         # Editar hábito
│   │
│   ├── settings/                 # Rutas de configuración
│   │   ├── index.tsx             # Pantalla principal de settings
│   │   ├── profile.tsx           # Editar perfil
│   │   ├── notifications.tsx     # Configurar notificaciones
│   │   ├── points.tsx            # Configurar sistema de puntos
│   │   └── appearance.tsx        # Tema y apariencia
│   │
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404
│
├── src/
│   ├── api/                      # Capa de comunicación con API
│   │   ├── client.ts             # Configuración de Axios
│   │   ├── auth.api.ts           # Endpoints de auth
│   │   ├── habits.api.ts         # Endpoints de hábitos
│   │   ├── logs.api.ts           # Endpoints de logs
│   │   ├── stats.api.ts          # Endpoints de estadísticas
│   │   ├── users.api.ts          # Endpoints de usuarios
│   │   └── index.ts
│   │
│   ├── components/               # Componentes reutilizables
│   │   ├── ui/                   # Componentes base de UI
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── Toggle.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── habits/               # Componentes de hábitos
│   │   │   ├── HabitCard.tsx
│   │   │   ├── HabitList.tsx
│   │   │   ├── HabitCheckbox.tsx
│   │   │   ├── HabitForm.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── stats/                # Componentes de estadísticas
│   │   │   ├── StreakCard.tsx
│   │   │   ├── PointsCard.tsx
│   │   │   ├── ProgressCard.tsx
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── WeeklyChart.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/               # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── ScreenContainer.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── common/               # Componentes comunes
│   │       ├── LoadingScreen.tsx
│   │       ├── ErrorScreen.tsx
│   │       ├── EmptyState.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts            # Hook de autenticación
│   │   ├── useHabits.ts          # Hook para hábitos (React Query)
│   │   ├── useTodayHabits.ts     # Hook para hábitos de hoy
│   │   ├── useStats.ts           # Hook para estadísticas
│   │   ├── useStreak.ts          # Hook para racha
│   │   ├── useToggleHabit.ts     # Hook para marcar hábito
│   │   ├── useTheme.ts           # Hook para tema
│   │   └── index.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── authStore.ts          # Estado de autenticación
│   │   ├── userStore.ts          # Datos del usuario
│   │   ├── settingsStore.ts      # Configuración local
│   │   └── index.ts
│   │
│   ├── services/                 # Lógica de negocio
│   │   ├── auth.service.ts       # Manejo de tokens, login, logout
│   │   ├── storage.service.ts    # SecureStore wrapper
│   │   ├── notifications.service.ts  # Push notifications
│   │   └── index.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── api.types.ts          # Tipos de respuestas API
│   │   ├── habit.types.ts        # Tipos de hábitos
│   │   ├── user.types.ts         # Tipos de usuario
│   │   ├── navigation.types.ts   # Tipos de navegación
│   │   └── index.ts
│   │
│   ├── utils/                    # Utilidades
│   │   ├── dates.ts              # Helpers de fechas
│   │   ├── formatters.ts         # Formateo de datos
│   │   ├── colors.ts             # Paleta de colores
│   │   ├── constants.ts          # Constantes de la app
│   │   └── index.ts
│   │
│   ├── theme/                    # Configuración de tema
│   │   ├── colors.ts             # Colores light/dark
│   │   ├── typography.ts         # Fuentes y tamaños
│   │   ├── spacing.ts            # Espaciado consistente
│   │   └── index.ts
│   │
│   └── config/                   # Configuración
│       ├── env.ts                # Variables de entorno
│       └── queryClient.ts        # Configuración React Query
│
├── assets/                       # Assets estáticos
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── .env.example
├── app.json                      # Configuración de Expo
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## Navegación (Expo Router)

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTRUCTURA DE RUTAS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /                          → Redirect a /(tabs) o /(auth)  │
│                                                             │
│  /(auth)                    → Stack Navigator (sin tabs)    │
│    ├── /login                                               │
│    ├── /register                                            │
│    └── /forgot-password                                     │
│                                                             │
│  /(tabs)                    → Tab Navigator                 │
│    ├── /                    → Tab "Hoy"                     │
│    ├── /calendar            → Tab "Calendario"              │
│    └── /stats               → Tab "Stats"                   │
│                                                             │
│  /habit                     → Stack Navigator               │
│    ├── /habit/create        → Crear hábito                  │
│    ├── /habit/[id]          → Detalle de hábito             │
│    └── /habit/edit/[id]     → Editar hábito                 │
│                                                             │
│  /settings                  → Stack Navigator               │
│    ├── /settings            → Configuración principal       │
│    ├── /settings/profile    → Editar perfil                 │
│    ├── /settings/notifications                              │
│    ├── /settings/points                                     │
│    └── /settings/appearance                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Stores (Zustand)

### authStore.ts
```typescript
interface AuthState {
  // Estado
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  
  // Acciones
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;  // Cargar tokens de SecureStore
}
```

### userStore.ts
```typescript
interface UserState {
  // Estado
  user: User | null;
  settings: UserSettings | null;
  
  // Acciones
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  setSettings: (settings: UserSettings) => void;
  clearUser: () => void;
}
```

### settingsStore.ts
```typescript
interface SettingsState {
  // Estado local (no requiere API)
  theme: 'light' | 'dark' | 'system';
  hapticFeedback: boolean;
  
  // Acciones
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleHapticFeedback: () => void;
}
```

---

## API Layer

### client.ts (Axios config)
```typescript
// Funcionalidades clave:
// - Base URL desde env
// - Interceptor para agregar Authorization header
// - Interceptor para refresh token automático en 401
// - Manejo de errores centralizado
```

### Estructura de cada archivo .api.ts
```typescript
// habits.api.ts
export const habitsApi = {
  getAll: (status?: 'activo' | 'inactivo') => Promise<Habit[]>,
  getToday: () => Promise<TodayHabitsResponse>,
  getById: (id: string) => Promise<Habit>,
  create: (data: CreateHabitDto) => Promise<Habit>,
  update: (id: string, data: UpdateHabitDto) => Promise<Habit>,
  deactivate: (id: string) => Promise<Habit>,
  activate: (id: string) => Promise<Habit>,
  reorder: (habits: { id: string; display_order: number }[]) => Promise<void>,
};
```

---

## Hooks con React Query

### useTodayHabits.ts
```typescript
// Obtiene los hábitos de hoy con su estado de completado
// Cachea y revalida automáticamente
// Optimistic updates cuando se marca un hábito

export const useTodayHabits = () => {
  return useQuery({
    queryKey: ['habits', 'today'],
    queryFn: habitsApi.getToday,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
```

### useToggleHabit.ts
```typescript
// Mutation para marcar/desmarcar hábito
// Incluye optimistic update para UX instantánea
// Rollback automático si falla

export const useToggleHabit = () => {
  return useMutation({
    mutationFn: ({ habitId, completed }) => 
      logsApi.toggle(habitId, { completed }),
    onMutate: async ({ habitId, completed }) => {
      // Optimistic update
    },
    onError: (err, variables, context) => {
      // Rollback
    },
    onSettled: () => {
      // Invalidar queries
      queryClient.invalidateQueries(['habits', 'today']);
    },
  });
};
```

---

## Componentes clave

### HabitCard.tsx
```typescript
interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  onToggle: () => void;
  onPress: () => void;  // Navegar a detalle
}

// Features:
// - Checkbox animado
// - Badge de categoría (obligatorio/ideal)
// - Indicador de puntos para ideales (+1 pt)
// - Progreso semanal para hábitos weekly
// - Haptic feedback al completar
```

### StreakCard.tsx
```typescript
interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
}

// Features:
// - Icono de fuego animado
// - Número grande de racha
// - Comparación con mejor racha
```

### CalendarGrid.tsx
```typescript
interface CalendarGridProps {
  year: number;
  month: number;
  data: Record<string, DaySummary>;
  onDayPress: (date: string) => void;
}

// Features:
// - Grid estilo GitHub contributions
// - Colores por estado (complete, saved, failed)
// - Intensidad por % de ideales
// - Selección de día para ver detalles
```

### ProgressRing.tsx
```typescript
interface ProgressRingProps {
  progress: number;  // 0-100
  size: number;
  strokeWidth: number;
  children?: ReactNode;  // Contenido central
}

// Features:
// - SVG circular animado
// - Gradiente de color
// - Animación al cambiar progreso
```

---

## Flujo de autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTH EN APP                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. App inicia                                              │
│     └─→ authStore.initialize()                              │
│         └─→ Lee tokens de SecureStore                       │
│                                                             │
│  2. Si hay tokens:                                          │
│     └─→ Validar con API (GET /users/me)                     │
│         ├─→ OK: Navegar a /(tabs)                           │
│         └─→ 401: Intentar refresh                           │
│             ├─→ OK: Guardar nuevos tokens, ir a /(tabs)     │
│             └─→ Fail: Limpiar tokens, ir a /(auth)/login    │
│                                                             │
│  3. Si no hay tokens:                                       │
│     └─→ Navegar a /(auth)/login                             │
│                                                             │
│  4. Login exitoso:                                          │
│     └─→ Guardar tokens en SecureStore                       │
│     └─→ authStore.setTokens()                               │
│     └─→ Fetch user data                                     │
│     └─→ Navegar a /(tabs)                                   │
│                                                             │
│  5. Logout:                                                 │
│     └─→ POST /auth/signout                                  │
│     └─→ Limpiar SecureStore                                 │
│     └─→ authStore.clearTokens()                             │
│     └─→ userStore.clearUser()                               │
│     └─→ Navegar a /(auth)/login                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tema y colores

### colors.ts
```typescript
export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceHover: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    
    primary: '#10B981',      // Esmeralda
    primaryLight: '#D1FAE5',
    
    streak: '#F97316',       // Naranja para racha
    streakLight: '#FED7AA',
    
    points: '#F59E0B',       // Ámbar para puntos
    pointsLight: '#FEF3C7',
    
    obligatorio: '#EF4444',  // Rojo
    ideal: '#F59E0B',        // Ámbar
    
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceHover: '#334155',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    
    // ... mismos colores de acento
  },
};
```

---

## Dependencias principales

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-haptics": "~14.0.0",
    "expo-notifications": "~0.29.0",
    
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-svg": "~15.8.0",
    
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    
    "date-fns": "^3.0.0",
    "@expo/vector-icons": "^14.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.3.0"
  }
}
```

---

## Variables de entorno

```env
# .env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
```

---

## Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## Notas para implementación con Claude Code

1. **Empezar por**: 
   - Crear proyecto con `npx create-expo-app@latest itera-app -t expo-template-blank-typescript`
   - Instalar expo-router y configurar
   - Crear estructura de carpetas

2. **Orden sugerido de desarrollo**:
   - `src/theme/` → Colores y tipografía
   - `src/config/` → Env y clients
   - `src/stores/` → Auth store primero
   - `src/api/` → Client y auth.api
   - `app/(auth)/` → Login y register
   - `src/components/ui/` → Componentes base
   - `app/(tabs)/` → Pantallas principales
   - Hooks y features restantes

3. **Consideraciones importantes**:
   - Usar `expo-secure-store` para tokens (no AsyncStorage)
   - Configurar interceptor de Axios para refresh automático
   - React Query maneja cache, no duplicar en Zustand
   - Zustand solo para estado que no viene de API

4. **Testing en desarrollo**:
   - Expo Go para desarrollo rápido
   - Development build para features nativas (notifications)
