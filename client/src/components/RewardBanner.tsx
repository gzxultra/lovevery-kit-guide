import { Coffee } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useI18n } from "../hooks/useI18n";

export function RewardBanner() {
  const { lang } = useLanguage();
  const i18n = useI18n();
  const t = i18n.reward;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFD3] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="hidden sm:flex p-3 bg-[#FAF7F2] rounded-xl">
            <Coffee className="w-6 h-6 text-[#E8A87C]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display text-[#3D3229] font-bold text-lg sm:text-xl leading-tight">
              {t.bannerTitle[lang]}
            </h3>
            <p className="text-[#6B5E50] text-sm sm:text-base mt-1">
              {t.bannerSubtitle[lang]}
            </p>
          </div>
        </div>
        
        <a
          href="https://ko-fi.com/ernie92368"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 bg-[#3D3229] text-white rounded-full text-sm font-medium hover:bg-[#2A231C] hover:shadow-lg hover:shadow-[#3D3229]/20 transition-all duration-300 active:scale-[0.98] min-h-[48px]"
        >
          <Coffee className="w-4 h-4" />
          <span>{t.kofiButton[lang]}</span>
        </a>
      </div>
    </div>
  );
}
