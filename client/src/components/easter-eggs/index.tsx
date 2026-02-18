/**
 * Easter Eggs Container
 * Renders all 7 easter egg components together:
 * - 4 universal easter eggs (desktop + mobile)
 * - 3 mobile-only easter eggs
 * Each easter egg manages its own activation logic independently.
 */
import KonamiCode from "./KonamiCode";
import LogoClickCombo from "./LogoClickCombo";
import LateNightBanner from "./LateNightBanner";
import RainbowTrail from "./RainbowTrail";
import ShakeToDiscover from "./ShakeToDiscover";
import LongPressHero from "./LongPressHero";
import PinchToReveal from "./PinchToReveal";

export default function EasterEggs() {
  return (
    <>
      {/* Universal Easter Eggs (Desktop + Mobile) */}
      <KonamiCode />
      <LogoClickCombo />
      <LateNightBanner />
      <RainbowTrail />
      
      {/* Mobile-Only Easter Eggs */}
      <ShakeToDiscover />
      <LongPressHero />
      <PinchToReveal />
    </>
  );
}
