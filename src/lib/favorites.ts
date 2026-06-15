// Favoritos del usuario (demo, sin backend). Persiste ids de propiedad en
// localStorage. Cuando se conecte el backend, migrar a la tabla `favorites`
// con RLS own-row (ver CLAUDE.md §6.3 / §7.1).
import { useSyncExternalStore } from "react";

const KEY = "habita.favorites.v1";
const listeners = new Set<() => void>();

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

// Snapshot estable (useSyncExternalStore exige misma referencia si no cambia).
let current: string[] = readFromStorage();
const serverSnapshot: string[] = [];

function emit() {
  for (const l of listeners) l();
}

function persist(next: string[]) {
  current = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  emit();
}

export function toggleFavorite(id: string) {
  persist(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
}

export function isFavoriteId(id: string): boolean {
  return current.includes(id);
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

export function useFavorites(): string[] {
  return useSyncExternalStore(subscribe, () => current, () => serverSnapshot);
}
