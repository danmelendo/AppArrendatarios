# Habita — App de Alquileres & Colivings

App móvil (PWA instalable, distribuible vía Play Store con TWA / Bubblewrap) para registro de usuarios, fidelización y búsqueda de alquileres y colivings. El catálogo y los clientes se gestionan desde un **backoffice web** (separado) que escribe sobre la misma BD.

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
| Forms | `zod` (+ opcional `react-hook-form`) | Validación cliente y servidor. |
| Notificaciones | `sonner` | Toaster. |
| Backend | **Lovable Cloud** (Supabase administrado) | ⚠️ **No habilitar todavía.** Activar cuando se vaya a crear la BD. |
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
│   ├── index.tsx                # Home
│   ├── buscar.tsx               # Búsqueda y filtros
│   ├── fidelidad.tsx            # Programa Habita+
│   ├── perfil.tsx               # Cuenta de usuario
│   ├── auth.login.tsx           # /auth/login (UI lista, sin backend)
│   └── auth.registro.tsx        # /auth/registro (UI lista, sin backend)
├── components/
│   ├── AppShell.tsx
│   ├── BottomNav.tsx
│   └── ui/                      # shadcn primitives
├── integrations/supabase/       # ⚠️ Se crea al activar Cloud (NO editar manual)
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
- Rutas protegidas viven bajo `src/routes/_authenticated/` cuando se conecte auth.

---

## 3. Design system

**Carácter**: amigable pero formal — hospitalidad confiable.

| Token | Valor | Uso |
|---|---|---|
| `--primary` | teal profundo `oklch(0.48 0.09 195)` | CTAs, links activos |
| `--accent` | coral cálido `oklch(0.74 0.14 40)` | Highlights, fidelidad |
| `--background` | arena `oklch(0.985 0.008 85)` | Lienzo |
| `--font-display` | **Fraunces** | Titulares |
| `--font-sans` | **Inter** | UI/cuerpo |
| `--gradient-hero` | teal → cyan | Banners principales |
| `--gradient-warm` | coral → ámbar | Banners de fidelidad |
| `--shadow-soft` / `--shadow-elevated` | sombras compuestas | Tarjetas |

**Regla:** todos los colores en `src/styles.css`. Nunca usar `text-white`, `bg-black`, etc. en componentes — siempre tokens semánticos.

---

## 4. PWA → Play Store + actualizaciones cómodas

