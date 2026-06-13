// Persistencia local mientras no haya backend.
// TODO(Claude): cuando se active Lovable Cloud, migrar a tablas
// `contracts`, `contract_documents`, `contract_signatures` (ver CLAUDE.md §6.4).

export type ContractDraft = {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  fullName: string;
  document: string; // cédula / NIE / passport
  email: string;
  phone: string;
  startDate: string;
  months: number;
  notes?: string;
  status: "draft" | "pre_signed" | "submitted";
  signatureDataUrl?: string;
  signedAt?: string;
  createdAt: string;
};

export type UploadedDoc = {
  id: string;
  contractId?: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 (sólo para demo; en cloud va a Storage)
  uploadedAt: string;
};

const CONTRACTS_KEY = "habita.contracts.v1";
const DOCS_KEY = "habita.docs.v1";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}
function write<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
}

export const contractsStore = {
  list: () => read<ContractDraft>(CONTRACTS_KEY),
  save(c: ContractDraft) {
    const all = read<ContractDraft>(CONTRACTS_KEY).filter((x) => x.id !== c.id);
    all.unshift(c);
    write(CONTRACTS_KEY, all);
  },
  get: (id: string) => read<ContractDraft>(CONTRACTS_KEY).find((c) => c.id === id),
  remove(id: string) {
    write(CONTRACTS_KEY, read<ContractDraft>(CONTRACTS_KEY).filter((c) => c.id !== id));
  },
};

export const docsStore = {
  list: () => read<UploadedDoc>(DOCS_KEY),
  add(d: UploadedDoc) {
    const all = read<UploadedDoc>(DOCS_KEY);
    all.unshift(d);
    write(DOCS_KEY, all);
  },
  remove(id: string) {
    write(DOCS_KEY, read<UploadedDoc>(DOCS_KEY).filter((d) => d.id !== id));
  },
};

export const PROPERTIES = [
  { id: "p1", title: "Coliving Centro", city: "Medellín · El Poblado", price: "$1.200.000", tag: "Coliving" as const },
  { id: "p2", title: "Loft Luminoso", city: "Bogotá · Chapinero", price: "$1.800.000", tag: "Alquiler" as const },
  { id: "p3", title: "Casa Compartida", city: "Cali · Granada", price: "$950.000", tag: "Coliving" as const },
  { id: "p4", title: "Estudio Moderno", city: "Medellín · Laureles", price: "$1.400.000", tag: "Alquiler" as const },
];
export type Property = (typeof PROPERTIES)[number];
