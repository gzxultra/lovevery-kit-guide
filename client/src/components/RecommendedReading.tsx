/*
 * RecommendedReading – "Editor's Pick" / "精选推荐" section
 * Shows 2-3 curated articles by default with expand to reveal all.
 * Matches the Montessori Naturalism / Scandinavian Minimalism design language.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Star,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getKitArticles,
  getArticleTypeLabel,
  type RecommendedArticle,
} from "@/data/recommendedArticles";
import { trackEvent } from "@/lib/analytics";

/* ------------------------------------------------------------------ */
/*  i18n strings                                                       */
/* ------------------------------------------------------------------ */
const t = {
  sectionTitle: { cn: "推荐阅读", en: "Recommended Reading" },
  sectionSubtitle: {
    cn: "精心挑选的高质量文章，帮助你更好地使用这套 Play Kit",
    en: "Curated articles to help you get the most out of this Play Kit",
  },
  editorPick: { cn: "精选推荐", en: "Editor's Pick" },
  viewMore: { cn: "查看更多文章", en: "View More Articles" },
  showLess: { cn: "收起", en: "Show Less" },
  opensExternal: { cn: "打开外部网站", en: "Opens external site" },
  allLang: { cn: "全部", en: "All" },
  enLang: { cn: "English", en: "English" },
  zhLang: { cn: "中文", en: "中文" },
  moreCount: { cn: "篇更多文章", en: "more articles" },
} as const;

/* ------------------------------------------------------------------ */
/*  Article type colour mapping                                        */
/* ------------------------------------------------------------------ */
const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  review:        { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
  usage_guide:   { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC" },
  comparison:    { bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
  unboxing:      { bg: "#FDF4FF", text: "#A21CAF", border: "#E879F9" },
  chinese_guide: { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
  discussion:    { bg: "#F5F3FF", text: "#6D28D9", border: "#C4B5FD" },
};

/* ------------------------------------------------------------------ */
/*  Single article card                                                */
/* ------------------------------------------------------------------ */
function ArticleCard({
  article,
  kitColor,
  isEditorPick,
}: {
  article: RecommendedArticle;
  kitColor: string;
  isEditorPick: boolean;
}) {
  const { lang } = useLanguage();
  const colors = typeColors[article.articleType] || typeColors.review;

  const handleClick = () => {
    trackEvent("click_recommended_article", {
      article_title: article.title,
      source: article.source,
      language: article.language,
    });
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group block rounded-xl border border-[#E8DFD3] bg-white hover:border-[#C8BFB3] hover:shadow-md hover:shadow-[#3D3229]/5 transition-all duration-300 overflow-hidden"
    >
      {/* Editor pick ribbon */}
      {isEditorPick && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold tracking-wide"
          style={{ backgroundColor: kitColor + "12", color: kitColor }}
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {t.editorPick[lang]}
        </div>
      )}

      <div className="p-3.5 sm:p-4">
        {/* Top row: badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5 flex-wrap">
          {/* Article type tag */}
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium border"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
            }}
          >
            {getArticleTypeLabel(article.articleType, lang)}
          </span>

          {/* Language badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium border ${
              article.language === "zh"
                ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                : "bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]"
            }`}
          >
            <Globe className="w-2.5 h-2.5" />
            {article.language === "zh" ? "中文" : "EN"}
          </span>

          {/* Source domain */}
          <span className="text-[10px] sm:text-[11px] text-[#9B8E7E] ml-auto truncate max-w-[120px] sm:max-w-none">
            {article.source}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-display text-sm sm:text-base font-semibold text-[#3D3229] leading-snug mb-1.5 sm:mb-2 group-hover:text-[#6B5E50] transition-colors line-clamp-2">
          {article.title}
        </h4>

        {/* Description */}
        {article.description && (
          <p className="text-xs sm:text-sm text-[#6B5E50] leading-relaxed line-clamp-2 mb-2.5 sm:mb-3">
            {article.description}
          </p>
        )}

        {/* External link indicator */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#B0A89E] group-hover:text-[#9B8E7E] transition-colors">
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          <span>{t.opensExternal[lang]}</span>
        </div>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section component                                             */
/* ------------------------------------------------------------------ */
export function RecommendedReading({
  kitId,
  kitColor,
}: {
  kitId: string;
  kitColor: string;
}) {
  const { lang } = useLanguage();
  const allArticles = getKitArticles(kitId);
  const [expanded, setExpanded] = useState(false);
  const [langFilter, setLangFilter] = useState<"all" | "en" | "zh">("all");

  // Separate editor picks from the rest
  const editorPicks = useMemo(
    () => allArticles.filter((a) => a.isEditorPick),
    [allArticles],
  );
  const remaining = useMemo(
    () => allArticles.filter((a) => !a.isEditorPick),
    [allArticles],
  );

  // Check if we have both languages
  const hasEnglish = allArticles.some((a) => a.language === "en");
  const hasChinese = allArticles.some((a) => a.language === "zh");
  const hasBothLanguages = hasEnglish && hasChinese;

  // Apply language filter to remaining articles
  const filteredRemaining = useMemo(() => {
    if (langFilter === "all") return remaining;
    return remaining.filter((a) => a.language === langFilter);
  }, [remaining, langFilter]);

  if (allArticles.length === 0) return null;

  return (
    <section className="pb-6 sm:pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: kitColor + "15" }}
            >
              <BookOpen
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                style={{ color: kitColor }}
              />
            </div>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-[#3D3229]">
              {t.sectionTitle[lang]}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#9B8E7E] ml-9 sm:ml-11">
            {t.sectionSubtitle[lang]}
          </p>
        </div>

        {/* Editor's Picks – always visible */}
        <div className="space-y-3 sm:space-y-4">
          {editorPicks.map((article, idx) => (
            <ArticleCard
              key={article.url + idx}
              article={article}
              kitColor={kitColor}
              isEditorPick
            />
          ))}
        </div>

        {/* Expand / collapse for remaining articles */}
        {remaining.length > 0 && (
          <>
            <div className="mt-4 sm:mt-5">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl border border-dashed border-[#D8D0C4] hover:border-[#C8BFB3] bg-[#FAF7F2] hover:bg-[#F5F0E8] text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-all active:scale-[0.99] min-h-[44px]"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    {t.showLess[lang]}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    {t.viewMore[lang]}
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8DFD3] text-[#6B5E50]">
                      {remaining.length} {t.moreCount[lang]}
                    </span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 sm:pt-5">
                    {/* Language filter tabs – only when both languages present */}
                    {hasBothLanguages && (
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 overflow-x-auto pb-1">
                        {(
                          [
                            { key: "all", label: t.allLang },
                            { key: "en", label: t.enLang },
                            { key: "zh", label: t.zhLang },
                          ] as const
                        ).map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setLangFilter(key)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[36px] ${
                              langFilter === key
                                ? "text-white shadow-sm"
                                : "bg-[#F5F0E8] text-[#6B5E50] hover:bg-[#EDE7DB]"
                            }`}
                            style={
                              langFilter === key
                                ? { backgroundColor: kitColor }
                                : undefined
                            }
                          >
                            {label[lang]}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Remaining article cards */}
                    <div className="space-y-3 sm:space-y-4">
                      {filteredRemaining.map((article, idx) => (
                        <ArticleCard
                          key={article.url + idx}
                          article={article}
                          kitColor={kitColor}
                          isEditorPick={false}
                        />
                      ))}
                      {filteredRemaining.length === 0 && (
                        <p className="text-center text-sm text-[#9B8E7E] py-4">
                          {lang === "cn"
                            ? "该语言暂无更多文章"
                            : "No more articles in this language"}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
