# Itera - Guía Completa de Desarrollo

## Resumen del Proyecto

**Itera** es una aplicación móvil para tracking de hábitos con sistema de rachas y puntos.

| Aspecto | Detalle |
|---------|---------|
| **Plataforma** | iOS & Android (React Native + Expo) |
| **Backend** | Node.js + Express + TypeScript |
| **Base de datos** | PostgreSQL (Supabase) |
| **Autenticación** | Supabase Auth |

---

# FASE 0: Preparación del Entorno

## 0.1 Requisitos previos

Asegurate de tener instalado:

```bash
# Node.js (v18 o superior)
node --version  # Debe mostrar v18.x.x o superior

# npm o yarn
npm --version

# Git
git --version

# Expo CLI (global)
npm install -g expo-cli

# EAS CLI para builds (opcional, para después)
npm install -g eas-cli
```

## 0.2 Crear cuenta en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear cuenta (puede ser con GitHub)
3. Crear nuevo proyecto:
   - **Name**: `itera`
   - **Database Password**: Guardar en lugar seguro
   - **Region**: Elegir la más cercana (ej: South America si estás en CR)
4. Esperar a que el proyecto se cree (~2 minutos)

## 0.3 Estructura de carpetas del workspace

```bash
# Crear carpeta raíz del proyecto
mkdir itera
cd itera

# Crear subcarpetas para cada parte
mkdir docs
```

Estructura final:
```
itera/
├── docs/           # Documentación (los archivos .md que ya tenés)
├── itera-api/      # Backend (se crea después)
└── itera-app/      # Mobile app (se crea después)
```

---

# FASE 1: Base de Datos (Supabase)

## 1.1 Configurar la base de datos

1. En Supabase Dashboard, ir a **SQL Editor**
2. Crear nuevo query
3. Copiar y pegar todo el contenido de `schema.sql`
4. Ejecutar (botón "Run" o Ctrl+Enter)
5. Verificar que no haya errores

## 1.2 Verificar las tablas

1. Ir a **Table Editor** en el sidebar
2. Deberías ver las siguientes tablas:
   - `users`
   - `habits`
   - `habit_logs`
   - `daily_summaries`
   - `period_completions`
   - `point_transactions`
   - `streak_milestones`
   - `user_settings`

## 1.3 Obtener credenciales

1. Ir a **Project Settings** → **API**
2. Copiar y guardar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...` (larga)
   - **service_role key**: `eyJ...` (larga, secreta)

⚠️ **IMPORTANTE**: El `service_role key` es secreto. Solo usar en backend, nunca en frontend.

## 1.4 Configurar autenticación

1. Ir a **Authentication** → **Providers**
2. Verificar que **Email** esté habilitado
3. En **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:8081` (para desarrollo)
4. Opcional: Configurar otros providers (Google, Apple) después

---

# FASE 2: Backend (API)

## 2.1 Crear el proyecto

```bash
cd itera

# Crear carpeta del backend
mkdir itera-api
cd itera-api

# Inicializar proyecto Node.js
npm init -y

# Instalar dependencias principales
npm install express cors helmet dotenv zod express-rate-limit @supabase/supabase-js

# Instalar dependencias de desarrollo
npm install -D typescript @types/node @types/express @types/cors tsx @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint
```

## 2.2 Configurar TypeScript

Crear `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 2.3 Configurar scripts en package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  }
}
```

## 2.4 Crear archivo de variables de entorno

Crear `.env`:
```env
NODE_ENV=development
PORT=3000

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGIN=http://localhost:8081
```

Crear `.env.example` (sin valores reales, para git):
```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:8081
```

## 2.5 Crear estructura de carpetas

```bash
mkdir -p src/{config,middleware,routes,services,types,utils}
```

## 2.6 Orden de desarrollo del backend

Seguir este orden para implementar:

### Paso 1: Configuración base
```
src/
├── config/
│   ├── environment.ts    # Validar y exportar variables de entorno
│   └── supabase.ts       # Cliente de Supabase
├── types/
│   ├── database.types.ts # Tipos de las tablas
│   ├── common.types.ts   # ApiResponse, errores custom
│   └── index.ts
```

### Paso 2: Middleware
```
src/
├── middleware/
│   ├── auth.middleware.ts     # Verificar JWT
│   ├── errorHandler.ts        # Manejo de errores
│   ├── notFoundHandler.ts     # 404
│   ├── requestLogger.ts       # Logging
│   ├── validate.middleware.ts # Validación con Zod
│   └── index.ts
```

### Paso 3: App y Server
```
src/
├── app.ts      # Configuración de Express
└── server.ts   # Entry point
```

### Paso 4: Rutas (una por una)
```
src/
├── routes/
│   ├── health.routes.ts  # Primero (para probar que funciona)
│   ├── auth.routes.ts    # Segundo (login, register)
│   ├── user.routes.ts    # Tercero
│   ├── habit.routes.ts   # Cuarto
│   ├── log.routes.ts     # Quinto
│   └── stats.routes.ts   # Sexto
```

