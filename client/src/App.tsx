import { Route, Switch, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { lazy, Suspense } from "react";

// Lazy load route components for code splitting
const Home = lazy(() => import("./pages/Home"));
const KitDetail = lazy(() => import("./pages/KitDetail"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Minimal loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#E8DFD3] border-t-[#7FB685] rounded-full animate-spin" />
    </div>
  );
}

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
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

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
