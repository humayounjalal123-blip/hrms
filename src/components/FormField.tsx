"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required,
  autoComplete,
  error,
  onBlur,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  onBlur?: () => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <motion.label
      className="group block space-y-1.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition ${
              error
                ? "text-rose-500"
                : "text-ink-mute group-focus-within:text-primary"
            }`}
          />
        )}
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-2xl border bg-white/95 py-2.5 text-sm text-ink shadow-sm outline-none transition duration-200 placeholder:text-ink-mute/70 ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
              : "border-primary/15 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10"
          } ${Icon ? "pl-10" : "pl-3.5"} ${isPassword ? "pr-10" : "pr-3.5"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-mute transition hover:bg-primary-mist hover:text-primary"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -2, height: 0 }}
            className="overflow-hidden text-xs font-medium text-rose-600"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
}) {
  return (
    <label className="group block space-y-1.5">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute transition group-focus-within:text-primary" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full appearance-none rounded-2xl border border-primary/15 bg-white/95 py-2.5 text-sm text-ink shadow-sm outline-none transition hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
            Icon ? "pl-10" : "pl-3.5"
          } pr-8`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
