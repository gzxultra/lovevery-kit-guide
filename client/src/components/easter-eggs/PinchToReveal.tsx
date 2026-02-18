/**
 * Mobile Easter Egg 3: Pinch to Reveal
 * Pinch in (zoom out gesture) on the page to reveal a hidden achievement badge.
 * A beautiful badge appears with a zoom-in animation and sparkle effects.
 * Only works on mobile/touch devices with multi-touch support.
 */
import { useEffect, useState, useRef, useCallback } from "react";

const PINCH_THRESHOLD = 0.7; // Pinch to 70% of original distance
const COOLDOWN = 5000; // 5 seconds between activations

export default function PinchToReveal() {
  const [triggered, setTriggered] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [badgeScale, setBadgeScale] = useState(0);
  const initialDistanceRef = useRef<number>(0);
  const lastTriggerRef = useRef(0);
  const isPinchingRef = useRef(false);

  // Check if device is mobile
  const isMobile = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      (window.innerWidth <= 768 || "ontouchstart" in window)
    );
  }, []);

  // Vibrate if supported
  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Handle pinch gesture
  useEffect(() => {
    if (!isMobile()) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinchingRef.current = true;
        initialDistanceRef.current = getTouchDistance(e.touches);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPinchingRef.current || e.touches.length !== 2) return;
      if (triggered) return;

      const now = Date.now();
      if (now - lastTriggerRef.current < COOLDOWN) return;

      const currentDistance = getTouchDistance(e.touches);
      const ratio = currentDistance / initialDistanceRef.current;

      // Pinch in detected
      if (ratio < PINCH_THRESHOLD) {
        lastTriggerRef.current = now;
        setTriggered(true);
        setBadgeScale(0);
        vibrate([30, 20, 30, 20, 50]);

        // Animate badge scale
        let scale = 0;
        const scaleInterval = setInterval(() => {
          scale += 0.05;
          if (scale >= 1) {
            scale = 1;
            clearInterval(scaleInterval);
          }
          setBadgeScale(scale);
        }, 16);

        // Auto-hide after duration
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setTriggered(false);
            setFadeOut(false);
            setBadgeScale(0);
          }, 600);
        }, 4000);
      }
    };

    const handleTouchEnd = () => {
      isPinchingRef.current = false;
      initialDistanceRef.current = 0;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isMobile, getTouchDistance, vibrate, triggered]);

  if (!isMobile() || !triggered) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Badge */}
      <div
        className="relative"
        style={{
          transform: `scale(${badgeScale})`,
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Glow rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute w-64 h-64 rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(127,182,133,0.4) 0%, transparent 70%)",
              animation: "pulseGlow 2s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-48 h-48 rounded-full opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(127,182,133,0.5) 0%, transparent 70%)",
              animation: "pulseGlow 2s ease-in-out infinite 0.5s",
            }}
          />
        </div>

        {/* Main badge */}
        <div
          className="relative bg-gradient-to-br from-white to-[#F5F5F0] rounded-full w-48 h-48 
                     shadow-2xl border-4 border-[#7FB685] flex flex-col items-center justify-center
                     overflow-hidden"
        >
          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)",
              animation: "shine 3s ease-in-out infinite",
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center px-6">
            <div className="text-5xl mb-2 animate-bounce-slow">🏆</div>
            <p className="text-lg font-bold text-[#3D3229] mb-1 font-['Manrope']">
              Achievement
            </p>
            <p className="text-sm text-[#7FB685] font-semibold mb-1">
              Pinch Master
            </p>
            <p className="text-xs text-[#6B5E50]">
              You discovered the pinch secret!
            </p>
          </div>

          {/* Decorative stars */}
          <div className="absolute top-4 left-4 text-xl animate-spin-slow">⭐</div>
          <div className="absolute top-6 right-6 text-lg animate-spin-slow-reverse">✨</div>
          <div className="absolute bottom-6 left-6 text-lg animate-spin-slow">💫</div>
          <div className="absolute bottom-4 right-4 text-xl animate-spin-slow-reverse">🌟</div>
        </div>

        {/* Floating sparkles */}
        <div className="absolute -top-8 -left-8 text-3xl animate-float-1">✨</div>
        <div className="absolute -top-10 -right-6 text-2xl animate-float-2">⭐</div>
        <div className="absolute -bottom-8 -left-6 text-2xl animate-float-3">💫</div>
        <div className="absolute -bottom-10 -right-8 text-3xl animate-float-4">🌟</div>
        <div className="absolute top-1/2 -left-12 text-xl animate-float-5">🎉</div>
        <div className="absolute top-1/2 -right-12 text-xl animate-float-6">🎊</div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 5s linear infinite;
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
          25% { transform: translate(10px, -15px) rotate(90deg); opacity: 1; }
          50% { transform: translate(0, -25px) rotate(180deg); opacity: 0.7; }
          75% { transform: translate(-10px, -15px) rotate(270deg); opacity: 1; }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
          33% { transform: translate(-12px, 18px) rotate(120deg); opacity: 1; }
          66% { transform: translate(8px, 22px) rotate(240deg); opacity: 0.8; }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
          50% { transform: translate(15px, 20px) rotate(180deg); opacity: 1; }
        }
        @keyframes float-4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
          33% { transform: translate(10px, -20px) rotate(-120deg); opacity: 1; }
          66% { transform: translate(-8px, -18px) rotate(-240deg); opacity: 0.8; }
        }
        @keyframes float-5 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(-20px, 10px) scale(1.2); opacity: 1; }
        }
        @keyframes float-6 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(20px, -10px) scale(1.2); opacity: 1; }
        }
        .animate-float-1 { animation: float-1 3s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 3.5s ease-in-out infinite 0.5s; }
        .animate-float-3 { animation: float-3 2.8s ease-in-out infinite 1s; }
        .animate-float-4 { animation: float-4 3.2s ease-in-out infinite 0.3s; }
        .animate-float-5 { animation: float-5 2.5s ease-in-out infinite 0.8s; }
        .animate-float-6 { animation: float-6 2.7s ease-in-out infinite 0.2s; }
      `}</style>
    </div>
  );
}
