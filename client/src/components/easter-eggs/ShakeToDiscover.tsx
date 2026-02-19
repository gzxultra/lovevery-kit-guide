/**
 * Mobile Easter Egg 1: Shake to Discover
 * Shake your phone to get "Today's Toy Recommendation".
 * Higher threshold and sensitivity for better UX.
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { kits } from "@/data/kits";
import { getToyImage } from "@/data/toyImages";
import { getToyThumbnailUrl } from "@/lib/imageUtils";
import { Sparkles, RefreshCw, X, Lightbulb } from "lucide-react";

const SHAKE_THRESHOLD = 45; // Increased from 30 to 45 for higher threshold
const SHAKE_COOLDOWN = 2000; // 2s cooldown between discovery
const CONSECUTIVE_SHAKES_REQUIRED = 3; 
const CONSECUTIVE_SHAKE_WINDOW = 1000; 

export default function ShakeToDiscover() {
  const [triggered, setTriggered] = useState(false);
  const [randomToy, setRandomToy] = useState<{
    name: string;
    englishName: string;
    kitName: string;
    kitColor: string;
    imageUrl: string | null;
    howToUse: string;
  } | null>(null);
  const [flipping, setFlipping] = useState(false);
  const { lang } = useLanguage();
  
  const lastShakeRef = useRef(0);
  const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const shakeTimestampsRef = useRef<number[]>([]);

  const isMobile = useCallback(() => {
    return typeof window !== "undefined" && (window.innerWidth <= 768 || "ontouchstart" in window);
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const pickRandomToy = useCallback(() => {
    const allToys: any[] = [];
    for (const kit of kits) {
      for (const toy of kit.toys) {
        const toyImage = getToyImage(kit.id, toy.englishName);
        allToys.push({
          name: toy.name,
          englishName: toy.englishName,
          kitName: kit.name,
          kitColor: kit.color,
          imageUrl: toyImage ? getToyThumbnailUrl(toyImage) : null,
          howToUse: lang === "cn" ? toy.howToUse : (toy.howToUseEn || toy.howToUse)
        });
      }
    }
    return allToys[Math.floor(Math.random() * allToys.length)];
  }, [lang]);

  useEffect(() => {
    if (!isMobile()) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || !acc.x || !acc.y || !acc.z) return;

      const now = Date.now();
      if (now - lastShakeRef.current < SHAKE_COOLDOWN) return;

      const deltaX = Math.abs(acc.x - lastAccelerationRef.current.x);
      const deltaY = Math.abs(acc.y - lastAccelerationRef.current.y);
      const deltaZ = Math.abs(acc.z - lastAccelerationRef.current.z);
      lastAccelerationRef.current = { x: acc.x, y: acc.y, z: acc.z };

      if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
        shakeTimestampsRef.current.push(now);
        shakeTimestampsRef.current = shakeTimestampsRef.current.filter(t => now - t < CONSECUTIVE_SHAKE_WINDOW);

        if (shakeTimestampsRef.current.length >= CONSECUTIVE_SHAKES_REQUIRED) {
          lastShakeRef.current = now;
          shakeTimestampsRef.current = [];
          
          const toy = pickRandomToy();
          if (toy) {
            setRandomToy(toy);
            setTriggered(true);
            setFlipping(true);
            vibrate([50, 50, 100]);
            setTimeout(() => setFlipping(false), 600);
            
            if (typeof window !== "undefined" && window.gtag) {
              window.gtag("event", "shake_discovery", { toy_name: toy.englishName });
            }
          }
        } else {
          vibrate(20);
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isMobile, pickRandomToy, vibrate]);

  if (!triggered || !randomToy) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md" onClick={() => setTriggered(false)}>
      <div 
        className={`relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 ${flipping ? "scale-90 rotate-y-180" : "scale-100"}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-3" style={{ backgroundColor: randomToy.kitColor }} />
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="px-4 py-1.5 rounded-full bg-[#FAF7F2] border border-[#F0EBE3] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A574]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A574]">
                {lang === "cn" ? "今日玩具推荐" : "Today's Pick"}
              </span>
            </div>
          </div>

          {randomToy.imageUrl && (
            <div className="aspect-square w-48 mx-auto mb-6 rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#F0EBE3] p-4 shadow-inner">
              <img src={randomToy.imageUrl} alt={randomToy.name} className="w-full h-full object-contain" />
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#3D3229] mb-1 font-['Manrope']">{randomToy.name}</h3>
            <p className="text-sm text-[#756A5C] font-medium">{randomToy.englishName}</p>
            <div className="mt-2 inline-block px-3 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: randomToy.kitColor + "20", color: randomToy.kitColor }}>
              {randomToy.kitName}
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#F0EBE3] mb-8">
            <div className="flex items-center gap-2 mb-2 text-[#D4A574]">
              <Lightbulb className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{lang === "cn" ? "推荐玩法" : "How to Play"}</span>
            </div>
            <p className="text-xs text-[#4A3F35] leading-relaxed">{randomToy.howToUse}</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => {
                setFlipping(true);
                setTimeout(() => {
                  setRandomToy(pickRandomToy());
                  setFlipping(false);
                }, 300);
              }}
              className="flex-1 py-4 rounded-2xl border-2 border-[#F0EBE3] text-[#6B5E50] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              {lang === "cn" ? "再换一个" : "Another"}
            </button>
            <button 
              onClick={() => setTriggered(false)}
              className="flex-1 py-4 rounded-2xl bg-[#3D3229] text-white font-bold active:scale-95 transition-all shadow-lg"
            >
              {lang === "cn" ? "太棒了" : "Awesome"}
            </button>
          </div>
        </div>

        <button onClick={() => setTriggered(false)} className="absolute top-6 right-6 p-2 text-[#B0A89E] hover:text-[#3D3229]">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
