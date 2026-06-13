import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChevronRight, Settings, Heart, FileText, HelpCircle, LogOut } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Mi Perfil · Habita" },
      { name: "description", content: "Gestiona tu cuenta, favoritos y reservas." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  return (
    <AppShell>
      <header className="px-5 pt-8">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-display text-primary-foreground">
            H
          </div>
          <div>
            <h1 className="font-display text-xl">Hola, Invitado</h1>
            <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Link to="/auth/login" className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
            Iniciar sesión
          </Link>
          <Link to="/auth/registro" className="flex-1 rounded-xl border border-primary px-4 py-2.5 text-center text-sm font-medium text-primary">
            Registrarse
          </Link>
        </div>
      </header>

      <section className="px-5 pt-8">
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {[
            { icon: Heart, label: "Favoritos" },
            { icon: FileText, label: "Mis reservas" },
            { icon: Settings, label: "Ajustes de cuenta" },
            { icon: HelpCircle, label: "Ayuda y soporte" },
            { icon: LogOut, label: "Cerrar sesión" },
          ].map((it, i, arr) => (
            <li key={it.label} className={i < arr.length - 1 ? "border-b border-border" : ""}>
              <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                <it.icon className="size-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{it.label}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-muted-foreground">Habita v0.1.0</p>
      </section>
    </AppShell>
  );
}
