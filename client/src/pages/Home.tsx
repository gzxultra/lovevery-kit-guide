/*
 * Design: Montessori Naturalism / Scandinavian Minimalism
 * - Warm cream background, natural wood tones
 * - DM Serif Display for headings, DM Sans for body
 * - Soft rounded cards with subtle shadows
 * - Each kit has a unique accent color forming a rainbow progression
 */

import { kits, stages } from "@/data/kits";
import { ArrowRight, BookOpen, Baby, Sparkles } from "lucide-react";
import { Link } from "wouter";

const HERO_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/pDLfTHjmxRpphsqt.jpg";
const BABY_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/JIqrZUgAwKJrNkNQ.jpg";
const TODDLER_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/QaBJZNnndfVVkEaM.jpg";
const PRESCHOOL_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/xHcGyRqYHpgCaEyO.jpg";

const stageImages: Record<string, string> = {
  baby: BABY_IMG,
  toddler: TODDLER_IMG,
  bigToddler: TODDLER_IMG,
  preschool: PRESCHOOL_IMG,
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <span className="font-['DM_Serif_Display'] text-2xl text-[#3D3229] tracking-tight">
                Lovevery
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {stages.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-[fadeInUp_0.8s_ease-out_both]">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8DFD3]/60 text-[#6B5E50] text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                0-60 个月完整指南
              </div>
              <h1 className="font-['DM_Serif_Display'] text-4xl md:text-5xl lg:text-6xl text-[#1a1108] leading-tight mb-6">
                Play Kit
                <br />
                <span className="text-[#5a9e65]">使用说明书</span>
              </h1>
              <p className="text-lg text-[#4A3F35] leading-relaxed mb-8 max-w-lg">
                基于蒙特梭利教育理念，按月龄段精心设计的 22 个 Play Kit 完整指南。了解每个玩具的使用方法、发展目标和家长真实评价。
              </p>
              <a
                href="#baby"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D3229] text-white rounded-full font-medium hover:bg-[#2A231C] transition-colors"
              >
                开始探索
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="relative animate-[fadeIn_1s_ease-out_0.2s_both]">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-[#3D3229]/10">
                <img
                  src={HERO_IMG}
                  alt="Lovevery Play Kit Collection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg shadow-[#3D3229]/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7FB685]/20 flex items-center justify-center">
                    <Baby className="w-5 h-5 text-[#7FB685]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3D3229]">22 个 Play Kit</p>
                    <p className="text-xs text-[#6B5E50]">覆盖 0-60 个月</p>
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
          <section key={stage.id} id={stage.id} className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Stage Header */}
              <div className="mb-12">
                <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-end">
                  <div>
                    <div
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
                      style={{
                        backgroundColor: stage.color + "20",
                        color: stage.color,
                      }}
                    >
                      {stage.range}
                    </div>
                    <h2 className="font-['DM_Serif_Display'] text-3xl md:text-4xl text-[#1a1108]">
                      {stage.label}
                    </h2>
                  </div>
                  <div className="h-px bg-gradient-to-r from-[#E8DFD3] to-transparent" />
                </div>
              </div>

              {/* Kit Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stageKits.map((kit) => (
                  <Link key={kit.id} href={`/kit/${kit.id}`}>
                    <div
                      className="group relative rounded-2xl overflow-hidden bg-white border border-[#E8DFD3] hover:shadow-xl hover:shadow-[#3D3229]/8 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full"
                    >
                      {/* Color accent bar */}
                      <div
                        className="h-1.5 w-full"
                        style={{ backgroundColor: kit.color }}
                      />
                      <div className="p-6">
                        {/* Kit name and age */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-['DM_Serif_Display'] text-xl text-[#1a1108] mb-1">
                              {kit.name}
                            </h3>
                            <p className="text-sm text-[#5A4E42]">{kit.ageRange}</p>
                          </div>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: kit.color + "15" }}
                          >
                            <BookOpen
                              className="w-5 h-5"
                              style={{ color: kit.color }}
                            />
                          </div>
                        </div>

                        {/* Description preview */}
                        <p className="text-sm text-[#5A4E42] leading-relaxed line-clamp-3 mb-4">
                          {kit.description}
                        </p>

                        {/* Toy count */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#F0EBE3]">
                          <span className="text-xs text-[#8B7E70]">
                            {kit.toys.length} 个玩具
                          </span>
                          <span
                            className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                            style={{ color: kit.color }}
                          >
                            查看详情
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Footer */}
      <footer className="bg-[#3D3229] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-['DM_Serif_Display'] text-2xl mb-4">Lovevery</h3>
              <p className="text-[#B8AFA3] text-sm leading-relaxed">
                基于蒙特梭利教育理念的订阅制玩具品牌，按月龄段提供经过儿童发展专家设计的玩具套装。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#E8DFD3]">发展阶段</h4>
              <ul className="space-y-2">
                {stages.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-[#B8AFA3] hover:text-white transition-colors"
                    >
                      {s.label} ({s.range})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#E8DFD3]">关于本指南</h4>
              <p className="text-sm text-[#B8AFA3] leading-relaxed">
                本指南整理了 Lovevery 全部 22 个 Play Kit 的详细信息，包括每个玩具的使用方法、发展目标和家长真实评价，帮助您更好地使用这些精心设计的教育玩具。
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#4D4439] text-center text-sm text-[#8B7E70]">
            Play Kit 使用说明书 — 非官方指南
          </div>
        </div>
      </footer>
    </div>
  );
}
