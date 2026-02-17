import { Coffee } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { i18n } from "../data/i18n";

export function RewardSection() {
  const { language } = useLanguage();
  const t = i18n.reward;

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-br from-[#FFF8F0] via-[#FFFBF5] to-[#FFF8F0]">
      <div className="max-w-2xl mx-auto text-center">
        {/* Coffee Icon with Animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF5E5B] opacity-20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-[#FF5E5B] to-[#FF8C42] p-4 rounded-full shadow-lg">
              <Coffee className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#6B5E50] to-[#8B7355] bg-clip-text text-transparent" style={{ fontFamily: "Manrope, sans-serif" }}>
          {t.title[language]}
        </h2>

        {/* Subtitle */}
        <p className="text-base text-[#8B7355] mb-8 leading-relaxed max-w-lg mx-auto">
          {t.subtitle[language]}
        </p>

        {/* Ko-fi Button */}
        <a
          href="https://ko-fi.com/ernie92368"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FF5E5B] to-[#FF8C42] text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <Coffee className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <span>{t.kofiButton[language]}</span>
        </a>

        {/* Decorative Element */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-[#FF5E5B] rounded-full opacity-40"></div>
          <div className="w-2 h-2 bg-[#FF8C42] rounded-full opacity-40"></div>
          <div className="w-2 h-2 bg-[#FFB347] rounded-full opacity-40"></div>
        </div>
      </div>
    </section>
  );
}
