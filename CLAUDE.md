# Habita — App de Alquileres & Colivings

App móvil (PWA instalable, distribuible vía Play Store con TWA / Bubblewrap) para registro de usuarios, fidelización y búsqueda de alquileres y colivings.

> Documento de referencia para trabajar este proyecto con **Claude Code** u otros agentes.

---

## 1. Stack técnico

| Capa | Herramienta | Notas |
|---|---|---|
| Framework | **TanStack Start v1** (React 19 + Vite 7) | SSR/SSG + Server Functions. File-based routing en `src/routes/`. |
| Routing | `@tanstack/react-router` | Type-safe. NO usar `react-router-dom`. |
| Data | `@tanstack/react-query` v5 | Loader + `useSuspenseQuery`. |
| Styling | **Tailwind CSS v4** | Configurado en `src/styles.css` (no `tailwind.config.js`). Tokens `oklch`. |
| UI primitives | **shadcn/ui** + Radix | Componentes en `src/components/ui/`. |
| Iconos | `lucide-react` | |
| Forms | `react-hook-form` + `zod` | Validación cliente y servidor. |
| Notificaciones | `sonner` | Toaster. |
| Backend | **Lovable Cloud** (Supabase administrado) | Aún **no habilitado**. Activarlo cuando se cree la BD. |
| Auth | Supabase Auth (email + Google) | Vía `@/integrations/supabase/client` y `requireSupabaseAuth` en server fns. |
| Runtime servidor | Cloudflare Workers (edge) | Sin Node nativo. Usar `createServerFn`. |
| PWA / Mobile | Manifest `public/manifest.webmanifest` | Empaquetar para Play Store con **Bubblewrap** (TWA) o **PWABuilder**. |

### Comandos
```bash
bun install
bun dev          # dev
bun run build    # producción
bun run lint
```
> ⚠️ Lovable ejecuta el build automáticamente. No correr `bun run build` manualmente en este entorno.

---

## 2. Estructura de carpetas

```
src/
├── routes/                      # File-based routing
│   ├── __root.tsx               # Shell raíz (head, fuentes, manifest)
│   ├── index.tsx                # Home (hero + categorías + destacados)
│   ├── buscar.tsx               # Búsqueda y filtros
│   ├── fidelidad.tsx            # Programa Habita+
│   ├── perfil.tsx               # Cuenta de usuario
│   ├── auth.login.tsx           # /auth/login
│   └── auth.registro.tsx        # /auth/registro
├── components/
│   ├── AppShell.tsx             # Layout con bottom nav
│   ├── BottomNav.tsx            # Navegación inferior móvil
│   └── ui/                      # shadcn primitives
├── integrations/supabase/       # (se crea al habilitar Cloud)
├── lib/                         # utils, server fns (*.functions.ts)
└── styles.css                   # Design system (tokens oklch)
public/
├── manifest.webmanifest         # PWA manifest
├── robots.txt
└── icon-192.png / icon-512.png  # ⚠️ Pendientes de generar
```

### Convenciones de rutas
- `posts.$id.tsx` → `/posts/:id`
- `auth.login.tsx` → `/auth/login` (flat dot-separated)
- Rutas protegidas viven bajo `src/routes/_authenticated/` (al integrar auth).

---

## 3. Design system

**Carácter**: amigable pero formal — hospitalidad confiable.

| Token | Valor | Uso |
|---|---|---|
| `--primary` | teal profundo `oklch(0.48 0.09 195)` | CTAs, links activos |
| `--accent` | coral cálido `oklch(0.74 0.14 40)` | Highlights, fidelidad |
| `--background` | arena `oklch(0.985 0.008 85)` | Lienzo |
| `--font-display` | **Fraunces** | Titulares (serif moderno) |
| `--font-sans` | **Inter** | UI/cuerpo |
| `--gradient-hero` | teal → cyan | Banners principales |
| `--gradient-warm` | coral → ámbar | Banners de fidelidad |
| `--shadow-soft` / `--shadow-elevated` | sombras compuestas | Tarjetas |

**Regla:** todos los colores en `src/styles.css`. Nunca usar `text-white`, `bg-black`, etc. en componentes — siempre tokens semánticos.

---

## 4. PWA → Play Store

