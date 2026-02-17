import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type Language = "cn" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (cn: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  toggleLang: () => {},
  t: (cn: string, en: string) => en,
});

// Detect browser language and determine initial language
function detectInitialLanguage(): Language {
  // Priority 1: Check localStorage for user's manual selection
  const savedLang = localStorage.getItem("lovevery-lang");
  if (savedLang === "en" || savedLang === "cn") {
    return savedLang;
  }

  // Priority 2: Check browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang && browserLang.toLowerCase().startsWith("zh")) {
    return "cn";
  }

  // Priority 3: Default to English (US market focus)
  return "en";
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
