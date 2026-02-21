import { useEffect } from "react";
import { trackEvent, setUserProperties } from "@/lib/analytics";

export default function TrafficSourceTracker() {
  useEffect(() => {
    const detectUserType = () => {
      // 1. Check for Site Owner cookie
      const cookies = document.cookie.split(';');
      const isOwner = cookies.some(c => c.trim().startsWith('user_type=site_owner'));
      if (isOwner) return 'site_owner';

      // 2. Check for Bot features
      const isBot = 
        navigator.webdriver || 
        /HeadlessChrome|Puppeteer|Lighthouse|Googlebot|bingbot|baiduspider/i.test(navigator.userAgent);
      if (isBot) return 'manus_bot';

      // 3. Default to organic user
      return 'organic_user';
    };

    const userType = detectUserType();

    // Set GA4 Custom Dimension
    setUserProperties({
      'user_type': userType
    });
    
    // Also send an event to ensure it's captured
    trackEvent('user_type_detected', {
      'user_type': userType,
      'non_interaction': true
    });

    // Triple-click listener for site owner activation
    const handleTripleClick = (e: MouseEvent) => {
      if (e.detail === 3) {
        document.cookie = "user_type=site_owner; path=/; max-age=31536000"; // 1 year
        alert("Site Owner Mode Activated (GA4)");
        window.location.reload();
      }
    };

    const footer = document.querySelector('footer');
    if (footer) {
      footer.addEventListener('click', handleTripleClick);
    }

    return () => {
      if (footer) {
        footer.removeEventListener('click', handleTripleClick);
      }
    };
  }, []);

  return null;
}
