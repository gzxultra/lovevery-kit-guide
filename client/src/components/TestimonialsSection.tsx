import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTestimonials } from "@/data/testimonials";
import type { Testimonial } from "@/data/testimonials";

export function TestimonialsSection() {
  const { lang, t, convert } = useLanguage();
  const testimonials = getTestimonials();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplay, testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setAutoplay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setAutoplay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-[#F5F0EB] via-[#FAF7F2] to-[#F8F3ED] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#D4A574]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#7FB685]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-[#E8DFD3]/60 text-[#6B5E50] text-xs font-medium mb-3 sm:mb-4 shadow-sm">
            <Star className="w-3 h-3" />
            {t("家长真实好评", "Real Parent Reviews")}
          </div>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-[#1a1108] mb-2 sm:mb-3">
            {t("看看其他家长怎么说", "What Parents Love")}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E50] max-w-2xl mx-auto">
            {t("来自真实用户的评价，帮你了解每个玩具的真实表现和家长体验", "Authentic feedback from parents who use Lovevery kits every day")}
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFD3] shadow-lg shadow-[#3D3229]/5 overflow-hidden ring-1 ring-black/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="p-4 sm:p-6 md:p-7"
              >
                {/* Quote Icon */}
                <div className="mb-3 sm:mb-4">
                  <Quote className="w-6 h-6 sm:w-7 sm:h-7 text-[#D4A574] opacity-60" />
                </div>

                {/* Review Text */}
                <p className="text-sm sm:text-base md:text-lg text-[#3D3229] leading-relaxed mb-4 sm:mb-5 font-medium">
                  "{lang === "cn" ? convert(current.reviewCn) : current.reviewEn}"
                </p>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4 sm:mb-5">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#FFB81C] text-[#FFB81C]"
                    />
                  ))}
                </div>

                {/* Kit & Toy Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#F0EBE3]">
                  <div>
                    <p className="text-[10px] sm:text-xs text-[#756A5C] mb-0.5">
                      {t("来自", "From")}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-[#3D3229]">
                      {current.kitName}
                    </p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-[#E8DFD3]" />
                  <div className="sm:flex-1">
                    <p className="text-[10px] sm:text-xs text-[#756A5C] mb-0.5">
                      {t("推荐玩具", "Toy")}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-[#3D3229]">
                      {lang === "cn" ? convert(current.toyNameCn) : current.toyName}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-4 sm:mt-5">
            <button
              onClick={goToPrevious}
              onMouseEnter={() => setAutoplay(false)}
              onMouseLeave={() => setAutoplay(true)}
              className="p-2 rounded-full bg-white border border-[#E8DFD3] hover:border-[#D4A574] hover:shadow-md transition-all text-[#6B5E50] hover:text-[#3D3229] active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2 sm:gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-[#D4A574] w-6 sm:w-8"
                      : "bg-[#E8DFD3] w-2 sm:w-2.5 hover:bg-[#D4A574]"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              onMouseEnter={() => setAutoplay(false)}
              onMouseLeave={() => setAutoplay(true)}
              className="p-2 rounded-full bg-white border border-[#E8DFD3] hover:border-[#D4A574] hover:shadow-md transition-all text-[#6B5E50] hover:text-[#3D3229] active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Autoplay indicator */}
          <div className="mt-4 text-center">
            <p className="text-[10px] sm:text-xs text-[#756A5C]">
              {currentIndex + 1} / {testimonials.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
