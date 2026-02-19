/**
 * Mobile Easter Egg 2: Long Press Hero
 * Long press (3 seconds) on the hero image to trigger a magical surprise.
 * Magical particles burst from the press point, and a hidden message appears.
 * Only works on mobile/touch devices.
 */
import { useEffect, useState, useRef, useCallback } from "react";

const LONG_PRESS_DURATION = 2500; // 2.5 seconds

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
}

const EMOJIS = ["✨", "🌟", "⭐", "💫", "🎨", "🎪", "🎭", "🎨", "🧸", "🎈", "🎁", "🎀"];

export default function LongPressHero() {
  const [triggered, setTriggered] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [pressPosition, setPressPosition] = useState({ x: 0, y: 0 });
  const [fadeOut, setFadeOut] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef(0);

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

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number) => {
    const count = 30;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 100 + Math.random() * 200;
      particlesRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 20 + Math.random() * 20,
        color: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4ECDC4", "#9B59B6", "#FF8FA3"][
          Math.floor(Math.random() * 6)
        ],
        life: 1,
        maxLife: 1 + Math.random() * 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 360,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      });
    }
  }, []);

  // Handle touch events on hero images
  useEffect(() => {
    if (!isMobile()) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (triggered) return;
      const target = e.target as HTMLElement;
      // Check if touch is on hero image or its container
      const heroImage = target.closest("[data-hero-image]");
      if (!heroImage) return;

      e.preventDefault();
      const touch = e.touches[0];
      const rect = (heroImage as HTMLElement).getBoundingClientRect();
      const x = touch.clientX;
      const y = touch.clientY;

      setPressing(true);
      setPressPosition({ x, y });
      setPressProgress(0);
      vibrate(10);

      // Progress animation
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / LONG_PRESS_DURATION, 1);
        setPressProgress(progress);
        if (progress >= 1) {
          clearInterval(progressIntervalRef.current);
        }
      }, 16);

      // Trigger after duration
      pressTimerRef.current = setTimeout(() => {
        setPressing(false);
        setPressProgress(0);
        setTriggered(true);
        spawnParticles(x, y);
        vibrate([50, 30, 50, 30, 100]);
      }, LONG_PRESS_DURATION);
    };

    const handleTouchEnd = () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setPressing(false);
      setPressProgress(0);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isMobile, triggered, spawnParticles, vibrate]);

  // Particles animation
  useEffect(() => {
    if (!triggered) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    startTimeRef.current = performance.now();
    let lastTime = performance.now();
    const TOTAL_DURATION = 4000;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const elapsed = time - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vy += 200 * dt; // Gravity
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        p.life -= dt / p.maxLife;
        p.vx *= 0.98;

        if (p.life <= 0 || p.y > canvas.height + 100) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.life;
        ctx.font = `${p.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      // End animation
      if (elapsed > TOTAL_DURATION - 800) {
        setFadeOut(true);
      }

      if (elapsed > TOTAL_DURATION && particlesRef.current.length === 0) {
        setTimeout(() => {
          setTriggered(false);
          setFadeOut(false);
          particlesRef.current = [];
        }, 800);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [triggered]);

  if (!isMobile()) return null;

  return (
    <>
      {/* Long press indicator */}
      {pressing && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: pressPosition.x,
            top: pressPosition.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative w-20 h-20">
            {/* Outer ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="rgba(127, 182, 133, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#7FB685"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset={220 * (1 - pressProgress)}
                style={{ transition: "stroke-dashoffset 0.016s linear" }}
              />
            </svg>
            {/* Center emoji */}
            <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
              ✨
            </div>
          </div>
        </div>
      )}

      {/* Particles canvas */}
      {triggered && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-[9998] pointer-events-none"
        />
      )}

      {/* Message overlay */}
      {triggered && (
        <div
          className={`fixed inset-0 z-[9997] flex items-center justify-center pointer-events-none transition-opacity duration-700 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border border-[#E8DFD3] max-w-sm mx-4"
            style={{
              animation: "longPressMessageIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <div className="text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-lg font-bold text-[#3D3229] mb-2 font-['Manrope']">
                You Found the Secret!
              </p>
              <p className="text-sm text-[#6B5E50]">
                Long press magic unlocked! ✨
              </p>
              <p className="text-xs text-[#756A5C] mt-3">
                Try long-pressing other images too!
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes longPressMessageIn {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(30px);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
