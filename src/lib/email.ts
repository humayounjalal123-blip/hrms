/**
 * Gmail signup–style email format:
 * - @ exactly once (e.g. ali123@123@ → invalid)
 * - username: letters, numbers, periods only
 * - no leading / trailing / consecutive dots
 * - username length 6–30 (same as Gmail)
 * - valid domain with a real extension (e.g. gmail.com)
 */

export const INVALID_EMAIL_ALERT =
  "Please enter a valid email address (e.g. yourname@gmail.com).";

export function getEmailError(email: string): string | null {
  const value = email.trim();

  if (!value) return "Email is required.";

  if (/\s/.test(value)) {
    return "Email cannot contain spaces.";
  }

  const atCount = (value.match(/@/g) || []).length;
  if (atCount === 0) {
    return "Email must include @ (e.g. name@gmail.com).";
  }
  if (atCount > 1) {
    return "@ can only appear once. Do not use @ more than one time.";
  }

  const atIndex = value.indexOf("@");
  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);

  if (!local) {
    return "Enter a username before @.";
  }

  // Gmail signup: 6–30 characters
  if (local.length < 6) {
    return "Username must be at least 6 characters (Gmail format).";
  }
  if (local.length > 30) {
    return "Username must be at most 30 characters (Gmail format).";
  }

  // Gmail signup: letters, numbers, and periods only
  if (!/^[a-zA-Z0-9.]+$/.test(local)) {
    return "Username can only use letters, numbers, and periods (Gmail format).";
  }

  if (local.startsWith(".") || local.endsWith(".")) {
    return "Username cannot start or end with a period.";
  }

  if (local.includes("..")) {
    return "Username cannot have consecutive periods (..).";
  }

  if (!domain) {
    return "Enter a domain after @ (e.g. gmail.com).";
  }

  if (domain.includes("@")) {
    return "@ can only appear once. Do not use @ more than one time.";
  }

  if (
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.startsWith("-") ||
    domain.endsWith("-")
  ) {
    return "Email domain format is invalid.";
  }

  if (domain.includes("..")) {
    return "Email domain cannot have consecutive periods.";
  }

  // Domain must look like gmail.com / edu.pk — not just numbers like "123"
  const labels = domain.split(".");
  if (labels.length < 2) {
    return "Use a full domain with extension (e.g. gmail.com).";
  }

  for (const label of labels) {
    if (!label) return "Email domain format is invalid.";
    if (label.length > 63) return "Email domain label is too long.";
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label)) {
      return "Email domain has invalid characters.";
    }
  }

  const tld = labels[labels.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) {
    return "Domain extension must be letters only (e.g. .com, .pk).";
  }

  return null;
}

/** Live feedback while typing — flags clear mistakes without nagging incomplete input. */
export function getEmailLiveError(email: string): string | null {
  const value = email.trim();
  if (!value) return null;

  if (/\s/.test(value)) {
    return "Email cannot contain spaces.";
  }

  const atCount = (value.match(/@/g) || []).length;
  if (atCount > 1) {
    return "@ can only appear once. Do not use @ more than one time.";
  }

  // Once @ is typed, run full Gmail-style validation
  if (atCount === 1) {
    return getEmailError(value);
  }

  // Before @: only check username character rules
  if (!/^[a-zA-Z0-9.]*$/.test(value)) {
    return "Username can only use letters, numbers, and periods (Gmail format).";
  }
  if (value.startsWith(".")) {
    return "Username cannot start or end with a period.";
  }
  if (value.includes("..")) {
    return "Username cannot have consecutive periods (..).";
  }

  return null;
}

export function isValidEmail(email: string): boolean {
  return getEmailError(email) === null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
