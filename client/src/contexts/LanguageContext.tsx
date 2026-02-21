import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { trackEvent } from "@/lib/analytics";

export type Language = "cn" | "en";

interface LanguageContextType {
  lang: Language;
  /** True when the user's browser is set to zh-TW / zh-HK (Traditional Chinese) */
  isTraditional: boolean;
  toggleLang: () => void;
  /**
   * Return the appropriate string for the current language.
   * When `lang === "cn"` and `isTraditional === true`, the simplified Chinese
   * string is transparently converted to Traditional Chinese via opencc-js.
   */
  t: (cn: string, en: string) => string;
  /**
   * Convert a single simplified Chinese string to Traditional Chinese.
   * Returns the original string unchanged when Traditional mode is off or
   * the converter is not yet ready.
   */
  convert: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "cn",
  isTraditional: false,
  toggleLang: () => {},
  t: (cn: string) => cn,
  convert: (text: string) => text,
});

// ---------------------------------------------------------------------------
// Browser-language detection helpers
// ---------------------------------------------------------------------------

/**
 * Detect whether the browser is set to a Traditional Chinese locale.
 * Covers zh-TW, zh-HK, zh-Hant, zh-Hant-TW, zh-Hant-HK, etc.
 */
function detectIsTraditional(): boolean {
  if (typeof navigator === "undefined") return false;
  const langs: string[] = [];
  if (navigator.languages && navigator.languages.length > 0) {
    langs.push(...navigator.languages);
  } else if (navigator.language) {
    langs.push(navigator.language);
  }
  return langs.some((l) => {
    const lower = l.toLowerCase();
    return (
      lower === "zh-tw" ||
      lower === "zh-hk" ||
      lower === "zh-mo" ||
      lower.startsWith("zh-hant") ||
      lower.startsWith("zh-tw") ||
      lower.startsWith("zh-hk")
    );
  });
}

/** Detect initial UI language (cn / en) — same logic as before. */
function detectInitialLanguage(): Language {
  // Check if we already set the language in the inline script
  if (typeof document !== "undefined") {
    const attrLang = document.documentElement.getAttribute("data-lang");
    if (attrLang === "en" || attrLang === "cn") {
      return attrLang as Language;
    }
  }

  if (typeof window !== "undefined" && window.document) {
    const htmlLang = window.document.documentElement.getAttribute("data-lang");
    if (htmlLang === "en" || htmlLang === "cn") return htmlLang as Language;
  }

  // Fallback: respect explicit user preference saved in localStorage
  const savedLang =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("lovevery-lang")
      : null;
  if (savedLang === "en" || savedLang === "cn") {
    return savedLang as Language;
  }

  // Auto-detect from browser language
  const browserLang =
    typeof navigator !== "undefined"
      ? navigator.language || (navigator as any).userLanguage
      : null;
  if (browserLang && browserLang.toLowerCase().startsWith("en")) {
    return "en";
  }

  return "cn";
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => detectInitialLanguage());

  // Traditional Chinese detection — computed once from the browser locale.
  // The user can still manually toggle between 中文 and EN; Traditional mode
  // is purely additive (it converts the simplified text that "cn" mode returns).
  const [isTraditional, setIsTraditional] = useState<boolean>(false);

  // opencc-js converter instance — loaded lazily only when needed.
  const converterRef = useRef<((text: string) => string) | null>(null);
  const converterLoadingRef = useRef(false);

  // Detect Traditional Chinese on mount (client-side only).
  useEffect(() => {
    const traditional = detectIsTraditional();
    setIsTraditional(traditional);
  }, []);

  // Lazily load opencc-js and create the Simplified → Traditional converter
  // only when Traditional mode is active and the user is viewing Chinese.
  useEffect(() => {
    if (!isTraditional || lang !== "cn") return;
    if (converterRef.current || converterLoadingRef.current) return;

    converterLoadingRef.current = true;
    import("opencc-js")
      .then((opencc) => {
        // s2twp: Simplified Chinese → Traditional Chinese (Taiwan standard + phrases)
        converterRef.current = opencc.Converter({ from: "cn", to: "twp" });
      })
      .catch((err) => {
        console.warn("[opencc-js] Failed to load converter:", err);
      })
      .finally(() => {
        converterLoadingRef.current = false;
      });
  }, [isTraditional, lang]);

  // ------------------------------------------------------------------
  // convert() — transparently convert simplified → traditional
  // ------------------------------------------------------------------
  const convert = useCallback(
    (text: string): string => {
      if (!isTraditional || lang !== "cn") return text;
      if (!converterRef.current) return text; // converter not ready yet → show simplified
      return converterRef.current(text);
    },
    [isTraditional, lang]
  );

  // ------------------------------------------------------------------
  // toggleLang() — unchanged behaviour: cn ↔ en
  // ------------------------------------------------------------------
  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "cn" ? "en" : "cn";
      localStorage.setItem("lovevery-lang", next);

      trackEvent("switch_language", {
        from_lang: prev,
        to_lang: next,
        is_traditional: isTraditional,
      });

      return next;
    });
  }, [isTraditional]);

  // ------------------------------------------------------------------
  // t() — pick cn/en string, then optionally convert to Traditional
  // ------------------------------------------------------------------
  const t = useCallback(
    (cn: string, en: string) => {
      if (lang !== "cn") return en;
      return convert(cn);
    },
    [lang, convert]
  );

  // Update HTML lang attribute when language or traditional mode changes
  useEffect(() => {
    if (lang === "cn") {
      document.documentElement.lang = isTraditional ? "zh-TW" : "zh-CN";
    } else {
      document.documentElement.lang = "en";
    }
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang, isTraditional]);

  return (
    <LanguageContext.Provider
      value={{ lang, isTraditional, toggleLang, t, convert }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