### Paso 5: Servicios
```
src/
├── services/
│   ├── habit.service.ts   # Lógica de negocio
│   ├── points.service.ts  # Sistema de puntos
│   └── streak.service.ts  # Rachas y milestones
```

## 2.7 Probar el backend

```bash
# En la carpeta itera-api
npm run dev

# Debería mostrar:
# 🚀 ITERA API Server
# Environment: development
# Port: 3000
```

Probar con curl o Postman:
```bash
# Health check
curl http://localhost:3000/api/health

# Debería responder:
# {"success":true,"data":{"status":"healthy",...}}
```

## 2.8 Testing de endpoints

Orden sugerido para probar:

1. **Health**: `GET /api/health` y `GET /api/health/db`
2. **Auth**: 
   - `POST /api/auth/signup` con body `{ "email": "test@test.com", "password": "12345678" }`
   - `POST /api/auth/signin` con las mismas credenciales
   - Guardar el `accessToken` de la respuesta
3. **User**: `GET /api/users/me` con header `Authorization: Bearer <token>`
4. **Habits**: CRUD completo
5. **Logs**: Toggle de hábitos
6. **Stats**: Verificar estadísticas

---

# FASE 3: App Móvil (Expo)

## 3.1 Crear el proyecto

```bash
cd itera  # Volver a la carpeta raíz

# Crear proyecto Expo con TypeScript
npx create-expo-app@latest itera-app --template blank-typescript

cd itera-app
```

## 3.2 Instalar dependencias

```bash
# Expo Router (navegación)
npx expo install expo-router expo-linking expo-constants expo-status-bar

# Storage seguro y haptics
npx expo install expo-secure-store expo-haptics

# Animaciones y gestos
npx expo install react-native-reanimated react-native-gesture-handler

# SVG para gráficos
npx expo install react-native-svg

# Íconos
npx expo install @expo/vector-icons

# Estado y data fetching
npm install zustand @tanstack/react-query axios

# Utilidades de fechas
npm install date-fns
```

## 3.3 Configurar Expo Router

Editar `package.json`:
```json
{
  "main": "expo-router/entry"
}
```

Editar `app.json`:
```json
{
  "expo": {
    "name": "Itera",
    "slug": "itera",
    "scheme": "itera",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.tuempresa.itera"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      },
      "package": "com.tuempresa.itera"
    }
  }
}
```

## 3.4 Crear estructura de carpetas

```bash
# Crear carpetas de rutas
mkdir -p app/\(auth\)
mkdir -p app/\(tabs\)
mkdir -p app/habit
mkdir -p app/settings

# Crear carpetas de código
mkdir -p src/{api,components,hooks,stores,services,types,utils,theme,config}
mkdir -p src/components/{ui,habits,stats,layout,common}
```

## 3.5 Configurar variables de entorno

Crear `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
```

⚠️ Para desarrollo en dispositivo físico, usar tu IP local:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000/api
```

## 3.6 Orden de desarrollo de la app

### Paso 1: Configuración base
```
src/
├── config/
│   └── env.ts              # Variables de entorno
├── theme/
│   ├── colors.ts           # Paleta de colores
│   ├── typography.ts       # Fuentes
│   ├── spacing.ts          # Espaciado
│   └── index.ts
```

### Paso 2: API client y stores
```
src/
├── api/
│   ├── client.ts           # Axios configurado
│   └── auth.api.ts         # Solo auth primero
├── stores/
│   ├── authStore.ts        # Estado de auth
│   └── index.ts
├── services/
│   ├── storage.service.ts  # SecureStore wrapper
│   └── auth.service.ts     # Lógica de auth
```

### Paso 3: Layouts y navegación
```
app/
├── _layout.tsx             # Root layout con providers
├── (auth)/
│   ├── _layout.tsx         # Layout sin tabs
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx         # Tab navigator
│   └── index.tsx           # Solo placeholder
```

### Paso 4: Componentes UI base
```
src/components/ui/
├── Button.tsx
├── Input.tsx
├── Text.tsx
├── Card.tsx
└── index.ts
```

### Paso 5: Pantalla de Login funcional
- Conectar con API
- Guardar tokens
- Navegar a tabs

### Paso 6: Pantalla Home (Hoy)
```
src/
├── api/
│   ├── habits.api.ts
│   └── logs.api.ts
├── hooks/
│   ├── useTodayHabits.ts
│   └── useToggleHabit.ts
├── components/habits/
│   ├── HabitCard.tsx
│   └── HabitList.tsx

app/(tabs)/
└── index.tsx               # Implementar completo
```

### Paso 7: Resto de pantallas
- Calendar
- Stats
- Settings
- Habit detail/create/edit

### Paso 8: Polish
- Animaciones
- Haptic feedback
- Loading states
- Error handling
- Empty states

## 3.7 Correr la app

```bash
# En la carpeta itera-app
npx expo start

