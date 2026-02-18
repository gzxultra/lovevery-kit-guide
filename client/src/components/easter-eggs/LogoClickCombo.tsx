/**
 * Easter Egg 2: Logo Click Combo
 * Click the site logo/title 5 times rapidly to trigger party mode.
 * Confetti rains from the top, the page briefly gets a colorful overlay,
 * and the logo bounces on each click.
 */
import { useEffect, useRef, useState, useCallback } from "react";

const CONFETTI_COLORS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4ECDC4", "#9B59B6",
  "#FF8FA3", "#74B9FF", "#FDCB6E", "#E17055", "#00CEC9",
  "#A29BFE", "#FD79A8", "#55EFC4", "#81ECEC", "#FAB1A0",
];

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
  type: "rect" | "circle" | "strip";
}

export default function LogoClickCombo() {
  const [partyMode, setPartyMode] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const confettiRef = useRef<ConfettiPiece[]>([]);
  const startTimeRef = useRef(0);

  // Attach click listener to the logo
  const handleLogoClick = useCallback(() => {
    if (partyMode) return;

    clickCountRef.current++;

    // Add bounce animation to logo
    const logos = document.querySelectorAll("[data-logo-target]");
    logos.forEach((logo) => {
      const el = logo as HTMLElement;
      el.style.transition = "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = `scale(${1 + clickCountRef.current * 0.04})`;
      setTimeout(() => {
        el.style.transform = "scale(1)";
      }, 150);
    });

    // Reset timer on each click
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setPartyMode(true);
    } else {
      // Reset count if no click within 2 seconds
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2000);
    }
  }, [partyMode]);

  // Attach click listener to logo elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const logoEl = target.closest("[data-logo-target]");
      if (logoEl) {
        handleLogoClick();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [handleLogoClick]);

  // Confetti animation
  useEffect(() => {
    if (!partyMode) return;

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
    confettiRef.current = [];

    // Spawn confetti
    const spawnConfetti = (count: number) => {
      for (let i = 0; i < count; i++) {
        const types: ConfettiPiece["type"][] = ["rect", "circle", "strip"];
        confettiRef.current.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * canvas.height * 0.5,
          vx: (Math.random() - 0.5) * 200,
          vy: 150 + Math.random() * 300,
          width: 6 + Math.random() * 8,
          height: 6 + Math.random() * 12,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 600,
          opacity: 1,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 2 + Math.random() * 4,
          type: types[Math.floor(Math.random() * types.length)],
        });
      }
    };

    // Initial burst
    spawnConfetti(120);
    // Second wave
    setTimeout(() => spawnConfetti(80), 400);
    // Third wave
    setTimeout(() => spawnConfetti(60), 900);

    let lastTime = performance.now();
    const TOTAL_DURATION = 5000;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const elapsed = time - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw confetti
      for (let i = confettiRef.current.length - 1; i >= 0; i--) {
        const c = confettiRef.current[i];

        c.vy += 100 * dt; // Gravity
        c.x += c.vx * dt + Math.sin(c.wobble) * 0.8;
        c.y += c.vy * dt;
        c.rotation += c.rotationSpeed * dt;
        c.wobble += c.wobbleSpeed * dt;
        c.vx *= 0.999;

        // Air resistance wobble
        c.vx += Math.sin(c.wobble) * 30 * dt;

        // Fade out in the last phase
        if (elapsed > TOTAL_DURATION - 1500) {
          c.opacity = Math.max(0, c.opacity - dt * 1.0);
        }

        // Remove off-screen or invisible
        if (c.y > canvas.height + 50 || c.opacity <= 0) {
          confettiRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;

        switch (c.type) {
          case "rect":
            ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
            break;
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, c.width / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "strip":
            ctx.fillRect(-c.width / 4, -c.height, c.width / 2, c.height * 2);
            break;
        }

        ctx.restore();
      }

      // End animation
      if (elapsed > TOTAL_DURATION && confettiRef.current.length === 0) {
        setFadeOut(true);
        setTimeout(() => {
          setPartyMode(false);
          setFadeOut(false);
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
  }, [partyMode]);

  if (!partyMode) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] pointer-events-none transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Colorful party overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(255,107,107,0.06) 0%,
            rgba(75,203,196,0.06) 25%,
            rgba(155,89,182,0.06) 50%,
            rgba(255,217,61,0.06) 75%,
            rgba(107,203,119,0.06) 100%
          )`,
          animation: "partyHueShift 2s linear infinite",
          opacity: fadeOut ? 0 : 1,
        }}
      />

      {/* Rainbow border pulse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 80px rgba(155,89,182,0.08), inset 0 0 40px rgba(255,107,107,0.06)",
          animation: "partyBorderPulse 1s ease-in-out infinite alternate",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.5s",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Party message */}
      <div className="absolute inset-x-0 top-20 flex justify-center">
        <div
          className={`
            bg-white/95 backdrop-blur-md rounded-2xl px-8 py-4 shadow-2xl
            border border-[#E8DFD3]
            transition-all duration-700
            ${fadeOut ? "opacity-0 scale-90" : "opacity-100 scale-100"}
          `}
          style={{
            animation: "partyMessageBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          <p className="text-center text-lg font-bold text-[#3D3229] font-['Manrope']">
            🎊 Party Mode Activated! 🎊
          </p>
          <p className="text-center text-sm text-[#6B5E50] mt-1">
            You clicked the logo 5 times — let&apos;s celebrate!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes partyHueShift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes partyBorderPulse {
          0% { box-shadow: inset 0 0 60px rgba(155,89,182,0.06), inset 0 0 30px rgba(255,107,107,0.04); }
          100% { box-shadow: inset 0 0 100px rgba(75,203,196,0.08), inset 0 0 50px rgba(255,217,61,0.06); }
        }
        @keyframes partyMessageBounce {
          0% { opacity: 0; transform: scale(0.3) translateY(-20px); }
          60% { opacity: 1; transform: scale(1.05) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
