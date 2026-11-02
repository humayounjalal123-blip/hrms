"use client";

import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Logo } from "@/components/Logo";
import { MosqueSilhouette } from "@/components/MosqueArt";
import { FadeUp, motion } from "@/components/motion";
import { useI18n } from "@/lib/i18n";

const sections = [
  {
    title: "1. Acceptance of terms",
    body: [
      "By accessing or using the Hifz Revision Management System (“HRMS”), you agree to these Terms of Use and our Privacy Policy.",
      "If you do not agree, please do not create an account or continue using the service.",
    ],
  },
  {
    title: "2. Purpose of the service",
    body: [
      "HRMS is an educational tool for managing Quran memorization (Hifz), revision, assessments, class organization, meetings, and listening practice.",
      "It supports students, teachers, and administrators — it does not replace qualified teachers, scholars, or traditional teaching methods.",
    ],
  },
  {
    title: "3. Accounts and roles",
    body: [
      "You must provide accurate information when signing up and keep your login details confidential.",
      "Access and features depend on your role (student, teacher, or admin) and class assignments set by authorized users.",
      "Institutions are responsible for correctly assigning teachers, enrolling students, and supervising student accounts.",
    ],
  },
  {
    title: "4. Acceptable use",
    body: [
      "Use HRMS only for lawful educational purposes related to Quran learning and school administration.",
      "Do not attempt to access another user’s account, disrupt the service, misuse meeting rooms, or upload harmful content.",
      "Do not use the platform to harass others, share inappropriate material, or misrepresent assessments or progress records.",
    ],
  },
  {
    title: "5. Learning content and audio",
    body: [
      "Quran text references and audio streams may come from public educational sources for learning use.",
      "HRMS does not claim ownership of third-party Quran recordings. Playback quality and availability depend on those external sources.",
      "Recorded assessments, feedback, and class notes belong to the educational relationship between the institution, teachers, and students.",
    ],
  },
  {
    title: "6. Meetings and third-party tools",
    body: [
      "Online meetings may use embedded or linked third-party tools (for example Jitsi, Zoom, or Google Meet).",
      "Those providers have their own terms and privacy policies. You should review them before joining a meeting.",
    ],
  },
  {
    title: "7. Class limits and administration",
    body: [
      "Class enrollment may be limited (for example a maximum number of students per class) as configured by administrators.",
      "Administrators may assign teachers, manage classes, and oversee records as needed for school operations.",
    ],
  },
  {
    title: "8. Disclaimer",
    body: [
      "HRMS is provided on an “as is” and “as available” basis for educational support.",
      "We do not guarantee uninterrupted service, perfect accuracy of every record, or continuous availability of external audio or meeting services.",
      "Academic or religious decisions remain the responsibility of teachers, institutions, and qualified educators.",
    ],
  },
  {
    title: "9. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, HRMS and its operators are not liable for indirect, incidental, or consequential losses arising from use of the platform, including lost data, missed sessions, or reliance on progress reports.",
      "You use the service at your own risk, especially in this demo/local-storage configuration.",
    ],
  },
  {
    title: "10. Termination",
    body: [
      "We or your institution may suspend or remove access if these terms are violated or if the account is no longer needed.",
      "You may stop using HRMS at any time. Local browser data may remain until you clear it or an administrator removes related records.",
    ],
  },
  {
    title: "11. Changes to terms",
    body: [
      "These Terms may be updated as features change. The “Last updated” date on this page reflects the latest revision.",
      "Continued use after changes means you accept the updated Terms.",
    ],
  },
  {
    title: "12. Contact",
    body: [
      "For questions about these Terms, use the Contact page or speak with your institution’s HRMS administrator.",
    ],
  },
];

export default function TermsPage() {
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
            {t.terms.title}
          </motion.h1>
          <motion.p
            className="relative mx-auto mt-3 max-w-2xl text-green-50/90"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t.terms.subtitle}
          </motion.p>
          <p className="relative mt-4 text-xs uppercase tracking-[0.18em] text-green-100/80">
            {t.terms.lastUpdated} · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-5 px-4 py-14 sm:px-6">
        <FadeUp>
          <p className="leading-relaxed text-ink-soft">
            {t.terms.subtitle}{" "}
            <Link href="/privacy" className="font-semibold text-primary hover:underline">
              {t.privacy.title}
            </Link>
            .
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

        <FadeUp delay={0.45} className="flex flex-wrap gap-3 text-sm">
          <Link href="/privacy" className="btn-primary">
            {t.terms.viewPrivacy}
          </Link>
          <Link href="/signup" className="btn-secondary">
            {t.common.createAccount}
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
          <Link href="/terms" className="text-primary hover:underline">
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
