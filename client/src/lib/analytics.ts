/**
 * Google Analytics 4 — Safe tracking utilities for loveveryfans.com
 * All calls are wrapped to prevent failures from breaking user interactions.
 *
 * GA4 Measurement ID: G-ZCV2N7Q89L
 *
 * Event taxonomy:
 *   page_view         — automatic (GA4 built-in)
 *   view_kit          — user lands on a Kit detail page
 *   product_view      — user lands on a standalone product page
 *   click_kit_card    — user clicks a Kit card on the Home page
 *   click_product_card — user clicks a product card on the Home page
 *   search            — user submits a search query
 *   click_amazon_link — user clicks an Amazon affiliate link
 *   lovevery_referral_click — user clicks a Lovevery purchase/referral link
 *   view_alternatives — alternatives section becomes visible for a toy
 *   module_expand     — user expands a collapsible module
 *   module_collapse   — user collapses a collapsible module
 *   click_recommended_article — user clicks a recommended article
 *   share             — user clicks a share button (WeChat or copy link)
 *   switch_language   — user toggles language
 *   scroll_depth      — user scrolls past 25/50/75/90% of a page
 *   user_type_detected — identifies organic user vs bot vs site owner
 */

/** Fire a GA4 custom event */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    }
  } catch (error) {
    console.error(`[Analytics] Event "${eventName}" failed:`, error);
  }
}

/** Set persistent user properties (custom dimensions) */
export function setUserProperties(properties: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("set", "user_properties", properties);
    }
  } catch (error) {
    console.error("[Analytics] setUserProperties failed:", error);
  }
}

/**
 * Scroll depth tracker — fires scroll_depth events at 25%, 50%, 75%, 90%.
 * Call this once per page (e.g. in a useEffect with cleanup).
 * Returns a cleanup function to remove the listener.
 */
export function initScrollDepthTracking(
  pageName: string,
  pageType: "home" | "kit" | "product" | "about"
): () => void {
  if (typeof window === "undefined") return () => {};

  const milestones = [25, 50, 75, 90];
  const reached = new Set<number>();

  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((scrollTop / docHeight) * 100);

    for (const milestone of milestones) {
      if (pct >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        trackEvent("scroll_depth", {
          page_name: pageName,
          page_type: pageType,
          depth_percentage: milestone,
        });
      }
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}
