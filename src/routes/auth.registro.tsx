import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { User, Mail, Phone, Lock, Loader2 } from "lucide-react";

const schema = z.object({
  fullName: z.string().trim().min(2, "Nombre muy corto").max(80),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().regex(/^[+\d\s-]{7,20}$/, "Teléfono inválido").optional().or(z.literal("")),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  terms: z.literal(true, { errorMap: () => ({ message: "Debes aceptar los términos" }) }),
});

export const Route = createFileRoute("/auth/registro")({
  head: () => ({ meta: [{ title: "Crear cuenta · Habita" }] }),
  component: Registro,
});

function Registro() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setMsg(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) fe[i.path[0] as string] = i.message;
      setErrors(fe);
      return;
    }
    setLoading(true);
    // TODO(Claude): conectar a Lovable Cloud (supabase.auth.signUp + insert en profiles + crear loyalty_account)
    // Ver CLAUDE.md §7 "Auth pendiente de Cloud".
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setMsg("Auth aún no conectada. Activa Lovable Cloud para crear cuentas reales.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
      <Link to="/perfil" className="text-sm text-muted-foreground">← Volver</Link>
      <div className="mt-8">
        <h1 className="font-display text-3xl">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">Empieza a acumular puntos Habita+ hoy.</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <Field label="Nombre completo" icon={<User className="size-4 text-muted-foreground" />} error={errors.fullName}>
          <input
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            autoComplete="name"
            className="w-full bg-transparent text-sm outline-none"
          />
        </Field>
        <Field label="Correo" icon={<Mail className="size-4 text-muted-foreground" />} error={errors.email}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </Field>
        <Field label="Teléfono (opcional)" icon={<Phone className="size-4 text-muted-foreground" />} error={errors.phone}>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </Field>
        <Field label="Contraseña" icon={<Lock className="size-4 text-muted-foreground" />} error={errors.password}>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </Field>

        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => set("terms", e.target.checked)}
            className="mt-0.5 size-4 rounded border-input accent-[var(--primary)]"
          />
          <span>
            Acepto los <a className="font-medium text-primary">Términos</a> y la{" "}
            <a className="font-medium text-primary">Política de Privacidad</a>.
          </span>
        </label>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}

        {msg && (
          <p className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-xs text-accent-foreground">{msg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Creando…" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link to="/auth/login" className="font-medium text-primary">Inicia sesión</Link>
      </p>
    </div>
  );
}

function Field({
  label, icon, error, children,
}: { label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div
        className={`mt-1 flex items-center gap-2 rounded-xl border bg-card px-3 py-3 focus-within:border-primary ${
          error ? "border-destructive" : "border-input"
        }`}
      >
        {icon}
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}
