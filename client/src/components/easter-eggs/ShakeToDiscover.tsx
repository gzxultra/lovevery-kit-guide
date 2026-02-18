/**
 * Mobile Easter Egg 1: Shake to Discover
 * Shake your phone to discover a random toy with a beautiful 3D card flip animation.
 * Only works on mobile devices with motion sensors.
 * Includes haptic feedback if supported.
 * 
 * FIXED: Reduced sensitivity to prevent accidental triggers
 * - Higher threshold (30 instead of 15)
 * - Initial delay of 8 seconds after page load
 * - Requires 3 consecutive shakes within 1.5 seconds
 * - Longer cooldown (30 seconds instead of 3)
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { kits } from "@/data/kits";
import { getToyImage } from "@/data/toyImages";
import { getToyThumbnailUrl } from "@/lib/imageUtils";
import { Sparkles } from "lucide-react";

const SHAKE_THRESHOLD = 30; // Increased from 15 to 30 for less sensitivity
const SHAKE_COOLDOWN = 30000; // Increased from 3s to 30s
const INITIAL_DELAY = 8000; // 8 second delay after page load
const CONSECUTIVE_SHAKES_REQUIRED = 3; // Need 3 shakes to trigger
const CONSECUTIVE_SHAKE_WINDOW = 1500; // Within 1.5 seconds

export default function ShakeToDiscover() {
  const [triggered, setTriggered] = useState(false);
  const [randomToy, setRandomToy] = useState<{
    name: string;
    englishName: string;
    kitName: string;
    kitColor: string;
    imageUrl: string | null;
  } | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [closing, setClosing] = useState(false);
  const lastShakeRef = useRef(0);
  const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const shakeCountRef = useRef(0);
  const shakeTimestampsRef = useRef<number[]>([]);
  const isReadyRef = useRef(false);

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

  // Pick a random toy from all kits
  const pickRandomToy = useCallback(() => {
    const allToys: Array<{
      name: string;
      englishName: string;
      kitName: string;
      kitColor: string;
      imageUrl: string | null;
    }> = [];

    for (const kit of kits) {
      for (const toy of kit.toys) {
        const toyImage = getToyImage(kit.id, toy.englishName);
        allToys.push({
          name: toy.name,
          englishName: toy.englishName,
          kitName: kit.name,
          kitColor: kit.color,
          imageUrl: toyImage ? getToyThumbnailUrl(toyImage) : null,
        });
      }
    }

    if (allToys.length === 0) return null;
    return allToys[Math.floor(Math.random() * allToys.length)];
  }, []);

  // Handle shake detection
  useEffect(() => {
    if (!isMobile()) return;

    // Initial delay before starting to listen
    const initialTimer = setTimeout(() => {
      isReadyRef.current = true;
    }, INITIAL_DELAY);

    const handleMotion = (event: DeviceMotionEvent) => {
      // Don't listen until initial delay has passed
      if (!isReadyRef.current) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc || !acc.x || !acc.y || !acc.z) return;

      const now = Date.now();
      
      // Check cooldown period
      if (now - lastShakeRef.current < SHAKE_COOLDOWN) return;

      const deltaX = Math.abs(acc.x - lastAccelerationRef.current.x);
      const deltaY = Math.abs(acc.y - lastAccelerationRef.current.y);
      const deltaZ = Math.abs(acc.z - lastAccelerationRef.current.z);

      lastAccelerationRef.current = { x: acc.x, y: acc.y, z: acc.z };

      // Check if shake exceeds threshold
      if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
        // Add shake timestamp
        shakeTimestampsRef.current.push(now);

        // Clean up old timestamps outside the window
        shakeTimestampsRef.current = shakeTimestampsRef.current.filter(
          (timestamp) => now - timestamp < CONSECUTIVE_SHAKE_WINDOW
        );

        // Check if we have enough consecutive shakes
        if (shakeTimestampsRef.current.length >= CONSECUTIVE_SHAKES_REQUIRED) {
          // Trigger the Easter egg!
          lastShakeRef.current = now;
          shakeTimestampsRef.current = []; // Reset shake count
          
          const toy = pickRandomToy();
          if (toy) {
            setRandomToy(toy);
            setTriggered(true);
            setFlipping(true);
            vibrate([50, 50, 100]); // Short vibration pattern
            setTimeout(() => setFlipping(false), 600);
          }
        } else {
          // Give subtle feedback for each shake in the sequence
          vibrate(20);
        }
      }
    };

    // Request permission for iOS 13+
    if (
      typeof (DeviceMotionEvent as any).requestPermission === "function"
    ) {
      // We'll show a button to request permission on first interaction
      // For now, just set up the listener
      window.addEventListener("devicemotion", handleMotion);
    } else {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isMobile, pickRandomToy, vibrate]);

  const handleClose = useCallback(() => {
    setClosing(true);
    vibrate(30);
    setTimeout(() => {
      setTriggered(false);
      setClosing(false);
      setRandomToy(null);
    }, 400);
  }, [vibrate]);

  if (!isMobile() || !triggered || !randomToy) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-400 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative max-w-sm w-full transition-all duration-400 ${
          closing ? "scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: !closing ? "shakeCardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both" : undefined,
        }}
      >
        {/* Card with 3D flip effect */}
        <div
          className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-transform duration-600 ${
            flipping ? "animate-flip3d" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Colored top bar */}
          <div
            className="h-2"
            style={{ backgroundColor: randomToy.kitColor }}
          />

          {/* Content */}
          <div className="p-6">
            {/* Badge */}
            <div className="flex justify-center mb-4">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${randomToy.kitColor}15`,
                  color: randomToy.kitColor,
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Shake Discovery!</span>
              </div>
            </div>

            {/* Toy image */}
            {randomToy.imageUrl ? (
              <div className="relative w-48 h-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-[#FAF7F2] shadow-lg">
                <img
                  src={randomToy.imageUrl}
                  alt={randomToy.englishName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-48 h-48 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${randomToy.kitColor}20` }}
              >
                <Sparkles
                  className="w-16 h-16"
                  style={{ color: randomToy.kitColor }}
                />
              </div>
            )}

            {/* Toy info */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#3D3229] mb-1 font-['Manrope']">
                {randomToy.name}
              </h3>
              <p className="text-sm text-[#6B5E50] mb-2">
                {randomToy.englishName}
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-[#9B8E7E]">
                <span>From</span>
                <span
                  className="font-medium"
                  style={{ color: randomToy.kitColor }}
                >
                  {randomToy.kitName}
                </span>
              </div>
            </div>

            {/* Hint */}
            <p className="text-center text-xs text-[#9B8E7E] mt-6 mb-2">
              Shake again to discover more! 🎲
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#3D3229]/10 hover:bg-[#3D3229]/20 
                       flex items-center justify-center transition-all duration-200
                       hover:scale-110 active:scale-95"
            aria-label="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="#3D3229"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 2l10 10M12 2l-10 10" />
            </svg>
          </button>
        </div>

        {/* Sparkle decorations */}
        <div className="absolute -top-2 -left-2 text-2xl animate-sparkle-1">✨</div>
        <div className="absolute -top-3 -right-1 text-xl animate-sparkle-2">⭐</div>
        <div className="absolute -bottom-2 -left-1 text-xl animate-sparkle-3">💫</div>
        <div className="absolute -bottom-3 -right-2 text-2xl animate-sparkle-4">🌟</div>
      </div>

      <style>{`
        @keyframes shakeCardIn {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg) translateY(50px);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) rotate(2deg) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg) translateY(0);
          }
        }
        @keyframes flip3d {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-flip3d {
          animation: flip3d 0.6s ease-in-out;
        }
        @keyframes sparkle-1 {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        @keyframes sparkle-2 {
          0%, 100% { opacity: 0.4; transform: scale(0.9) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(-180deg); }
        }
        @keyframes sparkle-3 {
          0%, 100% { opacity: 0.5; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(180deg); }
        }
        @keyframes sparkle-4 {
          0%, 100% { opacity: 0.3; transform: scale(0.85) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.15) rotate(-180deg); }
        }
        .animate-sparkle-1 { animation: sparkle-1 2s ease-in-out infinite; }
        .animate-sparkle-2 { animation: sparkle-2 2.5s ease-in-out infinite 0.3s; }
        .animate-sparkle-3 { animation: sparkle-3 2.2s ease-in-out infinite 0.6s; }
        .animate-sparkle-4 { animation: sparkle-4 2.8s ease-in-out infinite 0.9s; }
      `}</style>
    </div>
  );
}
