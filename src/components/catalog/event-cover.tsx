import { assetUrl } from "@/lib/api";
import { classNames } from "@/lib/format";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";

export function EventCover({
  coverUrl,
  seed,
  alt,
  className,
}: {
  coverUrl?: string;
  seed: string;
  alt: string;
  className?: string;
}) {
  const url = assetUrl(coverUrl);
  if (url) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={classNames("block bg-slate-900 bg-cover bg-center", className)}
        style={{ backgroundImage: `url(${encodeURI(url)})` }}
      />
    );
  }
  return <PhotoPlaceholder seed={seed} alt={alt} className={className} />;
}