# Opciones:
# - Press 'i' para iOS simulator
# - Press 'a' para Android emulator
# - Escanear QR con Expo Go en tu celular
```

---

# FASE 4: Integración y Testing

## 4.1 Testing del flujo completo

Verificar estos flujos end-to-end:

### Flujo de registro
1. Abrir app → Ver pantalla de login
2. Ir a registro → Crear cuenta
3. Redirigir a login → Iniciar sesión
4. Ver pantalla Home vacía

### Flujo de hábitos
1. Crear primer hábito obligatorio
2. Crear primer hábito ideal
3. Ver ambos en la lista de hoy
4. Marcar obligatorio como completado
5. Marcar ideal → Ver +1 punto
6. Verificar en Stats que los puntos se reflejan

### Flujo de racha
1. Completar todos los obligatorios de un día
2. Verificar que la racha incrementa al día siguiente
3. Simular un día fallido
4. Verificar que se usan puntos para salvar (si auto_save está on)
5. O que la racha se reinicia

### Flujo de calendario
1. Navegar al calendario
2. Ver días coloreados según estado
3. Tocar un día → Ver detalles

## 4.2 Testing en dispositivo real

```bash
# Instalar EAS CLI si no lo tenés
npm install -g eas-cli

# Login en Expo
eas login

# Crear build de desarrollo
eas build --profile development --platform ios
# o
eas build --profile development --platform android
```

---

# FASE 5: Preparación para Producción

## 5.1 Backend - Deploy

Opciones recomendadas:

### Railway (más fácil)
1. Conectar repo de GitHub
2. Configurar variables de entorno
3. Deploy automático

### Render
1. Similar a Railway
2. Tiene free tier

### DigitalOcean App Platform
1. Más control
2. Mejor para producción real

## 5.2 Variables de entorno de producción

```env
NODE_ENV=production
PORT=3000

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGIN=https://tu-app-url.com
```

## 5.3 Mobile - Build de producción

```bash
# Configurar eas.json si no existe
eas build:configure

# Build para stores
eas build --platform ios --profile production
eas build --platform android --profile production
```

## 5.4 Publicar en stores

### iOS (App Store)
1. Tener cuenta de Apple Developer ($99/año)
2. Crear App en App Store Connect
3. Submit build desde EAS o Transporter

### Android (Play Store)
1. Tener cuenta de Google Play Developer ($25 una vez)
2. Crear App en Play Console
3. Upload AAB desde EAS

---

# FASE 6: Post-Launch

## 6.1 Monitoreo

- **Supabase Dashboard**: Ver uso de BD y auth
- **Sentry**: Crash reporting (integrar si querés)
- **Analytics**: Expo tiene analytics básico

## 6.2 Cron job para processEndOfDay

Necesitás un servicio que ejecute diariamente:
- **Supabase Edge Functions**: Gratis con Supabase
- **Railway/Render cron**: Si tu backend está ahí
- **GitHub Actions**: Scheduled workflows

## 6.3 Mejoras futuras

- [ ] Push notifications
- [ ] Widgets (iOS/Android)
- [ ] Sync offline
- [ ] Export de datos
- [ ] Features premium
- [ ] Social features (accountability partner)

---

# Checklist Resumen

## Setup inicial
- [ ] Crear cuenta Supabase
- [ ] Ejecutar schema.sql
- [ ] Obtener credenciales de Supabase

## Backend
- [ ] Crear proyecto Node.js
- [ ] Configurar TypeScript
- [ ] Implementar config y types
- [ ] Implementar middleware
- [ ] Implementar rutas de auth
- [ ] Implementar rutas de habits
- [ ] Implementar rutas de logs
- [ ] Implementar rutas de stats
- [ ] Probar todos los endpoints

## Mobile
- [ ] Crear proyecto Expo
- [ ] Configurar Expo Router
- [ ] Implementar tema y UI base
- [ ] Implementar auth flow
- [ ] Implementar pantalla Home
- [ ] Implementar pantalla Calendar
- [ ] Implementar pantalla Stats
- [ ] Implementar Settings
- [ ] Implementar CRUD de hábitos
- [ ] Testing en dispositivo real

## Deploy
- [ ] Deploy backend a producción
- [ ] Configurar variables de producción
- [ ] Build de producción de app
- [ ] Submit a App Store
- [ ] Submit a Play Store

---

# Comandos útiles

```bash
# Backend
cd itera-api
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run typecheck    # Verificar tipos

# Mobile
cd itera-app
npx expo start       # Iniciar dev server
npx expo start -c    # Limpiar cache y empezar
npx expo install     # Instalar deps compatibles
eas build            # Crear build
```

---

# Recursos

- [Expo Docs](https://docs.expo.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

---

¡Éxito con Itera! 🚀
