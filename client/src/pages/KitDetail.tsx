/*
 * Design: Montessori Naturalism / Scandinavian Minimalism
 * Mobile-first responsive design with referral module
 * Supports discontinued and new toy badges
 * Full CN/EN language toggle support
 */

import { getKitById, kits, type Toy } from "@/data/kits";
import { i18n } from "@/data/i18n";
import { getToyImage, getKitHeroImage, getKitToyImages } from "@/data/toyImages";
import { getToyReview } from "@/data/toyReviews";
import { getCleaningInfo } from "@/data/toyCleaningGuide";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
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
  ThumbsUp,
  ThumbsDown,
  Droplets,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "wouter";
import Lightbox from "@/components/Lightbox";
import { RewardBanner } from "@/components/RewardBanner";
import { AlternativesSection } from "@/components/AlternativesSection";
import { getToyAlternatives } from "@/data/alternatives";

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
  onImageClick,
}: {
  toy: Toy;
  index: number;
  kitColor: string;
  kitId: string;
  onImageClick?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { lang } = useLanguage();
  const toyImage = getToyImage(kitId, index);
  const isDiscontinued = (toy as any).discontinued;
  const isNew = (toy as any).isNew;
  const hasDetails = !!(toy.developmentGoal && toy.parentReview);
  const toyReview = getToyReview(kitId, toy.name);
  const cleaningInfo = getCleaningInfo(kitId, toy.name);
  const toyAlternatives = getToyAlternatives(kitId, toy.englishName);

  const toyName = lang === "cn" ? toy.name : toy.englishName;
  const toySubName = lang === "cn" ? toy.englishName : toy.name;
  const howToUse = lang === "en" && toy.howToUseEn ? toy.howToUseEn : toy.howToUse;
  const devGoal = lang === "en" && toy.developmentGoalEn ? toy.developmentGoalEn : toy.developmentGoal;
  const parentRev = lang === "en" && toy.parentReviewEn ? toy.parentReviewEn : toy.parentReview;
  const category = lang === "en" && toy.categoryEn ? toy.categoryEn : toy.category;

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
            <div
              className="w-full sm:w-24 md:w-28 aspect-square sm:aspect-square rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-[#FAF7F2] border border-[#F0EBE3] flex items-center justify-center p-3 sm:p-2 max-w-[200px] mx-auto sm:mx-0 sm:max-w-none cursor-zoom-in hover:border-[#C8BFB3] hover:shadow-md transition-all"
              onClick={onImageClick}
            >
              <img
                src={toyImage}
                alt={toy.englishName}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 text-lg sm:text-xl font-['Manrope'] text-white mx-auto sm:mx-0"
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
              <h3 className="font-['Manrope'] text-base sm:text-xl text-[#3D3229] leading-snug">
                {toyName}
              </h3>
              {isDiscontinued && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#F5E6D8] text-[#A0845C] border border-[#E8D5BF]">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {i18n.kitDetail.discontinued[lang]}
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#E8F5E9] text-[#4CAF50] border border-[#C8E6C9]">
                  <Sparkles className="w-2.5 h-2.5" />
                  {i18n.kitDetail.newOnSite[lang]}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#9B8E7E] mb-1.5 sm:mb-2">{toySubName}</p>
            <span
              className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
              style={{ backgroundColor: kitColor + "15", color: kitColor }}
            >
              {category}
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
              {i18n.kitDetail.howToUse[lang]}
            </p>
            <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed">{howToUse}</p>
          </div>
        </div>
      </div>

      {/* Expandable sections */}
      {hasDetails && (
        <>
          <div className="px-4 sm:px-6 pb-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between py-3 text-xs sm:text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors border-t border-[#F0EBE3] min-h-[44px]"
            >
              <span>{expanded ? i18n.kitDetail.collapse[lang] : i18n.kitDetail.expand[lang]}</span>
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
                  {devGoal && (
                    <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#F0F7F1]">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-[#7FB685]" />
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-[#7FB685] uppercase tracking-wider mb-1 sm:mb-1.5">
                          {i18n.kitDetail.devGoal[lang]}
                        </p>
                        <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed">
                          {devGoal}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pros & Cons Review */}
                  {toyReview && (
                    <div className="rounded-lg sm:rounded-xl border border-[#E8DFD3] overflow-hidden">
                      {/* Section Header */}
                      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#FAF7F2] to-[#F5F0EB] border-b border-[#E8DFD3]">
                        <p className="text-[10px] sm:text-xs font-semibold text-[#6B5E50] uppercase tracking-wider flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-[#D4A574]" />
                          {i18n.kitDetail.prosConsTitle[lang]}
                        </p>
                      </div>
                      {/* Pros & Cons Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E8DFD3]">
                        {/* Pros */}
                        <div className="p-3 sm:p-4 bg-[#F6FBF6]">
                          <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                              <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4CAF50]" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-[#2E7D32]">
                              {i18n.kitDetail.prosTitle[lang]}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed pl-8 sm:pl-9">
                            {toyReview.pros}
                          </p>
                        </div>
                        {/* Cons */}
                        <div className="p-3 sm:p-4 bg-[#FFFBF5]">
                          <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                              <ThumbsDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F57C00]" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-[#E65100]">
                              {i18n.kitDetail.consTitle[lang]}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed pl-8 sm:pl-9">
                            {toyReview.cons}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amazon Alternatives */}
                  {toyAlternatives && toyAlternatives.length > 0 && (
                    <AlternativesSection
                      alternatives={toyAlternatives}
                      toyName={toy.englishName}
                      toyNameCn={toy.name}
                    />
                  )}

                  {/* Cleaning Guide */}
                  {cleaningInfo && (
                    <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#F0F4F8]">
                      <Droplets className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-[#5B9BD5]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5 sm:mb-2">
                          <p className="text-[10px] sm:text-xs font-semibold text-[#5B9BD5] uppercase tracking-wider">
                            {i18n.kitDetail.cleaningTitle[lang]}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-[#E3EDF7] text-[#3D6B99] border border-[#C5D9ED]">
                            {lang === "cn" ? cleaningInfo.materialCn : cleaningInfo.materialEn}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed">
                          {lang === "cn" ? cleaningInfo.cleaningCn : cleaningInfo.cleaningEn}
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

/* Referral Module */
function ReferralCard({ kitId, kitColor }: { kitId: string; kitColor: string }) {
  const { lang } = useLanguage();
  const purchaseUrl = getKitPurchaseUrl(kitId);
  const referralUrl = getReferralUrl();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8DFD3] bg-gradient-to-br from-white via-[#FFFCF8] to-[#FFF8F0]">
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
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: kitColor + "12" }}
          >
            <Gift className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: kitColor }} />
          </div>

          <div className="flex-1">
            <h3 className="font-['Manrope'] text-lg sm:text-xl md:text-2xl text-[#3D3229] mb-2 sm:mb-3">
              {i18n.referral.title[lang]}
            </h3>
            <p className="text-sm sm:text-base text-[#6B5E50] leading-relaxed mb-4 sm:mb-6">
              {i18n.referral.desc[lang]}
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
                {i18n.referral.buyKit[lang]}
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
              <a
                href={referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition-all hover:shadow-sm active:scale-[0.98]"
                style={{ borderColor: kitColor + "40", color: kitColor }}
              >
                {i18n.referral.learnReferral[lang]}
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            <p className="text-[10px] sm:text-xs text-[#B0A89E] mt-3 sm:mt-4">
              {lang === "cn" ? `推荐码：${REFERRAL_CODE} · ` : `Referral code: ${REFERRAL_CODE} · `}
              {i18n.referral.disclaimer[lang]}
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
  const { lang } = useLanguage();

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (kit) {
      document.title = `${kit.name} | Lovevery Fans`;
    }
    return () => {
      document.title = "Lovevery Fans";
    };
  }, [params.id, kit]);

  if (!kit) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-['Manrope'] text-2xl sm:text-3xl text-[#3D3229] mb-4">
            {i18n.kitDetail.notFound[lang]}
          </h1>
          <Link href="/">
            <span className="text-[#7FB685] hover:underline">{i18n.kitDetail.backHome[lang]}</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = kits.findIndex((k) => k.id === kit.id);
  const prevKit = currentIndex > 0 ? kits[currentIndex - 1] : null;
  const nextKit = currentIndex < kits.length - 1 ? kits[currentIndex + 1] : null;
  const heroImage = getKitHeroImage(kit.id);

  const categories = Array.from(
    new Set(
      kit.toys
        .filter((t) => !(t as any).discontinued)
        .flatMap((t) => {
          const cat = lang === "en" && t.categoryEn ? t.categoryEn : t.category;
          return cat.split("/");
        })
        .filter((c) => c !== "官网新增" && c !== "New")
    )
  );

  const activeToys = kit.toys.filter((t) => !(t as any).discontinued);
  const discontinuedToys = kit.toys.filter((t) => (t as any).discontinued);

  const kitDescription = lang === "en" && kit.descriptionEn ? kit.descriptionEn : kit.description;
  const kitAgeRange = lang === "en" && kit.ageRangeEn ? kit.ageRangeEn : kit.ageRange;
  const kitStageLabel = lang === "en" && kit.stageLabelEn ? kit.stageLabelEn : kit.stageLabel;

  // Lightbox handlers
  const allToyImages = getKitToyImages(kit.id);
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);
  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % allToyImages.length);
  }, [allToyImages.length]);
  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + allToyImages.length) % allToyImages.length);
  }, [allToyImages.length]);

  return (
    <>
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span className="flex items-center gap-1.5 sm:gap-2 text-[#6B5E50] hover:text-[#3D3229] transition-colors min-h-[44px] items-center">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">{i18n.kitDetail.backToAll[lang]}</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link href="/">
                <span className="font-['Manrope'] text-base sm:text-lg text-[#3D3229]">
                  Lovevery
                </span>
              </Link>
            </div>
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
                {kitStageLabel} · {kitAgeRange}
              </div>

              <h1 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1108] mb-4 sm:mb-6 leading-tight">
                {kit.name}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#3D3229] leading-relaxed max-w-3xl">
                {kitDescription}
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
                    <p className="text-xl sm:text-2xl font-['Manrope'] text-[#3D3229]">
                      {activeToys.length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#9B8E7E]">{i18n.kitDetail.toyCount[lang]}</p>
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
                    <p className="text-xl sm:text-2xl font-['Manrope'] text-[#3D3229]">
                      {kitAgeRange}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#9B8E7E]">{i18n.kitDetail.ageLabel[lang]}</p>
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
                  <p className="text-[10px] sm:text-xs text-[#9B8E7E] mt-1.5 sm:mt-2">{i18n.kitDetail.devAreas[lang]}</p>
                </div>
              </div>
            </div>

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
              <h2 className="font-['Manrope'] text-xl sm:text-2xl md:text-3xl text-[#3D3229]">
                {i18n.kitDetail.toyList[lang]}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#9B8E7E] ml-9 sm:ml-11">
              {i18n.kitDetail.toyListDesc[lang]}
            </p>
          </div>

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
                    onImageClick={openLightbox}
                  />
                );
              })}
          </div>

          {discontinuedToys.length > 0 && (
            <div className="mt-8 sm:mt-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-[#F5E6D8]">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A0845C]" />
                </div>
                <div>
                  <h3 className="font-['Manrope'] text-base sm:text-lg text-[#6B5E50]">
                    {i18n.kitDetail.oldToys[lang]}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#B0A89E]">
                    {i18n.kitDetail.oldToysDesc[lang]}
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
                      onImageClick={openLightbox}
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
          <RewardBanner />
        </div>
      </section>

      {/* Navigation between kits */}
      <section className="border-t border-[#E8DFD3] bg-white/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-center text-xs sm:text-sm text-[#9B8E7E] mb-4 sm:mb-6">{i18n.kitDetail.exploreMore[lang]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {prevKit ? (
              <Link href={`/kit/${prevKit.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] hover:shadow-md transition-all cursor-pointer active:scale-[0.98] min-h-[44px]">
                  <p className="text-[10px] sm:text-xs text-[#9B8E7E] mb-1.5 sm:mb-2 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    {i18n.kitDetail.prevKit[lang]}
                  </p>
                  <p className="font-['Manrope'] text-base sm:text-lg text-[#3D3229] group-hover:text-[#6B5E50] transition-colors">
                    {prevKit.name}
                  </p>
                  <p className="text-xs sm:text-sm text-[#9B8E7E] mt-0.5 sm:mt-1">
                    {lang === "en" && prevKit.ageRangeEn ? prevKit.ageRangeEn : prevKit.ageRange}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {nextKit ? (
              <Link href={`/kit/${nextKit.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] hover:shadow-md transition-all text-right cursor-pointer active:scale-[0.98] min-h-[44px]">
                  <p className="text-[10px] sm:text-xs text-[#9B8E7E] mb-1.5 sm:mb-2 flex items-center justify-end gap-1">
                    {i18n.kitDetail.nextKit[lang]}
                    <ArrowRight className="w-3 h-3" />
                  </p>
                  <p className="font-['Manrope'] text-base sm:text-lg text-[#3D3229] group-hover:text-[#6B5E50] transition-colors">
                    {nextKit.name}
                  </p>
                  <p className="text-xs sm:text-sm text-[#9B8E7E] mt-0.5 sm:mt-1">
                    {lang === "en" && nextKit.ageRangeEn ? nextKit.ageRangeEn : nextKit.ageRange}
                  </p>
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
          <h3 className="font-['Manrope'] text-lg sm:text-xl mb-2 sm:mb-3">Lovevery</h3>
          <p className="text-xs sm:text-sm text-[#8B7E70]">
            {i18n.footer.tagline[lang]}
          </p>
        </div>
      </footer>
    </div>
    {lightboxOpen && allToyImages.length > 0 && (
      <Lightbox
        images={allToyImages}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />
    )}
    </>
  );
}
