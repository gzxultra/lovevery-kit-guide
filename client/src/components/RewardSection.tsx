import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { i18n } from "../data/i18n";

const RewardSection: React.FC = () => {
  const { lang } = useLanguage();
  const t = i18n.reward;

  return (
    <section className="py-16 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-[#4A3E31] mb-4 font-manrope">
          {t.title[lang]}
        </h2>
        <p className="text-[#6B5E50] mb-12 max-w-2xl mx-auto">
          {t.subtitle[lang]}
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          {/* WeChat Reward - Primary in CN */}
          <div className={`flex flex-col items-center space-y-4 ${lang === 'en' ? 'order-2 opacity-80 scale-95' : 'order-1'}`}>
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-[#E8E2D9]">
              <img 
                src={`${import.meta.env.BASE_URL}wechat-reward.jpg`} 
                alt={t.wechat[lang]} 
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>
            <span className="text-sm font-medium text-[#4A3E31] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#07C160]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.348 14.65c.062 0 .124.005.185.014a3.827 3.827 0 0 1 3.74-3.264c.033 0 .066.001.098.003a3.52 3.52 0 0 1 3.476-2.903c2.121 0 3.84 1.545 3.84 3.45 0 1.905-1.719 3.45-3.84 3.45a4.063 4.063 0 0 1-1.393-.244l-1.462.731.365-1.463a3.344 3.344 0 0 1-1.014-2.31c0-1.803 1.564-3.264 3.491-3.264 1.927 0 3.49 1.461 3.49 3.264 0 1.803-1.563 3.264-3.49 3.264-.17 0-.336-.011-.498-.033l-1.305.652.326-1.304a3.033 3.033 0 0 1-1.009-2.215c0-1.63 1.413-2.952 3.156-2.952s3.156 1.322 3.156 2.952-1.413 2.952-3.156 2.952c-.153 0-.303-.01-.449-.03l-1.181.59.295-1.181a2.75 2.75 0 0 1-.914-2.007c0-1.474 1.278-2.669 2.855-2.669s2.855 1.195 2.855 2.669-1.278 2.669-2.855 2.669z"/>
              </svg>
              {t.wechat[lang]}
            </span>
          </div>

          {/* Ko-fi - Primary in EN */}
          <div className={`flex flex-col items-center space-y-4 ${lang === 'en' ? 'order-1' : 'order-2 opacity-80 scale-95'}`}>
            <a 
              href="https://ko-fi.com/ernie92368" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-[#FF5E5B] to-[#FF8C61] group-hover:from-[#FF5E5B] group-hover:to-[#FF8C61] hover:text-white focus:ring-4 focus:outline-none focus:ring-red-200"
            >
              <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-white rounded-full group-hover:bg-opacity-0 flex items-center gap-3">
                <img 
                  src="https://ko-fi.com/img/cup-border.png" 
                  alt="Ko-fi" 
                  className="w-6 h-6"
                />
                <span className="text-lg font-bold group-hover:text-white text-[#FF5E5B]">
                  {t.kofi[lang]}
                </span>
              </span>
            </a>
            <p className="text-xs text-[#6B5E50] italic">
              ko-fi.com/ernie92368
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardSection;
