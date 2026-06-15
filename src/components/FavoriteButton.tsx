import { Heart } from "lucide-react";
import { useFavorites, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const favorites = useFavorites();
  const active = favorites.includes(id);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
      }}
      className={`flex size-9 items-center justify-center rounded-full bg-card/90 shadow-[var(--shadow-soft)] backdrop-blur transition active:scale-95 ${className ?? ""}`}
    >
      <Heart className={`size-4 transition ${active ? "fill-accent text-accent" : "text-foreground"}`} />
    </button>
  );
}
