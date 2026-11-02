"use client";

import { motion } from "framer-motion";

export function MosqueSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 220"
      className={`animate-drift ${className}`}
      fill="currentColor"
      aria-hidden
    >
      <path d="M0 220h800v-40H0z" opacity="0.15" />
      <path
        d="M60 220V120l20-10 20 10v100H60zm40 0V90c20-30 60-30 80 0v130H100zm100 0V110l30-40 30 40v110h-60zm90 0V80c25-45 85-45 110 0v140H290zm130 0V100l35-50 35 50v120h-70zm100 0V85c22-35 70-35 92 0v135h-92zm112 0V115l28-35 28 35v105h-56zm76 0V95c18-28 55-28 72 0v125h-72z"
        opacity="0.35"
      />
      <circle cx="400" cy="48" r="8" opacity="0.4" className="animate-pulse-glow" />
      <path
        d="M392 48c0-18 8-28 8-28s8 10 8 28c0 0-4 6-8 6s-8-6-8-6z"
        opacity="0.45"
      />
    </svg>
  );
}

export function QuranHeroImage({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d3b1f] via-[#1B5E20] to-[#2E7D32] ${className}`}
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 shimmer-bg opacity-40" />
      <div className="absolute inset-0 opacity-30">
        <MosqueSilhouette className="absolute bottom-0 w-full text-white" />
      </div>
      <div className="relative flex h-full min-h-[220px] flex-col items-center justify-center p-8 text-center text-white">
        <motion.div
          className="mb-4 flex h-24 w-28 items-end justify-center rounded-lg border-2 border-amber-200/40 bg-gradient-to-b from-amber-100/20 to-amber-900/30 shadow-inner animate-float"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
        >
          <div className="mb-2 h-16 w-20 rounded-sm border border-amber-100/50 bg-gradient-to-br from-emerald-800 to-emerald-950 shadow-lg">
            <div className="flex h-full items-center justify-center text-xs tracking-widest text-amber-100/80">
              القرآن
            </div>
          </div>
        </motion.div>
        <motion.p
          className="max-w-xs font-serif text-sm italic leading-relaxed text-green-50/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          “And We have certainly made the Qur’an easy for remembrance…”
        </motion.p>
        <motion.p
          className="mt-2 text-xs text-green-100/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.45 }}
        >
          — Al-Qamar 54:17
        </motion.p>
      </div>
    </motion.div>
  );
}
