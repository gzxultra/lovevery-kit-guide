/*
 * ProductDetail page for standalone Lovevery products (Music Set, Bath Set, Block Set, Play Gym)
 * Design: EXACTLY matches KitDetail's Montessori Naturalism / Scandinavian Minimalism style
 * - Same ToyCard layout with image, hover expand, How-to-Use always visible
 * - Same AlternativesSection integration with Amazon affiliate links
 * - Same ReferralCard module
 * - Same header, nav, footer structure
 * Supports CN/EN language toggle and Traditional Chinese auto-detection
 */
import { getProductById, standaloneProducts } from "@/data/standaloneProducts";
import type { Toy } from "@/data/kits";
import { getToyAlternatives } from "@/data/alternatives";
import { useLanguage } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import LanguageToggle from "@/components/LanguageToggle";
import { AlternativesSection } from "@/components/AlternativesSection";
import { RewardBanner } from "@/components/RewardBanner";
import { RecommendedReading } from "@/components/RecommendedReading";
import { trackEvent } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Puzzle,
  Star,
  Heart,
  Gift,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Link, useParams } from "wouter";

const REFERRAL_CODE = "REF-6AA44A5A";

/* ─── ToyCard — matches KitDetail ToyCard exactly ─── */
const ToyCard = memo(function ToyCard({
  toy,
  index,
  productColor,
  productId,
  productName,
}: {
  toy: Toy;
  index: number;
  productColor: string;
  productId: string;
  productName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const { lang, t, convert } = useLanguage();
  const i18n = useI18n();

  const toyAlternatives = getToyAlternatives(productId, toy.englishName);

  const toyName = lang === "cn" ? convert(toy.name) : toy.englishName;
  const toySubName = lang === "cn" ? toy.englishName : convert(toy.name);
  const howToUse = lang === "en" && toy.howToUseEn ? toy.howToUseEn : convert(toy.howToUse);
  const devGoal = lang === "en" && toy.developmentGoalEn ? toy.developmentGoalEn : convert(toy.developmentGoal || "");
  const parentRev = lang === "en" && toy.parentReviewEn ? toy.parentReviewEn : convert(toy.parentReview || "");
  const category = lang === "en" && toy.categoryEn ? toy.categoryEn : convert(toy.category || "");

  const hasDetails = !!(toy.developmentGoal && toy.parentReview);

  // Hover with debounce for desktop only — same as KitDetail
  const handleMouseEnter = () => {
    if (!hasDetails || userInteracted) return;
    if (typeof window !== "undefined" && window.innerWidth <= 640) return;
    const timeout = setTimeout(() => {
      setExpanded(true);
      if (toyAlternatives && toyAlternatives.length > 0) {
        trackEvent("view_alternatives", {
          toy_name: toy.englishName,
          kit_name: productName,
        });
      }
    }, 250);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    if (typeof window !== "undefined" && window.innerWidth <= 640) return;
    if (!userInteracted) {
      setExpanded(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasDetails) return;
    setUserInteracted(true);
    const willExpand = !expanded;
    setExpanded(willExpand);
    trackEvent(willExpand ? "module_expand" : "module_collapse", {
      module_name: "alternatives",
      toy_name: toy.englishName,
    });
    if (willExpand && toyAlternatives && toyAlternatives.length > 0) {
      trackEvent("view_alternatives", {
        toy_name: toy.englishName,
        kit_name: productName,
      });
    }
  };

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl border border-[#E8DFD3] overflow-hidden hover:shadow-xl hover:shadow-[#3D3229]/8 transition-all duration-300 hover:border-[#D0C8BC] hover-expand-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Toy Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
          {/* Number badge (no toy images for standalone products) */}
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 text-lg sm:text-xl font-display text-white mx-auto sm:mx-0"
            style={{ backgroundColor: productColor }}
          >
            {index + 1}
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: productColor }}
              >
                {index + 1}
              </span>
              <h3 className="font-display text-base sm:text-xl text-[#3D3229] leading-snug">
                {toyName}
              </h3>
              {(toy as any).isNew && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#E8F5E9] text-[#4CAF50] border border-[#C8E6C9]">
                  <Sparkles className="w-2.5 h-2.5" />
                  {i18n.kitDetail.newOnSite[lang]}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#756A5C] mb-1.5 sm:mb-2">{toySubName}</p>
            <span
              className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
              style={{ backgroundColor: productColor + "15", color: productColor }}
            >
              {category}
            </span>
          </div>
        </div>
      </div>

      {/* How to Use — Always visible, same yellow bg as KitDetail */}
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

      {/* Expandable sections — same as KitDetail */}
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

                  {/* Parent Review — styled as Pros & Cons */}
                  {parentRev && (
                    <div className="rounded-lg sm:rounded-xl border border-[#E8DFD3] overflow-hidden">
                      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#FAF7F2] to-[#F5F0EB] border-b border-[#E8DFD3]">
                        <p className="text-[10px] sm:text-xs font-semibold text-[#6B5E50] uppercase tracking-wider flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-[#D4A574]" />
                          {i18n.kitDetail.parentReview ? i18n.kitDetail.parentReview[lang] : t("家长评价", "Parent Review")}
                        </p>
                      </div>
                      <div className="p-3 sm:p-4 bg-[#FFFBF5]">
                        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4A574]" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-[#6B5E50]">
                            {t("家长真实反馈", "Real Parent Feedback")}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed pl-8 sm:pl-9">
                          {parentRev}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Amazon Alternatives — same as KitDetail */}
                  {toyAlternatives && toyAlternatives.length > 0 && (
                    <AlternativesSection
                      alternatives={toyAlternatives}
                      toyName={toy.englishName}
                      toyNameCn={toy.name}
                      kitName={productName}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* If no expandable details but has alternatives, show them directly */}
      {!hasDetails && toyAlternatives && toyAlternatives.length > 0 && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <AlternativesSection
            alternatives={toyAlternatives}
            toyName={toy.englishName}
            toyNameCn={toy.name}
            kitName={productName}
          />
        </div>
      )}
    </div>
  );
});

/* ─── ReferralCard — same as KitDetail ─── */
function ProductReferralCard({ product }: { product: ReturnType<typeof getProductById> }) {
  const { lang, t } = useLanguage();
  const i18n = useI18n();

  if (!product) return null;

  const purchaseUrl = `${product.officialUrl}?discount_code=${REFERRAL_CODE}&utm_source=loveveryfans&utm_medium=referral&utm_campaign=product_${product.id}`;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFD3] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: product.color + "12" }}
        >
          <Gift className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: product.color }} />
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
              onClick={() => {
                trackEvent("lovevery_referral_click", {
                  kit_name: product.id,
                  kit_id: product.id,
                  page_url: typeof window !== "undefined" ? window.location.href : "",
                  link_type: "buy_product_button",
                });
              }}
            >
              <Heart className="w-4 h-4" />
              {t("在 Lovevery 购买", "Buy on Lovevery")}
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          <p className="text-[10px] sm:text-xs text-[#B0A89E] mt-4">
            {t(`推荐码：${REFERRAL_CODE} · `, `Referral code: ${REFERRAL_CODE} · `)}
            {i18n.referral.disclaimer[lang]}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ProductDetail ─── */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, t, convert } = useLanguage();
  const i18n = useI18n();
  const product = id ? getProductById(id) : undefined;

  // Navigation between products
  const currentIndex = product ? standaloneProducts.findIndex((p) => p.id === product.id) : -1;
  const prevProduct = currentIndex > 0 ? standaloneProducts[currentIndex - 1] : null;
  const nextProduct = currentIndex < standaloneProducts.length - 1 ? standaloneProducts[currentIndex + 1] : null;

  // Track page view + SEO
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!product) return;

    trackEvent("product_view", { product_id: product.id, product_name: product.name });

    const categoryLabel = lang === "cn"
      ? convert(product.category === "music" ? "音乐玩具" : product.category === "bath" ? "洗澡玩具" : product.category === "blockSet" ? "积木套装" : "游戏垫")
      : product.category === "music" ? "Music Toy" : product.category === "bath" ? "Bath Toy" : product.category === "blockSet" ? "Block Set" : "Play Gym";

    const title = lang === "cn"
      ? `${product.name} ${categoryLabel}平替推荐 | Lovevery Fans`
      : `${product.name} (${product.ageRangeEn || product.ageRange}) | Lovevery Alternatives | Lovevery Fans`;

    document.title = title;

    const desc = lang === "cn"
      ? convert(product.description)
      : (product.descriptionEn || product.description);

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", product.imageUrl);
    setMeta("property", "og:url", `https://loveveryfans.com/product/${product.id}`);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = `https://loveveryfans.com/product/${product.id}/`;

    // JSON-LD structured data
    const priceValidUntil = new Date();
    priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.descriptionEn || product.description,
      "image": product.imageUrl,
      "brand": { "@type": "Brand", "name": "Lovevery" },
      "offers": {
        "@type": "Offer",
        "url": product.officialUrl,
        "priceCurrency": "USD",
        "price": product.price.replace(/[^0-9.]/g, ""),
        "availability": "https://schema.org/InStock",
        "priceValidUntil": priceValidUntil.toISOString().split("T")[0],
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
          "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "DAY" },
            "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 7, "unitCode": "DAY" },
          },
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "US",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 30,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn",
        },
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount,
      },
    };

    let script = document.querySelector('script[data-seo-id="product-jsonld"]') as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.setAttribute("data-seo-id", "product-jsonld"); document.head.appendChild(script); }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const el = document.querySelector('script[data-seo-id="product-jsonld"]');
      if (el) el.remove();
    };
  }, [id, product, lang]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-['Manrope'] text-2xl sm:text-3xl text-[#3D3229] mb-4">
            {t("未找到该产品", "Product Not Found")}
          </h1>
          <Link href="/">
            <span className="text-[#7FB685] hover:underline">{i18n.kitDetail.backHome[lang]}</span>
          </Link>
        </div>
      </div>
    );
  }

  const categories = Array.from(
    new Set(
      product.toys
        .flatMap((t) => {
          const cat = lang === "en" && t.categoryEn ? t.categoryEn : t.category;
          return cat.split("/");
        })
        .filter(Boolean)
    )
  );

  const productDescription = lang === "en" && product.descriptionEn ? product.descriptionEn : convert(product.description);
  const productAgeRange = lang === "en" && product.ageRangeEn ? product.ageRangeEn : convert(product.ageRange);

  return (
    <>
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation — identical to KitDetail */}
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

      {/* Product Header — same structure as KitDetail kit header */}
      <section className="relative overflow-hidden">
        <div
          className="h-1 sm:h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${product.color}, ${product.color}88, ${product.color}44)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 25%, ${product.color} 0%, transparent 35%), radial-gradient(circle at 85% 75%, ${product.color} 0%, transparent 35%), radial-gradient(circle at 50% 50%, ${product.color} 0%, transparent 50%)`,
          }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 relative z-10">
          {/* Mobile hero image */}
          {product.imageUrl && (
            <div className="md:hidden mb-6 flex justify-center">
              <div className="w-48 sm:w-56 aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] shadow-lg shadow-[#3D3229]/5 p-3">
                <img
                  src={product.imageUrl}
                  alt={`${product.name} - Lovevery ${productAgeRange}`}
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
              {/* Age/category badge */}
              <div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border"
                style={{ backgroundColor: product.color + "12", color: product.color, borderColor: product.color + "25" }}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {productAgeRange}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1108] tracking-tight leading-[1.1] mb-6 sm:mb-8">
                {product.name}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#3D3229] leading-relaxed max-w-3xl">
                {productDescription}
              </p>

              {/* View on Lovevery button — same as KitDetail */}
              <div className="mt-5 sm:mt-6">
                <a
                  href={`${product.officialUrl}?discount_code=${REFERRAL_CODE}&utm_source=loveveryfans&utm_medium=referral&utm_campaign=product_${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent("lovevery_referral_click", {
                      kit_name: product.id,
                      kit_id: product.id,
                      page_url: typeof window !== "undefined" ? window.location.href : "",
                      link_type: "product_header",
                    });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-sm font-medium border-2 transition-all hover:shadow-md active:scale-[0.98] group"
                  style={{
                    borderColor: product.color,
                    color: product.color,
                    backgroundColor: product.color + "08",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = product.color;
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = product.color + "08";
                    e.currentTarget.style.color = product.color;
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  {i18n.kitDetail.viewOnLovevery[lang]}
                </a>
                <p className="mt-2 flex items-center justify-start gap-1.5 text-[10px] sm:text-xs text-[#756A5C]/60 opacity-70">
                  <Heart className="w-3 h-3 text-[#D4A574]/50" />
                  <span>
                    {t("通过此链接购买可享折扣，同时支持本站运营", "Using this link supports our site & gives you a discount")}
                  </span>
                </p>
              </div>

              {/* Stats row — same as KitDetail */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10 mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-[#E8DFD3]/80">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: product.color + "15" }}
                  >
                    <Puzzle className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: product.color }} />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-['Manrope'] text-[#3D3229]">
                      {product.toys.length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#756A5C]">{i18n.kitDetail.toyCount[lang]}</p>
                  </div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-[#E8DFD3] hidden sm:block" />
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: product.color + "15" }}
                  >
                    <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: product.color }} />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-['Manrope'] text-[#3D3229]">
                      {product.rating}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#756A5C]">
                      {product.reviewCount.toLocaleString()} {t("条评价", "reviews")}
                    </p>
                  </div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-[#E8DFD3] hidden sm:block" />
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium"
                        style={{ backgroundColor: product.color + "12", color: product.color }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#756A5C] mt-1.5 sm:mt-2">{i18n.kitDetail.devAreas[lang]}</p>
                </div>
              </div>
            </div>

            {/* Desktop hero image */}
            {product.imageUrl && (
              <div className="hidden md:block w-56 lg:w-72 shrink-0">
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] shadow-xl shadow-[#3D3229]/8 ring-1 ring-black/5 p-4 hover:shadow-2xl transition-shadow duration-500">
                  <img
                    src={product.imageUrl}
                    alt={`${product.name} - Lovevery ${productAgeRange}`}
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

      {/* Toy List — same structure as KitDetail */}
      <section className="pb-6 sm:pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: product.color + "15" }}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: product.color }} />
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
            {product.toys.map((toy, idx) => (
              <ToyCard
                key={toy.englishName + idx}
                toy={toy}
                index={idx}
                productColor={product.color}
                productId={product.id}
                productName={product.name}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Referral + Reward — same as KitDetail */}
      <section className="pb-10 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <ProductReferralCard product={product} />
          <RewardBanner />
        </div>
      </section>

      {/* Navigation between products — same as KitDetail kit navigation */}
      <section className="border-t border-[#E8DFD3] bg-gradient-to-b from-white to-[#FAF7F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-center text-xs sm:text-sm text-[#756A5C] mb-4 sm:mb-6 font-medium">
            {t("探索更多 Lovevery 产品", "Explore More Lovevery Products")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {prevProduct ? (
              <Link href={`/product/${prevProduct.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] bg-white hover:shadow-lg hover:shadow-[#3D3229]/5 transition-all duration-300 cursor-pointer active:scale-[0.98] min-h-[44px]">
                  <p className="text-[10px] sm:text-xs text-[#756A5C] mb-1.5 sm:mb-2 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    {i18n.kitDetail.prevKit[lang]}
                  </p>
                  <p className="font-display text-base sm:text-lg text-[#3D3229] group-hover:text-[#1a1108] transition-colors">
                    {prevProduct.name}
                  </p>
                  <p className="text-xs sm:text-sm text-[#756A5C] mt-0.5 sm:mt-1">
                    {lang === "en" && prevProduct.ageRangeEn ? prevProduct.ageRangeEn : prevProduct.ageRange}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {nextProduct ? (
              <Link href={`/product/${nextProduct.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] bg-white hover:shadow-lg hover:shadow-[#3D3229]/5 transition-all duration-300 text-right cursor-pointer active:scale-[0.98] min-h-[44px]">
                  <p className="text-[10px] sm:text-xs text-[#756A5C] mb-1.5 sm:mb-2 flex items-center justify-end gap-1">
                    {i18n.kitDetail.nextKit[lang]}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="font-display text-base sm:text-lg text-[#3D3229] group-hover:text-[#1a1108] transition-colors">
                    {nextProduct.name}
                  </p>
                  <p className="text-xs sm:text-sm text-[#756A5C] mt-0.5 sm:mt-1">
                    {lang === "en" && nextProduct.ageRangeEn ? nextProduct.ageRangeEn : nextProduct.ageRange}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </div>
      </section>

      {/* Footer — same as KitDetail */}
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
    </>
  );
}
