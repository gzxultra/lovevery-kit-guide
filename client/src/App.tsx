import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { lazy, Suspense, useEffect } from "react";
import TrafficSourceTracker from "./components/TrafficSourceTracker";
import { trackEvent } from "./lib/analytics";

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

// Loading skeleton for lazy-loaded routes
function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Nav skeleton */}
      <div className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-lg border-b border-[#E8DFD3]/70 h-14 sm:h-16" />
      {/* Hero skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-[#E8DFD3] rounded-full" />
          <div className="h-10 w-64 bg-[#E8DFD3] rounded-lg" />
          <div className="h-4 w-full max-w-xl bg-[#E8DFD3]/60 rounded" />
          <div className="h-4 w-3/4 max-w-lg bg-[#E8DFD3]/60 rounded" />
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-[#E8DFD3] p-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-[#E8DFD3]/60 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-[#E8DFD3] rounded" />
                  <div className="h-3 w-32 bg-[#E8DFD3]/60 rounded" />
                  <div className="h-3 w-full bg-[#E8DFD3]/40 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    if (onReady) onReady();
  }, [onReady]);
  return null;
}

function AppRouter({ onReady }: { onReady?: () => void }) {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <ReadySignal onReady={onReady} />
      <HashRedirect />
      <Switch>
        <Route path={"/"} component={Home} />
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
          trackEvent('scroll_depth', { 'percent': t });
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