1. La app es PWA instalable (manifest + `display: standalone`).
2. Para Play Store empaquetar con [**Bubblewrap**](https://github.com/GoogleChromeLabs/bubblewrap) o [**PWABuilder**](https://www.pwabuilder.com):
   ```bash
   npx @bubblewrap/cli init --manifest=https://<dominio>/manifest.webmanifest
   npx @bubblewrap/cli build
   ```
3. Subir el `.aab` resultante a Google Play Console.
4. Verificar Digital Asset Links (`/.well-known/assetlinks.json`) para TWA.

**Pendiente:** generar `icon-192.png` e `icon-512.png` (maskable) en `public/`.

---

## 5. Esquema de base de datos (propuesto — NO creado)

> Esquema sugerido para Supabase/Postgres. Activar Lovable Cloud antes de migrar. Toda tabla en `public` debe llevar `GRANT` + `RLS` + políticas.

### 5.1 Usuarios & Roles

```sql
-- Perfil extendido (1:1 con auth.users)
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null,
  phone           text,
  avatar_url      text,
  date_of_birth   date,
  city            text,
  country         text default 'CO',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create type public.app_role as enum ('user', 'host', 'admin');

create table public.user_roles (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users(id) on delete cascade,
  role     app_role not null,
  unique (user_id, role)
);
```

### 5.2 Propiedades (alquileres + colivings)

```sql
create type public.property_type as enum ('rental', 'coliving');
create type public.property_status as enum ('draft', 'published', 'archived');

create table public.properties (
  id             uuid primary key default gen_random_uuid(),
  host_id        uuid not null references auth.users(id) on delete restrict,
  type           property_type not null,
  status         property_status not null default 'draft',
  title          text not null,
  description    text,
  address_line   text,
  city           text not null,
  neighborhood   text,
  country        text default 'CO',
  lat            numeric(9,6),
  lng            numeric(9,6),
  monthly_price  numeric(12,2) not null,
  currency       text not null default 'COP',
  bedrooms       int,
  bathrooms      numeric(3,1),
  area_m2        int,
  furnished      boolean default false,
  pets_allowed   boolean default false,
  amenities      text[] default '{}',         -- ['wifi','gym','coworking',...]
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  url          text not null,
  position     int not null default 0,
  alt          text
);
```

### 5.3 Favoritos, búsquedas, reseñas

```sql
create table public.favorites (
  user_id      uuid not null references auth.users(id) on delete cascade,
  property_id  uuid not null references public.properties(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, property_id)
);

create table public.saved_searches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text,
  filters     jsonb not null,                  -- {city, min_price, max_price, type, amenities[]}
  created_at  timestamptz not null default now()
);

create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  author_id    uuid not null references auth.users(id) on delete cascade,
  rating       int not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  unique (property_id, author_id)
);
```

### 5.4 Reservas / Contratos

```sql
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.bookings (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id),
  user_id      uuid not null references auth.users(id),
  start_date   date not null,
  end_date     date,
  status       booking_status not null default 'pending',
  total_amount numeric(12,2),
  currency     text default 'COP',
  created_at   timestamptz not null default now()
);
```

### 5.5 Fidelización (Habita+)

```sql
create type public.loyalty_tier as enum ('bronze', 'silver', 'gold', 'platinum');

create table public.loyalty_accounts (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  points_balance int not null default 0,
  lifetime_points int not null default 0,
  tier           loyalty_tier not null default 'bronze',
  updated_at     timestamptz not null default now()
);

create type public.loyalty_txn_kind as enum ('earn', 'redeem', 'expire', 'adjust');

create table public.loyalty_transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  kind         loyalty_txn_kind not null,
  points       int not null,                  -- positivo earn, negativo redeem
  reason       text not null,                 -- 'booking_completed','referral','review',...
  reference_id uuid,                          -- booking_id/review_id/etc
  created_at   timestamptz not null default now()
);

create table public.loyalty_rewards (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  cost_points     int not null,
  active          boolean not null default true,
  stock           int,
  created_at      timestamptz not null default now()
);

create table public.loyalty_redemptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  reward_id   uuid not null references public.loyalty_rewards(id),
  points_spent int not null,
  code        text unique,                    -- código de canje
  redeemed_at timestamptz not null default now(),
  used_at     timestamptz
);

create table public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references auth.users(id),
  referred_id   uuid references auth.users(id),
  code          text not null unique,
  status        text not null default 'pending',  -- pending|completed
  created_at    timestamptz not null default now()
);
```

### 5.6 Reglas RLS (resumen)

- `profiles`, `favorites`, `saved_searches`, `loyalty_accounts`, `loyalty_transactions`, `loyalty_redemptions`, `bookings`: usuario solo accede a sus propias filas (`auth.uid() = user_id`).
- `properties` (publicadas), `property_images`, `loyalty_rewards (active)`, `reviews`: lectura pública (`anon`).
- Escritura de `properties` solo por su `host_id` o `admin` (`public.has_role(auth.uid(),'admin')`).
- Roles **siempre** en `public.user_roles` + función `public.has_role(uuid, app_role) security definer`.

---

## 6. Próximos pasos sugeridos

1. Generar íconos PWA (`icon-192.png`, `icon-512.png`).
2. Activar **Lovable Cloud** y aplicar el esquema de §5 en una migración.
3. Implementar Auth (email + Google) y conectar pantallas `/auth/*`.
4. Conectar `/buscar` a `properties` y `/fidelidad` a `loyalty_*`.
5. Empaquetar TWA y publicar en Play Store.
