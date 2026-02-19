import { Coffee, Heart } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { i18n } from "../data/i18n";

export function RewardSection() {
  const { lang } = useLanguage();
  const t = i18n.reward;

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-b from-white to-[#FFFBF5]">
      <div className="max-w-3xl mx-auto">
        {/* Main Card - Elegant & Prominent but Refined */}
        <div className="relative bg-white rounded-3xl shadow-sm border border-[#F5E6D3] overflow-hidden group hover:shadow-lg hover:shadow-[#3D3229]/5 transition-all duration-500">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5E5B]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="relative z-10 px-8 py-10 md:px-12 md:py-12 text-center">
            {/* Title with Icon */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-[#FFF5F0] rounded-xl">
                <Coffee className="w-6 h-6 text-[#FF5E5B]" strokeWidth={2.5} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#6B5E50]">
                {t.title[lang]}
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-[#6B5840] mb-8 leading-relaxed max-w-xl mx-auto">
              {t.subtitle[lang]}
            </p>

            {/* Ko-fi Button - Clear CTA */}
            <div className="flex flex-col items-center gap-4">
              <a
                href="https://ko-fi.com/ernie92368"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#C43B38] text-white text-lg font-bold rounded-2xl shadow-lg shadow-[#C43B38]/20 hover:bg-[#A83230] hover:scale-[1.02] hover:shadow-xl hover:shadow-[#C43B38]/30 active:scale-[0.98] transition-all duration-300 min-h-[48px]"
              >
                <Coffee className="w-6 h-6" strokeWidth={2.5} />
                <span>{t.kofiButton[lang]}</span>
              </a>
              
              <p className="text-xs text-[#756050] flex items-center gap-1.5">
                <span>{t.thankYou[lang]}</span>
                <Heart className="w-3 h-3 text-[#FF5E5B]" fill="currentColor" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
