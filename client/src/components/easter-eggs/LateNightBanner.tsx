/**
 * Easter Egg 3: Late Night Surprise
 * Shows a warm, encouraging banner between 12 AM and 5 AM
 * with a beautiful starry sky / moon animation background.
 * Stars twinkle, a crescent moon glows, and it can be dismissed gracefully.
 */
import { useEffect, useState, useRef, useCallback } from "react";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);

  // Check time on mount
  useEffect(() => {
    const hour = new Date().getHours();
    const isLateNight = hour >= 0 && hour < 5;

    // Check if already dismissed this session
    const alreadyDismissed = sessionStorage.getItem("lateNightBannerDismissed");

    if (isLateNight && !alreadyDismissed) {
      // Small delay for a graceful entrance
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setClosing(true);
    sessionStorage.setItem("lateNightBannerDismissed", "true");
    setTimeout(() => {
      setDismissed(true);
      setVisible(false);
    }, 600);
  }, []);

  // Stars animation
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

    // Generate stars
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

    // Add a few larger "bright" stars
    for (let i = 0; i < 8; i++) {
      starsRef.current.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 2 + Math.random() * 2,
        baseOpacity: 0.7 + Math.random() * 0.3,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    let startTime = performance.now();

    const drawMoon = (w: number, h: number) => {
      const moonX = w - 50;
      const moonY = h * 0.4;
      const moonR = 14;

      // Moon glow
      const glowGrad = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 3);
      glowGrad.addColorStop(0, "rgba(255, 248, 220, 0.25)");
      glowGrad.addColorStop(0.5, "rgba(255, 248, 220, 0.08)");
      glowGrad.addColorStop(1, "rgba(255, 248, 220, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 3, 0, Math.PI * 2);
      ctx.fill();

      // Moon body
      const moonGrad = ctx.createRadialGradient(moonX - 3, moonY - 3, 0, moonX, moonY, moonR);
      moonGrad.addColorStop(0, "#FFF8DC");
      moonGrad.addColorStop(0.7, "#F5E6B8");
      moonGrad.addColorStop(1, "#E8D5A0");
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Crescent shadow (make it a crescent moon)
      ctx.fillStyle = "rgba(30, 30, 60, 0.6)";
      ctx.beginPath();
      ctx.arc(moonX + 5, moonY - 2, moonR * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Re-draw the lit part
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Crescent cutout
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.beginPath();
      ctx.arc(moonX + 6, moonY - 3, moonR * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Re-add subtle glow after cutout
      const glowGrad2 = ctx.createRadialGradient(moonX, moonY, moonR * 0.3, moonX, moonY, moonR * 2);
      glowGrad2.addColorStop(0, "rgba(255, 248, 220, 0.12)");
      glowGrad2.addColorStop(1, "rgba(255, 248, 220, 0)");
      ctx.fillStyle = glowGrad2;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawShootingStar = (time: number, w: number, h: number) => {
      // Occasional shooting star
      const cycle = (time / 1000) % 8;
      if (cycle > 0.8) return;

      const progress = cycle / 0.8;
      const startX = w * 0.2;
      const startY = h * 0.15;
      const endX = w * 0.55;
      const endY = h * 0.6;

      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;

      const tailLength = 40;
      const tailX = currentX - (endX - startX) / Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) * tailLength;
      const tailY = currentY - (endY - startY) / Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) * tailLength;

      const grad = ctx.createLinearGradient(tailX, tailY, currentX, currentY);
      grad.addColorStop(0, "rgba(255, 255, 255, 0)");
      grad.addColorStop(1, `rgba(255, 255, 255, ${0.7 * (1 - progress)})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    };

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect?.width || 800;
      const h = rect?.height || 80;

      ctx.clearRect(0, 0, w, h);

      // Draw stars
      for (const star of starsRef.current) {
        const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase);
        const opacity = star.baseOpacity * (0.5 + 0.5 * twinkle);

        ctx.save();
        ctx.globalAlpha = opacity;

        if (star.size > 2) {
          // Larger stars get a cross/sparkle effect
          const sparkleSize = star.size * (1 + 0.3 * twinkle);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - sparkleSize, star.y);
          ctx.lineTo(star.x + sparkleSize, star.y);
          ctx.moveTo(star.x, star.y - sparkleSize);
          ctx.lineTo(star.x, star.y + sparkleSize);
          ctx.stroke();

          // Core glow
          const starGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 1.5);
          starGlow.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          starGlow.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
          starGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = starGlow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star dot
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Draw moon
      drawMoon(w, h);

      // Draw occasional shooting star
      drawShootingStar(time, w, h);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [visible, dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[9997]
        transition-all duration-600 ease-out
        ${closing
          ? "opacity-0 -translate-y-full"
          : "opacity-100 translate-y-0"
        }
      `}
      style={{
        animation: !closing ? "bannerSlideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both" : undefined,
      }}
    >
      <div className="relative overflow-hidden">
        {/* Starry background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #0c1445 0%, #1a1a4e 30%, #2d1b69 60%, #1a1a4e 80%, #0c1445 100%)",
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
          />
        </div>

        {/* Content */}
        <div className="relative px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Moon icon */}
            <span className="text-xl sm:text-2xl shrink-0" style={{ animation: "moonFloat 3s ease-in-out infinite" }}>
              🌙
            </span>
            <div className="min-w-0">
              <p className="text-white/95 text-sm sm:text-base font-medium font-['Manrope'] truncate">
                Late night parenting? You&apos;re doing amazing!{" "}
                <span className="inline-block" style={{ animation: "sparkleRotate 2s ease-in-out infinite" }}>✨</span>
              </p>
              <p className="text-white/50 text-xs mt-0.5 hidden sm:block">
                We see you, super parent. Take care of yourself too.
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="shrink-0 ml-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 
                       flex items-center justify-center transition-all duration-200
                       text-white/60 hover:text-white/90 hover:scale-110 active:scale-95"
            aria-label="Dismiss banner"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 80%, transparent)",
          }}
        />
      </div>

      <style>{`
        @keyframes bannerSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes moonFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }
        @keyframes sparkleRotate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(15deg) scale(1.2); }
          50% { transform: rotate(0deg) scale(1); }
          75% { transform: rotate(-15deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
