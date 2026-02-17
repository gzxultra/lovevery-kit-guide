/*
 * Design: Montessori Naturalism / Scandinavian Minimalism
 * Mobile-first responsive design with referral module
 * Supports discontinued and new toy badges
 */

import { getKitById, kits, type Toy } from "@/data/kits";
import { getToyImage, getKitHeroImage } from "@/data/toyImages";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Target,
  MessageSquare,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Puzzle,
  Star,
  Heart,
  Gift,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";

const REFERRAL_CODE = "REF-6AA44A5A";

function getKitPurchaseUrl(kitSlug: string) {
  return `https://lovevery.com/products/the-play-kits-the-${kitSlug}?discount_code=${REFERRAL_CODE}`;
}

function getReferralUrl() {
  return `https://lovevery.com/pages/refer-a-friend?discount_code=${REFERRAL_CODE}`;
}

function ToyCard({
  toy,
  index,
  kitColor,
  kitId,
}: {
  toy: Toy;
  index: number;
  kitColor: string;
  kitId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const toyImage = getToyImage(kitId, index);
  const isDiscontinued = (toy as any).discontinued;
  const isNew = (toy as any).isNew;
  const hasDetails = !!(toy.developmentGoal && toy.parentReview);

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl border overflow-hidden hover:shadow-lg hover:shadow-[#3D3229]/5 transition-shadow ${
        isDiscontinued ? "border-[#E8DFD3] opacity-70" : "border-[#E8DFD3]"
      }`}
    >
      {/* Toy Header with Image */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
          {/* Toy Image */}
          {toyImage ? (
            <div className="w-full sm:w-24 md:w-28 aspect-square sm:aspect-square rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-[#FAF7F2] border border-[#F0EBE3] flex items-center justify-center p-3 sm:p-2 max-w-[200px] mx-auto sm:mx-0 sm:max-w-none">
              <img
                src={toyImage}
                alt={toy.englishName}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 text-lg sm:text-xl font-['DM_Serif_Display'] text-white mx-auto sm:mx-0"
              style={{ backgroundColor: kitColor }}
            >
              {index + 1}
            </div>
          )}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: kitColor }}
              >
                {index + 1}
              </span>
              <h3 className="font-['DM_Serif_Display'] text-base sm:text-xl text-[#3D3229] leading-snug">
                {toy.name}
              </h3>
              {isDiscontinued && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#F5E6D8] text-[#A0845C] border border-[#E8D5BF]">
                  <AlertCircle className="w-2.5 h-2.5" />
                  旧版
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#E8F5E9] text-[#4CAF50] border border-[#C8E6C9]">
                  <Sparkles className="w-2.5 h-2.5" />
                  官网新增
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#9B8E7E] mb-1.5 sm:mb-2">{toy.englishName}</p>
            <span
              className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
              style={{ backgroundColor: kitColor + "15", color: kitColor }}
            >
              {toy.category}
            </span>
          </div>
        </div>
      </div>

      {/* How to Use - Always visible */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4">
        <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#FAF7F2]">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-[#D4A574]" />
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#D4A574] uppercase tracking-wider mb-1 sm:mb-1.5">
              使用方法
            </p>
            <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed">{toy.howToUse}</p>
          </div>
        </div>
      </div>

      {/* Expandable sections - only show if there are real details */}
      {hasDetails && (
        <>
          <div className="px-4 sm:px-6 pb-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between py-3 text-xs sm:text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors border-t border-[#F0EBE3] min-h-[44px]"
            >
              <span>{expanded ? "收起详情" : "查看发展目标和家长评价"}</span>
              {expanded ? (
                <ChevronUp className="w-4 h-4 shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 shrink-0 ml-2" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
                  {/* Development Goal */}
                  {toy.developmentGoal && (
                    <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#F0F7F1]">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-[#7FB685]" />
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-[#7FB685] uppercase tracking-wider mb-1 sm:mb-1.5">
                          发展目标
                        </p>
                        <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed">
                          {toy.developmentGoal}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Parent Review */}
                  {toy.parentReview && (
                    <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#F5F0F8]">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-[#9B7DB8]" />
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-[#9B7DB8] uppercase tracking-wider mb-1 sm:mb-1.5">
                          家长评价
                        </p>
                        <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed italic">
                          &ldquo;{toy.parentReview}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/* Referral Module - warm, gentle presentation */
function ReferralCard({ kitId, kitColor }: { kitId: string; kitColor: string }) {
  const purchaseUrl = getKitPurchaseUrl(kitId);
  const referralUrl = getReferralUrl();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8DFD3] bg-gradient-to-br from-white via-[#FFFCF8] to-[#FFF8F0]">
      {/* Subtle decorative elements */}
      <div
        className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full opacity-[0.04] -translate-y-1/2 translate-x-1/4"
        style={{ backgroundColor: kitColor }}
      />
      <div
        className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 rounded-full opacity-[0.04] translate-y-1/2 -translate-x-1/4"
        style={{ backgroundColor: kitColor }}
      />

      <div className="relative p-5 sm:p-8 md:p-10">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Icon */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: kitColor + "12" }}
          >
            <Gift className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: kitColor }} />
          </div>

          <div className="flex-1">
            <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl md:text-2xl text-[#3D3229] mb-2 sm:mb-3">
              觉得不错？分享给朋友一起买
            </h3>
            <p className="text-sm sm:text-base text-[#6B5E50] leading-relaxed mb-4 sm:mb-6">
              如果这份指南对你有帮助，欢迎通过下面的链接下单购买。使用我的推荐链接，你和我都可以获得 Lovevery 的优惠。每一份支持都是对这个项目最好的鼓励 ❤️
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                style={{ backgroundColor: kitColor }}
              >
                <Heart className="w-4 h-4" />
                购买这个 Play Kit
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
              <a
                href={referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition-all hover:shadow-sm active:scale-[0.98]"
                style={{ borderColor: kitColor + "40", color: kitColor }}
              >
                了解推荐计划
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            <p className="text-[10px] sm:text-xs text-[#B0A89E] mt-3 sm:mt-4">
              推荐码：{REFERRAL_CODE} · 本站为非官方指南，与 Lovevery 无隶属关系
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KitDetail() {
  const params = useParams<{ id: string }>();
  const kit = getKitById(params.id || "");

  // Scroll to top on kit change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.id]);

  if (!kit) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-[#3D3229] mb-4">
            未找到该 Kit
          </h1>
          <Link href="/">
            <span className="text-[#7FB685] hover:underline">返回首页</span>
          </Link>
        </div>
      </div>
    );
  }

  // Find prev and next kits
  const currentIndex = kits.findIndex((k) => k.id === kit.id);
  const prevKit = currentIndex > 0 ? kits[currentIndex - 1] : null;
  const nextKit = currentIndex < kits.length - 1 ? kits[currentIndex + 1] : null;

  // Get kit hero image from Lovevery
  const heroImage = getKitHeroImage(kit.id);

  // Get all categories (excluding placeholder categories)
  const categories = Array.from(
    new Set(
      kit.toys
        .filter((t) => !(t as any).discontinued)
        .flatMap((t) => t.category.split("/"))
        .filter((c) => c !== "官网新增")
    )
  );

  // Count active vs discontinued
  const activeToys = kit.toys.filter((t) => !(t as any).discontinued);
  const discontinuedToys = kit.toys.filter((t) => (t as any).discontinued);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span className="flex items-center gap-1.5 sm:gap-2 text-[#6B5E50] hover:text-[#3D3229] transition-colors min-h-[44px] items-center">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">返回全部 Kit</span>
              </span>
            </Link>
            <Link href="/">
              <span className="font-['DM_Serif_Display'] text-base sm:text-lg text-[#3D3229]">
                Lovevery
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Kit Header with Hero Image */}
      <section className="relative overflow-hidden">
        <div
          className="h-1.5 sm:h-2 w-full"
          style={{ backgroundColor: kit.color }}
        />
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, ${kit.color} 0%, transparent 40%), radial-gradient(circle at 80% 70%, ${kit.color} 0%, transparent 40%)`,
          }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 relative z-10">
          {/* Mobile: Hero image on top */}
          {heroImage && (
            <div className="md:hidden mb-6 flex justify-center">
              <div className="w-48 sm:w-56 aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] shadow-lg shadow-[#3D3229]/5 p-3">
                <img
                  src={heroImage}
                  alt={`${kit.name} Play Kit`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-[1fr_auto] gap-6 sm:gap-8 items-start">
            <div>
              <div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6"
                style={{ backgroundColor: kit.color + "20", color: kit.color }}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {kit.stageLabel} · {kit.ageRange}
              </div>

              <h1 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1108] mb-4 sm:mb-6 leading-tight">
                {kit.name}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#3D3229] leading-relaxed max-w-3xl">
                {kit.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10 mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-[#E8DFD3]/80">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: kit.color + "15" }}
                  >
                    <Puzzle className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: kit.color }} />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-['DM_Serif_Display'] text-[#3D3229]">
                      {activeToys.length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#9B8E7E]">个玩具</p>
                  </div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-[#E8DFD3] hidden sm:block" />
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: kit.color + "15" }}
                  >
                    <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: kit.color }} />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-['DM_Serif_Display'] text-[#3D3229]">
                      {kit.ageRange}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#9B8E7E]">适用月龄</p>
                  </div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-[#E8DFD3] hidden sm:block" />
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium"
                        style={{ backgroundColor: kit.color + "12", color: kit.color }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#9B8E7E] mt-1.5 sm:mt-2">发展领域</p>
                </div>
              </div>
            </div>

            {/* Kit Hero Image - desktop */}
            {heroImage && (
              <div className="hidden md:block w-56 lg:w-72 shrink-0">
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] shadow-lg shadow-[#3D3229]/5 p-4">
                  <img
                    src={heroImage}
                    alt={`${kit.name} Play Kit`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Toys List */}
      <section className="pb-6 sm:pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: kit.color + "15" }}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: kit.color }} />
              </div>
              <h2 className="font-['DM_Serif_Display'] text-xl sm:text-2xl md:text-3xl text-[#3D3229]">
                玩具清单
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#9B8E7E] ml-9 sm:ml-11">
              点击每个玩具卡片查看详细的发展目标和家长评价
            </p>
          </div>

          {/* Active toys */}
          <div className="space-y-3 sm:space-y-5">
            {kit.toys
              .filter((t) => !(t as any).discontinued)
              .map((toy, idx) => {
                const originalIndex = kit.toys.indexOf(toy);
                return (
                  <ToyCard
                    key={toy.englishName + idx}
                    toy={toy}
                    index={originalIndex}
                    kitColor={kit.color}
                    kitId={kit.id}
                  />
                );
              })}
          </div>

          {/* Discontinued toys section */}
          {discontinuedToys.length > 0 && (
            <div className="mt-8 sm:mt-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-[#F5E6D8]">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A0845C]" />
                </div>
                <div>
                  <h3 className="font-['DM_Serif_Display'] text-base sm:text-lg text-[#6B5E50]">
                    旧版玩具
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#B0A89E]">
                    以下玩具在当前版本的 Kit 中已不再包含，仅供参考
                  </p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-5">
                {discontinuedToys.map((toy, idx) => {
                  const originalIndex = kit.toys.indexOf(toy);
                  return (
                    <ToyCard
                      key={toy.englishName + idx}
                      toy={toy}
                      index={originalIndex}
                      kitColor={kit.color}
                      kitId={kit.id}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Referral Module */}
      <section className="pb-10 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReferralCard kitId={kit.id} kitColor={kit.color} />
        </div>
      </section>

      {/* Navigation between kits */}
      <section className="border-t border-[#E8DFD3] bg-white/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-center text-xs sm:text-sm text-[#9B8E7E] mb-4 sm:mb-6">继续探索其他 Kit</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {prevKit ? (
              <Link href={`/kit/${prevKit.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] hover:shadow-md transition-all cursor-pointer active:scale-[0.98] min-h-[44px]">
                  <p className="text-[10px] sm:text-xs text-[#9B8E7E] mb-1.5 sm:mb-2 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    上一个 Kit
                  </p>
                  <p className="font-['DM_Serif_Display'] text-base sm:text-lg text-[#3D3229] group-hover:text-[#6B5E50] transition-colors">
                    {prevKit.name}
                  </p>
                  <p className="text-xs sm:text-sm text-[#9B8E7E] mt-0.5 sm:mt-1">{prevKit.ageRange}</p>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {nextKit ? (
              <Link href={`/kit/${nextKit.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] hover:shadow-md transition-all text-right cursor-pointer active:scale-[0.98] min-h-[44px]">
                  <p className="text-[10px] sm:text-xs text-[#9B8E7E] mb-1.5 sm:mb-2 flex items-center justify-end gap-1">
                    下一个 Kit
                    <ArrowRight className="w-3 h-3" />
                  </p>
                  <p className="font-['DM_Serif_Display'] text-base sm:text-lg text-[#3D3229] group-hover:text-[#6B5E50] transition-colors">
                    {nextKit.name}
                  </p>
                  <p className="text-xs sm:text-sm text-[#9B8E7E] mt-0.5 sm:mt-1">{nextKit.ageRange}</p>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D3229] text-white py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl mb-2 sm:mb-3">Lovevery</h3>
          <p className="text-xs sm:text-sm text-[#8B7E70]">
            Play Kit 使用说明书 — 非官方指南
          </p>
        </div>
      </footer>
    </div>
  );
}
