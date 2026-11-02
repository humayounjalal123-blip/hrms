import Link from "next/link";

export function Logo({
  variant = "light",
  href = "/",
  showSubtitle = true,
  compact = false,
}: {
  variant?: "light" | "dark" | "green";
  href?: string;
  showSubtitle?: boolean;
  compact?: boolean;
}) {
  const text =
    variant === "dark"
      ? "text-white"
      : "text-primary";
  const sub =
    variant === "dark" ? "text-green-100/75" : "text-ink-mute";

  return (
    <Link href={href} className="group flex items-center gap-3">
      <div
        className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl transition duration-300 group-hover:scale-[1.05] ${
          variant === "dark"
            ? "bg-white/15 text-white ring-1 ring-gold/40"
            : "bg-arch-fade text-white shadow-nav ring-1 ring-gold/25 group-hover:shadow-glow"
        }`}
      >
        <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden>
          <path
            d="M20 6c-5 4-8 8-8 13v11h16V19c0-5-3-9-8-13z"
            fill="currentColor"
            opacity="0.25"
          />
          <path
            d="M12 20h16v10H12z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M20 8c3.5 3 5.5 6.2 5.5 10.2V30M20 8c-3.5 3-5.5 6.2-5.5 10.2V30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="20" cy="7" r="1.6" fill="currentColor" />
        </svg>
      </div>
      <div className={compact ? "" : "leading-tight"}>
        <div className={`font-display text-xl font-semibold tracking-tight ${text}`}>
          HRMS
        </div>
        {showSubtitle && !compact && (
          <div className={`text-[10px] font-medium tracking-wide ${sub}`}>
            Hifz Revision Atelier
          </div>
        )}
      </div>
    </Link>
  );
}
