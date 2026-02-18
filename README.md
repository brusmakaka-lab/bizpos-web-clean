# BizPos Lite (Single Tenant)

Proyecto full-stack simplificado inspirado en BizPos / FerreStock / ZukiZone.

- Stack: Next.js 14 App Router + TypeScript + TailwindCSS + Prisma + PostgreSQL + NextAuth Credentials.
- Arquitectura: **sin API REST para CRUD**, usando **Server Actions**.
- Segmentación funcional:
  - `/admin/*` panel de gestión
  - `/` catálogo público

## 1) Plan de arquitectura

### 1.1 Principios

1. Single-tenant real:
   - una base por cliente
   - una sola fila de negocio (`Business` singleton)
2. Zero REST para operaciones de dominio:
   - altas/bajas/modificaciones vía Server Actions (`app/actions/*`)
3. Seguridad por capas:
   - middleware en `/admin/*`
   - validación server-side con Zod
   - claves sensibles sólo en server/env

### 1.2 Capas

1. Presentación (RSC + Client Components)
   - Admin pages en `app/admin/(panel)/*`
   - Público en `app/*`
2. Acciones de dominio
   - `app/actions/*` para CRUD + checkout + IA + chatbot
3. Persistencia
   - Prisma client único en `lib/prisma.ts`
   - Schema en `prisma/schema.prisma`
4. Auth
   - NextAuth Credentials en `auth.ts`
   - ruta técnica de NextAuth en `app/api/auth/[...nextauth]/route.ts`

### 1.3 Rutas

Admin:
- `/admin/login`
- `/admin/dashboard`
- `/admin/productos`
- `/admin/categorias`
- `/admin/pedidos`
- `/admin/configuracion`

Público:
- `/`
- `/producto/[id]`
- `/checkout`

## 2) Árbol de archivos

```txt
.
├─ app/
│  ├─ actions/
│  │  ├─ ai-actions.ts
│  │  ├─ auth-actions.ts
│  │  ├─ business-actions.ts
│  │  ├─ category-actions.ts
│  │  ├─ order-actions.ts
│  │  └─ product-actions.ts
│  ├─ admin/
│  │  ├─ login/page.tsx
│  │  └─ (panel)/
│  │     ├─ layout.tsx
│  │     ├─ dashboard/page.tsx
│  │     ├─ productos/page.tsx
│  │     ├─ categorias/page.tsx
│  │     ├─ pedidos/page.tsx
│  │     └─ configuracion/page.tsx
│  ├─ api/auth/[...nextauth]/route.ts
│  ├─ checkout/page.tsx
│  ├─ producto/[id]/page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ admin/
│  │  ├─ admin-nav.tsx
│  │  └─ stat-card.tsx
│  └─ public/
│     ├─ add-to-cart-button.tsx
│     ├─ cart-checkout-form.tsx
│     ├─ product-grid.tsx
│     └─ public-header.tsx
├─ lib/
│  ├─ auth-helpers.ts
│  ├─ business.ts
│  ├─ prisma.ts
│  ├─ utils.ts
│  └─ validations.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ types/next-auth.d.ts
├─ auth.ts
├─ middleware.ts
├─ docker-compose.yml
├─ .env.example
└─ package.json
```

## 3) Implementación por módulos

### Módulo A - Configuración base

- Dependencias y scripts en `package.json`.
- Tailwind config en `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`.
- Variables de entorno en `.env.example`.

### Módulo B - Base de datos

- Modelo Prisma completo en `prisma/schema.prisma`:
  - `Business`, `User`, `Category`, `Product`, `Order`, `OrderItem`
- Seed inicial en `prisma/seed.ts` (business singleton + admin + datos demo).

### Módulo C - Autenticación y seguridad

- NextAuth Credentials en `auth.ts`.
- Sesión JWT con `role` y `userId`.
- Middleware de protección admin en `middleware.ts`.
- Helpers de guard en `lib/auth-helpers.ts`.

