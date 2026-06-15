import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { SignaturePad } from "@/components/SignaturePad";
import {
  FileSignature,
  PenLine,
  Upload,
  FileText,
  Check,
  Trash2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  contractsStore,
  docsStore,
  getProperty,
  type ContractDraft,
  type UploadedDoc,
} from "@/lib/local-store";

const searchSchema = z.object({
  propertyId: z.string().optional(),
  propertyTitle: z.string().optional(),
  tab: z.enum(["formalizar", "firma", "documentos"]).optional(),
});

export const Route = createFileRoute("/contratos")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Contratos · Habita" },
      { name: "description", content: "Formaliza, pre-firma y sube documentos para tu contrato de alquiler." },
    ],
  }),
  component: Contratos,
});

type Tab = "formalizar" | "firma" | "documentos";

function Contratos() {
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>(search.tab ?? "formalizar");
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Si el usuario llegó desde una propiedad, abrimos un draft asociado.
  useEffect(() => {
    if (!search.propertyId) return;
    const existing = contractsStore.list().find((c) => c.propertyId === search.propertyId);
    if (existing) setCurrentId(existing.id);
  }, [search.propertyId]);

  return (
    <AppShell>
      <header className="px-5 pt-8">
        <h1 className="font-display text-2xl">Contratos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Formaliza tu contrato, fírmalo digitalmente y envía la documentación a la inmobiliaria.
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          Tus datos se guardan localmente hasta sincronizar con la inmobiliaria.
        </div>
      </header>

      <nav className="sticky top-0 z-10 mt-4 border-b border-border bg-background/95 px-5 py-2 backdrop-blur">
        <div className="flex gap-1 rounded-xl bg-muted p-1 text-xs font-medium">
          {(
            [
              { id: "formalizar", label: "Formalizar", icon: FileSignature },
              { id: "firma", label: "Pre-firma", icon: PenLine },
              { id: "documentos", label: "Documentos", icon: Upload },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 transition ${
                tab === t.id
                  ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground"
              }`}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="p-5">
        {tab === "formalizar" && (
          <FormalizarTab
            propertyId={search.propertyId}
            propertyTitle={search.propertyTitle}
            currentId={currentId}
            onSaved={(id) => {
              setCurrentId(id);
              setTab("firma");
            }}
          />
        )}
        {tab === "firma" && (
          <PreFirmaTab currentId={currentId} onSigned={() => setTab("documentos")} />
        )}
        {tab === "documentos" && <DocumentosTab currentId={currentId} />}
      </section>
    </AppShell>
  );
}

/* ---------------- Formalizar ---------------- */

const contractSchema = z.object({
  fullName: z.string().trim().min(2, "Indica tu nombre completo").max(120),
  document: z.string().trim().min(5, "Documento inválido").max(40),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  startDate: z.string().min(1, "Selecciona una fecha"),
  months: z.coerce.number().int().min(1).max(36),
  notes: z.string().max(500).optional(),
});

function FormalizarTab({
  propertyId,
  propertyTitle,
  currentId,
  onSaved,
}: {
  propertyId?: string;
  propertyTitle?: string;
  currentId: string | null;
  onSaved: (id: string) => void;
}) {
  const existing = currentId ? contractsStore.get(currentId) : undefined;
  const property = getProperty(propertyId ?? existing?.propertyId);
  const [form, setForm] = useState({
    fullName: existing?.fullName ?? "",
    document: existing?.document ?? "",
    email: existing?.email ?? "",
    phone: existing?.phone ?? "",
    startDate: existing?.startDate ?? "",
    months: String(existing?.months ?? 12),
    notes: existing?.notes ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = contractSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
      setErrors(fe);
      return;
    }
    setSaving(true);
    const id = existing?.id ?? crypto.randomUUID();
    const draft: ContractDraft = {
      id,
      propertyId: propertyId ?? existing?.propertyId,
      propertyTitle: propertyTitle ?? existing?.propertyTitle,
      ...parsed.data,
      status: existing?.status === "submitted" ? "submitted" : existing?.status ?? "draft",
      signatureDataUrl: existing?.signatureDataUrl,
      signedAt: existing?.signedAt,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    contractsStore.save(draft);
    setTimeout(() => {
      setSaving(false);
      onSaved(id);
    }, 350);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {(propertyTitle || existing?.propertyTitle) && (
        <div className="rounded-xl border border-border bg-primary-soft/40 p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Propiedad</p>
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-medium text-foreground">
              {propertyTitle ?? existing?.propertyTitle}
            </p>
            {property && (
              <p className="shrink-0 font-semibold text-primary">
                {property.price}
                <span className="text-xs font-normal text-muted-foreground">/mes</span>
              </p>
            )}
          </div>
        </div>
      )}

      <Field label="Nombre completo" error={errors.fullName}>
        <input
          className="field"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          autoComplete="name"
        />
      </Field>
      <Field label="Documento de identidad" error={errors.document}>
        <input
          className="field"
          value={form.document}
          onChange={(e) => update("document", e.target.value)}
          placeholder="Cédula, DNI o pasaporte"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Correo" error={errors.email}>
          <input
            type="email"
            className="field"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Teléfono" error={errors.phone}>
          <input
            type="tel"
            className="field"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Inicio de estadía" error={errors.startDate}>
          <input
            type="date"
            className="field"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
          />
        </Field>
        <Field label="Duración (meses)" error={errors.months}>
          <input
            type="number"
            min={1}
            max={36}
            className="field"
            value={form.months}
            onChange={(e) => update("months", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Notas para la inmobiliaria" error={errors.notes}>
        <textarea
          className="field min-h-[80px]"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Convivencia, mascotas, fechas tentativas…"
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <FileSignature className="size-4" />}
        Guardar y continuar a pre-firma
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

/* ---------------- Pre-firma ---------------- */

function PreFirmaTab({
  currentId,
  onSigned,
}: {
  currentId: string | null;
  onSigned: () => void;
}) {
  const contract = currentId ? contractsStore.get(currentId) : undefined;
  const property = getProperty(contract?.propertyId);
  const [sig, setSig] = useState<string | undefined>(contract?.signatureDataUrl);
  const [accepted, setAccepted] = useState(contract?.status === "pre_signed");
  const [saving, setSaving] = useState(false);

  if (!contract) {
    return (
      <EmptyState
        title="Aún no hay contrato"
        body="Completa primero el formulario en la pestaña Formalizar."
      />
    );
  }

  function confirm() {
    if (!sig || !accepted || !contract) return;
    setSaving(true);
    contractsStore.save({
      ...contract,
      signatureDataUrl: sig,
      signedAt: new Date().toISOString(),
      status: "pre_signed",
    });
    setTimeout(() => {
      setSaving(false);
      onSigned();
    }, 400);
  }

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-border bg-card p-4 text-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Resumen</p>
        <p className="mt-1 font-medium">{contract.propertyTitle ?? "Contrato Habita"}</p>
        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
          <dt className="text-muted-foreground">Inquilino</dt>
          <dd>{contract.fullName}</dd>
          <dt className="text-muted-foreground">Documento</dt>
          <dd>{contract.document}</dd>
          <dt className="text-muted-foreground">Inicio</dt>
          <dd>{contract.startDate}</dd>
          <dt className="text-muted-foreground">Duración</dt>
          <dd>{contract.months} meses</dd>
          {property && (
            <>
              <dt className="text-muted-foreground">Renta mensual</dt>
              <dd className="font-semibold text-primary">{property.price}</dd>
            </>
          )}
        </dl>
      </article>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-medium">Tu firma</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Esta pre-firma es una declaración de intención. El contrato definitivo lo emite la
          inmobiliaria tras revisar tu documentación.
        </p>
        <div className="mt-3">
          <SignaturePad value={sig} onChange={setSig} />
        </div>
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Declaro que la información es veraz y autorizo a Habita a compartirla con la inmobiliaria
          gestora.
        </span>
      </label>

      <button
        type="button"
        disabled={!sig || !accepted || saving}
        onClick={confirm}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Confirmar pre-firma
      </button>

      {contract.status === "pre_signed" && (
        <p className="text-center text-xs text-primary">
          Pre-firma guardada el {new Date(contract.signedAt!).toLocaleString()}
        </p>
      )}
    </div>
  );
}

/* ---------------- Documentos ---------------- */

const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_MB = 8;

function DocumentosTab({ currentId }: { currentId: string | null }) {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setDocs(docsStore.list().filter((d) => !currentId || d.contractId === currentId));
  }, [currentId]);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (f.size > MAX_MB * 1024 * 1024) {
        alert(`${f.name}: supera ${MAX_MB} MB`);
        continue;
      }
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = () => rej(r.error);
        r.readAsDataURL(f);
      });
      const doc: UploadedDoc = {
        id: crypto.randomUUID(),
        contractId: currentId ?? undefined,
        name: f.name,
        size: f.size,
        type: f.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      docsStore.add(doc);
    }
    setDocs(docsStore.list().filter((d) => !currentId || d.contractId === currentId));
  }

  function remove(id: string) {
    docsStore.remove(id);
    setDocs((d) => d.filter((x) => x.id !== id));
  }

  function submitToAgency() {
    if (!currentId) return;
    const contract = contractsStore.get(currentId);
    if (!contract) return;
    setSubmitting(true);
    // TODO(Claude): cuando haya Cloud, hacer un createServerFn que:
    //   1) suba archivos a Storage (bucket privado "contract-docs"),
    //   2) inserte filas en `contracts` + `contract_documents`,
    //   3) notifique al backoffice y muestre estado "en revisión".
    contractsStore.save({ ...contract, status: "submitted" });
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  }

  const requirements = useMemo(
    () => [
      "Documento de identidad (anverso y reverso)",
      "Comprobante de ingresos o laboral",
      "Última factura de servicios (opcional)",
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-medium">Documentación requerida</h3>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {requirements.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-primary" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-4 py-8 text-center">
        <Upload className="size-6 text-primary" />
        <span className="text-sm font-medium">Subir documentos</span>
        <span className="text-xs text-muted-foreground">PDF, JPG o PNG · máx. {MAX_MB} MB c/u</span>
        <input
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </label>

      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <FileText className="size-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(d.size / 1024).toFixed(0)} KB · {new Date(d.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(d.id)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Eliminar"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={!currentId || docs.length === 0 || submitting || submitted}
        onClick={submitToAgency}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        {submitted ? "Enviado a la inmobiliaria" : "Enviar a la inmobiliaria"}
      </button>

      {!currentId && (
        <p className="text-center text-xs text-muted-foreground">
          Crea primero un contrato en <Link to="/contratos" search={{ tab: "formalizar" }} className="text-primary">Formalizar</Link>.
        </p>
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
