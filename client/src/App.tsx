import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { lazy, Suspense, useEffect } from "react";
import TrafficSourceTracker from "./components/TrafficSourceTracker";

// Lazy load easter eggs so they don't affect initial bundle
const EasterEggs = lazy(() => import("./components/easter-eggs"));
import { useLocation } from "wouter";

// Lazy load route components for code splitting
const Home = lazy(() => import("./pages/Home"));
const KitDetail = lazy(() => import("./pages/KitDetail"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Redirect from old hash URLs to clean URLs for backward compatibility
function HashRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#/")) {
      const cleanPath = hash.slice(1); // Remove the '#'
      setLocation(cleanPath, { replace: true });
    }
  }, [setLocation]);
  return null;
}

function AppRouter({ onReady }: { onReady?: () => void }) {
  return (
    <Suspense fallback={null}>
      <HashRedirect />
      <Switch>
        <Route path={"/"}>
          {() => <Home onReady={onReady} />}
        </Route>
        <Route path={"/kit/:id"} component={KitDetail} />
        <Route path={"/about"} component={AboutUs} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    // 3a. Scroll depth tracking
    const thresholds = [25, 50, 75, 100];
    const reached = new Set<number>();

    const handleScroll = () => {
      const h = document.documentElement, 
            b = document.body,
            st = 'scrollTop',
            sh = 'scrollHeight';
      const percent = ((h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight)) * 100;

      thresholds.forEach(t => {
        if (percent >= t && !reached.has(t)) {
          reached.add(t);
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag('event', 'scroll_depth', { 'percent': t });
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <TrafficSourceTracker />
        <AppRouter onReady={onReady} />
        <Suspense fallback={null}>
          <EasterEggs />
        </Suspense>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