### Módulo D - CRUD con Server Actions

- Categorías en `app/actions/category-actions.ts`.
- Productos en `app/actions/product-actions.ts`.
- Pedidos + estado + WhatsApp en `app/actions/order-actions.ts`.
- Configuración de negocio en `app/actions/business-actions.ts`.

### Módulo E - Admin panel

- Login: `app/admin/login/page.tsx`
- Layout protegido + navegación: `app/admin/(panel)/layout.tsx` y `components/admin/admin-nav.tsx`
- Dashboard: `app/admin/(panel)/dashboard/page.tsx`
- CRUD páginas:
  - `app/admin/(panel)/productos/page.tsx`
  - `app/admin/(panel)/categorias/page.tsx`
  - `app/admin/(panel)/pedidos/page.tsx`
  - `app/admin/(panel)/configuracion/page.tsx`

### Módulo F - Catálogo público + checkout

- Home catálogo en `app/page.tsx` + `components/public/product-grid.tsx`
- Detalle producto en `app/producto/[id]/page.tsx`
- Carrito en `localStorage`:
  - `components/public/add-to-cart-button.tsx`
  - `components/public/cart-checkout-form.tsx`
- Checkout en `app/checkout/page.tsx`

### Módulo G - IA + Chatbot (preview)

- `app/actions/ai-actions.ts`
  - generar `themeJson` preview
  - generar productos preview
  - chatbot en server action

## 4) Instalación local

### 4.1 Levantar PostgreSQL en Docker

```bash
docker compose up -d
```

### 4.2 Configurar entorno

```bash
copy .env.example .env
```

Nota: en esta base el Postgres local se expone en el puerto `55432` para evitar conflictos con otras instancias locales.

### 4.3 Instalar dependencias y preparar DB

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4.4 Ejecutar en desarrollo

```bash
npm run dev
```

Login admin por defecto (seed):
- email: `admin@local.dev`
- password: `admin123`

## 5) Producción (Vercel + Neon opcional)

1. Crear DB PostgreSQL en Neon.
2. Configurar envs en Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL final)
3. Ejecutar migraciones en entorno de despliegue.
4. Deploy en Vercel.

### 5.1 STAGING (Vercel + Neon) - checklist operativo

1. Crear proyecto de staging en Neon (DB separada de producción).
2. Obtener `DATABASE_URL` de Neon (con `sslmode=require`).
3. En Vercel (entorno **Preview** o proyecto `-staging`) cargar variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL pública de staging)
4. Ejecutar migraciones sobre la DB de staging con `migrate deploy`.
5. (Opcional) correr seed controlado para datos demo de QA.
6. Deploy y smoke test (`/`, `/checkout`, `/admin/login`, `/admin/pedidos`).

### 5.2 Variables recomendadas para STAGING

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
NEXTAUTH_SECRET="reemplazar-por-secreto-seguro"
NEXTAUTH_URL="https://tu-app-staging.vercel.app"
SEED_ADMIN_EMAIL="admin@local.dev"
SEED_ADMIN_PASSWORD="admin123"
```

### 5.3 Comandos de migración STAGING

PowerShell:

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
npx prisma migrate deploy
```

cmd.exe:

```cmd
set DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require && npx prisma migrate deploy
```

Seed opcional en staging:

```cmd
set DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require && npm run db:seed
```

### 5.4 Comandos útiles con Vercel CLI (opcional)

```cmd
vercel env add DATABASE_URL preview
vercel env add NEXTAUTH_SECRET preview
vercel env add NEXTAUTH_URL preview
vercel --prod=false
```

> Nota: para migrar desde CI/CD, usar `npx prisma migrate deploy` en el pipeline con `DATABASE_URL` del entorno de staging.

## 6) Notas clave

- No hay endpoints `/api/products` o `/api/orders` para CRUD.
- Se usa `app/api/auth/[...nextauth]/route.ts` sólo para handshake de NextAuth.
- Todo CRUD funcional ocurre vía Server Actions.
