import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// GitHub Pages SPA redirect: restore the original path after 404.html redirect
(function () {
  const redirectPath = sessionStorage.getItem('spa-redirect');
  if (redirectPath) {
    sessionStorage.removeItem('spa-redirect');
    // Use replaceState to set the correct URL without triggering a page load
    window.history.replaceState(null, '', redirectPath);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
