/*
 * Design: Montessori Naturalism / Scandinavian Minimalism
 * Mobile-first responsive design with CN/EN language toggle
 * Search functionality for kits and toys
 */

import { kits, stages } from "@/data/kits";
import { i18n } from "@/data/i18n";
import { getKitHeroImage } from "@/data/toyImages";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { ArrowRight, BookOpen, Baby, Sparkles, Menu, X, Search } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";

const HERO_IMG = "/hero.jpg";

function scrollToStage(stageId: string) {
  const el = document.getElementById(`stage-${stageId}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Home() {
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

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span className="font-['Manrope'] text-xl sm:text-2xl text-[#3D3229] tracking-tight font-bold">
                Lovevery
              </span>
            </Link>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {stages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToStage(s.id)}
                  className="text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors"
                >
                  {stageLabel(s.id)}
                </button>
              ))}

              {/* Search bar - Desktop */}
              <div ref={searchContainerRef} className="relative">
                <div className="flex items-center bg-[#F0EBE3] rounded-full px-3 py-1.5 gap-2 focus-within:ring-2 focus-within:ring-[#7FB685]/40 transition-all">
                  <Search className="w-4 h-4 text-[#9B8E7E] shrink-0" />
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
                      className="text-[#9B8E7E] hover:text-[#3D3229]"
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
                        <div className="px-4 py-2.5 border-b border-[#F0EBE3] text-xs text-[#9B8E7E]">
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
                            className="w-full text-left px-4 py-3 hover:bg-[#FAF7F2] transition-colors border-b border-[#F0EBE3] last:border-b-0"
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
                                  <p className="text-xs text-[#9B8E7E]">Play Kit</p>
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
                                  <p className="text-xs text-[#9B8E7E] truncate">
                                    {lang === "cn" ? result.toyEnglishName : result.toyName} · {result.kitName}
                                  </p>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-[#9B8E7E]">
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
                className="p-2 text-[#6B5E50] hover:text-[#3D3229]"
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
                className="p-2 -mr-2 text-[#3D3229]"
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
              <Search className="w-4 h-4 text-[#9B8E7E] shrink-0" />
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
                  className="text-[#9B8E7E] hover:text-[#3D3229]"
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
                    <div className="px-4 py-2 border-b border-[#F0EBE3] text-xs text-[#9B8E7E]">
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
                        className="w-full text-left px-4 py-3 hover:bg-[#FAF7F2] transition-colors border-b border-[#F0EBE3] last:border-b-0"
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
                              <p className="text-xs text-[#9B8E7E]">Play Kit</p>
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
                              <p className="text-xs text-[#9B8E7E] truncate">
                                {lang === "cn" ? result.toyEnglishName : result.toyName} · {result.kitName}
                              </p>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-[#9B8E7E]">
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
                  className="block w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] hover:bg-[#E8DFD3]/40 transition-colors"
                >
                  <span className="flex items-center justify-between">
                    {stageLabel(s.id)}
                    <span className="text-xs text-[#9B8E7E]">{stageRange(s.id)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text content */}
            <div className="animate-[fadeInUp_0.8s_ease-out_both] order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#E8DFD3]/60 text-[#6B5E50] text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {i18n.hero.badge[lang]}
              </div>
              <h1 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1108] leading-tight mb-4 sm:mb-6">
                {i18n.hero.title1[lang]}
                <br />
                <span className="text-[#5a9e65]">{i18n.hero.title2[lang]}</span>
              </h1>
              <p className="text-base sm:text-lg text-[#4A3F35] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                {i18n.hero.subtitle[lang]}
              </p>
              <button
                onClick={() => scrollToStage("baby")}
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#3D3229] text-white rounded-full text-sm sm:text-base font-medium hover:bg-[#2A231C] transition-colors active:scale-95"
              >
                {i18n.hero.cta[lang]}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {/* Hero image */}
            <div className="relative animate-[fadeIn_1s_ease-out_0.2s_both] order-1 md:order-2">
              <div className="aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl shadow-[#3D3229]/10">
                <img
                  src={HERO_IMG}
                  alt="Lovevery Play Kit Collection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg shadow-[#3D3229]/10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7FB685]/20 flex items-center justify-center">
                    <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-[#7FB685]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#3D3229]">{i18n.hero.kitCount[lang]}</p>
                    <p className="text-[10px] sm:text-xs text-[#6B5E50]">{i18n.hero.coverRange[lang]}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                      className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4"
                      style={{
                        backgroundColor: stage.color + "20",
                        color: stage.color,
                      }}
                    >
                      {stageRange(stage.id)}
                    </div>
                    <h2 className="font-['Manrope'] text-2xl sm:text-3xl md:text-4xl text-[#1a1108]">
                      {stageLabel(stage.id)}
                    </h2>
                  </div>
                  <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-[#E8DFD3] to-transparent" />
                </div>
              </div>

              {/* Kit Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stageKits.map((kit) => {
                  const kitHero = getKitHeroImage(kit.id);
                  return (
                    <Link key={kit.id} href={`/kit/${kit.id}`}>
                      <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#E8DFD3] hover:shadow-2xl hover:shadow-[#3D3229]/12 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer h-full active:scale-[0.98]">
                        <div
                          className="h-1 sm:h-1.5 w-full"
                          style={{ backgroundColor: kit.color }}
                        />
                        <div className="p-4 sm:p-6">
                          <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-['Manrope'] text-lg sm:text-xl text-[#1a1108] mb-1 truncate">
                                {kit.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-[#5A4E42]">
                                {lang === "cn" ? kit.ageRange : kit.ageRange.replace("个月", " months").replace("周", " weeks")}
                              </p>
                            </div>
                            {kitHero ? (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-[#FAF7F2] border border-[#F0EBE3] p-1">
                                <img
                                  src={kitHero}
                                  alt={kit.name}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
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

                          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#F0EBE3]">
                            <span className="text-xs text-[#8B7E70]">
                              {kit.toys.length} {i18n.kitCard.toys[lang]}
                            </span>
                            <span
                              className="text-xs sm:text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                              style={{ color: kit.color }}
                            >
                              {i18n.kitCard.viewDetails[lang]}
                              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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

      {/* Feedback Form */}
      <FeedbackForm />

      {/* Footer */}
      <footer className="bg-[#3D3229] text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 className="font-['Manrope'] text-xl sm:text-2xl mb-3 sm:mb-4">Lovevery</h3>
              <p className="text-[#B8AFA3] text-sm leading-relaxed">
                {i18n.footer.brandDesc[lang]}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-[#E8DFD3]">{i18n.footer.devStages[lang]}</h4>
              <ul className="space-y-2">
                {stages.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToStage(s.id)}
                      className="text-sm text-[#B8AFA3] hover:text-white transition-colors"
                    >
                      {stageLabel(s.id)} ({stageRange(s.id)})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-3 sm:mb-4 text-[#E8DFD3]">{i18n.footer.aboutGuide[lang]}</h4>
              <p className="text-sm text-[#B8AFA3] leading-relaxed">
                {i18n.footer.aboutDesc[lang]}
              </p>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#4D4439] text-center">
            <p className="text-xs sm:text-sm text-[#8B7E70] mb-2">
              {i18n.footer.tagline[lang]}
            </p>
            <p className="text-[10px] sm:text-xs text-[#6B5E50] italic">
              {i18n.footer.disclaimer[lang]}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
