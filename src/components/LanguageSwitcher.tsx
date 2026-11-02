"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe2 } from "lucide-react";
import clsx from "clsx";
import { LOCALES, useI18n } from "@/lib/i18n";

type Variant = "nav" | "panel" | "compact";

export function LanguageSwitcher({
  variant = "nav",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (variant === "panel") {
    return (
      <div className={clsx("space-y-3", className)}>
        <div>
          <p className="text-sm font-medium text-ink">{t.settings.language}</p>
          <p className="mt-1 text-xs text-ink-mute">{t.settings.languageHint}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLocale(item.code)}
              className={clsx(
                "rounded-2xl border px-3 py-3 text-left transition",
                locale === item.code
                  ? "border-primary bg-primary-soft text-primary shadow-sm"
                  : "border-primary/10 bg-white hover:border-primary/30"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold" dir={item.dir}>
                  {item.nativeLabel}
                </span>
                {locale === item.code && <Check className="h-4 w-4 shrink-0" />}
              </div>
              <span className="mt-1 block text-xs text-ink-mute">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/90 text-sm font-medium text-ink-soft transition hover:bg-primary-soft hover:text-primary",
          variant === "compact" ? "px-2.5 py-2" : "px-3 py-1.5"
        )}
        aria-label={t.common.language}
        aria-expanded={open}
      >
        <Globe2 className="h-4 w-4 shrink-0 text-primary" />
        <span className="max-w-[4.5rem] truncate" dir={current.dir}>
          {current.nativeLabel}
        </span>
      </button>

      {open && (
        <div
          className={clsx(
            "absolute z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-primary/10 bg-white p-1.5 shadow-lift",
            "end-0"
          )}
        >
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
            {t.common.language}
          </p>
          {LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLocale(item.code);
                setOpen(false);
              }}
              className={clsx(
                "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm transition",
                locale === item.code
                  ? "bg-primary-soft font-semibold text-primary"
                  : "text-ink-soft hover:bg-primary-mist"
              )}
            >
              <span dir={item.dir}>{item.nativeLabel}</span>
              <span className="text-[11px] text-ink-mute">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
