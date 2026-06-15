import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { PROPERTIES } from "@/lib/local-store";
import { PropertyImage } from "@/components/PropertyImage";
import { FavoriteButton } from "@/components/FavoriteButton";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Buscar alquileres y colivings · Habita" },
      { name: "description", content: "Filtra por ciudad, precio y tipo de propiedad." },
    ],
  }),
  component: Buscar,
});

const CHIPS = ["Todo", "Alquileres", "Colivings"] as const;

function Buscar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("Todo");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PROPERTIES.filter((p) => {
      if (chip === "Alquileres" && p.tag !== "Alquiler") return false;
      if (chip === "Colivings" && p.tag !== "Coliving") return false;
      if (!term) return true;
      return p.title.toLowerCase().includes(term) || p.city.toLowerCase().includes(term);
    });
  }, [q, chip]);

  return (
    <AppShell>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
        <h1 className="font-display text-2xl">Buscar</h1>
        <div className="mt-3 flex gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-card px-3 py-2.5">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Ciudad, barrio…"
            />
          </label>
          <button
            type="button"
            onClick={() => alert("Filtros avanzados próximamente")}
            className="rounded-xl border border-input bg-card px-3"
            aria-label="Filtros"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs">
          {CHIPS.map((c) => {
            const active = c === chip;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChip(c)}
                className={`shrink-0 rounded-full border px-3 py-1.5 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </header>

      <section className="space-y-3 p-5">
        {results.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No encontramos propiedades con esos criterios.
          </p>
        )}
        {results.map((r) => (
          <div
            key={r.id}
            className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
          >
            <button
              type="button"
              onClick={() => navigate({ to: "/propiedad/$id", params: { id: r.id } })}
              className="block w-full text-left"
            >
              <PropertyImage src={r.image} alt={r.title} className="h-36 w-full" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                    {r.tag}
                  </span>
                  <p className="text-sm font-semibold text-primary">
                    {r.price}
                    <span className="text-xs font-normal text-muted-foreground">/mes</span>
                  </p>
                </div>
                <h3 className="mt-2 font-medium">{r.title}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {r.city}
                </p>
              </div>
            </button>
            <FavoriteButton id={r.id} className="absolute right-3 top-3" />
          </div>
        ))}
        <p className="pt-2 text-center text-xs text-muted-foreground">
          ¿Ya elegiste? <Link to="/contratos" className="text-primary underline">Formaliza tu contrato</Link>
        </p>
      </section>
    </AppShell>
  );
}
