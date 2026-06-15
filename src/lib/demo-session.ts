// Sesión de demo (sin backend). Guarda un usuario ficticio en localStorage
// para que el flujo de login/registro/perfil funcione de extremo a extremo
// durante la presentación. Cuando se conecte el backend real, reemplazar por
// supabase.auth.* (ver CLAUDE.md §8).
import { useSyncExternalStore } from "react";

export type DemoUser = {
  name: string;
  email: string;
};

const KEY = "habita.session.v1";
const listeners = new Set<() => void>();

function readFromStorage(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

// Snapshot estable (useSyncExternalStore exige misma referencia si no cambia,
// de lo contrario provoca un bucle infinito de renders).
let current: DemoUser | null = readFromStorage();

function emit() {
  for (const l of listeners) l();
}

export function signIn(user: DemoUser) {
  current = user;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(user));
  emit();
}

export function signOut() {
  current = null;
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
  emit();
}

// Deriva un nombre legible a partir del correo cuando no se capturó nombre.
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned ? cleaned.replace(/\b\w/g, (c) => c.toUpperCase()) : "Invitado";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      current = readFromStorage();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDemoSession(): DemoUser | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
