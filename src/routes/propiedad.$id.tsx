import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, MapPin, FileSignature } from "lucide-react";
import { PROPERTIES } from "@/lib/local-store";
import { PropertyImage } from "@/components/PropertyImage";
import { FavoriteButton } from "@/components/FavoriteButton";

export const Route = createFileRoute("/propiedad/$id")({
  loader: ({ params }) => {
    const property = PROPERTIES.find((p) => p.id === params.id);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.property.title} · Habita` },
          { name: "description", content: `${loaderData.property.title} en ${loaderData.property.city}` },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Propiedad no encontrada.</p>
        <Link to="/buscar" className="mt-3 inline-block text-primary underline">Volver a buscar</Link>
      </div>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <p className="p-6 text-center text-sm text-muted-foreground">Error cargando la propiedad.</p>
    </AppShell>
  ),
  component: Detail,
});

function Detail() {
  const { property } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="relative">
        <PropertyImage src={property.image} alt={property.title} className="h-64 w-full" />
        <button
          type="button"
          onClick={() => navigate({ to: "/buscar" })}
          className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-card/90 shadow-[var(--shadow-soft)] backdrop-blur"
          aria-label="Volver"
        >
          <ArrowLeft className="size-4" />
        </button>
        <FavoriteButton id={property.id} className="absolute right-4 top-4" />
      </div>

      <div className="space-y-5 p-5">
        <div>
          <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
            {property.tag}
          </span>
          <h1 className="mt-2 font-display text-2xl">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {property.city}
          </p>
          <p className="mt-3 text-lg font-semibold text-primary">
            {property.price}
            <span className="text-sm font-normal text-muted-foreground">/mes</span>
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Espacio totalmente equipado, servicios incluidos y comunidad activa. Verificado por Habita
          y disponible para estancias mensuales.
        </p>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { k: "Dorm.", v: String(property.bedrooms) },
            { k: "Baños", v: String(property.bathrooms) },
            { k: "Área", v: `${property.area} m²` },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-border bg-card py-3">
              <p className="font-semibold text-foreground">{s.v}</p>
              <p className="text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Renta mensual</p>
            <p className="text-base font-semibold text-primary">{property.price}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/contratos",
                search: { propertyId: property.id, propertyTitle: property.title },
              })
            }
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <FileSignature className="size-4" /> Formalizar contrato
          </button>
        </div>
      </div>
    </AppShell>
  );
}
