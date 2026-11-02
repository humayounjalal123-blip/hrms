export type PasswordCheck = {
  id: "length" | "upper" | "lower" | "number" | "special";
  label: string;
  ok: boolean;
};

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    {
      id: "length",
      label: "At least 8 characters",
      ok: password.length >= 8,
    },
    {
      id: "upper",
      label: "One uppercase letter (A–Z)",
      ok: /[A-Z]/.test(password),
    },
    {
      id: "lower",
      label: "One lowercase letter (a–z)",
      ok: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "One number (0–9)",
      ok: /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "One special character (!@#$%…)",
      ok: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function isStrongPassword(password: string) {
  return getPasswordChecks(password).every((c) => c.ok);
}

export function getPasswordStrength(password: string): {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;
} {
  const passed = getPasswordChecks(password).filter((c) => c.ok).length;
  if (passed <= 2) return { score: passed, label: "Weak", color: "bg-rose-500" };
  if (passed === 3) return { score: passed, label: "Fair", color: "bg-amber-500" };
  if (passed === 4) return { score: passed, label: "Good", color: "bg-lime-600" };
  return { score: passed, label: "Strong", color: "bg-emerald-600" };
}

export const WEAK_PASSWORD_ALERT =
  "Weak password. Use 8+ characters with uppercase, lowercase, number, and a special character.";
