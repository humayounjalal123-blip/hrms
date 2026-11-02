export type Locale = "en" | "ur" | "ar";

export const LOCALES: {
  code: Locale;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", dir: "rtl" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
];

export const DEFAULT_LOCALE: Locale = "en";
export const LANG_STORAGE_KEY = "hrms_lang";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "ur" || value === "ar";
}

export function getLocaleMeta(code: Locale) {
  return LOCALES.find((l) => l.code === code) || LOCALES[0];
}
