import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-[#E8DFD3] bg-white/90 hover:bg-[#E8DFD3]/50 text-[#6B5E50] hover:text-[#3D3229] transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md overflow-hidden group"
      aria-label="Toggle language"
    >
      {/* Background gradient animation on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] to-[#E8DFD3] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <span className="relative flex items-center gap-2">
        {/* Flag icon with smooth transition */}
        <motion.span
          key={lang}
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-base leading-none"
        >
          {lang === "cn" ? "🇺🇸" : "🇨🇳"}
        </motion.span>
        
        {/* Language text with slide animation */}
        <motion.span
          key={`text-${lang}`}
          initial={{ x: -5, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="font-semibold text-xs"
        >
          {lang === "cn" ? "EN" : "中文"}
        </motion.span>
      </span>
    </button>
  );
}
