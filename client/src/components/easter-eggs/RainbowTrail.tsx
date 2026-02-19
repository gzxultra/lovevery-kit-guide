/**
 * Easter Egg 4: Rainbow Doodle
 * Mouse movement leaves a rainbow trail that persists as a doodle.
 * Users can clear it or "save" it (simulated).
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Palette, Trash2, Camera, X } from "lucide-react";

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
const POOL_SIZE = 1000; // Increased for persistence

export default function RainbowTrail() {
  const [enabled, setEnabled] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const { lang } = useLanguage();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<TrailDot[]>([]);
  const hueRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    dotsRef.current = Array.from({ length: POOL_SIZE }, () => ({
      x: 0, y: 0, size: 0, hue: 0, life: 1, maxLife: 1, active: false,
    }));
  }, []);

  useEffect(() => {
    const findTarget = () => {
      const el = document.querySelector("[data-rainbow-portal]");
      if (el instanceof HTMLElement) setPortalTarget(el);
    };
    findTarget();
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const spawnDot = useCallback((x: number, y: number) => {
    const dot = dotsRef.current.find(d => !d.active) || dotsRef.current[0];
    dot.x = x;
    dot.y = y;
    dot.size = 6 + Math.random() * 4;
    dot.hue = hueRef.current;
    dot.active = true;
    hueRef.current = (hueRef.current + 2) % 360;
    
    // Rotate the pool
    dotsRef.current.push(dotsRef.current.shift()!);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!enabledRef.current) return;
      spawnDot(e.clientX, e.clientY);
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [spawnDot]);

  useEffect(() => {
    if (!enabled) return;
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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const dot of dotsRef.current) {
        if (!dot.active) continue;
        ctx.fillStyle = `hsla(${dot.hue}, ${RAINBOW_SATURATION}%, ${RAINBOW_LIGHTNESS}%, 0.6)`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }
      if (enabledRef.current) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => window.removeEventListener("resize", resize);
  }, [enabled]);

  const clearDoodle = () => {
    dotsRef.current.forEach(d => d.active = false);
  };

  const saveDoodle = () => {
    // In a real app, we'd use toDataURL and download. For now, just show a message.
    alert(lang === "cn" ? "涂鸦已保存！快去分享给朋友吧~" : "Doodle saved! Share it with your friends!");
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "save_doodle");
    }
  };

  return (
    <>
      {portalTarget && createPortal(
        <button
          onClick={() => setEnabled(!enabled)}
          className={`w-6 h-6 rounded-full transition-all duration-300 hover:scale-125 ${enabled ? "ring-2 ring-offset-2 ring-[#7FB685]" : "opacity-40"}`}
          style={{ background: "conic-gradient(#FF6B6B, #FFD93D, #6BCB77, #4ECDC4, #9B59B6, #FF6B6B)" }}
        />,
        portalTarget
      )}

      {enabled && (
        <>
          <canvas ref={canvasRef} className="fixed inset-0 z-[9996] pointer-events-none" />
          <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 animate-in slide-in-from-right-10">
            <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-[#E8DFD3] flex flex-col gap-2">
              <button onClick={saveDoodle} className="p-3 hover:bg-[#FAF7F2] rounded-xl text-[#6B5E50] transition-colors flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <span className="text-xs font-bold">{lang === "cn" ? "保存" : "Save"}</span>
              </button>
              <button onClick={clearDoodle} className="p-3 hover:bg-[#FAF7F2] rounded-xl text-[#6B5E50] transition-colors flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span className="text-xs font-bold">{lang === "cn" ? "清除" : "Clear"}</span>
              </button>
              <div className="h-px bg-[#E8DFD3] mx-2" />
              <button onClick={() => setEnabled(false)} className="p-3 hover:bg-red-50 rounded-xl text-red-400 transition-colors flex items-center gap-2">
                <X className="w-5 h-5" />
                <span className="text-xs font-bold">{lang === "cn" ? "退出" : "Exit"}</span>
              </button>
            </div>
            <div className="bg-[#3D3229] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-center shadow-lg">
              {lang === "cn" ? "彩虹涂鸦模式" : "Rainbow Doodle Mode"}
            </div>
          </div>
        </>
      )}
    </>
  );
}
