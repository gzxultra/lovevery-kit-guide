import { Coffee } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { i18n } from "../data/i18n";

export function RewardBanner() {
  const { lang } = useLanguage();
  const t = i18n.reward;

  return (
    <div className="w-full mt-16 pt-8 border-t border-[#F5E6D3]">
      <div className="bg-gradient-to-r from-[#FFFBF5] to-[#FFF8F0] rounded-2xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#F5E6D3]/50 shadow-sm">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="hidden sm:flex p-2 bg-white rounded-xl shadow-sm">
            <Coffee className="w-5 h-5 text-[#FF5E5B]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[#6B5E50] font-bold text-lg leading-tight">
              {t.bannerTitle[lang]}
            </p>
            <p className="text-[#6B5840] text-sm mt-1">
              {t.bannerSubtitle[lang]}
            </p>
          </div>
        </div>
        
        <a
          href="https://ko-fi.com/ernie92368"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 bg-[#C43B38] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#A83230] hover:shadow-lg hover:shadow-[#C43B38]/20 transition-all duration-300 min-h-[48px]"
        >
          <Coffee className="w-4 h-4" strokeWidth={2.5} />
          <span>{t.kofiButton[lang]}</span>
        </a>
      </div>
    </div>
  );
}
