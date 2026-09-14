import { assetUrl } from "@/lib/api";
import { classNames } from "@/lib/format";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";

export function PhotoThumb({
  previewUrl,
  seed,
  alt,
  className,
  label,
}: {
  previewUrl?: string | null;
  seed: string;
  alt: string;
  className?: string;
  label?: string;
}) {
  const url = assetUrl(previewUrl);
  if (url) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={classNames(
          "relative block bg-slate-900 bg-cover bg-center",
          className,
        )}
        style={{ backgroundImage: `url(${encodeURI(url)})` }}
      />
    );
  }
  return <PhotoPlaceholder seed={seed} alt={alt} className={className} label={label} />;
}
