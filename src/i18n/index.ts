import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ru from "./locales/ru.json";

// Top-10 placeholder languages (only EN/RU have full strings,
// others fall back to EN automatically).
const placeholders = ["es", "fr", "de", "it", "pt", "ar", "hi", "zh"];

const resources: Record<string, { translation: typeof en }> = {
  en: { translation: en },
  ru: { translation: ru },
};
placeholders.forEach((code) => {
  resources[code] = { translation: en };
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "ru", ...placeholders],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "propaai_lang",
      caches: ["localStorage"],
    },
  });

export const SUPPORTED_LANGS = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "zh", label: "Chinese", native: "中文" },
] as const;

export const FULLY_LOCALIZED = new Set(["en", "ru"]);

export default i18n;
