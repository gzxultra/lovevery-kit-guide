import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart3, X, Box, BookOpen, Baby, Zap, Award, ExternalLink } from "lucide-react";
import { kits, stages } from "@/data/kits";
import { articlesData } from "@/data/recommendedArticles";
import { alternatives } from "@/data/alternatives";

export default function StatisticsEasterEgg() {
  const [enabled, setEnabled] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const { lang, t } = useLanguage();

  useEffect(() => {
    const findTarget = () => {
      const el = document.querySelector("[data-rainbow-portal]");
      if (el instanceof HTMLElement) setPortalTarget(el);
    };
    findTarget();
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const stats = useMemo(() => {
    const totalKits = kits.length;
    const totalToys = kits.reduce((acc, kit) => acc + kit.toys.length, 0);
    const totalArticles = articlesData.totalArticles || 0;
    const totalAlternatives = alternatives.reduce((acc, kit) => {
      return acc + kit.toys.reduce((tAcc, toy) => tAcc + toy.alternatives.length, 0);
    }, 0);
    const totalMonths = 60; // 0-60 months
    const totalStages = stages.length;

    return {
      totalKits,
      totalToys,
      totalArticles,
      totalAlternatives,
      totalMonths,
      totalStages
    };
  }, []);

  if (!portalTarget) return null;

  return (
    <>
      {createPortal(
        <button
          onClick={() => setEnabled(true)}
          className="w-6 h-6 rounded-full transition-all duration-300 hover:scale-125 opacity-40 hover:opacity-100 flex items-center justify-center bg-[#7FB685] text-white"
          title={t("查看网站统计", "View Site Statistics")}
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </button>,
        portalTarget
      )}

      {enabled && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#3D3229]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-[#E8DFD3] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#F5F0E8] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7FB685]/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#7FB685]" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl text-[#3D3229]">
                    {t("网站数据统计", "Site Statistics")}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#B0A89E] font-medium uppercase tracking-wider">
                    Lovevery Fans Data Center
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEnabled(false)}
                className="p-2 hover:bg-[#E8DFD3]/40 rounded-full transition-colors text-[#B0A89E] hover:text-[#3D3229]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-2 gap-4 sm:gap-6">
              <StatCard 
                icon={<Box className="w-5 h-5" />}
                label={t("收录 Play Kits", "Play Kits")}
                value={stats.totalKits}
                color="#E8A87C"
              />
              <StatCard 
                icon={<Zap className="w-5 h-5" />}
                label={t("收录玩具总量", "Total Toys")}
                value={stats.totalToys}
                color="#7FB685"
              />
              <StatCard 
                icon={<BookOpen className="w-5 h-5" />}
                label={t("推荐阅读文章", "Articles")}
                value={stats.totalArticles}
                color="#C38D9E"
              />
              <StatCard 
                icon={<Award className="w-5 h-5" />}
                label={t("平替方案推荐", "Alternatives")}
                value={stats.totalAlternatives}
                color="#6C8EAD"
              />
              <StatCard 
                icon={<Baby className="w-5 h-5" />}
                label={t("覆盖月龄段", "Months Covered")}
                value={`0-${stats.totalMonths}`}
                color="#D4A373"
              />
              <StatCard 
                icon={<ExternalLink className="w-5 h-5" />}
                label={t("成长发展阶段", "Growth Stages")}
                value={stats.totalStages}
                color="#8D99AE"
              />
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-[#FAF7F2] border-t border-[#F5F0E8] text-center">
              <p className="text-xs text-[#6B5E50] leading-relaxed">
                {t("感谢你对 Lovevery Fans 的支持！我们致力为家长提供最全面、最客观的玩具指南。", "Thank you for supporting Lovevery Fans! We are dedicated to providing the most comprehensive and objective toy guides for parents.")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-[#FAF7F2]/50 rounded-2xl p-4 border border-[#F5F0E8] hover:border-[#E8DFD3] transition-all group">
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-display font-bold text-[#3D3229] mb-1">
        {value}
      </div>
      <div className="text-xs font-medium text-[#6B5E50] opacity-80">
        {label}
      </div>
    </div>
  );
}
