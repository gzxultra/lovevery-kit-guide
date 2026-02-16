/*
 * Design: Montessori Naturalism / Scandinavian Minimalism
 * - Individual kit detail page simulating a physical play guide booklet
 * - Warm cream background with kit-specific accent color
 * - Card-based layout for each toy with official product images
 */

import { getKitById, kits, stages } from "@/data/kits";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";

function ToyCard({
  toy,
  index,
  kitColor,
  kitId,
}: {
  toy: { name: string; englishName: string; category: string; howToUse: string; developmentGoal: string; parentReview: string };
  index: number;
  kitColor: string;
  kitId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const toyImage = getToyImage(kitId, index);

  return (
    <div
      className="bg-white rounded-2xl border border-[#E8DFD3] overflow-hidden hover:shadow-lg hover:shadow-[#3D3229]/5 transition-shadow"
    >
      {/* Toy Header with Image */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-5">
          {/* Toy Image or Number */}
          {toyImage ? (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-[#FAF7F2] border border-[#F0EBE3] flex items-center justify-center p-2">
              <img
                src={toyImage}
                alt={toy.englishName}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 text-xl font-['DM_Serif_Display'] text-white"
              style={{ backgroundColor: kitColor }}
            >
              {index + 1}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: kitColor }}
              >
                {index + 1}
              </span>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#3D3229]">
                {toy.name}
              </h3>
            </div>
            <p className="text-sm text-[#9B8E7E] mb-2">{toy.englishName}</p>
            <span
              className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: kitColor + "15", color: kitColor }}
            >
              {toy.category}
            </span>
          </div>
        </div>
      </div>

      {/* How to Use - Always visible */}
      <div className="px-6 pb-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF7F2]">
          <Lightbulb className="w-5 h-5 shrink-0 mt-0.5 text-[#D4A574]" />
          <div>
            <p className="text-xs font-semibold text-[#D4A574] uppercase tracking-wider mb-1.5">
              使用方法
            </p>
            <p className="text-sm text-[#4A3F35] leading-relaxed">{toy.howToUse}</p>
          </div>
        </div>
      </div>

      {/* Expandable sections */}
      <div className="px-6 pb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-3 text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors border-t border-[#F0EBE3]"
        >
          <span>{expanded ? "收起详情" : "查看发展目标和家长评价"}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
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
            <div className="px-6 pb-6 space-y-4">
              {/* Development Goal */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F0F7F1]">
                <Target className="w-5 h-5 shrink-0 mt-0.5 text-[#7FB685]" />
                <div>
                  <p className="text-xs font-semibold text-[#7FB685] uppercase tracking-wider mb-1.5">
                    发展目标
                  </p>
                  <p className="text-sm text-[#4A3F35] leading-relaxed">
                    {toy.developmentGoal}
                  </p>
                </div>
              </div>

              {/* Parent Review */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F0F8]">
                <MessageSquare className="w-5 h-5 shrink-0 mt-0.5 text-[#9B7DB8]" />
                <div>
                  <p className="text-xs font-semibold text-[#9B7DB8] uppercase tracking-wider mb-1.5">
                    家长评价
                  </p>
                  <p className="text-sm text-[#4A3F35] leading-relaxed italic">
                    &ldquo;{toy.parentReview}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['DM_Serif_Display'] text-3xl text-[#3D3229] mb-4">
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

  // Get all categories
  const categories = Array.from(new Set(kit.toys.flatMap((t) => t.category.split("/"))));

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <span className="flex items-center gap-2 text-[#6B5E50] hover:text-[#3D3229] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">返回全部 Kit</span>
              </span>
            </Link>
            <Link href="/">
              <span className="font-['DM_Serif_Display'] text-lg text-[#3D3229]">
                Lovevery
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Kit Header with Hero Image */}
      <section className="relative overflow-hidden">
        {/* Colored top band */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: kit.color }}
        />
        {/* Subtle gradient background */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, ${kit.color} 0%, transparent 40%), radial-gradient(circle at 80% 70%, ${kit.color} 0%, transparent 40%)`,
          }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              {/* Stage badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ backgroundColor: kit.color + "20", color: kit.color }}
              >
                <BookOpen className="w-4 h-4" />
                {kit.stageLabel} · {kit.ageRange}
              </div>

              {/* Kit name */}
              <h1 className="font-['DM_Serif_Display'] text-4xl md:text-5xl lg:text-6xl text-[#1a1108] mb-6 leading-tight">
                {kit.name}
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-[#3D3229] leading-relaxed max-w-3xl">
                {kit.description}
              </p>

              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-6 md:gap-10 mt-10 pt-8 border-t border-[#E8DFD3]/80">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: kit.color + "15" }}
                  >
                    <Puzzle className="w-6 h-6" style={{ color: kit.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-['DM_Serif_Display'] text-[#3D3229]">
                      {kit.toys.length}
                    </p>
                    <p className="text-xs text-[#9B8E7E]">个玩具</p>
                  </div>
                </div>
                <div className="w-px h-10 bg-[#E8DFD3] hidden sm:block" />
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: kit.color + "15" }}
                  >
                    <Star className="w-6 h-6" style={{ color: kit.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-['DM_Serif_Display'] text-[#3D3229]">
                      {kit.ageRange}
                    </p>
                    <p className="text-xs text-[#9B8E7E]">适用月龄</p>
                  </div>
                </div>
                <div className="w-px h-10 bg-[#E8DFD3] hidden sm:block" />
                <div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: kit.color + "12", color: kit.color }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#9B8E7E] mt-2">发展领域</p>
                </div>
              </div>
            </div>

            {/* Kit Hero Image from Lovevery */}
            {heroImage && (
              <div className="hidden md:block w-64 lg:w-80 shrink-0">
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
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: kit.color + "15" }}
              >
                <BookOpen className="w-4 h-4" style={{ color: kit.color }} />
              </div>
              <h2 className="font-['DM_Serif_Display'] text-2xl md:text-3xl text-[#3D3229]">
                玩具清单
              </h2>
            </div>
            <p className="text-sm text-[#9B8E7E] ml-11">
              点击每个玩具卡片查看详细的发展目标和家长评价
            </p>
          </div>

          <div className="space-y-5">
            {kit.toys.map((toy, idx) => (
              <ToyCard
                key={toy.englishName}
                toy={toy}
                index={idx}
                kitColor={kit.color}
                kitId={kit.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Navigation between kits */}
      <section className="border-t border-[#E8DFD3] bg-white/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-sm text-[#9B8E7E] mb-6">继续探索其他 Kit</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevKit ? (
              <Link href={`/kit/${prevKit.id}`}>
                <div className="group p-5 rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] hover:shadow-md transition-all cursor-pointer">
                  <p className="text-xs text-[#9B8E7E] mb-2 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    上一个 Kit
                  </p>
                  <p className="font-['DM_Serif_Display'] text-lg text-[#3D3229] group-hover:text-[#6B5E50] transition-colors">
                    {prevKit.name}
                  </p>
                  <p className="text-sm text-[#9B8E7E] mt-1">{prevKit.ageRange}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextKit ? (
              <Link href={`/kit/${nextKit.id}`}>
                <div className="group p-5 rounded-2xl border border-[#E8DFD3] hover:border-[#C8BFB3] hover:shadow-md transition-all text-right cursor-pointer">
                  <p className="text-xs text-[#9B8E7E] mb-2 flex items-center justify-end gap-1">
                    下一个 Kit
                    <ArrowRight className="w-3 h-3" />
                  </p>
                  <p className="font-['DM_Serif_Display'] text-lg text-[#3D3229] group-hover:text-[#6B5E50] transition-colors">
                    {nextKit.name}
                  </p>
                  <p className="text-sm text-[#9B8E7E] mt-1">{nextKit.ageRange}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D3229] text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-['DM_Serif_Display'] text-xl mb-3">Lovevery</h3>
          <p className="text-sm text-[#8B7E70]">
            Play Kit 使用说明书 — 非官方指南
          </p>
        </div>
      </footer>
    </div>
  );
}
