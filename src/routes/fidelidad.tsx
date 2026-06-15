import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { Sparkles, Gift, Star, TrendingUp, Check } from "lucide-react";
import { REWARDS, GOAL, redeemReward, useLoyalty } from "@/lib/loyalty";

export const Route = createFileRoute("/fidelidad")({
  head: () => ({
    meta: [
      { title: "Habita+ Fidelidad · Habita" },
      { name: "description", content: "Acumula puntos y desbloquea beneficios exclusivos." },
    ],
  }),
  component: Fidelidad,
});

const REWARD_ICONS = { "renta-10": Gift, checkin: Star, upgrade: TrendingUp } as const;

function Fidelidad() {
  const { points, redeemed } = useLoyalty();
  const pct = Math.min(100, (points / GOAL) * 100);
  const restante = Math.max(0, GOAL - points);

  function handleRedeem(rewardId: string, title: string, cost: number) {
    const result = redeemReward(rewardId);
    if (result.ok) {
      toast.success("¡Beneficio canjeado!", {
        description: `${title} · -${cost.toLocaleString()} pts · Saldo: ${result.points.toLocaleString()} pts`,
      });
      return;
    }
    if (result.reason === "insufficient") {
      toast.error("Puntos insuficientes", {
        description: `Necesitas ${cost.toLocaleString()} pts para canjear «${title}».`,
      });
    } else if (result.reason === "already") {
      toast.info("Ya canjeaste este beneficio");
    }
  }

  return (
    <AppShell>
      <section
        className="rounded-b-3xl px-5 pt-10 pb-8 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest opacity-90">
          <Sparkles className="size-3.5" /> Habita+ · Nivel Plata
        </p>
        <h1 className="mt-2 font-display text-4xl">
          {points.toLocaleString()} <span className="text-base font-sans opacity-80">pts</span>
        </h1>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs opacity-90">
            {restante > 0 ? `${restante.toLocaleString()} pts para Nivel Oro` : "¡Nivel Oro alcanzado!"}
          </p>
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display text-lg">Beneficios disponibles</h2>
        <div className="mt-3 space-y-3">
          {REWARDS.map((b) => {
            const Icon = REWARD_ICONS[b.id as keyof typeof REWARD_ICONS] ?? Gift;
            const isRedeemed = redeemed.includes(b.id);
            const affordable = points >= b.cost;
            return (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.cost.toLocaleString()} pts</p>
                </div>
                <button
                  type="button"
                  disabled={isRedeemed || !affordable}
                  onClick={() => handleRedeem(b.id, b.title, b.cost)}
                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRedeemed ? (
                    <>
                      <Check className="size-3.5" /> Canjeado
                    </>
                  ) : (
                    "Canjear"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="font-display text-lg">Cómo ganar puntos</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="rounded-xl border border-border bg-card p-3">+100 pts por cada mes de estadía</li>
          <li className="rounded-xl border border-border bg-card p-3">+250 pts al referir un amigo</li>
          <li className="rounded-xl border border-border bg-card p-3">+50 pts al dejar una reseña</li>
        </ul>
      </section>

      <Toaster position="top-center" />
    </AppShell>
  );
}
