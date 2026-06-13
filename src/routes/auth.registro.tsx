import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/registro")({
  head: () => ({ meta: [{ title: "Crear cuenta · Habita" }] }),
  component: Registro,
});

function Registro() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
      <Link to="/perfil" className="text-sm text-muted-foreground">← Volver</Link>
      <div className="mt-8">
        <h1 className="font-display text-3xl">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">Empieza a acumular puntos Habita+ hoy.</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Nombre completo</span>
          <input className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Correo</span>
          <input type="email" className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Teléfono</span>
          <input type="tel" className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Contraseña</span>
          <input type="password" className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
        </label>
        <button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)]">
          Crear cuenta
        </button>
        <p className="text-center text-[11px] text-muted-foreground">
          Al continuar aceptas los Términos y la Política de Privacidad.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link to="/auth/login" className="font-medium text-primary">Inicia sesión</Link>
      </p>
    </div>
  );
}
