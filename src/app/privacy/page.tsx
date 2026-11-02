"use client";

import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Logo } from "@/components/Logo";
import { MosqueSilhouette } from "@/components/MosqueArt";
import { FadeUp, motion } from "@/components/motion";
import { useI18n } from "@/lib/i18n";

const sections = [
  {
    title: "1. Information we collect",
    body: [
      "Account details you provide during signup — such as name, email, role (student, teacher, or admin), and class-related information.",
      "Learning activity data created inside HRMS — memorization records, revision tasks, assessments, feedback, schedules, and meeting links.",
      "Contact messages you send through the Contact page.",
      "Basic technical data needed to run the app in your browser (for example session state stored locally).",
    ],
  },
  {
    title: "2. How we use information",
    body: [
      "To operate the Hifz Revision Management System and show the correct dashboard for your role.",
      "To connect students, teachers, and administrators through classes, tasks, assessments, and meetings.",
      "To improve product features such as progress tracking, Quran listening, and reporting.",
      "To respond to support or contact requests.",
    ],
  },
  {
    title: "3. Storage and security",
    body: [
      "In this demo build, much of the app data is stored in your browser’s local storage on the device you use.",
      "You are responsible for protecting access to that device and account credentials.",
      "We take reasonable steps to keep the application secure, but no online or browser-based system can be guaranteed 100% secure.",
      "Do not enter highly sensitive personal data that is not needed for Hifz management.",
    ],
  },
  {
    title: "4. Sharing of information",
    body: [
      "Student and teacher data may be visible to authorized users within the same class or institution according to their role.",
      "We do not sell personal information.",
      "Third-party services used for Quran audio streaming or online meetings (for example public Quran audio servers or meeting providers) operate under their own privacy practices.",
    ],
  },
  {
    title: "5. Cookies and local data",
    body: [
      "HRMS may store login/session and application data locally in your browser to keep you signed in and preserve records.",
      "Clearing browser storage will remove local demo data associated with this app on that device.",
    ],
  },
  {
    title: "6. Children’s privacy",
    body: [
      "HRMS is designed for educational use in Quran learning environments and may be used by minors under teacher or guardian supervision.",
      "Institutions and guardians should ensure appropriate consent and oversight when creating accounts for younger students.",
    ],
  },
  {
    title: "7. Your choices",
    body: [
      "You may update profile information available in your account area.",
      "You may request removal of account-related records by contacting the administrator or using the Contact page.",
      "You may stop using the service at any time.",
    ],
  },
  {
    title: "8. Changes to this policy",
    body: [
      "We may update this Privacy Policy as HRMS features evolve. The “Last updated” date at the top of this page will change when revisions are published.",
      "Continued use of HRMS after updates means you accept the revised policy.",
    ],
  },
  {
    title: "9. Contact",
    body: [
      "Questions about privacy can be sent through the Contact page or to the institution administering your HRMS deployment.",
    ],
  },
];

export default function PrivacyPage() {
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
            {t.privacy.title}
          </motion.h1>
          <motion.p
            className="relative mx-auto mt-3 max-w-2xl text-green-50/90"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t.privacy.subtitle}
          </motion.p>
          <p className="relative mt-4 text-xs uppercase tracking-[0.18em] text-green-100/80">
            {t.privacy.lastUpdated} · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-5 px-4 py-14 sm:px-6">
        <FadeUp>
          <p className="leading-relaxed text-ink-soft">
            This Privacy Policy explains how the Hifz Revision Management System
            (“HRMS”, “we”, “us”) handles information when you use our website and
            learning tools. By using HRMS, you agree to the practices described here.
          </p>
        </FadeUp>

        {sections.map((section, i) => (
          <FadeUp key={section.title} delay={0.04 * (i + 1)} className="card">
            <h2 className="font-display text-xl font-semibold text-ink">
              {section.title}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
              {section.body.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </FadeUp>
        ))}

        <FadeUp delay={0.4} className="flex flex-wrap gap-3 text-sm">
          <Link href="/terms" className="btn-primary">
            {t.privacy.viewTerms}
          </Link>
          <Link href="/contact" className="btn-secondary">
            {t.privacy.contactUs}
          </Link>
        </FadeUp>
      </section>

      <footer className="border-t border-primary/10 py-6 text-center text-sm text-ink-mute">
        <div className="mb-2 flex justify-center">
          <Logo showSubtitle={false} />
        </div>
        <div className="mb-2 flex justify-center gap-4">
          <Link href="/privacy" className="text-primary hover:underline">
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
