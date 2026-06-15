// Programa de fidelidad Habita+ (demo, sin backend). Persiste el saldo de
// puntos y los beneficios ya canjeados en localStorage. Cuando se conecte el
// backend, migrar a las tablas `loyalty_accounts` / `loyalty_transactions` /
// `loyalty_redemptions` con RLS own-row (ver CLAUDE.md §6.3 / §7.1).
import { useSyncExternalStore } from "react";

export type Reward = {
  id: string;
  title: string;
  cost: number;
};

// Catálogo de beneficios canjeables (en cloud vendría de `loyalty_rewards`).
export const REWARDS: Reward[] = [
  { id: "renta-10", title: "10% en tu próxima renta", cost: 800 },
  { id: "checkin", title: "Check-in prioritario", cost: 500 },
  { id: "upgrade", title: "Upgrade de habitación", cost: 1500 },
];

export const GOAL = 2000; // pts para Nivel Oro

type LoyaltyState = {
  points: number;
  redeemed: string[]; // ids de Reward ya canjeados
};

const KEY = "habita.loyalty.v1";
const listeners = new Set<() => void>();

const DEFAULT_STATE: LoyaltyState = { points: 1240, redeemed: [] };

function readFromStorage(): LoyaltyState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<LoyaltyState>;
    return {
      points: typeof parsed.points === "number" ? parsed.points : DEFAULT_STATE.points,
      redeemed: Array.isArray(parsed.redeemed) ? parsed.redeemed : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

// Snapshot estable (useSyncExternalStore exige misma referencia si no cambia,
// de lo contrario provoca un bucle infinito de renders).
let current: LoyaltyState = readFromStorage();
const serverSnapshot: LoyaltyState = DEFAULT_STATE;

function emit() {
  for (const l of listeners) l();
}

function persist(next: LoyaltyState) {
  current = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  emit();
}

export type RedeemResult =
  | { ok: true; points: number }
  | { ok: false; reason: "already" | "insufficient" | "unknown" };

export function redeemReward(rewardId: string): RedeemResult {
  const reward = REWARDS.find((r) => r.id === rewardId);
  if (!reward) return { ok: false, reason: "unknown" };
  if (current.redeemed.includes(rewardId)) return { ok: false, reason: "already" };
  if (current.points < reward.cost) return { ok: false, reason: "insufficient" };

  const next: LoyaltyState = {
    points: current.points - reward.cost,
    redeemed: [...current.redeemed, rewardId],
  };
  persist(next);
  return { ok: true, points: next.points };
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

export function useLoyalty(): LoyaltyState {
  return useSyncExternalStore(subscribe, () => current, () => serverSnapshot);
}
