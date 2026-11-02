"use client";

import { TaskStatus } from "@/lib/types";
import clsx from "clsx";
import { motion } from "framer-motion";

const styles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-sky-50 text-sky-700 border-sky-200",
  overdue: "bg-rose-50 text-rose-700 border-rose-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StatusBadge({
  status,
}: {
  status: TaskStatus | "active" | "inactive" | string;
}) {
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.85, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide shadow-sm",
        styles[status] || "bg-slate-100 text-slate-600 border-slate-200"
      )}
    >
      <motion.span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {status}
    </motion.span>
  );
}
