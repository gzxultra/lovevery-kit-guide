import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border border-[#E8DFD3] bg-white/80 hover:bg-[#E8DFD3]/40 text-[#6B5E50] hover:text-[#3D3229] transition-all active:scale-95"
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="font-semibold">{lang === "cn" ? "EN" : "中"}</span>
    </button>
  );
}
