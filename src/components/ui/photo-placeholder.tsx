import { classNames } from "@/lib/format";

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const PALETTES: Array<[string, string, string, string]> = [
  ["#0f172a", "#f97316", "#facc15", "#1f2937"],
  ["#0c4a6e", "#38bdf8", "#fde68a", "#0f172a"],
  ["#1e1b4b", "#a855f7", "#f9a8d4", "#111827"],
  ["#064e3b", "#34d399", "#fef08a", "#0f172a"],
  ["#7c2d12", "#fb923c", "#fed7aa", "#1c1917"],
  ["#0f766e", "#2dd4bf", "#fef9c3", "#134e4a"],
  ["#312e81", "#818cf8", "#e0e7ff", "#1e1b4b"],
  ["#831843", "#f472b6", "#fce7f3", "#4a044e"],
];

interface PhotoPlaceholderProps {
  seed: string;
  alt: string;
  className?: string;
  label?: string;
}

export function PhotoPlaceholder({ seed, alt, className, label }: PhotoPlaceholderProps) {
  const hash = hashSeed(seed);
  const [sky, accent, glow, ground] = PALETTES[hash % PALETTES.length];
  const gradientId = `photo-${hash.toString(36)}`;
  const sunX = 70 + (hash % 180);
  const hillOffset = (hash % 60) - 30;
  const riderX = 90 + (hash % 200);

  return (
    <div
      role="img"
      aria-label={alt}
      className={classNames("relative overflow-hidden bg-slate-900", className)}
    >
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky} />
            <stop offset="65%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={ground} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#${gradientId})`} />
        <circle cx={sunX} cy={82} r="34" fill={glow} opacity="0.9" />
        <polygon
          points={`0,190 90,${120 + hillOffset} 180,190 260,${140 - hillOffset} 400,190 400,300 0,300`}
          fill={ground}
          opacity="0.55"
        />
        <polygon
          points={`0,215 120,${165 + hillOffset / 2} 240,215 320,${175 - hillOffset / 2} 400,215 400,300 0,300`}
          fill={ground}
          opacity="0.85"
        />
        <g opacity="0.5" stroke={glow} strokeWidth="3" strokeLinecap="round">
          <path d="M20 252h70M40 266h90M30 280h60" />
        </g>
        <g transform={`translate(${riderX} 196)`} fill={ground}>
          <circle cx="0" cy="26" r="13" />
          <circle cx="42" cy="26" r="13" />
          <path d="M2 20 20 4l20 6 4 14-16-3-12 8Z" />
          <circle cx="16" cy="-4" r="8" />
        </g>
      </svg>
      {label ? (
        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
          {label}
        </span>
      ) : null}
    </div>
  );
}
