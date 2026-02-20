/*
 * Design: Montessori Naturalism / Scandinavian Minimalism
 * Mobile-first responsive design with referral module
 * Supports discontinued and new toy badges
 * Full CN/EN language toggle support
 */

import { getKitById, kits, type Toy } from "@/data/kits";
import { i18n } from "@/data/i18n";
import { getToyImage, getKitHeroImage, getKitToyImages } from "@/data/toyImages";
import { getToyThumbnailUrl, getKitHeroOptimizedUrl, getLightboxImageUrl } from "@/lib/imageUtils";
import { getToyReview } from "@/data/toyReviews";
import { getCleaningInfo } from "@/data/toyCleaningGuide";
import { getKitSeoData } from "@/data/seoData";
import { applyKitPageSeo, cleanupKitPageSeo } from "@/lib/seoHelpers";
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
import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Link, useParams } from "wouter";
import Lightbox from "@/components/Lightbox";
import { RewardBanner } from "@/components/RewardBanner";
import { RecommendedReading } from "@/components/RecommendedReading";
import { AlternativesSection } from "@/components/AlternativesSection";
import { getToyAlternatives, alternatives as allAlternatives } from "@/data/alternatives";

const REFERRAL_CODE = "REF-6AA44A5A";

function getKitPurchaseUrl(kitSlug: string) {
  return `https://lovevery.com/products/the-play-kits-the-${kitSlug}?discount_code=${REFERRAL_CODE}`;
}

function getReferralUrl() {
  return `https://lovevery.com/pages/refer-a-friend?discount_code=${REFERRAL_CODE}`;
}

