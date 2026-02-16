/*
 * Design: Montessori Naturalism / Scandinavian Minimalism
 * Mobile-first responsive design:
 * - Hamburger menu for mobile navigation
 * - Stacked hero layout on small screens
 * - Adaptive card grid (1 col → 2 col → 3 col)
 * - Touch-friendly tap targets (min 44px)
 * - Proper text sizing for readability
 */

import { kits, stages } from "@/data/kits";
import { getKitHeroImage } from "@/data/toyImages";
import { ArrowRight, BookOpen, Baby, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const HERO_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/MNPxTRzCbxWVkhFf.jpg";

function scrollToStage(stageId: string) {
  const el = document.getElementById(`stage-${stageId}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span className="font-['DM_Serif_Display'] text-xl sm:text-2xl text-[#3D3229] tracking-tight">
                Lovevery
              </span>
            </Link>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {stages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToStage(s.id)}
                  className="text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -mr-2 text-[#3D3229]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

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
                    {s.label}
                    <span className="text-xs text-[#9B8E7E]">{s.range}</span>
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
                0-60 个月完整指南
              </div>
              <h1 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1108] leading-tight mb-4 sm:mb-6">
                Play Kit
                <br />
                <span className="text-[#5a9e65]">使用说明书</span>
              </h1>
              <p className="text-base sm:text-lg text-[#4A3F35] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                基于蒙特梭利教育理念，按月龄段精心设计的 22 个 Play Kit 完整指南。了解每个玩具的使用方法、发展目标和家长真实评价。
              </p>
              <button
                onClick={() => scrollToStage("baby")}
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#3D3229] text-white rounded-full text-sm sm:text-base font-medium hover:bg-[#2A231C] transition-colors active:scale-95"
              >
                开始探索
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
                    <p className="text-xs sm:text-sm font-semibold text-[#3D3229]">22 个 Play Kit</p>
                    <p className="text-[10px] sm:text-xs text-[#6B5E50]">覆盖 0-60 个月</p>
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
                      {stage.range}
                    </div>
                    <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-[#1a1108]">
                      {stage.label}
                    </h2>
                  </div>
                  <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-[#E8DFD3] to-transparent" />
                </div>
              </div>

              {/* Kit Cards Grid - 1 col on mobile, 2 on sm, 3 on lg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stageKits.map((kit) => {
                  const kitHero = getKitHeroImage(kit.id);
                  return (
                    <Link key={kit.id} href={`/kit/${kit.id}`}>
                      <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#E8DFD3] hover:shadow-xl hover:shadow-[#3D3229]/8 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full active:scale-[0.98]">
                        {/* Color accent bar */}
                        <div
                          className="h-1 sm:h-1.5 w-full"
                          style={{ backgroundColor: kit.color }}
                        />
                        <div className="p-4 sm:p-6">
                          {/* Kit name, age, and hero image */}
                          <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-[#1a1108] mb-1 truncate">
                                {kit.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-[#5A4E42]">{kit.ageRange}</p>
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

                          {/* Description preview */}
                          <p className="text-xs sm:text-sm text-[#5A4E42] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
                            {kit.description}
                          </p>

                          {/* Toy count */}
                          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#F0EBE3]">
                            <span className="text-xs text-[#8B7E70]">
                              {kit.toys.length} 个玩具
                            </span>
                            <span
                              className="text-xs sm:text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                              style={{ color: kit.color }}
                            >
                              查看详情
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

      {/* Footer */}
      <footer className="bg-[#3D3229] text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 className="font-['DM_Serif_Display'] text-xl sm:text-2xl mb-3 sm:mb-4">Lovevery</h3>
              <p className="text-[#B8AFA3] text-sm leading-relaxed">
                基于蒙特梭利教育理念的订阅制玩具品牌，按月龄段提供经过儿童发展专家设计的玩具套装。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-[#E8DFD3]">发展阶段</h4>
              <ul className="space-y-2">
                {stages.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToStage(s.id)}
                      className="text-sm text-[#B8AFA3] hover:text-white transition-colors"
                    >
                      {s.label} ({s.range})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-3 sm:mb-4 text-[#E8DFD3]">关于本指南</h4>
              <p className="text-sm text-[#B8AFA3] leading-relaxed">
                本指南整理了 Lovevery 全部 22 个 Play Kit 的详细信息，包括每个玩具的使用方法、发展目标和家长真实评价，帮助您更好地使用这些精心设计的教育玩具。
              </p>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#4D4439] text-center text-xs sm:text-sm text-[#8B7E70]">
            Play Kit 使用说明书 — 非官方指南
          </div>
        </div>
      </footer>
    </div>
  );
}
