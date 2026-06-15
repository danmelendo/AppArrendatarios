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

// Fotos placeholder de interiores (Unsplash CDN). Si fallan (p.ej. sin conexión),
// PropertyImage cae a un degradado de marca.
const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=80`;

export const PROPERTIES = [
  { id: "p1", title: "Coliving Malasaña", city: "Madrid · Malasaña", price: "780 €", monthlyEur: 780, tag: "Coliving" as const, bedrooms: 1, bathrooms: 1, area: 16, image: IMG("photo-1522708323590-d24dbb6b0267") },
  { id: "p2", title: "Loft en Eixample", city: "Barcelona · Eixample", price: "1.250 €", monthlyEur: 1250, tag: "Alquiler" as const, bedrooms: 2, bathrooms: 1, area: 68, image: IMG("photo-1502672260266-1c1ef2d93688") },
  { id: "p3", title: "Piso en Ruzafa", city: "Valencia · Ruzafa", price: "850 €", monthlyEur: 850, tag: "Alquiler" as const, bedrooms: 2, bathrooms: 1, area: 60, image: IMG("photo-1493809842364-78817add7ffb") },
  { id: "p4", title: "Coliving Triana", city: "Sevilla · Triana", price: "690 €", monthlyEur: 690, tag: "Coliving" as const, bedrooms: 1, bathrooms: 1, area: 15, image: IMG("photo-1560448204-e02f11c3d0e2") },
  { id: "p5", title: "Estudio en El Soho", city: "Málaga · El Soho", price: "720 €", monthlyEur: 720, tag: "Alquiler" as const, bedrooms: 1, bathrooms: 1, area: 38, image: IMG("photo-1484154218962-a197022b5858") },
  { id: "p6", title: "Coliving Indautxu", city: "Bilbao · Indautxu", price: "640 €", monthlyEur: 640, tag: "Coliving" as const, bedrooms: 1, bathrooms: 1, area: 14, image: IMG("photo-1505691938895-1758d7feb511") },
];
export type Property = (typeof PROPERTIES)[number];

export function getProperty(id?: string): Property | undefined {
  if (!id) return undefined;
  return PROPERTIES.find((p) => p.id === id);
}
