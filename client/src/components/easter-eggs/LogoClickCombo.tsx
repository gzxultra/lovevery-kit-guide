/**
 * Easter Egg 2: Logo Click Combo
 * Click the site logo/title 5 times rapidly to trigger a "Lovevery Trivia" popup.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Info, Sparkles, RefreshCw } from "lucide-react";

const TRIVIA = {
  cn: [
    "Lovevery 的名字来源于 'Love' 和 'Every'，寓意关爱宝宝成长的每一刻。",
    "Lovevery 的所有玩具都经过儿童发展专家、心理学家和教育学家的精心设计。",
    "最受欢迎的 Play Gym 曾获得多项国际玩具大奖，包括红点设计奖。",
    "Lovevery 的木制玩具主要使用可持续采伐的 FSC 认证木材。",
    "Play Kits 的设计理念深受蒙特梭利 (Montessori) 教育法的启发。",
    "Lovevery 的创始人之一 Jessica Rolph 也是知名有机辅食品牌 Happy Family 的联合创始人。",
    "每个 Play Kit 都附带一本详细的家长指南，解释每个玩具背后的科学原理。",
  ],
  en: [
    "The name Lovevery comes from 'Love' and 'Every', meaning love for every stage of development.",
    "All Lovevery toys are designed by child development experts, psychologists, and educators.",
    "The famous Play Gym has won multiple international awards, including the Red Dot Design Award.",
    "Lovevery primarily uses sustainably harvested, FSC-certified wood for its wooden toys.",
    "The Play Kits are deeply inspired by the Montessori educational philosophy.",
    "Co-founder Jessica Rolph also co-founded the organic baby food brand Happy Family.",
    "Each Play Kit includes a detailed Play Guide explaining the science behind every toy.",
  ]
};

export default function LogoClickCombo() {
  const [showTrivia, setShowTrivia] = useState(false);
  const [currentTrivia, setCurrentTrivia] = useState("");
  const { lang } = useLanguage();
  
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleLogoClick = useCallback(() => {
    clickCountRef.current++;

    // Add bounce animation to logo
    const logos = document.querySelectorAll("[data-logo-target]");
    logos.forEach((logo) => {
      const el = logo as HTMLElement;
      el.style.transition = "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = `scale(${1 + clickCountRef.current * 0.04})`;
      setTimeout(() => {
        el.style.transform = "scale(1)";
      }, 150);
    });

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      const triviaList = TRIVIA[lang as keyof typeof TRIVIA] || TRIVIA.en;
      setCurrentTrivia(triviaList[Math.floor(Math.random() * triviaList.length)]);
      setShowTrivia(true);
      
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "unlock_trivia", { method: "logo_click" });
      }
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2000);
    }
  }, [lang]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const logoEl = target.closest("[data-logo-target]");
      if (logoEl) {
        handleLogoClick();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [handleLogoClick]);

  const refreshTrivia = () => {
    const triviaList = TRIVIA[lang as keyof typeof TRIVIA] || TRIVIA.en;
    let nextTrivia;
    do {
      nextTrivia = triviaList[Math.floor(Math.random() * triviaList.length)];
    } while (nextTrivia === currentTrivia && triviaList.length > 1);
    setCurrentTrivia(nextTrivia);
  };

  if (!showTrivia) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-[#E8DFD3]">
        <div className="bg-[#F0F7F1] p-6 text-[#2E7D32] relative border-b border-[#E8DFD3]">
          <button 
            onClick={() => setShowTrivia(false)}
            className="absolute top-4 right-4 p-1 hover:bg-black/5 rounded-full transition-colors text-[#6B5E50]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-[#7FB685]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Manrope']">
                {lang === "cn" ? "Lovevery 冷知识" : "Lovevery Trivia"}
              </h3>
              <p className="text-[#7FB685] text-[10px] font-bold uppercase tracking-widest">
                {lang === "cn" ? "你知道吗？" : "Did you know?"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="relative">
            <Info className="absolute -left-2 -top-2 w-12 h-12 text-[#F0F7F1] -z-10" />
            <p className="text-[#4A3F35] text-base leading-relaxed font-medium">
              {currentTrivia}
            </p>
          </div>
          
          <div className="mt-8 flex gap-3">
            <button
              onClick={refreshTrivia}
              className="flex-1 py-3 rounded-xl border border-[#E8DFD3] text-[#6B5E50] font-bold hover:bg-[#FAF7F2] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {lang === "cn" ? "换一个" : "Next One"}
            </button>
            <button
              onClick={() => setShowTrivia(false)}
              className="flex-1 py-3 rounded-xl bg-[#7FB685] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-[#7FB685]/20"
            >
              {lang === "cn" ? "记住了" : "Got it"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
