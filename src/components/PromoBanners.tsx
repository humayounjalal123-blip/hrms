"use client";

import Link from "next/link";
import { Globe2, GraduationCap, Headphones, Video } from "lucide-react";
import { FadeUp, motion } from "./motion";
import { useI18n } from "@/lib/i18n";

const bannerMeta = [
  { key: "international" as const, icon: Globe2, href: "/dashboard/meetings" },
  { key: "meetings" as const, icon: Video, href: "/dashboard/meetings" },
  { key: "listening" as const, icon: Headphones, href: "/listen" },
  { key: "classes" as const, icon: GraduationCap, href: "/dashboard/classes" },
];

export function PromoBanners({ loggedIn }: { loggedIn?: boolean }) {
  const { t } = useI18n();

  return (
    <section className="page-shell py-14">
      <FadeUp className="mb-8 max-w-2xl">
        <p className="eyebrow">{t.home.pillarsEyebrow}</p>
        <h2 className="section-title mt-2">{t.home.pillarsTitle}</h2>
        <p className="mt-3 text-ink-mute">{t.home.pillarsText}</p>
      </FadeUp>
      <div className="grid gap-4 md:grid-cols-2">
        {bannerMeta.map((b, i) => {
          const Icon = b.icon;
          const copy = t.home.banners[b.key];
          const href =
            b.href === "/listen" ? "/listen" : loggedIn ? b.href : "/login";
          return (
            <motion.div
              key={b.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href={href}
                className="group flex h-full gap-4 overflow-hidden rounded-[1.5rem] border border-primary/10 bg-white/85 p-5 shadow-card backdrop-blur transition hover:shadow-lift"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-arch-fade text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {copy.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-mute">{copy.text}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-primary group-hover:underline">
                    {t.common.explore}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function MidPageBanner() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-white pattern-dots">
      <div className="absolute inset-y-0 start-0 w-1.5 bg-gradient-to-b from-primary to-primary-light" />
      <div className="grid items-center gap-6 px-6 py-10 sm:px-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="eyebrow">{t.home.spotlight}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            {t.home.footerTag.replace(/ \| /g, " · ")}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ink-mute">{t.home.pillarsText}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center text-sm">
          <div className="rounded-3xl bg-arch-fade p-5 text-white">
            <div className="font-display text-2xl font-semibold">{t.nav.meetings}</div>
            <div className="mt-1 text-green-100/80">{t.home.banners.meetings.title}</div>
          </div>
          <div className="rounded-3xl border border-primary/15 bg-primary-soft p-5 text-primary">
            <div className="font-display text-2xl font-semibold">{t.nav.listen}</div>
            <div className="mt-1 text-primary/80">{t.home.banners.listening.title}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
