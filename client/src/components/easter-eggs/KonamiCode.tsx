/**
 * Easter Egg 1: Konami Code
 * ↑↑↓↓←→←→BA triggers a beautiful falling toys/blocks animation
 * and unlocks a secret discount code or parenting tip.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Sparkles, Gift, Lightbulb, Copy, Check } from "lucide-react";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

const TOY_SHAPES = [
  { type: "block", color: "#FF6B6B", emoji: "🧱" },
  { type: "star", color: "#FFD93D", emoji: "⭐" },
  { type: "ball", color: "#6BCB77", emoji: "🔵" },
  { type: "heart", color: "#FF8FA3", emoji: "💖" },
  { type: "bear", color: "#C4A882", emoji: "🧸" },
  { type: "puzzle", color: "#9B59B6", emoji: "🧩" },
  { type: "car", color: "#4ECDC4", emoji: "🚗" },
  { type: "duck", color: "#FFE66D", emoji: "🦆" },
  { type: "ring", color: "#FF7675", emoji: "🔴" },
  { type: "abc", color: "#74B9FF", emoji: "🔤" },
];

const TIPS = {
  cn: [
    "观察宝宝：最好的教育是跟随宝宝的节奏，观察他们现在对什么感兴趣。",
    "少即是多：给宝宝提供有限的玩具选择，有助于培养他们的专注力。",
    "地板时间：尽可能多地让宝宝在平坦安全的地板上自由活动，这对大运动发展至关重要。",
    "描述性语言：即使宝宝还不会说话，也要经常向他们描述你正在做的事情。",
    "重复的力量：宝宝通过重复来学习，同一个玩具玩很多次也是非常有意义的。",
  ],
  en: [
    "Observe your baby: The best education is following your baby's lead and seeing what interests them.",
    "Less is more: Providing a limited selection of toys helps develop your baby's focus.",
    "Floor time: Give your baby as much time as possible to move freely on a flat, safe floor.",
    "Narrate your day: Even if they can't talk yet, describe what you're doing to build their language skills.",
    "Power of repetition: Babies learn through repetition; playing with the same toy many times is meaningful.",
  ]
};

const DISCOUNT_CODE = "FAN20";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  shape: typeof TOY_SHAPES[number];
  opacity: number;
  bounceCount: number;
  scale: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export default function KonamiCode() {
  const [triggered, setTriggered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [randomTip, setRandomTip] = useState("");
  const { lang } = useLanguage();
  
  const sequenceRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (triggered) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    sequenceRef.current.push(key);
    if (sequenceRef.current.length > KONAMI_SEQUENCE.length) {
      sequenceRef.current.shift();
    }
    if (
      sequenceRef.current.length === KONAMI_SEQUENCE.length &&
      sequenceRef.current.every((k, i) => k === KONAMI_SEQUENCE[i])
    ) {
      setTriggered(true);
      sequenceRef.current = [];
      const tips = TIPS[lang as keyof typeof TIPS] || TIPS.en;
      setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
      
      // Send GA event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "unlock_konami", {
          method: "konami_code"
        });
      }
    }
  }, [triggered, lang]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const spawnBounceParticles = useCallback((x: number, y: number, color: string) => {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      particlesRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: -Math.abs(Math.sin(angle)) * (3 + Math.random() * 2),
        color,
        size: 3 + Math.random() * 4,
        life: 1,
        maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }, []);

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
    itemsRef.current = [];
    particlesRef.current = [];

    setTimeout(() => setShowModal(true), 2500);

    let lastTime = performance.now();
    const GRAVITY = 800;
    const BOUNCE_DAMPING = 0.55;
    const GROUND_Y_OFFSET = 60;
    const TOTAL_DURATION = 6000;
    let nextId = 0;

    const spawnItem = () => {
      const shape = TOY_SHAPES[Math.floor(Math.random() * TOY_SHAPES.length)];
      const size = 28 + Math.random() * 24;
      itemsRef.current.push({
        id: nextId++,
        x: 60 + Math.random() * (canvas.width - 120),
        y: -size - Math.random() * 100,
        vy: 50 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 120,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 300,
        size,
        shape,
        opacity: 1,
        bounceCount: 0,
        scale: 1,
      });
    };

    for (let i = 0; i < 15; i++) {
      spawnItem();
    }

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      const elapsed = time - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = itemsRef.current.length - 1; i >= 0; i--) {
        const item = itemsRef.current[i];
        item.vy += GRAVITY * dt;
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        item.rotation += item.rotationSpeed * dt;

        const groundY = canvas.height - GROUND_Y_OFFSET - item.size / 2;
        if (item.y > groundY) {
          item.y = groundY;
          item.vy = -item.vy * BOUNCE_DAMPING;
          item.vx *= 0.8;
          item.rotationSpeed *= 0.6;
          item.bounceCount++;
          spawnBounceParticles(item.x, item.y + item.size / 2, item.shape.color);
        }

        if (elapsed > TOTAL_DURATION - 1000) {
          item.opacity = Math.max(0, 1 - (elapsed - (TOTAL_DURATION - 1000)) / 1000);
        }

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.globalAlpha = item.opacity;
        ctx.font = `${item.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.shape.emoji, 0, 0);
        ctx.restore();
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= dt / p.maxLife;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      if (elapsed < TOTAL_DURATION) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setTriggered(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [triggered, spawnBounceParticles]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "copy_konami_code", { code: DISCOUNT_CODE });
    }
  };

  if (!triggered && !showModal) return null;

  return (
    <>
      {triggered && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-[9999] pointer-events-none"
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-[#E8A87C] to-[#D4A574] p-6 text-white relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6" />
                <h3 className="text-xl font-bold font-['Manrope']">
                  {lang === "cn" ? "恭喜解锁隐藏惊喜！" : "Hidden Surprise Unlocked!"}
                </h3>
              </div>
              <p className="text-white/90 text-sm">
                {lang === "cn" ? "你是真正的 Lovevery 粉丝，为你准备了特别礼物。" : "You're a true Lovevery fan. Here's something special for you."}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#F0EBE3]">
                <div className="flex items-center gap-2 mb-2 text-[#D4A574]">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {lang === "cn" ? "育儿小贴士" : "Parenting Tip"}
                  </span>
                </div>
                <p className="text-[#4A3F35] text-sm leading-relaxed italic">
                  "{randomTip}"
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#6B5E50]">
                  <Gift className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {lang === "cn" ? "隐藏优惠码" : "Secret Discount Code"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#F0F7F1] border-2 border-dashed border-[#7FB685] rounded-xl flex items-center justify-center p-3 font-mono font-bold text-xl text-[#2E7D32] tracking-widest">
                    {DISCOUNT_CODE}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 rounded-xl bg-[#3D3229] text-white hover:bg-[#524539] transition-all flex items-center justify-center"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#B0A89E] text-center">
                  {lang === "cn" ? "* 适用于官网部分订阅及单品，以官网结算为准" : "* Valid for select products on official site. Subject to terms."}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3.5 rounded-xl bg-[#E8A87C] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-[#E8A87C]/20"
              >
                {lang === "cn" ? "太棒了，继续探索" : "Awesome, keep exploring"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
