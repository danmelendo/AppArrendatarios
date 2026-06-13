import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Sparkles, Gift, Star, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/fidelidad")({
  head: () => ({
    meta: [
      { title: "Habita+ Fidelidad · Habita" },
      { name: "description", content: "Acumula puntos y desbloquea beneficios exclusivos." },
    ],
  }),
  component: Fidelidad,
});

function Fidelidad() {
  const puntos = 1240;
  const meta = 2000;
  const pct = Math.min(100, (puntos / meta) * 100);

  return (
    <AppShell>
      <section
        className="rounded-b-3xl px-5 pt-10 pb-8 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest opacity-90">
          <Sparkles className="size-3.5" /> Habita+ · Nivel Plata
        </p>
        <h1 className="mt-2 font-display text-4xl">{puntos.toLocaleString()} <span className="text-base font-sans opacity-80">pts</span></h1>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs opacity-90">{meta - puntos} pts para Nivel Oro</p>
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display text-lg">Beneficios disponibles</h2>
        <div className="mt-3 space-y-3">
          {[
            { icon: Gift, title: "10% en tu próxima renta", pts: "800 pts" },
            { icon: Star, title: "Check-in prioritario", pts: "500 pts" },
            { icon: TrendingUp, title: "Upgrade de habitación", pts: "1.500 pts" },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <b.icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.pts}</p>
              </div>
              <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                Canjear
              </button>
            </div>
          ))}
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
    </AppShell>
  );
}
