"use client";

import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Logo } from "@/components/Logo";
import { MosqueSilhouette } from "@/components/MosqueArt";
import { QuranPlayer } from "@/components/QuranPlayer";
import { FadeUp, motion } from "@/components/motion";
import { Headphones } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ListenPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <PublicNav />

      <section className="page-shell pt-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-arch-fade px-6 py-12 text-white shadow-lift sm:px-10">
          <MosqueSilhouette className="absolute bottom-0 left-0 w-full text-white opacity-20" />
          <div className="pointer-events-none absolute inset-0 shimmer-bg opacity-25" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-green-100">
                <Headphones className="h-4 w-4" /> {t.listen.title}
              </p>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                {t.listen.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-green-50/90 sm:text-base">
                {t.listen.subtitle}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary"
            >
              {t.nav.dashboard}
            </Link>
          </motion.div>
        </div>
      </section>

      <main className="page-shell py-10">
        <FadeUp>
          <QuranPlayer />
        </FadeUp>
      </main>

      <footer className="border-t border-primary/10 bg-white/70 py-6 text-center text-sm text-ink-mute backdrop-blur">
        <div className="mb-2 flex justify-center">
          <Logo showSubtitle={false} />
        </div>
        <div className="mb-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-primary hover:underline">
            {t.nav.privacy}
          </Link>
          <Link href="/terms" className="hover:text-primary hover:underline">
            {t.nav.terms}
          </Link>
        </div>
        {t.listen.footerNote}
      </footer>
    </div>
  );
}
