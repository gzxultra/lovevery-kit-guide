import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Star, ExternalLink } from "lucide-react";
import { i18n } from "@/data/i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Alternative } from "@/data/alternatives";

interface AlternativesSectionProps {
  alternatives: Alternative[];
  toyName: string;
  toyNameCn: string;
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="w-3.5 h-3.5 fill-[#FFB81C] text-[#FFB81C]"
        />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <div key={i} className="relative w-3.5 h-3.5">
          <Star className="w-3.5 h-3.5 text-[#E8DFD3]" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-3.5 h-3.5 fill-[#FFB81C] text-[#FFB81C]" />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 text-[#E8DFD3]" />
      );
    }
  }

  return stars;
}

export function AlternativesSection({
  alternatives,
  toyName,
  toyNameCn,
}: AlternativesSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const { lang } = useLanguage();

  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 sm:mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#E8F4F8] to-[#F0E8F8] hover:from-[#D8E8F0] hover:to-[#E8DFF0] transition-all border border-[#D0E4F0] text-xs sm:text-sm font-medium text-[#5B7B99] min-h-[40px]"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">💡</span>
          {lang === "cn" ? "查看 Amazon 平替" : "See Alternatives"}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#F8FBFC] to-[#F5F0FB] border border-[#E0E8F0] hover:border-[#C8D8E8] hover:shadow-md transition-all"
                >
                  {/* Product Name */}
                  <div className="mb-2 sm:mb-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#3D3229] line-clamp-2 mb-1">
                      {alt.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-[#9B8E7E]">
                      ASIN: {alt.asin}
                    </p>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-2.5 sm:mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {renderStars(alt.rating)}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#3D3229]">
                        {alt.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-[#9B8E7E]">
                      {alt.reviewCount.toLocaleString()} {lang === "cn" ? "条评价" : "reviews"}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#D4A574]">
                      {alt.price}
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-xs sm:text-sm text-[#4A3F35] leading-relaxed mb-3 sm:mb-4">
                    {lang === "cn" ? alt.reasonCn : alt.reasonEn}
                  </p>

                  {/* Buy Button */}
                  <a
                    href={alt.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#FF9900] hover:bg-[#FF8800] text-white text-xs sm:text-sm font-medium transition-all hover:shadow-md active:scale-[0.98] min-h-[36px]"
                  >
                    {lang === "cn" ? "去 Amazon 购买" : "Buy on Amazon"}
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
