/**
 * Easter Egg 1: Konami Code
 * ↑↑↓↓←→←→BA triggers a beautiful falling toys/blocks animation
 * with physics bouncing, colorful particles, and a secret message.
 */
import { useEffect, useState, useCallback, useRef } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

// Toy/block shapes as SVG paths with colors matching the Lovevery palette
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
  const [showMessage, setShowMessage] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const sequenceRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const spawnTimerRef = useRef(0);
  const startTimeRef = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (triggered) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    sequenceRef.current.push(key);
    // Keep only the last N keys
    if (sequenceRef.current.length > KONAMI_SEQUENCE.length) {
      sequenceRef.current.shift();
    }
    // Check match
    if (
      sequenceRef.current.length === KONAMI_SEQUENCE.length &&
      sequenceRef.current.every((k, i) => k === KONAMI_SEQUENCE[i])
    ) {
      setTriggered(true);
      sequenceRef.current = [];
    }
  }, [triggered]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Spawn particles on bounce
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

  // Main animation loop
  useEffect(() => {
    if (!triggered) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    startTimeRef.current = performance.now();
    spawnTimerRef.current = 0;
    itemsRef.current = [];
    particlesRef.current = [];

    // Show message after a brief delay
    setTimeout(() => setShowMessage(true), 600);

    let lastTime = performance.now();
    const GRAVITY = 800;
    const BOUNCE_DAMPING = 0.55;
    const GROUND_Y_OFFSET = 60;
    const TOTAL_DURATION = 6000;
    const SPAWN_DURATION = 2500;
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

    // Initial burst
    for (let i = 0; i < 8; i++) {
      spawnItem();
    }

    const drawToyShape = (item: FallingItem) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.scale(item.scale, item.scale);
      ctx.globalAlpha = item.opacity;

      const s = item.size;
      const half = s / 2;

      switch (item.shape.type) {
        case "block": {
          // Rounded block with 3D effect
          const radius = 4;
          ctx.fillStyle = item.shape.color;
          ctx.beginPath();
          ctx.roundRect(-half, -half, s, s, radius);
          ctx.fill();
          // Highlight
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.beginPath();
          ctx.roundRect(-half + 3, -half + 3, s * 0.45, s * 0.45, radius);
          ctx.fill();
          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.beginPath();
          ctx.roundRect(-half + s * 0.3, -half + s * 0.3, s * 0.65, s * 0.65, radius);
          ctx.fill();
          break;
        }
        case "star": {
          ctx.fillStyle = item.shape.color;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i === 0 ? half : half;
            const method = i === 0 ? "moveTo" : "lineTo";
            ctx[method](Math.cos(angle) * r, Math.sin(angle) * r);
            const innerAngle = angle + (2 * Math.PI) / 10;
            ctx.lineTo(Math.cos(innerAngle) * half * 0.4, Math.sin(innerAngle) * half * 0.4);
          }
          ctx.closePath();
          ctx.fill();
          // Glow
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.beginPath();
          ctx.arc(-half * 0.15, -half * 0.15, half * 0.25, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "ball": {
          // Gradient ball
          const grad = ctx.createRadialGradient(-half * 0.3, -half * 0.3, 0, 0, 0, half);
          grad.addColorStop(0, "#9BE8A8");
          grad.addColorStop(0.7, item.shape.color);
          grad.addColorStop(1, "#3AA04D");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, half, 0, Math.PI * 2);
          ctx.fill();
          // Shine
          ctx.fillStyle = "rgba(255,255,255,0.45)";
          ctx.beginPath();
          ctx.ellipse(-half * 0.25, -half * 0.3, half * 0.3, half * 0.2, -0.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "heart": {
          ctx.fillStyle = item.shape.color;
          ctx.beginPath();
          const topY = -half * 0.4;
          ctx.moveTo(0, half * 0.7);
          ctx.bezierCurveTo(-half, half * 0.2, -half, topY, -half * 0.5, topY);
          ctx.bezierCurveTo(-half * 0.15, topY - half * 0.4, 0, topY, 0, topY + half * 0.2);
          ctx.bezierCurveTo(0, topY, half * 0.15, topY - half * 0.4, half * 0.5, topY);
          ctx.bezierCurveTo(half, topY, half, half * 0.2, 0, half * 0.7);
          ctx.fill();
          // Shine
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.beginPath();
          ctx.arc(-half * 0.25, -half * 0.15, half * 0.18, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "bear": {
          // Cute bear face
          const grad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, half);
          grad2.addColorStop(0, "#D4B896");
          grad2.addColorStop(1, item.shape.color);
          ctx.fillStyle = grad2;
          ctx.beginPath();
          ctx.arc(0, 0, half * 0.8, 0, Math.PI * 2);
          ctx.fill();
          // Ears
          ctx.beginPath();
          ctx.arc(-half * 0.55, -half * 0.55, half * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(half * 0.55, -half * 0.55, half * 0.3, 0, Math.PI * 2);
          ctx.fill();
          // Inner ears
          ctx.fillStyle = "#E8C9A0";
          ctx.beginPath();
          ctx.arc(-half * 0.55, -half * 0.55, half * 0.17, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(half * 0.55, -half * 0.55, half * 0.17, 0, Math.PI * 2);
          ctx.fill();
          // Eyes
          ctx.fillStyle = "#3D3229";
          ctx.beginPath();
          ctx.arc(-half * 0.22, -half * 0.1, half * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(half * 0.22, -half * 0.1, half * 0.08, 0, Math.PI * 2);
          ctx.fill();
          // Nose
          ctx.fillStyle = "#8B6F47";
          ctx.beginPath();
          ctx.arc(0, half * 0.1, half * 0.1, 0, Math.PI * 2);
          ctx.fill();
          // Mouth
          ctx.strokeStyle = "#8B6F47";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, half * 0.18, half * 0.12, 0, Math.PI);
          ctx.stroke();
          break;
        }
        case "puzzle": {
          ctx.fillStyle = item.shape.color;
          // Main piece
          ctx.beginPath();
          ctx.roundRect(-half, -half, s, s, 3);
          ctx.fill();
          // Knob top
          ctx.beginPath();
          ctx.arc(0, -half, half * 0.25, 0, Math.PI * 2);
          ctx.fill();
          // Hole right
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath();
          ctx.arc(half, 0, half * 0.25, 0, Math.PI * 2);
          ctx.fill();
          // Highlight
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.beginPath();
          ctx.roundRect(-half + 3, -half + 3, s * 0.4, s * 0.4, 2);
          ctx.fill();
          break;
        }
        case "car": {
          // Simple cute car
          ctx.fillStyle = item.shape.color;
          ctx.beginPath();
          ctx.roundRect(-half, -half * 0.3, s, half * 0.8, 4);
          ctx.fill();
          // Roof
          ctx.beginPath();
          ctx.roundRect(-half * 0.5, -half * 0.8, s * 0.5, half * 0.6, [4, 4, 0, 0]);
          ctx.fill();
          // Wheels
          ctx.fillStyle = "#3D3229";
          ctx.beginPath();
          ctx.arc(-half * 0.5, half * 0.5, half * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(half * 0.5, half * 0.5, half * 0.2, 0, Math.PI * 2);
          ctx.fill();
          // Window
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.beginPath();
          ctx.roundRect(-half * 0.35, -half * 0.65, s * 0.3, half * 0.35, 2);
          ctx.fill();
          break;
        }
        case "duck": {
          // Rubber duck
          const duckGrad = ctx.createRadialGradient(-half * 0.2, -half * 0.2, 0, 0, 0, half);
          duckGrad.addColorStop(0, "#FFF176");
          duckGrad.addColorStop(1, item.shape.color);
          ctx.fillStyle = duckGrad;
          // Body
          ctx.beginPath();
          ctx.ellipse(0, half * 0.15, half * 0.8, half * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();
          // Head
          ctx.beginPath();
          ctx.arc(-half * 0.15, -half * 0.4, half * 0.45, 0, Math.PI * 2);
          ctx.fill();
          // Beak
          ctx.fillStyle = "#FF9800";
          ctx.beginPath();
          ctx.ellipse(-half * 0.55, -half * 0.35, half * 0.2, half * 0.1, 0, 0, Math.PI * 2);
          ctx.fill();
          // Eye
          ctx.fillStyle = "#3D3229";
          ctx.beginPath();
          ctx.arc(-half * 0.25, -half * 0.48, half * 0.07, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "ring": {
          // Stacking ring
          const ringGrad = ctx.createRadialGradient(-half * 0.2, -half * 0.2, 0, 0, 0, half);
          ringGrad.addColorStop(0, "#FF9A9A");
          ringGrad.addColorStop(1, item.shape.color);
          ctx.fillStyle = ringGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, half, half * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          // Hole
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.beginPath();
          ctx.ellipse(0, 0, half * 0.35, half * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "abc": {
          // ABC block
          ctx.fillStyle = item.shape.color;
          ctx.beginPath();
          ctx.roundRect(-half, -half, s, s, 5);
          ctx.fill();
          // Letter
          ctx.fillStyle = "white";
          ctx.font = `bold ${s * 0.55}px 'Manrope', sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const letters = "ABCDEFG";
          ctx.fillText(letters[Math.floor(Math.random() * letters.length)], 0, 2);
          break;
        }
      }

      ctx.restore();
    };

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const elapsed = time - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new items during spawn phase
      if (elapsed < SPAWN_DURATION) {
        spawnTimerRef.current += dt;
        while (spawnTimerRef.current > 0.12) {
          spawnItem();
          spawnTimerRef.current -= 0.12;
        }
      }

      const groundY = canvas.height - GROUND_Y_OFFSET;

      // Update and draw items
      for (let i = itemsRef.current.length - 1; i >= 0; i--) {
        const item = itemsRef.current[i];

        // Apply gravity
        item.vy += GRAVITY * dt;
        item.y += item.vy * dt;
        item.x += item.vx * dt;
        item.rotation += item.rotationSpeed * dt;

        // Bounce off ground
        if (item.y + item.size / 2 > groundY) {
          item.y = groundY - item.size / 2;
          if (Math.abs(item.vy) > 30) {
            spawnBounceParticles(item.x, groundY, item.shape.color);
          }
          item.vy = -item.vy * BOUNCE_DAMPING;
          item.vx *= 0.8;
          item.rotationSpeed *= 0.7;
          item.bounceCount++;

          // Squash and stretch
          item.scale = 1.3;
          setTimeout(() => {
            if (item) item.scale = 1;
          }, 100);
        }

        // Bounce off walls
        if (item.x < item.size / 2) {
          item.x = item.size / 2;
          item.vx = Math.abs(item.vx) * 0.6;
        }
        if (item.x > canvas.width - item.size / 2) {
          item.x = canvas.width - item.size / 2;
          item.vx = -Math.abs(item.vx) * 0.6;
        }

        // Fade out in the last phase
        if (elapsed > TOTAL_DURATION - 1500) {
          item.opacity = Math.max(0, item.opacity - dt * 1.2);
        }

        // Remove dead items
        if (item.opacity <= 0) {
          itemsRef.current.splice(i, 1);
          continue;
        }

        drawToyShape(item);
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vy += 400 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt / p.maxLife;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life * 0.8;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // End animation
      if (elapsed > TOTAL_DURATION && itemsRef.current.length === 0) {
        setFadeOut(true);
        setTimeout(() => {
          setTriggered(false);
          setShowMessage(false);
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
  }, [triggered, spawnBounceParticles]);

  if (!triggered) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Secret message */}
      {showMessage && (
        <div className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none">
          <div
            className={`
              bg-white/90 backdrop-blur-md rounded-2xl px-8 py-5 shadow-2xl
              border border-[#E8DFD3]
              transform transition-all duration-700 ease-out
              ${fadeOut ? "opacity-0 scale-90 translate-y-4" : "opacity-100 scale-100 translate-y-0"}
            `}
            style={{
              animation: showMessage ? "konamiMessageIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both" : undefined,
            }}
          >
            <p className="text-center text-lg font-bold text-[#3D3229] font-['Manrope']">
              You found a secret! 🎉
            </p>
            <p className="text-center text-sm text-[#6B5E50] mt-1">
              Konami Code activated — toys are raining!
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes konamiMessageIn {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(-30px);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
