import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    toggleLang();
  };

  useEffect(() => {
    if (animating) {
      const timer = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [animating]);

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-[#E8DFD3] bg-white/90 hover:bg-[#E8DFD3]/50 text-[#6B5E50] hover:text-[#3D3229] transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md overflow-hidden group min-w-[48px] min-h-[48px] justify-center"
      aria-label="Toggle language"
    >
      {/* Background gradient animation on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] to-[#E8DFD3] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <span className="relative flex items-center gap-2">
        {/* Flag icon with CSS transition */}
        <span
          className="text-base leading-none transition-all duration-300"
          style={{
            transform: animating ? 'scale(0.8) rotate(-10deg)' : 'scale(1) rotate(0)',
            opacity: animating ? 0.5 : 1,
          }}
        >
          {lang === "cn" ? "🇺🇸" : "🇨🇳"}
        </span>
        
        {/* Language text */}
        <span
          className="font-display font-bold text-xs transition-all duration-300"
          style={{
            transform: animating ? 'translateX(-5px)' : 'translateX(0)',
            opacity: animating ? 0.5 : 1,
          }}
        >
          {lang === "cn" ? "EN" : "中文"}
        </span>
      </span>
    </button>
  );
}
