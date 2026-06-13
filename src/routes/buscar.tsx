import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Buscar alquileres y colivings · Habita" },
      { name: "description", content: "Filtra por ciudad, precio y tipo de propiedad." },
    ],
  }),
  component: Buscar,
});

const RESULTS = [
  { title: "Coliving Centro", city: "Medellín", price: "$1.200.000", tag: "Coliving" },
  { title: "Loft Luminoso", city: "Bogotá", price: "$1.800.000", tag: "Alquiler" },
  { title: "Casa Compartida", city: "Cali", price: "$950.000", tag: "Coliving" },
  { title: "Estudio Moderno", city: "Medellín", price: "$1.400.000", tag: "Alquiler" },
];

function Buscar() {
  return (
    <AppShell>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
        <h1 className="font-display text-2xl">Buscar</h1>
        <div className="mt-3 flex gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-card px-3 py-2.5">
            <Search className="size-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Ciudad, barrio…"
            />
          </label>
          <button className="rounded-xl border border-input bg-card px-3" aria-label="Filtros">
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs">
          {["Todo", "Alquileres", "Colivings", "Amoblado", "Mascotas"].map((c, i) => (
            <button
              key={c}
              className={`shrink-0 rounded-full border px-3 py-1.5 ${
                i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <section className="space-y-3 p-5">
        {RESULTS.map((r) => (
          <article key={r.title} className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="h-36 w-full bg-primary-soft" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                  {r.tag}
                </span>
                <p className="text-sm font-semibold text-primary">{r.price}<span className="text-xs font-normal text-muted-foreground">/mes</span></p>
              </div>
              <h3 className="mt-2 font-medium">{r.title}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" /> {r.city}
              </p>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
