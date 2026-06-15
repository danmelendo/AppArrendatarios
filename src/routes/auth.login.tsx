import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, nameFromEmail } from "@/lib/demo-session";

const schema = z.object({
  email: z.string().trim().email("Correo inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión · Habita" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as "email" | "password";
        fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    // Demo: autentica localmente. Sustituir por supabase.auth.signInWithPassword
    // cuando se conecte el backend (ver CLAUDE.md §8).
    await new Promise((r) => setTimeout(r, 700));
    signIn({ email, name: nameFromEmail(email) });
    setLoading(false);
    navigate({ to: "/perfil" });
  }

  async function onGoogle() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const email = "demo@habita.app";
    signIn({ email, name: "Usuario Demo" });
    setLoading(false);
    navigate({ to: "/perfil" });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
      <Link to="/perfil" className="text-sm text-muted-foreground">← Volver</Link>

      <div className="mt-8">
        <h1 className="font-display text-3xl">Bienvenido de vuelta</h1>
        <p className="mt-2 text-sm text-muted-foreground">Inicia sesión para continuar con Habita+.</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          label="Correo"
          icon={<Mail className="size-4 text-muted-foreground" />}
          error={errors.email}
        >
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@email.com"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <Field
          label="Contraseña"
          icon={<Lock className="size-4 text-muted-foreground" />}
          error={errors.password}
          right={
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        >
          <input
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <div className="flex justify-end">
          <button type="button" className="text-xs font-medium text-primary">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {errors.form && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        o continúa con
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={onGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-card py-3 text-sm font-medium"
      >
        <GoogleIcon /> Google
      </button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link to="/auth/registro" className="font-medium text-primary">Regístrate</Link>
      </p>

      <button
        onClick={() => navigate({ to: "/" })}
        className="mt-2 text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        Explorar sin cuenta
      </button>
    </div>
  );
}

function Field({
  label, icon, right, error, children,
}: {
  label: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div
        className={`mt-1 flex items-center gap-2 rounded-xl border bg-card px-3 py-3 transition focus-within:border-primary ${
          error ? "border-destructive" : "border-input"
        }`}
      >
        {icon}
        {children}
        {right}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.4 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}
