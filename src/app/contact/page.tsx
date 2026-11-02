"use client";

import { FormEvent, useState } from "react";
import {
  Clock3,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { Logo } from "@/components/Logo";
import { MosqueSilhouette } from "@/components/MosqueArt";
import { FormField, SelectField } from "@/components/FormField";
import { addContactMessage } from "@/lib/store";
import Link from "next/link";
import { FadeUp, MotionButton, motion } from "@/components/motion";
import { useI18n } from "@/lib/i18n";
import { getEmailError, getEmailLiveError } from "@/lib/email";

export default function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmailField = (value: string, live = false) => {
    const msg = live ? getEmailLiveError(value) : getEmailError(value);
    setEmailError(msg || "");
    return !msg;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmailField(email)) return;
    await addContactMessage({ name, email, subject, message });
    setSent(true);
    setName("");
    setEmail("");
    setEmailError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen">
      <PublicNav />

      <section className="page-shell pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-arch-fade py-16 text-center text-white shadow-lift">
          <MosqueSilhouette className="absolute bottom-0 left-0 w-full text-white opacity-25" />
          <div className="pointer-events-none absolute inset-0 shimmer-bg opacity-20" />
          <motion.h1
            className="relative font-display text-4xl font-semibold"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t.contact.title}
          </motion.h1>
          <motion.p
            className="relative mt-3 text-green-50/90"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t.contact.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <FadeUp>
          <h2 className="font-display text-3xl font-semibold text-ink">{t.contact.title}</h2>
          <p className="mt-2 text-ink-mute">{t.contact.subtitle}</p>

          <div className="mt-8 space-y-5">
            <InfoRow
              icon={Mail}
              title="Email"
              value="info@hrms.edu.pk"
            />
            <InfoRow
              icon={Phone}
              title="Call Us"
              value="+92 300 1234567"
            />
            <InfoRow
              icon={MapPin}
              title="Our Location"
              value="Foundation University, Rawalpindi, Pakistan"
            />
            <InfoRow
              icon={Clock3}
              title="Working Hours"
              value="Mon – Sat, 9:00 AM – 5:00 PM"
            />
          </div>

          <div className="mt-8 flex gap-3">
            {[Share2, Globe, Mail].map((Icon, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3, scale: 1.08 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
              >
                <Icon className="h-4 w-4" />
              </motion.div>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.12} className="card">
          <h3 className="font-display text-2xl font-semibold text-ink">{t.contact.title}</h3>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <FormField label={t.contact.name} value={name} onChange={setName} required />
            <FormField
              label={t.contact.email}
              type="text"
              value={email}
              onChange={(v) => {
                setEmail(v);
                validateEmailField(v, true);
              }}
              onBlur={() => validateEmailField(email)}
              error={emailError}
              placeholder="yourname@gmail.com"
              autoComplete="email"
              required
            />
            <SelectField
              label="Subject"
              value={subject}
              onChange={setSubject}
              options={[
                { value: "General Inquiry", label: "General Inquiry" },
                { value: "Student Support", label: "Student Support" },
                { value: "Teacher Support", label: "Teacher Support" },
                { value: "Demo Request", label: "Demo Request" },
              ]}
            />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">{t.contact.message}</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="input-base resize-none"
                placeholder="How can we help?"
              />
            </label>
            {sent && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              >
                {t.contact.success}
              </motion.div>
            )}
            <MotionButton type="submit" className="btn-primary w-full">
              {t.contact.send}
            </MotionButton>
          </form>
        </FadeUp>
      </section>

      <footer className="bg-primary py-8 text-center text-green-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4">
          <Logo variant="dark" />
          <p className="text-sm">Better Records | Better Revision | Brighter Future</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/" className="hover:text-white">
              {t.nav.home}
            </Link>
            <Link href="/about" className="hover:text-white">
              {t.nav.about}
            </Link>
            <Link href="/contact" className="hover:text-white">
              {t.nav.contact}
            </Link>
            <Link href="/privacy" className="hover:text-white">
              {t.nav.privacy}
            </Link>
            <Link href="/terms" className="hover:text-white">
              {t.nav.terms}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-600">{value}</div>
      </div>
    </div>
  );
}
