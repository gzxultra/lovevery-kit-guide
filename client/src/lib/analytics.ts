/**
 * Safe wrapper for Google Analytics gtag calls
 * Prevents gtag failures from breaking user interactions
 */

export function trackEvent(eventName: string, params?: Record<string, any>) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    }
  } catch (error) {
    console.error(`Analytics tracking failed for event "${eventName}":`, error);
  }
}

export function setUserProperties(properties: Record<string, any>) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("set", "user_properties", properties);
    }
  } catch (error) {
    console.error("Analytics user properties update failed:", error);
  }
}
