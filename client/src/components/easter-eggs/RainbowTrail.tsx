/**
 * Easter Egg 4: Rainbow Mouse Trail
 * Activated by clicking a hidden icon in the footer.
 * Mouse movement leaves a beautiful rainbow gradient trail of fading dots.
 * Performance-optimized with canvas rendering and object pooling.
 *
 * The hidden toggle is rendered via React Portal into a container
 * element placed in the footer (data-rainbow-portal).
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface TrailDot {
  x: number;
  y: number;
  size: number;
  hue: number;
  life: number;
  maxLife: number;
  active: boolean;
}

const RAINBOW_SATURATION = 85;
const RAINBOW_LIGHTNESS = 65;
const POOL_SIZE = 200;

export default function RainbowTrail() {
  const [enabled, setEnabled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dotsRef = useRef<TrailDot[]>([]);
  const hueRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastSpawnRef = useRef(0);
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Initialize dot pool
  useEffect(() => {
    dotsRef.current = Array.from({ length: POOL_SIZE }, () => ({
      x: 0, y: 0, size: 0, hue: 0, life: 0, maxLife: 0, active: false,
    }));
  }, []);

  // Find the portal target in the footer
  useEffect(() => {
    const findTarget = () => {
      const el = document.querySelector("[data-rainbow-portal]");
      if (el instanceof HTMLElement) {
        setPortalTarget(el);
      }
    };
    findTarget();
    // Retry for lazy-loaded pages
    const t1 = setTimeout(findTarget, 1000);
    const t2 = setTimeout(findTarget, 3000);
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, []);

  const getInactiveDot = useCallback((): TrailDot | null => {
    for (const dot of dotsRef.current) {
      if (!dot.active) return dot;
    }
    return null;
  }, []);

  const spawnDot = useCallback((x: number, y: number) => {
    const dot = getInactiveDot();
    if (!dot) return;
    dot.x = x;
    dot.y = y;
    dot.size = 4 + Math.random() * 6;
    dot.hue = hueRef.current;
    dot.maxLife = 0.5 + Math.random() * 0.4;
    dot.life = dot.maxLife;
    dot.active = true;
    hueRef.current = (hueRef.current + 3) % 360;
  }, [getInactiveDot]);

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!enabledRef.current) return;
      const now = performance.now();
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 3 && now - lastSpawnRef.current > 8) {
        spawnDot(e.clientX, e.clientY);
        if (dist > 20) {
          const midX = (e.clientX + lastPosRef.current.x) / 2;
          const midY = (e.clientY + lastPosRef.current.y) / 2;
          spawnDot(midX + (Math.random() - 0.5) * 4, midY + (Math.random() - 0.5) * 4);
        }
        lastSpawnRef.current = now;
      }
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [spawnDot]);

  // Canvas animation loop
  useEffect(() => {
    if (!enabled) {
      for (const dot of dotsRef.current) dot.active = false;
      return;
    }
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

    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let hasActive = false;
      for (const dot of dotsRef.current) {
        if (!dot.active) continue;
        hasActive = true;
        dot.life -= dt;
        if (dot.life <= 0) { dot.active = false; continue; }
        const progress = dot.life / dot.maxLife;
        const size = dot.size * progress;
        const opacity = progress * 0.8;
        ctx.save();
        ctx.globalAlpha = opacity;
        // Outer glow
        const glowGrad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, size * 2);
        glowGrad.addColorStop(0, `hsla(${dot.hue}, ${RAINBOW_SATURATION}%, ${RAINBOW_LIGHTNESS}%, 0.3)`);
        glowGrad.addColorStop(1, `hsla(${dot.hue}, ${RAINBOW_SATURATION}%, ${RAINBOW_LIGHTNESS}%, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        // Core dot
        const coreGrad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, size);
        coreGrad.addColorStop(0, `hsla(${dot.hue}, ${RAINBOW_SATURATION}%, ${RAINBOW_LIGHTNESS + 20}%, 1)`);
        coreGrad.addColorStop(0.6, `hsla(${dot.hue}, ${RAINBOW_SATURATION}%, ${RAINBOW_LIGHTNESS}%, 0.8)`);
        coreGrad.addColorStop(1, `hsla(${dot.hue}, ${RAINBOW_SATURATION}%, ${RAINBOW_LIGHTNESS}%, 0)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (hasActive || enabledRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  const toggleTrail = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return (
    <>
      {/* Portal the hidden toggle into the footer container */}
      {portalTarget &&
        createPortal(
          <button
            onClick={toggleTrail}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`
              relative w-5 h-5 rounded-full transition-all duration-300
              hover:scale-150 hover:shadow-lg active:scale-125
              ${enabled ? "scale-125 shadow-md" : "opacity-30 hover:opacity-80"}
            `}
            style={{
              background: "conic-gradient(#FF6B6B, #FFD93D, #6BCB77, #4ECDC4, #9B59B6, #FF6B6B)",
              animation: enabled ? "rainbowSpin 2s linear infinite" : undefined,
            }}
            aria-label="Toggle rainbow mouse trail"
          >
            {showTooltip && (
              <span
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                           bg-[#3D3229] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg
                           pointer-events-none z-50"
                style={{ animation: "tooltipFadeIn 0.2s ease-out both" }}
              >
                {enabled ? "Disable rainbow trail" : "Enable rainbow trail 🌈"}
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#3D3229]" />
              </span>
            )}
          </button>,
          portalTarget
        )}

      {/* Canvas overlay for trail */}
      {enabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-[9996] pointer-events-none"
          style={{ mixBlendMode: "screen" }}
        />
      )}

      {/* Floating indicator when enabled */}
      {enabled && (
        <div
          className="fixed bottom-4 right-4 z-[9997] pointer-events-auto"
          style={{ animation: "rainbowIndicatorIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
        >
          <button
            onClick={toggleTrail}
            className="group flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full
                       pl-3 pr-3.5 py-2 shadow-lg border border-[#E8DFD3]
                       hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{
                background: "conic-gradient(#FF6B6B, #FFD93D, #6BCB77, #4ECDC4, #9B59B6, #FF6B6B)",
                animation: "rainbowSpin 2s linear infinite",
              }}
            />
            <span className="text-xs font-medium text-[#3D3229]">Rainbow Trail On</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9B8E7E" strokeWidth="2" strokeLinecap="round" className="group-hover:stroke-[#3D3229] transition-colors">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes rainbowIndicatorIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rainbowSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes tooltipFadeIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(4px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
