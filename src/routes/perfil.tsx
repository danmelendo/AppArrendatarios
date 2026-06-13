import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  ChevronRight,
  Settings,
  Heart,
  FileText,
  HelpCircle,
  LogOut,
  FileSignature,
} from "lucide-react";

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
  const navigate = useNavigate();

  const items: Array<{
    icon: typeof Heart;
    label: string;
    onClick: () => void;
  }> = [
    { icon: FileSignature, label: "Mis contratos", onClick: () => navigate({ to: "/contratos" }) },
    { icon: Heart, label: "Favoritos", onClick: () => alert("Próximamente: lista de favoritos") },
    { icon: FileText, label: "Mis reservas", onClick: () => alert("Próximamente: historial de reservas") },
    { icon: Settings, label: "Ajustes de cuenta", onClick: () => alert("Próximamente") },
    { icon: HelpCircle, label: "Ayuda y soporte", onClick: () => window.open("mailto:soporte@habita.app") },
    {
      icon: LogOut,
      label: "Cerrar sesión",
      onClick: () => {
        // TODO(Claude): supabase.auth.signOut() cuando esté Cloud.
        alert("Sesión cerrada (demo)");
      },
    },
  ];

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
          {items.map((it, i, arr) => (
            <li key={it.label} className={i < arr.length - 1 ? "border-b border-border" : ""}>
              <button
                type="button"
                onClick={it.onClick}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50"
              >
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
