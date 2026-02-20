import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type Language = "cn" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (cn: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "cn",
  toggleLang: () => {},
  t: (cn: string, en: string) => cn,
});

// Detect browser language and determine initial language
function detectInitialLanguage(): Language {
  // Check if we already set the language in the inline script
  if (typeof document !== "undefined") {
    const attrLang = document.documentElement.getAttribute("data-lang");
    if (attrLang === "en" || attrLang === "cn") {
      return attrLang as Language;
    }
  }

  // Double check if data-lang is present on <html> but not detected yet
  if (typeof window !== 'undefined' && window.document) {
    const htmlLang = window.document.documentElement.getAttribute('data-lang');
    if (htmlLang === 'en' || htmlLang === 'cn') return htmlLang as Language;
  }

  // Fallback to manual detection (same as inline script)
  const savedLang = typeof localStorage !== "undefined" ? localStorage.getItem("lovevery-lang") : null;
  if (savedLang === "en" || savedLang === "cn") {
    return savedLang as Language;
  }

  const browserLang = typeof navigator !== "undefined" ? (navigator.language || (navigator as any).userLanguage) : null;
  if (browserLang && browserLang.toLowerCase().startsWith("en")) {
    return "en";
  }

  return "cn";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => detectInitialLanguage());

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "cn" ? "en" : "cn";
      localStorage.setItem("lovevery-lang", next);
      
      // Send Google Analytics event for language switch
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "switch_language", {
          from_lang: prev,
          to_lang: next,
        });
      }
      
      return next;
    });
  }, []);

  const t = useCallback(
    (cn: string, en: string) => (lang === "cn" ? cn : en),
    [lang]
  );

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = lang === "cn" ? "zh-CN" : "en";
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);



  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
