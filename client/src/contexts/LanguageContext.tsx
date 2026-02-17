import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "cn" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (cn: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "cn",
  toggleLang: () => {},
  t: (cn: string) => cn,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("lovevery-lang");
    return saved === "en" ? "en" : "cn";
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "cn" ? "en" : "cn";
      localStorage.setItem("lovevery-lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (cn: string, en: string) => (lang === "cn" ? cn : en),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
