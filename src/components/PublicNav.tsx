"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function PublicNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t.nav.home, key: "home" },
    { href: "/listen", label: t.nav.listen, key: "listen" },
    { href: "/about", label: t.nav.about, key: "about" },
    { href: "/contact", label: t.nav.contact, key: "contact" },
    {
      href: user ? "/dashboard/meetings" : "/login",
      label: t.nav.meetings,
      key: "meetings",
    },
  ];

  const isActive = (link: { href: string; key: string }) =>
    pathname === link.href ||
    (link.key === "meetings" && pathname.startsWith("/dashboard/meetings")) ||
    (link.key === "listen" &&
      (pathname === "/listen" || pathname.startsWith("/dashboard/listen")));

  return (
    <motion.header
      className="sticky top-0 z-40 px-3 pt-3 sm:px-4"
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-gold/20 bg-white/80 px-3 py-2.5 shadow-nav backdrop-blur-2xl sm:px-5">
        <Logo showSubtitle={false} />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <motion.div key={link.key} whileTap={{ scale: 0.96 }} className="relative">
              <Link
                href={link.href}
                className={clsx(
                  "nav-pill relative z-10 block",
                  isActive(link)
                    ? "text-white"
                    : "text-ink-soft hover:bg-gold-soft/70 hover:text-primary"
                )}
              >
                {isActive(link) && (
                  <motion.span
                    layoutId="public-nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-primary shadow-glow ring-1 ring-gold/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" className="hidden sm:block" />
          {user ? (
            <Link href="/dashboard" className="btn-primary !px-4 !py-2 text-xs sm:text-sm">
              {t.nav.dashboard}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary-soft md:inline"
              >
                {t.nav.login}
              </Link>
              <Link href="/signup" className="btn-primary !px-4 !py-2 text-xs sm:text-sm">
                {t.nav.signup}
              </Link>
            </>
          )}
          <button
            type="button"
            className="rounded-full border border-primary/15 bg-primary-mist/60 p-2 text-primary transition hover:bg-primary-soft lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-primary/10 bg-white/95 p-3 shadow-lift backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            {links.map((link, i) => (
              <motion.div
                key={link.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "block rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                    isActive(link)
                      ? "bg-primary text-white shadow-sm"
                      : "text-ink-soft hover:bg-primary-soft hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <div className="mt-2 border-t border-primary/10 px-2 pt-3">
              <LanguageSwitcher variant="panel" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
