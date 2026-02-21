/**
 * Easter Egg 3: Late Night Surprise
 * Shows a warm, encouraging banner between 12 AM and 5 AM
 * with a parenting guide and "Night Owl Mama Club" interaction.
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { Moon, Sparkles, BookOpen, Coffee, X, Heart } from "lucide-react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export default function LateNightBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [heartCount, setHeartCount] = useState(0);
  const { lang } = useLanguage();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    const isLateNight = hour >= 0 && hour < 5;
    const alreadyDismissed = sessionStorage.getItem("lateNightBannerDismissed");

    if (isLateNight && !alreadyDismissed) {
      setTimeout(() => setVisible(true), 1500);
    }
    
    // Load heart count from local storage to simulate a "club"
    const savedHearts = localStorage.getItem("nightOwlHearts") || "1240";
    setHeartCount(parseInt(savedHearts));
  }, []);

  const handleDismiss = useCallback(() => {
    setClosing(true);
    sessionStorage.setItem("lateNightBannerDismissed", "true");
    setTimeout(() => {
      setDismissed(true);
      setVisible(false);
    }, 600);
  }, []);

  const addHeart = () => {
    const newCount = heartCount + 1;
    setHeartCount(newCount);
    localStorage.setItem("nightOwlHearts", newCount.toString());
    
    trackEvent("night_owl_heart", { count: newCount });
  };

  // Stars animation (same as before)
  useEffect(() => {
    if (!visible || dismissed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };
    resize();

    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width || 800;
    const h = rect?.height || 80;
    starsRef.current = [];

    for (let i = 0; i < 60; i++) {
      starsRef.current.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.5 + Math.random() * 2,
        baseOpacity: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1 + Math.random() * 3,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    let startTime = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect?.width || 800;
      const h = rect?.height || 80;
      ctx.clearRect(0, 0, w, h);

      for (const star of starsRef.current) {
        const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase);
        const opacity = star.baseOpacity * (0.5 + 0.5 * twinkle);
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [visible, dismissed]);

  if (!visible || dismissed) return null;

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-[9997] transition-all duration-600 ease-out ${
          closing ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="relative overflow-hidden bg-[#0c1445]">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          
          <div className="relative px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Moon className="w-5 h-5 text-yellow-200 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <p className="text-white/95 text-sm sm:text-base font-medium">
                  {lang === "cn" ? "深夜育儿辛苦了，你做得棒极了！" : "Late night parenting? You're doing amazing!"} ✨
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <button 
                    onClick={() => setShowGuide(true)}
                    className="text-[10px] sm:text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1 transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    {lang === "cn" ? "深夜育儿生存指南" : "Late Night Survival Guide"}
                  </button>
                  <button 
                    onClick={addHeart}
                    className="text-[10px] sm:text-xs text-pink-300 hover:text-pink-200 flex items-center gap-1 transition-colors"
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    {lang === "cn" ? `夜猫子妈妈俱乐部 (${heartCount})` : `Night Owl Club (${heartCount})`}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleDismiss} className="p-1.5 text-white/40 hover:text-white/90 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#1a1a4e] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Coffee className="w-6 h-6 text-yellow-200" />
                <h3 className="font-display text-xl font-bold">{lang === "cn" ? "深夜育儿生存指南" : "Late Night Survival Guide"}</h3>
              </div>
              <button onClick={() => setShowGuide(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <section className="space-y-2">
                <h4 className="font-bold text-[#1a1a4e] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  {lang === "cn" ? "1. 保持低感官刺激" : "1. Keep it Low Sensory"}
                </h4>
                <p className="text-sm text-[#4A3F35] leading-relaxed">
                  {lang === "cn" 
                    ? "尽量只开微弱的小夜灯，保持声音轻柔，这能帮助宝宝（和你）在结束后更容易回到睡眠状态。" 
                    : "Use minimal lighting and keep voices low. This helps both you and baby drift back to sleep more easily."}
                </p>
              </section>
              <section className="space-y-2">
                <h4 className="font-bold text-[#1a1a4e] flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-brown-500" />
                  {lang === "cn" ? "2. 照顾好你自己" : "2. Take Care of Yourself"}
                </h4>
                <p className="text-sm text-[#4A3F35] leading-relaxed">
                  {lang === "cn" 
                    ? "准备一大瓶水和一点健康的零食。如果你感到焦虑，试试深呼吸，提醒自己这只是一个阶段。" 
                    : "Have a large bottle of water and a healthy snack ready. If you feel anxious, try deep breathing and remind yourself it's just a phase."}
                </p>
              </section>
              <section className="space-y-2">
                <h4 className="font-bold text-[#1a1a4e] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  {lang === "cn" ? "3. 建立一个小仪式" : "3. Create a Small Ritual"}
                </h4>
                <p className="text-sm text-[#4A3F35] leading-relaxed">
                  {lang === "cn" 
                    ? "在心里对自己说一句鼓励的话。你正在为宝宝建立安全感，这是非常伟大的工作。" 
                    : "Say something encouraging to yourself. You are building security for your baby, and that is incredible work."}
                </p>
              </section>
              <button 
                onClick={() => setShowGuide(false)}
                className="w-full py-3 mt-4 rounded-xl bg-[#1a1a4e] text-white font-bold hover:opacity-90 transition-all"
              >
                {lang === "cn" ? "收到，我会加油的" : "Got it, I can do this"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
