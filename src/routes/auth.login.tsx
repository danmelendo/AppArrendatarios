import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión · Habita" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
      <Link to="/perfil" className="text-sm text-muted-foreground">← Volver</Link>
      <div className="mt-8">
        <h1 className="font-display text-3xl">Bienvenido de vuelta</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ingresa tu correo para continuar.</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Correo</span>
          <input type="email" placeholder="tucorreo@email.com"
            className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Contraseña</span>
          <input type="password" placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
        </label>
        <button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)]">
          Entrar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link to="/auth/registro" className="font-medium text-primary">Regístrate</Link>
      </p>
    </div>
  );
}
