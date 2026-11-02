"use client";

import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Logo } from "@/components/Logo";
import { MosqueSilhouette } from "@/components/MosqueArt";
import { FadeUp, MotionButton, motion } from "@/components/motion";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <PublicNav />
      <section className="page-shell pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-arch-fade py-16 text-center text-white shadow-lift">
          <MosqueSilhouette className="absolute bottom-0 left-0 w-full text-white opacity-25" />
          <motion.h1
            className="relative font-display text-4xl font-semibold"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t.about.title}
          </motion.h1>
          <motion.p
            className="relative mx-auto mt-3 max-w-2xl text-green-50/90"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t.about.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        <FadeUp>
          <p className="text-lg leading-relaxed text-ink-soft">{t.about.p1}</p>
        </FadeUp>
        <FadeUp delay={0.08}>
          <p className="leading-relaxed text-ink-mute">{t.about.p2}</p>
        </FadeUp>
        <FadeUp delay={0.14} className="card">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {t.about.coreTitle}
          </h2>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-ink-soft">
            {t.about.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </FadeUp>
        <FadeUp delay={0.2}>
          <Link href="/signup">
            <MotionButton className="btn-primary">{t.common.createAccount}</MotionButton>
          </Link>
        </FadeUp>
      </section>

      <footer className="border-t border-primary/10 py-6 text-center text-sm text-ink-mute">
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
          <Link href="/contact" className="hover:text-primary hover:underline">
            {t.nav.contact}
          </Link>
        </div>
        © {new Date().getFullYear()} HRMS
      </footer>
    </div>
  );
}
