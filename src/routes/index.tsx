import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Search, Sparkles, MapPin, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Habita — Alquileres y Colivings" },
      { name: "description", content: "Encuentra tu próximo hogar o coliving. Fideliza tu estadía con Habita." },
      { property: "og:title", content: "Habita — Alquileres y Colivings" },
      { property: "og:description", content: "Encuentra tu próximo hogar o coliving. Fideliza tu estadía con Habita." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <AppShell>
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-b-3xl px-5 pt-10 pb-8 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <p className="text-xs font-medium uppercase tracking-widest opacity-80">Hola 👋</p>
        <h1 className="mt-1 text-3xl font-semibold leading-tight">
          Encuentra el hogar que te merece
        </h1>
        <p className="mt-2 text-sm opacity-90">Alquileres y colivings verificados, con beneficios exclusivos.</p>

        <Link
          to="/buscar"
          className="mt-5 flex items-center gap-3 rounded-2xl bg-card/95 px-4 py-3 text-foreground shadow-[var(--shadow-soft)] backdrop-blur"
        >
          <Search className="size-5 text-primary" />
          <span className="text-sm text-muted-foreground">¿A dónde te mudas?</span>
        </Link>
      </section>

      {/* Categorías */}
      <section className="px-5 pt-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Alquileres", desc: "Apartamentos y casas", icon: MapPin, to: "/buscar" },
            { label: "Colivings", desc: "Comunidad incluida", icon: Users, to: "/buscar" },
          ].map((c) => (
            <Link
              key={c.label}
              to={c.to}
              className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <c.icon className="size-5 text-primary" />
              <p className="mt-3 font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Banner fidelidad */}
      <section className="px-5 pt-6">
        <Link
          to="/fidelidad"
          className="flex items-center justify-between rounded-2xl border border-border p-4"
          style={{ background: "var(--gradient-warm)" }}
        >
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground/80">
              <Sparkles className="size-3.5" /> Programa Habita+
            </p>
            <p className="mt-1 font-display text-lg text-accent-foreground">Gana puntos en cada estadía</p>
          </div>
          <ArrowRight className="size-5 text-accent-foreground" />
        </Link>
      </section>

      {/* Destacados */}
      <section className="px-5 pt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-xl">Destacados</h2>
          <Link to="/buscar" className="text-xs font-medium text-primary">Ver todo</Link>
        </div>
        <div className="space-y-3">
          {[
            { title: "Coliving Centro", city: "Medellín · El Poblado", price: "$1.200.000/mes" },
            { title: "Loft Luminoso", city: "Bogotá · Chapinero", price: "$1.800.000/mes" },
            { title: "Casa Compartida", city: "Cali · Granada", price: "$950.000/mes" },
          ].map((l) => (
            <article key={l.title} className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-soft)]">
              <div className="h-20 w-20 shrink-0 rounded-xl bg-primary-soft" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-medium">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.city}</p>
                </div>
                <p className="text-sm font-semibold text-primary">{l.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
