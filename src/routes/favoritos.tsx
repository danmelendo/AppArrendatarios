import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PropertyImage } from "@/components/PropertyImage";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/lib/favorites";
import { PROPERTIES } from "@/lib/local-store";
import { ArrowLeft, Heart, MapPin } from "lucide-react";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Mis favoritos · Habita" },
      { name: "description", content: "Las propiedades que guardaste." },
    ],
  }),
  component: Favoritos,
});

function Favoritos() {
  const navigate = useNavigate();
  const favorites = useFavorites();
  const saved = PROPERTIES.filter((p) => favorites.includes(p.id));

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/perfil" })}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Volver"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl">Favoritos</h1>
          <p className="text-sm text-muted-foreground">
            {saved.length > 0
              ? `${saved.length} ${saved.length === 1 ? "propiedad guardada" : "propiedades guardadas"}`
              : "Aún no has guardado propiedades"}
          </p>
        </div>
      </header>

      <section className="space-y-3 p-5">
        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Heart className="size-5" />
            </div>
            <p className="mt-3 font-medium">Tu lista está vacía</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Toca el corazón en cualquier propiedad para guardarla aquí.
            </p>
            <Link
              to="/buscar"
              className="mt-4 inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Explorar propiedades
            </Link>
          </div>
        ) : (
          saved.map((r) => (
            <div
              key={r.id}
              className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <button
                type="button"
                onClick={() => navigate({ to: "/propiedad/$id", params: { id: r.id } })}
                className="flex w-full gap-3 p-3 text-left"
              >
                <PropertyImage src={r.image} alt={r.title} className="h-20 w-20 shrink-0 rounded-xl" />
                <div className="flex flex-1 flex-col justify-between pr-8">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {r.city}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {r.price}
                    <span className="text-xs font-normal text-muted-foreground">/mes</span>
                  </p>
                </div>
              </button>
              <FavoriteButton id={r.id} className="absolute right-3 top-3" />
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}
