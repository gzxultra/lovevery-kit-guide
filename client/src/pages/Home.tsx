/*
 * Design: Montessori Naturalism / Scandinavian Minimalism
 * Mobile-first responsive design with CN/EN language toggle
 * Search functionality for kits and toys
 */

import { kits, stages } from "@/data/kits";
import { i18n } from "@/data/i18n";
import { getKitHeroImage } from "@/data/toyImages";
import { getKitCardThumbnailUrl, getAccessibleTextColor } from "@/lib/imageUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { ArrowRight, BookOpen, Baby, Sparkles, Menu, X, Search } from "lucide-react";
import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { Link, useLocation } from "wouter";

// Prefetch KitDetail chunk on hover for faster navigation
let kitDetailPrefetched = false;
function prefetchKitDetail() {
  if (!kitDetailPrefetched) {
    kitDetailPrefetched = true;
    import("./KitDetail");
  }
}
import { applyHomePageSeo } from "@/lib/seoHelpers";

// Lazy load below-the-fold components
const FeedbackForm = lazy(() => import("@/components/FeedbackForm"));
const RewardSection = lazy(() => import("@/components/RewardSectionWrapper"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSectionWrapper"));

const HERO_IMG = `${import.meta.env.BASE_URL}hero.webp`;
const HERO_IMG_MOBILE = `${import.meta.env.BASE_URL}hero-mobile.webp`;
const HERO_IMG_FALLBACK = `${import.meta.env.BASE_URL}hero-mobile.jpg`;

function scrollToStage(stageId: string) {
  const el = document.getElementById(`stage-${stageId}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Home({ onReady }: { onReady?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();

  const stageLabel = (id: string) => {
    const key = id as keyof typeof i18n.stages;
    return i18n.stages[key]?.[lang] ?? id;
  };
  const stageRange = (id: string) => {
    const key = id as keyof typeof i18n.stageRanges;
    return i18n.stageRanges[key]?.[lang] ?? "";
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{
      kitId: string;
      kitName: string;
      matchType: "kit" | "toy";
      toyName?: string;
      toyEnglishName?: string;
      kitColor: string;
    }> = [];

    for (const kit of kits) {
      // Match kit name
      if (
        kit.name.toLowerCase().includes(q) ||
        kit.id.toLowerCase().includes(q)
      ) {
        results.push({
          kitId: kit.id,
          kitName: kit.name,
          matchType: "kit",
          kitColor: kit.color,
        });
      }
      // Match toy names
      for (const toy of kit.toys) {
        if (
          toy.name.toLowerCase().includes(q) ||
          toy.englishName.toLowerCase().includes(q)
        ) {
          results.push({
            kitId: kit.id,
            kitName: kit.name,
            matchType: "toy",
            toyName: toy.name,
            toyEnglishName: toy.englishName,
            kitColor: kit.color,
          });
        }
      }
    }
    return results.slice(0, 15); // Limit results
  }, [searchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    applyHomePageSeo();
  }, []);

  // Signal that React has rendered, SSR shell can be hidden
  useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-lg border-b border-[#E8DFD3]/70 shadow-sm shadow-[#3D3229]/3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span data-logo-target className="font-display text-xl sm:text-2xl text-[#3D3229] tracking-tight font-bold select-none hover:opacity-80 transition-opacity">
                Lovevery
              </span>
            </Link>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {stages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToStage(s.id)}
                  className="relative text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#7FB685] after:rounded-full after:transition-all hover:after:w-full"
                >
                  {stageLabel(s.id)}
                </button>
              ))}

              <Link href="/about">
                <span className="text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors">
                  {i18n.nav.aboutUs[lang]}
                </span>
              </Link>

              {/* Search bar - Desktop */}
              <div ref={searchContainerRef} className="relative">
                <div className="flex items-center bg-[#F0EBE3] rounded-full px-3 py-1.5 gap-2 focus-within:ring-2 focus-within:ring-[#7FB685]/40 transition-all">
                  <Search className="w-4 h-4 text-[#756A5C] shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder={i18n.search.placeholder[lang]}
                    className="bg-transparent text-sm text-[#3D3229] placeholder-[#9B8E7E] outline-none w-40 lg:w-52"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                      className="text-[#756A5C] hover:text-[#3D3229] min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchOpen && searchQuery.trim() && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-[#E8DFD3] shadow-xl shadow-[#3D3229]/10 overflow-hidden max-h-[70vh] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-[#F0EBE3] text-xs text-[#756A5C]">
                          {searchResults.length} {i18n.search.resultCount[lang]}
                        </div>
                        {searchResults.map((result, idx) => (
                          <button
                            key={`${result.kitId}-${result.toyEnglishName || "kit"}-${idx}`}
                            onClick={() => {
                              setLocation(`/kit/${result.kitId}`);
                              setSearchQuery("");
                              setSearchOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-[#FAF7F2] transition-colors border-b border-[#F0EBE3] last:border-b-0 min-h-[48px]"
                          >
                            {result.matchType === "kit" ? (
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: result.kitColor + "15" }}
                                >
                                  <BookOpen className="w-4 h-4" style={{ color: result.kitColor }} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#3D3229]">{result.kitName}</p>
                                  <p className="text-xs text-[#756A5C]">Play Kit</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: result.kitColor + "10" }}
                                >
                                  <Sparkles className="w-4 h-4" style={{ color: result.kitColor }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-[#3D3229] truncate">
                                    {lang === "cn" ? result.toyName : result.toyEnglishName}
                                  </p>
                                  <p className="text-xs text-[#756A5C] truncate">
                                    {lang === "cn" ? result.toyEnglishName : result.toyName} · {result.kitName}
                                  </p>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-[#756A5C]">
                        {i18n.search.noResults[lang]}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <LanguageToggle />
            </div>
            {/* Mobile: search + language toggle + hamburger */}
            <div className="flex md:hidden items-center gap-1">
              <button
                className="p-2 text-[#6B5E50] hover:text-[#3D3229] min-w-[48px] min-h-[48px] flex items-center justify-center"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setMobileMenuOpen(false);
                }}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <LanguageToggle />
              <button
                className="p-2 text-[#6B5E50] hover:text-[#3D3229] min-w-[48px] min-h-[48px] flex items-center justify-center"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  setSearchOpen(false);
                }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-t border-[#E8DFD3] px-4 py-3">
            <div className="flex items-center bg-[#F0EBE3] rounded-full px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-[#7FB685]/40">
              <Search className="w-4 h-4 text-[#756A5C] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={i18n.search.placeholder[lang]}
                className="bg-transparent text-sm text-[#3D3229] placeholder-[#9B8E7E] outline-none flex-1"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[#756A5C] hover:text-[#3D3229] min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile search results */}
            {searchQuery.trim() && (
              <div className="mt-2 bg-white rounded-xl border border-[#E8DFD3] shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                {searchResults.length > 0 ? (
                  <>
                    <div className="px-4 py-2 border-b border-[#F0EBE3] text-xs text-[#756A5C]">
                      {searchResults.length} {i18n.search.resultCount[lang]}
                    </div>
                    {searchResults.map((result, idx) => (
                      <button
                        key={`m-${result.kitId}-${result.toyEnglishName || "kit"}-${idx}`}
                        onClick={() => {
                          setLocation(`/kit/${result.kitId}`);
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[#FAF7F2] transition-colors border-b border-[#F0EBE3] last:border-b-0 min-h-[48px]"
                      >
                        {result.matchType === "kit" ? (
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: result.kitColor + "15" }}
                            >
                              <BookOpen className="w-4 h-4" style={{ color: result.kitColor }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#3D3229]">{result.kitName}</p>
                              <p className="text-xs text-[#756A5C]">Play Kit</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: result.kitColor + "10" }}
                            >
                              <Sparkles className="w-4 h-4" style={{ color: result.kitColor }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#3D3229] truncate">
                                {lang === "cn" ? result.toyName : result.toyEnglishName}
                              </p>
                              <p className="text-xs text-[#756A5C] truncate">
                                {lang === "cn" ? result.toyEnglishName : result.toyName} · {result.kitName}
                              </p>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-[#756A5C]">
                    {i18n.search.noResults[lang]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-t border-[#E8DFD3] shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {stages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    scrollToStage(s.id);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] hover:bg-[#E8DFD3]/40 transition-colors min-h-[48px]"
                >
                  <span className="flex items-center justify-between">
                    {stageLabel(s.id)}
                    <span className="text-xs text-[#756A5C]">{stageRange(s.id)}</span>
                  </span>
                </button>
              ))}
              <Link href="/about">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] hover:bg-[#E8DFD3]/40 transition-colors min-h-[48px] flex items-center"
                >
                  {i18n.nav.aboutUs[lang]}
                </span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#FAF7F2] to-[#F0EBE3]">
        {/* Decorative background elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#7FB685]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#E8A87C]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#D4B896]/6 rounded-full blur-2xl pointer-events-none animate-float" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text content */}
            <div className="animate-[fadeInUp_0.8s_ease-out_both] order-1 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#E8DFD3]/60 text-[#6B5E50] text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4A574]" />
                {i18n.hero.badge[lang]}
              </div>                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1108] tracking-tight leading-[1.1] mb-4 sm:mb-6">
                {i18n.hero.title1[lang]}
                <br />
                <span className="text-[#5a9e65] relative">
                  {i18n.hero.title2[lang]}
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#7FB685]/20 rounded-full" />
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#4A3F35] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                {i18n.hero.subtitle[lang]}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  onClick={() => scrollToStage("baby")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-[#3D3229] text-white rounded-full text-sm sm:text-base font-medium hover:bg-[#2A231C] hover:shadow-lg hover:shadow-[#3D3229]/20 transition-all duration-300 active:scale-95 min-h-[48px]"
                >
                  {i18n.hero.cta[lang]}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <span className="text-xs sm:text-sm text-[#756A5C] hidden sm:inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7FB685] animate-[pulse-soft_2s_ease-in-out_infinite]" />
                  {lang === "cn" ? "免费使用 · 无广告" : "Free & Ad-free"}
                </span>
              </div>
            </div>
            {/* Hero image */}
            <div className="relative animate-[fadeIn_1s_ease-out_0.2s_both] order-2 md:order-2">
              <div data-hero-image className="aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl shadow-[#3D3229]/12 ring-1 ring-black/5">
                <picture>
                  <source srcSet={HERO_IMG_MOBILE} type="image/webp" media="(max-width: 767px)" />
                  <source srcSet={HERO_IMG} type="image/webp" media="(min-width: 768px)" />
                  <img
                    src={HERO_IMG_FALLBACK}
                    alt="Lovevery Play Kit Collection - Complete guide to all 22 Lovevery Play Kits with affordable Amazon alternatives"
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                    decoding="sync"
                    width={640}
                    height={364}
                  />
                </picture>
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg shadow-[#3D3229]/10 ring-1 ring-black/5 animate-[fadeInUp_0.6s_ease-out_0.5s_both]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#7FB685]/25 to-[#7FB685]/10 flex items-center justify-center">
                    <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-[#5a9e65]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#3D3229]">{i18n.hero.kitCount[lang]}</p>
                    <p className="text-[10px] sm:text-xs text-[#6B5E50]">{i18n.hero.coverRange[lang]}</p>
                  </div>
                </div>
              </div>
              {/* Decorative accent */}
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-16 h-16 sm:w-20 sm:h-20 bg-[#7FB685]/10 rounded-full blur-xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - lazy loaded */}
      <Suspense fallback={<div className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#F5F0EB] via-[#FAF7F2] to-[#F8F3ED]" />}>
        <TestimonialsSection />
      </Suspense>

      {/* Stage Sections */}
      {stages.map((stage) => {
        const stageKits = kits.filter((k) => k.stage === stage.id);
        return (
          <section key={stage.id} id={`stage-${stage.id}`} className="py-10 sm:py-16 md:py-24 scroll-mt-16 sm:scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Stage Header */}
              <div className="mb-8 sm:mb-12">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
                  <div className="shrink-0">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 border"
                      style={{
                        backgroundColor: stage.color + "12",
                        color: getAccessibleTextColor(stage.color),
                        borderColor: stage.color + "25",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      {stageRange(stage.id)}
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-[#1a1108] tracking-tight">
                      {stageLabel(stage.id)}
                    </h2>
                  </div>
                  <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-[#E8DFD3] via-[#E8DFD3]/50 to-transparent" />
                </div>
              </div>

              {/* Kit Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stageKits.map((kit) => {
                  const kitHero = getKitHeroImage(kit.id);
                  return (
                    <Link key={kit.id} href={`/kit/${kit.id}`}>
                      <div
                        className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#E8DFD3] hover:border-[#C8BFB3] hover:shadow-2xl hover:shadow-[#3D3229]/12 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer h-full active:scale-[0.98] card-glow"
                        onMouseEnter={prefetchKitDetail}
                        onTouchStart={prefetchKitDetail}
                      >
                        {/* Color accent bar with gradient */}
                        <div
                          className="h-1 sm:h-1.5 w-full"
                          style={{ background: `linear-gradient(90deg, ${kit.color}, ${kit.color}88)` }}
                        />
                        <div className="p-4 sm:p-6">
                          <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-lg sm:text-xl text-[#1a1108] mb-1 truncate group-hover:text-[#3D3229] transition-colors">
                                {kit.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-[#5A4E42]">
                                {lang === "cn" ? kit.ageRange : (kit.ageRangeEn || kit.ageRange)}
                              </p>
                            </div>
                            {kitHero ? (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-[#FAF7F2] border border-[#F0EBE3] p-1 group-hover:border-[#E8DFD3] group-hover:shadow-sm transition-all">
                                <img
                                  src={getKitCardThumbnailUrl(kitHero)}
                                  alt={`${kit.name} Play Kit - Lovevery educational toys for ${kit.ageRangeEn || kit.ageRange}`}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                  width={128}
                                  height={128}
                                  decoding="async"
                                />
                              </div>
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: kit.color + "15" }}
                              >
                                <BookOpen className="w-5 h-5" style={{ color: kit.color }} />
                              </div>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-[#5A4E42] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
                            {lang === "cn" ? kit.description : (kit.descriptionEn || kit.description)}
                          </p>

                          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#F0EBE3] group-hover:border-[#E8DFD3] transition-colors">
                            <span className="text-xs text-[#6B5E50] flex items-center gap-1">
                              <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: kit.color }} />
                              {kit.toys.length} {i18n.kitCard.toys[lang]}
                            </span>
                            <span
                              className="text-xs sm:text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all min-h-[48px] min-w-[48px] justify-end"
                              style={{ color: getAccessibleTextColor(kit.color) }}
                            >
                              {i18n.kitCard.viewDetails[lang]}
                              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* Reward Section - lazy loaded */}
      <Suspense fallback={<div className="py-16" />}>
        <RewardSection />
      </Suspense>

      {/* Feedback Form - lazy loaded */}
      <Suspense fallback={<div className="py-12 sm:py-20" />}>
        <FeedbackForm />
      </Suspense>

      {/* Footer */}
      <footer className="relative bg-[#3D3229] text-white py-10 sm:py-16">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7FB685]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 data-logo-target className="font-display text-xl sm:text-2xl mb-3 sm:mb-4 select-none">Lovevery</h3>
              <p className="text-[#B8AFA3] text-sm leading-relaxed">
                {i18n.footer.brandDesc[lang]}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-[#E8DFD3]">{i18n.footer.devStages[lang]}</h4>
              <ul className="space-y-1">
                {stages.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToStage(s.id)}
                      className="text-sm text-[#B8AFA3] hover:text-white hover:translate-x-1 transition-all duration-200 min-h-[44px] flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#6B5E50] group-hover:bg-[#7FB685] transition-colors" />
                      {stageLabel(s.id)} ({stageRange(s.id)})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-3 sm:mb-4 text-[#E8DFD3]">{i18n.footer.aboutGuide[lang]}</h4>
              <p className="text-sm text-[#B8AFA3] leading-relaxed mb-4">
                {i18n.footer.aboutDesc[lang]}
              </p>
              <Link href="/about">
                <span className="inline-flex items-center gap-1.5 text-sm text-[#B8AFA3] hover:text-white transition-colors group">
                  {i18n.nav.aboutUs[lang]}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#4D4439]/80 text-center">
            <p className="text-xs sm:text-sm text-[#9A8E82] mb-2">
              {i18n.footer.tagline[lang]}
            </p>
            <p className="text-xs sm:text-sm text-[#9A8E82] leading-relaxed max-w-4xl mx-auto">
              {i18n.footer.disclaimer[lang]}
            </p>
            <div data-rainbow-portal className="mt-3 flex justify-center" />
          </div>
        </div>
      </footer>
    </div>
  );
}
