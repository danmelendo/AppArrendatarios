import { useState } from "react";
import { ImageOff } from "lucide-react";

// Imagen de propiedad con placeholder: intenta cargar la foto y, si falla
// (p.ej. sin conexión durante el demo), cae a un degradado de marca.
export function PropertyImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-primary-soft ${className ?? ""}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        >
          <ImageOff className="size-7 text-primary-foreground/70" />
        </div>
      )}
    </div>
  );
}
