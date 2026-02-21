/*
 * ProductDetail page for standalone Lovevery products (Music Set, Bath Set, Block Set, Play Gym)
 * Design: Matches KitDetail's Montessori Naturalism / Scandinavian Minimalism style
 * Supports CN/EN language toggle, Amazon alternatives, and structured data
 */
import { getProductById, standaloneProducts, type StandaloneProduct } from "@/data/standaloneProducts";
import type { Toy } from "@/data/kits";
import { getToyAlternatives } from "@/data/alternatives";
import { useLanguage } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import LanguageToggle from "@/components/LanguageToggle";
import { AlternativesSection } from "@/components/AlternativesSection";
import { RewardBanner } from "@/components/RewardBanner";
import FeedbackForm from "@/components/FeedbackForm";
import { trackEvent } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Target,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink,
  Music,
  Droplets,
  Box,
  Baby,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams } from "wouter";

const REFERRAL_CODE = "REF-6AA44A5A";

function getCategoryIcon(category: string) {
  switch (category) {
    case "music": return Music;
    case "bath": return Droplets;
    case "blockSet": return Box;
    case "playGym": return Baby;
    default: return BookOpen;
  }
}

/* ─── ToyCard ─── */
function ToyCard({
  toy,
  index,
  productId,
  color,
}: {
  toy: Toy;
  index: number;
  productId: string;
  color: string;
}) {
  const { lang, t, convert } = useLanguage();
  const i18n = useI18n();
  const [expanded, setExpanded] = useState(false);

  const toyName = lang === "cn" ? convert(toy.name) : toy.englishName;
  const category = lang === "cn" ? convert(toy.category) : (toy.categoryEn || toy.category);
  const howToUse = lang === "cn" ? convert(toy.howToUse) : (toy.howToUseEn || toy.howToUse);
  const devGoal = lang === "cn" ? convert(toy.developmentGoal) : (toy.developmentGoalEn || toy.developmentGoal);
  const parentReview = lang === "cn" ? convert(toy.parentReview) : (toy.parentReviewEn || toy.parentReview);

  const hasDetails = !!(howToUse || devGoal || parentReview);
  const alternatives = getToyAlternatives(productId, toy.englishName);

  return (
    <div className="group rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#E8DFD3] hover:border-[#C8BFB3] transition-all duration-300 hover:shadow-lg">
      {/* Color accent */}
      <div className="h-0.5 sm:h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: color + "40", color: color, backgroundColor: color + "10" }}>
                {category}
              </span>
            </div>
            <h3 className="font-display text-base sm:text-lg text-[#1a1108]">{toyName}</h3>
            {lang === "cn" && (
              <p className="text-xs text-[#756A5C] mt-0.5">{toy.englishName}</p>
            )}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ backgroundColor: color + "15", color: color }}>
            {index + 1}
          </div>
        </div>

        {/* Expand/Collapse */}
        {hasDetails && (
          <button
            onClick={() => {
              setExpanded(!expanded);
              if (!expanded) trackEvent("product_toy_expand", { product_id: productId, toy: toy.englishName });
            }}
            className="flex items-center gap-1 text-xs font-medium mt-2 transition-colors"
            style={{ color: color }}
          >
            {expanded ? i18n.kitDetail.collapse[lang] : i18n.kitDetail.expand[lang]}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        <AnimatePresence>
          {expanded && hasDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {howToUse && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "12" }}>
                      <BookOpen className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#3D3229] mb-1">{i18n.kitDetail.howToUse[lang]}</p>
                      <p className="text-xs sm:text-sm text-[#5A4E42] leading-relaxed">{howToUse}</p>
                    </div>
                  </div>
                )}
                {devGoal && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "12" }}>
                      <Target className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#3D3229] mb-1">{i18n.kitDetail.devGoal[lang]}</p>
                      <p className="text-xs sm:text-sm text-[#5A4E42] leading-relaxed">{devGoal}</p>
                    </div>
                  </div>
                )}
                {parentReview && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "12" }}>
                      <MessageSquare className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#3D3229] mb-1">{i18n.kitDetail.parentReview[lang]}</p>
                      <p className="text-xs sm:text-sm text-[#5A4E42] leading-relaxed">{parentReview}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Alternatives */}
              {alternatives.length > 0 && (
                <div className="mt-4">
                  <AlternativesSection kitId={productId} toyName={toy.englishName} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

  // Track page view
  useEffect(() => {
    if (product) {
      trackEvent("product_view", { product_id: product.id, product_name: product.name });
    }
  }, [product]);

  // SEO
  useEffect(() => {
    if (!product) return;
    const title = lang === "cn"
      ? `${product.name} | Lovevery ${convert(product.category === "music" ? "音乐玩具" : product.category === "bath" ? "洗澡玩具" : product.category === "blockSet" ? "积木套装" : "游戏垫")}平替推荐 | Lovevery Fans`
      : `${product.name} (${product.ageRangeEn}) | Lovevery Alternatives & Dupes | Lovevery Fans`;
    document.title = title;

    const desc = lang === "cn"
      ? convert(product.description)
      : (product.descriptionEn || product.description);

    // Meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", `https://loveveryfans.com/product/${product.id}`);

    // Canonical
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
        "price": product.price.replace("$", ""),
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
  }, [product, lang, convert]);

  // Navigation between products
  const currentIndex = product ? standaloneProducts.findIndex((p) => p.id === product.id) : -1;
  const prevProduct = currentIndex > 0 ? standaloneProducts[currentIndex - 1] : null;
  const nextProduct = currentIndex < standaloneProducts.length - 1 ? standaloneProducts[currentIndex + 1] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-[#3D3229] mb-4">
            {t("未找到该产品", "Product Not Found")}
          </h1>
          <Link href="/">
            <span className="text-[#7FB685] hover:underline">{i18n.kitDetail.backHome[lang]}</span>
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(product.category);
  const productName = product.name;
  const ageRange = lang === "cn" ? convert(product.ageRange) : (product.ageRangeEn || product.ageRange);
  const description = lang === "cn" ? convert(product.description) : (product.descriptionEn || product.description);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-lg border-b border-[#E8DFD3]/70 shadow-sm shadow-[#3D3229]/3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span className="flex items-center gap-2 text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t("返回首页", "Back to Home")}</span>
              </span>
            </Link>
            <span className="font-display text-lg sm:text-xl text-[#3D3229] tracking-tight font-bold truncate max-w-[200px] sm:max-w-none">
              {productName}
            </span>
            <LanguageToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${product.bgColor}, ${product.lightColor})` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border"
                  style={{ backgroundColor: product.color + "12", color: product.color, borderColor: product.color + "25" }}>
                  <CategoryIcon className="w-3.5 h-3.5" />
                  {ageRange}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {product.rating} ({product.reviewCount.toLocaleString()})
                </div>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-[#1a1108] tracking-tight mb-3">
                {productName}
              </h1>
              <p className="text-sm sm:text-base text-[#5A4E42] leading-relaxed mb-4 max-w-2xl">
                {description}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-lg sm:text-xl font-bold" style={{ color: product.color }}>{product.price}</span>
                <a
                  href={`${product.officialUrl}?discount_code=${REFERRAL_CODE}&utm_source=loveveryfans&utm_medium=referral&utm_campaign=product_${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ backgroundColor: product.color }}
                  onClick={() => trackEvent("product_buy_click", { product_id: product.id })}
                >
                  {t("在 Lovevery 官网购买", "Buy on Lovevery")}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toy List */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="font-display text-xl sm:text-2xl text-[#1a1108] tracking-tight mb-2">
              {i18n.kitDetail.toyList[lang]}
            </h2>
            <p className="text-sm text-[#6B5E50]">
              {product.toys.length} {i18n.kitDetail.toyCount[lang]} · {i18n.kitDetail.toyListDesc[lang]}
            </p>
          </div>
          <div className="space-y-4">
            {product.toys.map((toy, idx) => (
              <ToyCard
                key={toy.englishName}
                toy={toy}
                index={idx}
                productId={product.id}
                color={product.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Reward Banner */}
      <RewardBanner />

      {/* Navigation between products */}
      <section className="py-8 sm:py-12 border-t border-[#E8DFD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-display text-lg sm:text-xl text-[#1a1108] mb-4 text-center">
            {t("探索更多 Lovevery 产品", "Explore More Lovevery Products")}
          </h3>
          <div className="flex justify-between gap-4">
            {prevProduct ? (
              <Link href={`/product/${prevProduct.id}`}>
                <span className="flex items-center gap-2 text-sm text-[#6B5E50] hover:text-[#3D3229] transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  {prevProduct.name}
                </span>
              </Link>
            ) : <div />}
            {nextProduct ? (
              <Link href={`/product/${nextProduct.id}`}>
                <span className="flex items-center gap-2 text-sm text-[#6B5E50] hover:text-[#3D3229] transition-colors">
                  {nextProduct.name}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <FeedbackForm />

      {/* Footer */}
      <footer className="bg-[#3D3229] text-white py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm text-[#9A8E82] mb-2">
            {i18n.footer.tagline[lang]}
          </p>
          <p className="text-xs sm:text-sm text-[#9A8E82] leading-relaxed max-w-4xl mx-auto">
            {i18n.footer.disclaimer[lang]}
          </p>
        </div>
      </footer>
    </div>
  );
}
