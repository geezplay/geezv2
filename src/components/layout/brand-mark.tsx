import { classNames } from "@/lib/format";
import { IconSparkles } from "@/components/ui/icons";

export function BrandMark({
  logoUrl,
  size = "md",
  className,
}: {
  logoUrl?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const box = size === "lg" ? "h-10 w-10" : "h-9 w-9";
  const safeLogo = logoUrl?.trim();

  return (
    <span className={classNames("inline-flex items-center", className)}>
      {safeLogo ? (
        <span
          role="img"
          aria-label="Logo"
          className={classNames(box, "shrink-0 rounded-lg bg-cover bg-center")}
          style={{ backgroundImage: `url(${encodeURI(safeLogo)})` }}
        />
      ) : (
        <span
          className={classNames(
            box,
            "flex shrink-0 items-center justify-center rounded-lg bg-primary text-white",
          )}
        >
          <IconSparkles size={size === "lg" ? 22 : 20} />
        </span>
      )}
    </span>
  );
}