### 4.1 Empaquetado inicial
1. La app es PWA instalable (manifest + `display: standalone`).
2. Empaquetar con [**Bubblewrap**](https://github.com/GoogleChromeLabs/bubblewrap) (TWA) o [**PWABuilder**](https://www.pwabuilder.com):
   ```bash
   npx @bubblewrap/cli init --manifest=https://<dominio>/manifest.webmanifest
   npx @bubblewrap/cli build
   ```
3. Subir el `.aab` resultante a Google Play Console.
4. Publicar `assetlinks.json` en `https://<dominio>/.well-known/assetlinks.json` (Digital Asset Links).

### 4.2 Estrategia de actualización **sin pasar por Play Store** (OTA)

La gran ventaja de TWA: el contenido vive en la web; cuando publicas en Lovable, **los usuarios reciben la nueva versión al abrir la app**, sin re-descargar el APK.

| Necesidad | Solución | Responsable |
|---|---|---|
| **Actualizar UI/contenido** | Publicar en Lovable → la TWA carga la web nueva al siguiente arranque. | Inmediato |
| **Forzar refresco si hay caché** | Service Worker con `registerType: "autoUpdate"` + `NetworkFirst` para HTML (ver skill PWA). | Configurar antes de publicar |
| **Aviso de "nueva versión disponible"** | Hook que escucha `workbox.messageSkipWaiting()` y muestra toast con botón "Recargar". | TODO Claude (cuando se añada PWA skill) |
| **Cambios en `manifest.webmanifest` (nombre, iconos, `start_url`)** | Requieren **nuevo `.aab`** + actualización en Play Store (Android cachea esos campos al instalar). | Manual, cada cambio mayor |
| **Cambios sólo en código JS/CSS/HTML/imágenes** | **OTA** — no se toca Play Store. | Automático tras `Publish` |
| **Versión mínima soportada** | Endpoint `/api/public/version-check` que devuelve `{ minVersion }`; cliente muestra pantalla "actualiza desde Play Store" si su `versionCode` es menor. | TODO Claude |

> **TODO Claude** (al activar Cloud): aplicar la **skill `pwa`** con `vite-plugin-pwa` (`generateSW`, `registerType: "autoUpdate"`, `injectRegister: null`) y un wrapper que **no registre el SW en preview/iframe Lovable**.

### 4.3 Versionado de la app nativa (TWA)
- `versionCode` (entero) y `versionName` (semver) en `twa-manifest.json`.
- Subir incrementos a Play Store sólo cuando haya: nuevo icono, nuevo nombre, cambios en permisos, o se quiera forzar versión mínima.

**Pendiente:** generar `icon-192.png` e `icon-512.png` (maskable) en `public/`.

---

## 5. Backoffice web/escritorio para la empresa

La empresa necesita: **crear/editar anuncios, gestionar clientes, ver métricas y reservas**. El backoffice **no se construye aquí**; es un **proyecto Lovable separado** que comparte la misma BD.

### 5.1 Arquitectura recomendada

```
┌────────────────────┐         ┌─────────────────────┐
│  App móvil Habita  │         │  Backoffice Habita  │
│  (este proyecto,   │         │  (proyecto Lovable   │
│   role: user)      │         │   aparte, role: admin│
│                    │         │   / host)            │
└────────┬───────────┘         └──────────┬──────────┘
         │                                │
         │  Supabase JS client            │  Supabase JS client
         │  (anon key + JWT usuario)      │  (anon key + JWT admin)
         ▼                                ▼
        ┌─────────────────────────────────────┐
        │  Lovable Cloud (Postgres+Auth+RLS)  │
        │  Single source of truth             │
        └─────────────────────────────────────┘
```

**Por qué compartir la BD y no exponer una API custom:**
- Una sola fuente de verdad → no hay desincronización.
- RLS distingue `user`, `host`, `admin` → el mismo cliente Supabase sirve ambas apps.
- Tiempo real gratis: `supabase.realtime` envía cambios del backoffice a la app móvil en vivo (ej. nuevos anuncios).

### 5.2 Variante escritorio
- **Opción A (recomendada):** el backoffice web es además **PWA instalable en escritorio** (Windows/macOS) — un solo código.
- **Opción B (nativa):** empaquetar el backoffice con [Electron](https://www.electronjs.org/) o [Tauri](https://tauri.app/) reutilizando la misma app web. Requiere `base: './'` en `vite.config.ts` para Electron.

### 5.3 Sincronización app móvil ⇄ backoffice
| Caso | Mecanismo |
|---|---|
| Backoffice crea un anuncio | `INSERT public.properties` → política RLS permite `SELECT` a `anon` si `status='published'` → la app móvil lo ve en su próxima query. |
| Empuje en vivo a la app móvil | `supabase.channel('properties').on('postgres_changes', ...)` (Realtime, ver knowledge `cloud-realtime`). |
| Notificaciones push (promos) | Web Push (FCM) — TODO Claude: añadir `firebase-messaging-sw.js` cuando se requiera. |
| Importación masiva desde Excel | Backoffice parsea `.xlsx` y hace `INSERT` por lotes. |
| Generar "anuncios" con IA | Backoffice llama a Lovable AI Gateway (`google/gemini-2.5-flash`) para redactar título/descripción. |

### 5.4 Roles (decisión definitiva)
- **Nunca** poner el rol en `profiles`. Siempre en `public.user_roles` + función `public.has_role(_user_id uuid, _role app_role)` `SECURITY DEFINER` (evita recursión en RLS).
- Roles: `user` (cliente final), `host` (propietario que sube inmuebles), `admin` (empresa, acceso total al backoffice).

---

## 6. Esquema de base de datos (propuesto — **NO crear todavía**)

> Esquema sugerido para Postgres/Supabase. Toda tabla en `public` requiere `GRANT` + `RLS ENABLE` + políticas en la **misma** migración.

### 6.1 Usuarios & Roles
```sql
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

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;
```

### 6.2 Propiedades
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
  amenities      text[] default '{}',
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

### 6.3 Favoritos, búsquedas, reseñas, reservas, fidelización
*(Ver versión anterior de este documento — bloques §5.3-§5.5 — sin cambios.)*

```sql
-- favorites, saved_searches, reviews, bookings,
-- loyalty_accounts, loyalty_transactions, loyalty_rewards,
-- loyalty_redemptions, referrals
```

### 6.4 Tablas del backoffice
```sql
-- Anuncios/campañas mostradas en la app (banners, promos)
create type public.ad_placement as enum ('home_banner', 'search_top', 'loyalty_banner');

create table public.ads (
  id          uuid primary key default gen_random_uuid(),
  placement   ad_placement not null,
  title       text not null,
  subtitle    text,
  image_url   text,
  link_url    text,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  active      boolean not null default true,
  priority    int not null default 0,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

-- Notas internas que el backoffice escribe sobre un cliente
create table public.customer_notes (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references auth.users(id) on delete cascade,
  author_id    uuid not null references auth.users(id),
  body         text not null,
  created_at   timestamptz not null default now()
);

-- Auditoría de cambios admin (quién editó qué)
create table public.audit_log (
  id          bigserial primary key,
  actor_id    uuid references auth.users(id),
  action      text not null,           -- 'property.update','user.role.grant',...
  entity      text not null,           -- 'properties','user_roles',...
  entity_id   text,
  diff        jsonb,
  created_at  timestamptz not null default now()
);
```

---

## 7. RLS propuesta (resumen accionable) — **TODO Claude al activar Cloud**

> Patrón general: **denegar por defecto**, abrir lo mínimo con políticas. Roles vía `public.has_role()`.

### 7.1 Tablas con datos personales (sólo el dueño + admin)
Aplica a: `profiles`, `favorites`, `saved_searches`, `bookings`, `loyalty_accounts`, `loyalty_transactions`, `loyalty_redemptions`, `customer_notes` (solo admin), `referrals`.

```sql
-- Patrón "own row"
alter table public.<t> enable row level security;
grant select, insert, update, delete on public.<t> to authenticated;
grant all on public.<t> to service_role;

create policy "own_select" on public.<t> for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "own_insert" on public.<t> for insert to authenticated
  with check (user_id = auth.uid());

create policy "own_update" on public.<t> for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own_delete" on public.<t> for delete to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
```
> `profiles` usa `id` en vez de `user_id` (es la PK referenciando `auth.users.id`).
> `customer_notes`: **sólo** lectura/escritura `admin` (no `own`).

### 7.2 Catálogo público (lectura anon, escritura admin/host)
Aplica a: `properties` (filtrar `status='published'`), `property_images`, `reviews`, `loyalty_rewards` (filtrar `active=true`), `ads` (filtrar `active and now() between starts_at and coalesce(ends_at,'infinity')`).

```sql
alter table public.properties enable row level security;
grant select on public.properties to anon, authenticated;
grant insert, update, delete on public.properties to authenticated;
grant all on public.properties to service_role;

create policy "public_read_published" on public.properties for select to anon, authenticated
  using (status = 'published' or host_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "host_write_own" on public.properties for all to authenticated
  using  (host_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (host_id = auth.uid() or public.has_role(auth.uid(),'admin'));
```

### 7.3 `user_roles` — máxima protección
```sql
alter table public.user_roles enable row level security;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

create policy "self_read_roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "admin_manage_roles" on public.user_roles for all to authenticated
  using  (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
```

### 7.4 `audit_log`
```sql
alter table public.audit_log enable row level security;
grant select on public.audit_log to authenticated;
grant insert on public.audit_log to authenticated;
grant all on public.audit_log to service_role;

create policy "admin_read_audit" on public.audit_log for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "self_insert_audit" on public.audit_log for insert to authenticated
  with check (actor_id = auth.uid());
```

### 7.5 Antipatrones a evitar
- ❌ `select role from profiles where id = auth.uid() = 'admin'` dentro de una política sobre `profiles` → **recursión infinita**. Usar `has_role()` siempre.
- ❌ `grant ... to anon` sin condicionar por `status`/`active` → fuga de borradores.
- ❌ Confiar en el cliente para "ser admin" → cualquier validación de rol va en RLS o en `requireSupabaseAuth` server-side.

---

## 8. Auth — **pendiente de Cloud** (TODO Claude)

Las pantallas `/auth/login` y `/auth/registro` ya tienen UI completa con validación zod, pero NO hacen requests reales. Cuando se active Lovable Cloud:

1. **Activar Cloud** (`supabase--enable`).
2. **Configurar auth**: `supabase--configure_auth` con `disable_signup:false`, `auto_confirm_email:false`, `password_hibp_enabled:true`.
3. **Habilitar Google**: `supabase--configure_social_auth` provider=`google` (managed credentials).
4. **Login**: reemplazar el `setTimeout` en `auth.login.tsx` por:
   ```ts
   import { supabase } from "@/integrations/supabase/client";
   const { error } = await supabase.auth.signInWithPassword({ email, password });
   ```
5. **Google**: usar el broker Lovable, **no** `supabase.auth.signInWithOAuth` directo:
   ```ts
   import { lovable } from "@/integrations/lovable/index";
   await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
   ```
6. **Registro**: `supabase.auth.signUp({ email, password, options: { data: { full_name, phone } } })`.
7. **Trigger on signup** (migración): crear fila en `profiles` y `loyalty_accounts` automáticamente.
8. **Listener global** en `src/routes/__root.tsx`: `supabase.auth.onAuthStateChange` filtrado a `SIGNED_IN`/`SIGNED_OUT`/`USER_UPDATED` → `router.invalidate()` + `queryClient.invalidateQueries()`.
9. **Rutas protegidas**: mover futuras pantallas (favoritos, reservas, ajustes) bajo `src/routes/_authenticated/`. Lovable crea automáticamente `_authenticated/route.tsx` (`ssr:false`, redirect a `/auth`).
10. **Wiring del bearer**: el integration añade `attachSupabaseAuth` a `functionMiddleware` en `src/start.ts` — verificar que sigue presente.
11. **Eliminar mensajes "Auth aún no conectada"** en `auth.login.tsx` y `auth.registro.tsx`.

---

## 9. Plan de desarrollo

### Fase 0 — Andamiaje (✅ hecho)
- Diseño visual y design system.
- Rutas básicas (home, buscar, fidelidad, perfil, auth/*).
- PWA manifest, fuentes, robots.

### Fase 1 — Activar backend
- [ ] Activar Lovable Cloud.
- [ ] Aplicar migración con §6 + §7 (esquema + RLS + grants + has_role + triggers).
- [ ] Conectar `/auth/*` siguiendo §8.

### Fase 2 — Conectar app a datos reales
- [ ] `/buscar` → `properties` (loader + `useSuspenseQuery`, filtros como `loaderDeps`).
- [ ] Detalle de propiedad (`/propiedad/$id`) con `og:image` desde `property_images`.
- [ ] Favoritos, reseñas, reservas (rutas bajo `_authenticated/`).
- [ ] `/fidelidad` → `loyalty_*` (saldo real, canjes).
- [ ] Banners de `ads` activos en home/buscar/fidelidad.

### Fase 3 — Backoffice (proyecto Lovable aparte)
- [ ] Crear nuevo proyecto Lovable "Habita Admin" conectado al **mismo** Lovable Cloud (vía Connectors).
- [ ] Login restringido a usuarios con rol `admin` o `host` (gate en `_authenticated/` + redirect si `!has_role`).
- [ ] CRUD de `properties` + subida de imágenes a Storage.
- [ ] CRUD de `ads` con previsualización del banner.
- [ ] Buscador de clientes (`profiles`) + ficha con `customer_notes`, reservas e historial de puntos.
- [ ] Asistente IA para redactar anuncios (Lovable AI Gateway, `google/gemini-2.5-flash`).
- [ ] Empaquetado opcional para escritorio con Tauri/Electron (ver knowledge `electron-desktop-app`).

### Fase 4 — Realtime + push
- [ ] `ALTER PUBLICATION supabase_realtime ADD TABLE public.properties, public.ads;`
- [ ] Suscripción en la app móvil para refrescar listados al instante.
- [ ] Web Push (FCM) para promos y novedades.

### Fase 5 — Distribución y OTA
- [ ] Aplicar **skill `pwa`** (Service Worker controlado + toast "nueva versión").
- [ ] Generar iconos PWA maskable 192/512.
- [ ] Bubblewrap → `.aab` → Play Store.
- [ ] Subir `assetlinks.json` al dominio publicado.
- [ ] Configurar endpoint `/api/public/version-check` para forzar mínimos.

### Fase 6 — Observabilidad
- [ ] Logging estructurado en server fns.
- [ ] Analytics (PostHog / Lovable analytics).
- [ ] Scan de seguridad (`security--run_security_scan`) antes de cada publish mayor.

---

## 10. Checklist rápido para Claude antes de tocar la BD
- [ ] ¿Estoy creando una tabla nueva en `public`? → `GRANT` + `ENABLE RLS` + políticas en la **misma** migración.
- [ ] ¿La política referencia la propia tabla? → usar `SECURITY DEFINER` (`has_role`).
- [ ] ¿Hay columna `user_id`? → `NOT NULL` y RLS forzando `= auth.uid()` en `WITH CHECK`.
- [ ] ¿Es lectura pública? → filtrar por `status`/`active`; nunca `grant select to anon` sin condicionar en la política.
- [ ] ¿Server fn privada? → `.middleware([requireSupabaseAuth])`.
- [ ] ¿Usa `supabaseAdmin`? → `await import("@/integrations/supabase/client.server")` **dentro** del `.handler()`.