const ToyCard = memo(function ToyCard({
  toy,
  index,
  kitColor,
  kitId,
  kitName,
  onImageClick,
}: {
  toy: Toy;
  index: number;
  kitColor: string;
  kitId: string;
  kitName: string;
  onImageClick?: (index: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userInteracted, setUserInteracted] = useState(false); // Track if user manually clicked
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

  // Handle hover with debounce for desktop only
  const handleMouseEnter = () => {
    if (!hasDetails || userInteracted) return; // Don't auto-expand if user manually interacted
    // Only enable hover on desktop (screen width > 640px)
    if (typeof window !== 'undefined' && window.innerWidth <= 640) return;
    const timeout = setTimeout(() => {
      setExpanded(true);
      
      // Send GA event when expanding to view alternatives
      if (toyAlternatives && toyAlternatives.length > 0) {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "view_alternatives", {
            toy_name: toy.englishName,
            kit_name: kitName,
          });
        }
      }
    }, 250); // 250ms debounce
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Only enable hover on desktop (screen width > 640px)
    if (typeof window !== 'undefined' && window.innerWidth <= 640) return;
    if (!userInteracted) {
      setExpanded(false); // Only auto-collapse if user hasn't manually interacted
    }
  };

  // Handle click for mobile
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasDetails) return;
    setUserInteracted(true); // Mark that user has manually interacted
    const willExpand = !expanded;
    setExpanded(willExpand);
    
    if (typeof window !== "undefined" && window.gtag) {
      // 3a. Module expand/collapse event
      window.gtag("event", willExpand ? "module_expand" : "module_collapse", {
        toy_name: toy.englishName,
        kit_name: kitName,
      });

      // Send GA event when expanding to view alternatives
      if (willExpand && toyAlternatives && toyAlternatives.length > 0) {
        window.gtag("event", "view_alternatives", {
          toy_name: toy.englishName,
          kit_name: kitName,
        });
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl border overflow-hidden hover:shadow-xl hover:shadow-[#3D3229]/8 transition-all duration-300 ${
        isDiscontinued ? "border-[#E8DFD3] opacity-70" : "border-[#E8DFD3] hover:border-[#D0C8BC]"
      } hover-expand-card`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Toy Header with Image */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
          {/* Toy Image */}
          {toyImage ? (
            <div
              className="w-full sm:w-24 md:w-28 aspect-square sm:aspect-square rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-[#FAF7F2] border border-[#F0EBE3] flex items-center justify-center p-3 sm:p-2 max-w-[200px] mx-auto sm:mx-0 sm:max-w-none cursor-zoom-in hover:border-[#C8BFB3] hover:shadow-md transition-all"
              onClick={() => onImageClick?.(index)}
            >
              <img
                src={getToyThumbnailUrl(toyImage)}
                alt={`${toy.englishName} - Lovevery ${kitName} Play Kit educational toy`}
                className="w-full h-full object-contain"
                loading="lazy"
                width={224}
                height={224}
                decoding="async"
              />
            </div>
          ) : (
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 text-lg sm:text-xl font-display text-white mx-auto sm:mx-0"
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
              <h3 className="font-display text-base sm:text-xl text-[#3D3229] leading-snug">
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
            <p className="text-xs sm:text-sm text-[#756A5C] mb-1.5 sm:mb-2">{toySubName}</p>
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
              onClick={handleClick}
              className="w-full flex items-center justify-between py-3 text-xs sm:text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors border-t border-[#F0EBE3] min-h-[44px] mobile-expand-trigger"
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
                      kitName={kitName}
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
});

/* Referral Module */
function ReferralCard({ kitId, kitColor }: { kitId: string; kitColor: string }) {
  const { lang } = useLanguage();
  const purchaseUrl = getKitPurchaseUrl(kitId);
  const referralUrl = getReferralUrl();

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFD3] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: kitColor + "12" }}
        >
          <Gift className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: kitColor }} />
        </div>

        <div className="flex-1">
          <h3 className="font-display text-xl sm:text-2xl text-[#3D3229] mb-3">
            {i18n.referral.title[lang]}
          </h3>
          <p className="text-sm sm:text-base text-[#6B5E50] leading-relaxed mb-6">
            {i18n.referral.desc[lang]}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3D3229] text-white rounded-full text-sm font-medium hover:bg-[#2A231C] hover:shadow-lg hover:shadow-[#3D3229]/20 transition-all duration-300 active:scale-[0.98] min-h-[48px]"
            >
              <Heart className="w-4 h-4" />
              {i18n.referral.buyKit[lang]}
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#3D3229] rounded-full text-sm font-medium border border-[#E8DFD3] hover:bg-[#F5F0E8] transition-all duration-300 active:scale-[0.98] min-h-[48px]"
            >
              {i18n.referral.learnReferral[lang]}
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          <p className="text-[10px] sm:text-xs text-[#B0A89E] mt-4">
            {lang === "cn" ? `推荐码：${REFERRAL_CODE} · ` : `Referral code: ${REFERRAL_CODE} · `}
            {i18n.referral.disclaimer[lang]}
          </p>
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

  // SEO data for this kit
  const seoData = kit ? getKitSeoData(kit.id) : undefined;

  // Get alternatives data for structured data
  const kitAlternatives = useMemo(() => {
    if (!kit) return [];
    const kitAlt = allAlternatives.find((k) => k.kitId === kit.id);
    return kitAlt?.toys || [];
  }, [kit]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (kit) {
      // Apply comprehensive SEO tags
      const metaTitle = lang === "cn" && seoData?.metaTitleCn
        ? seoData.metaTitleCn
        : seoData?.metaTitleEn || `${kit.name} | Lovevery Fans`;
      const metaDesc = lang === "cn" && seoData?.metaDescriptionCn
        ? seoData.metaDescriptionCn
        : seoData?.metaDescriptionEn || `${kit.name} Play Kit guide with parent reviews and affordable Amazon alternatives.`;

      applyKitPageSeo({
        kitId: kit.id,
        kitName: kit.name,
        ageRange: kit.ageRange,
        ageRangeEn: kit.ageRangeEn || kit.ageRange,
        description: kit.description,
        descriptionEn: kit.descriptionEn || kit.description,
        metaTitle: metaTitle,
        metaDescription: metaDesc,
        toyCount: kit.toys.filter((t) => !(t as any).discontinued).length,
        stage: kit.stage,
        color: kit.color,
        toys: kit.toys.filter((t) => !(t as any).discontinued).map((t) => ({
          name: t.name,
          englishName: t.englishName,
          category: t.categoryEn || t.category,
        })),
        alternatives: kitAlternatives.map((ta) => ({
          toyName: ta.toyName,
          alternatives: ta.alternatives.map((a) => ({
            name: a.name,
            price: a.price,
            rating: a.rating,
            reviewCount: a.reviewCount,
            amazonUrl: a.amazonUrl,
          })),
        })),
      });

      // Send Google Analytics event for kit view
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "view_kit", {
          kit_name: kit.name,
          kit_age_range: kit.ageRange,
        });
      }
    }
    return () => {
      cleanupKitPageSeo();
    };
  }, [params.id, kit, lang, seoData, kitAlternatives]);

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
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-lg border-b border-[#E8DFD3]/70 shadow-sm shadow-[#3D3229]/3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span className="group flex items-center gap-1.5 sm:gap-2 text-[#6B5E50] hover:text-[#3D3229] transition-colors min-h-[44px] items-center">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs sm:text-sm font-medium">{i18n.kitDetail.backToAll[lang]}</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link href="/">
                <span data-logo-target className="font-['Manrope'] text-base sm:text-lg text-[#3D3229] select-none hover:opacity-80 transition-opacity">
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
          className="h-1 sm:h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${kit.color}, ${kit.color}88, ${kit.color}44)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 25%, ${kit.color} 0%, transparent 35%), radial-gradient(circle at 85% 75%, ${kit.color} 0%, transparent 35%), radial-gradient(circle at 50% 50%, ${kit.color} 0%, transparent 50%)`,
          }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 relative z-10">
          {heroImage && (
            <div className="md:hidden mb-6 flex justify-center">
              <div className="w-48 sm:w-56 aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] shadow-lg shadow-[#3D3229]/5 p-3">
                <img
                  src={getKitHeroOptimizedUrl(heroImage)}
                  alt={`${kit.name} Play Kit - Lovevery alternatives and affordable dupes for ${kit.ageRangeEn || kit.ageRange}`}
                  className="w-full h-full object-contain"
                  width={576}
                  height={576}
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-[1fr_auto] gap-6 sm:gap-8 items-start">
            <div>
              <div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border"
                style={{ backgroundColor: kit.color + "12", color: kit.color, borderColor: kit.color + "25" }}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {kitStageLabel} · {kitAgeRange}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1108] tracking-tight leading-[1.1] mb-6 sm:mb-8">
                {kit.name[lang]}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#3D3229] leading-relaxed max-w-3xl">
                {kitDescription}
              </p>

              {/* SEO Description - Natural language text for search engines */}
              {seoData && (
                <p className="text-sm sm:text-base text-[#6B5E50] leading-relaxed max-w-3xl mt-3 sm:mt-4 opacity-90">
                  {lang === "cn" ? seoData.seoDescriptionCn : seoData.seoDescriptionEn}
                </p>
              )}

              {/* View on Lovevery Official Site Button */}
              {(kit.officialUrl || true) && (
                <div className="mt-5 sm:mt-6">
                  <a
                    href={(() => {
                      const url = kit.officialUrl || "https://lovevery.com/products/the-play-kits";
                      const separator = url.includes("?") ? "&" : "?";
                      return `${url}${separator}discount_code=${REFERRAL_CODE}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-sm font-medium border-2 transition-all hover:shadow-md active:scale-[0.98] group"
                    style={{
                      borderColor: kit.color,
                      color: kit.color,
                      backgroundColor: kit.color + "08",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = kit.color;
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = kit.color + "08";
                      e.currentTarget.style.color = kit.color;
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {i18n.kitDetail.viewOnLovevery[lang]}
                  </a>
                  {/* Subtle referral hint */}
                  <p className="mt-2 flex items-center justify-start gap-1.5 text-[10px] sm:text-xs text-[#756A5C]/60 opacity-70">
                    <Heart className="w-3 h-3 text-[#D4A574]/50" />
                    <span>
                      {lang === "cn"
                        ? "通过此链接购买可享折扣，同时支持本站运营"
                        : "Using this link supports our site & gives you a discount"}
                    </span>
                  </p>
                </div>
              )}

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
                    <p className="text-[10px] sm:text-xs text-[#756A5C]">{i18n.kitDetail.toyCount[lang]}</p>
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
                    <p className="text-[10px] sm:text-xs text-[#756A5C]">{i18n.kitDetail.ageLabel[lang]}</p>
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
                  <p className="text-[10px] sm:text-xs text-[#756A5C] mt-1.5 sm:mt-2">{i18n.kitDetail.devAreas[lang]}</p>
                </div>
              </div>
            </div>

            {heroImage && (
              <div className="hidden md:block w-56 lg:w-72 shrink-0">
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] shadow-xl shadow-[#3D3229]/8 ring-1 ring-black/5 p-4 hover:shadow-2xl transition-shadow duration-500">
                  <img
                    src={getKitHeroOptimizedUrl(heroImage)}
                    alt={`${kit.name} Play Kit overview - toys and Amazon alternatives for ${kit.ageRangeEn || kit.ageRange}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    width={576}
                    height={576}
                    decoding="async"
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
            <p className="text-xs sm:text-sm text-[#756A5C] ml-9 sm:ml-11">
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
                    kitName={kit.name}
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
                  <h3 className="font-display text-base sm:text-lg text-[#6B5E50]">
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
                      kitName={kit.name}
                      onImageClick={openLightbox}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recommended Reading */}
      <RecommendedReading kitId={kit.id} kitColor={kit.color} />

      {/* Referral Module */}
      <section className="pb-10 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <ReferralCard kitId={kit.id} kitColor={kit.color} />
          <RewardBanner />
        </div>
      </section>

      {/* Navigation between kits */}
      <section className="border-t border-[#E8DFD3] bg-gradient-to-b from-white to-[#FAF7F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-center text-xs sm:text-sm text-[#756A5C] mb-4 sm:mb-6 font-medium">{i18n.kitDetail.exploreMore[lang]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {prevKit ? (
              <Link href={`/kit/${prevKit.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] bg-white hover:shadow-lg hover:shadow-[#3D3229]/5 transition-all duration-300 cursor-pointer active:scale-[0.98] min-h-[44px]">
                  <p className="text-[10px] sm:text-xs text-[#756A5C] mb-1.5 sm:mb-2 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    {i18n.kitDetail.prevKit[lang]}
                  </p>
                  <p className="font-display text-base sm:text-lg text-[#3D3229] group-hover:text-[#1a1108] transition-colors">
                    {prevKit.name}
                  </p>
                  <p className="text-xs sm:text-sm text-[#756A5C] mt-0.5 sm:mt-1">
                    {lang === "en" && prevKit.ageRangeEn ? prevKit.ageRangeEn : prevKit.ageRange}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {nextKit ? (
              <Link href={`/kit/${nextKit.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] bg-white hover:shadow-lg hover:shadow-[#3D3229]/5 transition-all duration-300 text-right cursor-pointer active:scale-[0.98] min-h-[44px]">
                  <p className="text-[10px] sm:text-xs text-[#756A5C] mb-1.5 sm:mb-2 flex items-center justify-end gap-1">
                    {i18n.kitDetail.nextKit[lang]}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="font-display text-base sm:text-lg text-[#3D3229] group-hover:text-[#1a1108] transition-colors">
                    {nextKit.name}
                  </p>
                  <p className="text-xs sm:text-sm text-[#756A5C] mt-0.5 sm:mt-1">
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
      <footer className="relative bg-[#3D3229] text-white py-8 sm:py-12">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7FB685]/40 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 data-logo-target className="font-display text-lg sm:text-xl mb-2 sm:mb-3 select-none">Lovevery</h3>
          <p className="text-xs sm:text-sm text-[#9A8E82]">
            {i18n.footer.tagline[lang]}
          </p>
          <div data-rainbow-portal className="mt-3 flex justify-center" />
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
